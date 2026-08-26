import { Link } from 'react-router-dom'
import { ChevronLeft, Shield } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <Link to="/" className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white">
          <ChevronLeft size={18} />
        </Link>
        <h1 className="text-lg font-bold">Privacy Policy</h1>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-12 prose prose-invert">
        <p className="text-white/50 text-sm mb-8">Last updated: August 26, 2026</p>

        <div className="glass-card p-6 mb-8 flex items-start gap-4">
          <Shield size={24} className="text-blue-400 shrink-0 mt-1" />
          <div>
            <h3 className="font-bold mb-1">Privacy-First</h3>
            <p className="text-sm text-white/50">
              Plurix is built on the principle that your conversations are yours. We don't sell data, 
              we don't train on your prompts, and we don't share your information with advertisers.
            </p>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4">1. Information We Collect</h2>
        <p className="text-white/60 text-sm leading-relaxed mb-4">
          <strong className="text-white/80">Account Information:</strong> Email address, name, and profile picture 
          (if you sign in with Google/GitHub).
        </p>
        <p className="text-white/60 text-sm leading-relaxed mb-6">
          <strong className="text-white/80">Usage Data:</strong> Conversation history, IP address, browser type, 
          and device information for security and abuse prevention.
        </p>

        <h2 className="text-xl font-bold mb-4">2. How We Use Your Information</h2>
        <ul className="text-white/60 text-sm leading-relaxed mb-6 space-y-2">
          <li>• To provide and maintain the Service</li>
          <li>• To detect and prevent abuse, spam, and security threats</li>
          <li>• To improve the quality of AI responses</li>
          <li>• To send important service updates (not marketing)</li>
        </ul>

        <h2 className="text-xl font-bold mb-4">3. Data Sharing</h2>
        <p className="text-white/60 text-sm leading-relaxed mb-6">
          We do NOT sell your data. We do NOT share your conversations with third parties for advertising. 
          We may share data with AI model providers (Google, OpenAI, Anthropic, etc.) solely to process 
          your chat requests. These providers have their own privacy policies.
        </p>

        <h2 className="text-xl font-bold mb-4">4. Data Retention</h2>
        <p className="text-white/60 text-sm leading-relaxed mb-6">
          Your conversation history is stored securely and retained as long as your account is active. 
          You may delete your conversations at any time. Deleting your account removes all associated data.
        </p>

        <h2 className="text-xl font-bold mb-4">5. Security</h2>
        <p className="text-white/60 text-sm leading-relaxed mb-6">
          We implement industry-standard security measures including encryption in transit (TLS 1.3), 
          encryption at rest, and regular security audits. However, no system is 100% secure.
        </p>

        <h2 className="text-xl font-bold mb-4">6. Cookies</h2>
        <p className="text-white/60 text-sm leading-relaxed mb-6">
          Plurix uses essential cookies for authentication and session management. We do not use 
          advertising or tracking cookies.
        </p>

        <h2 className="text-xl font-bold mb-4">7. Children's Privacy</h2>
        <p className="text-white/60 text-sm leading-relaxed mb-6">
          Plurix is not intended for children under 13. We do not knowingly collect data from children.
        </p>

        <h2 className="text-xl font-bold mb-4">8. Your Rights</h2>
        <p className="text-white/60 text-sm leading-relaxed mb-6">
          You have the right to access, export, and delete your personal data. Contact us at{' '}
          <a href="mailto:privacy@plurix.app" className="text-blue-400 hover:text-blue-300">privacy@plurix.app</a>.
        </p>

        <h2 className="text-xl font-bold mb-4">9. Changes</h2>
        <p className="text-white/60 text-sm leading-relaxed mb-6">
          We may update this policy. Significant changes will be communicated via email.
        </p>
      </div>
    </div>
  )
}
