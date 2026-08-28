import { supabase } from '@/lib/supabase'
import { useStore } from '@/store'
import { Conversation, Message } from '@/types'

// ========== Conversations ==========

export async function loadCloudConversations(): Promise<Conversation[]> {
  const user = useStore.getState().user
  if (!user) return []

  try {
    const { data: convRows, error: convErr } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(200)

    if (convErr || !convRows) {
      console.warn('[CloudStorage] Load conversations error:', convErr?.message)
      return []
    }

    // Load messages for each conversation
    const convIds = convRows.map((c: any) => c.id)
    if (convIds.length === 0) return []

    const { data: msgRows, error: msgErr } = await supabase
      .from('messages')
      .select('*')
      .in('conversation_id', convIds)
      .order('created_at', { ascending: true })

    if (msgErr) {
      console.warn('[CloudStorage] Load messages error:', msgErr.message)
    }

    const messagesByConv = new Map<string, Message[]>()
    for (const msg of (msgRows || [])) {
      const arr = messagesByConv.get(msg.conversation_id) || []
      arr.push({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        model: msg.model,
        created_at: msg.created_at,
      })
      messagesByConv.set(msg.conversation_id, arr)
    }

    return convRows.map((c: any) => ({
      id: c.id,
      title: c.title,
      model: c.model,
      user_id: c.user_id,
      created_at: c.created_at,
      updated_at: c.updated_at,
      messages: messagesByConv.get(c.id) || [],
    }))
  } catch (err) {
    console.warn('[CloudStorage] Load failed:', err)
    return []
  }
}

export async function saveCloudConversation(conv: Conversation): Promise<boolean> {
  const user = useStore.getState().user
  if (!user) return false

  try {
    const { error } = await supabase
      .from('conversations')
      .upsert({
        id: conv.id,
        user_id: user.id,
        title: conv.title,
        model: conv.model,
        created_at: conv.created_at,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    if (error) {
      console.warn('[CloudStorage] Save conversation error:', error.message)
      return false
    }
    return true
  } catch {
    return false
  }
}

export async function saveCloudMessage(conversationId: string, msg: Message): Promise<boolean> {
  const user = useStore.getState().user
  if (!user) return false

  try {
    const { error } = await supabase
      .from('messages')
      .insert({
        id: msg.id,
        conversation_id: conversationId,
        user_id: user.id,
        role: msg.role,
        content: msg.content,
        model: msg.model || null,
        created_at: msg.created_at,
      })

    if (error) {
      console.warn('[CloudStorage] Save message error:', error.message)
      return false
    }

    // Update conversation's updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)

    return true
  } catch {
    return false
  }
}

export async function deleteCloudConversation(id: string): Promise<boolean> {
  const user = useStore.getState().user
  if (!user) return false

  try {
    // Messages cascade-delete via FK
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.warn('[CloudStorage] Delete error:', error.message)
      return false
    }
    return true
  } catch {
    return false
  }
}

export async function renameCloudConversation(id: string, title: string): Promise<boolean> {
  const user = useStore.getState().user
  if (!user) return false

  try {
    const { error } = await supabase
      .from('conversations')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.warn('[CloudStorage] Rename error:', error.message)
      return false
    }
    return true
  } catch {
    return false
  }
}

// ========== Merge: cloud + localStorage ==========

/**
 * Called when user signs in. Loads cloud conversations and merges
 * with any local-only conversations (to avoid losing unsynced data).
 */
export async function syncOnLogin(): Promise<Conversation[]> {
  const cloudConvs = await loadCloudConversations()
  const localConvs = useStore.getState().conversations

  if (cloudConvs.length === 0 && localConvs.length === 0) return []
  if (cloudConvs.length === 0) {
    // Only local — upload them to cloud
    for (const conv of localConvs) {
      await saveCloudConversation(conv)
      for (const msg of conv.messages) {
        await saveCloudMessage(conv.id, msg)
      }
    }
    return localConvs
  }

  if (localConvs.length === 0) return cloudConvs

  // Merge: prefer cloud, add any local-only conversations
  const cloudIds = new Set(cloudConvs.map(c => c.id))
  const localOnly = localConvs.filter(c => !cloudIds.has(c.id))

  // Upload local-only conversations to cloud
  for (const conv of localOnly) {
    await saveCloudConversation(conv)
    for (const msg of conv.messages) {
      await saveCloudMessage(conv.id, msg)
    }
  }

  return [...cloudConvs, ...localOnly]
}
