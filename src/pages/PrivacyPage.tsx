import { Link } from 'react-router-dom'
import { ChevronLeft, Shield } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="border-b border-white/[0.04] px-5 py-3 flex items-center gap-3">
        <Link to="/" className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-white/60">
          <ChevronLeft size={16} />
        </Link>
        <h1 className="text-[15px] font-bold">Privacy Policy</h1>
      </div>
      <div className="max-w-2xl mx-auto px-5 py-10">
        <p className="text-white/25 text-[11px] mb-8 uppercase tracking-wider font-medium">Last updated: August 27, 2026</p>

        <div className="glass-card p-5 mb-8 flex items-start gap-3">
          <Shield size={18} className="text-white/40 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-[13px] font-bold mb-1">Privacy-First</h3>
            <p className="text-[12px] text-white/35 leading-relaxed">
              Plurix is built on the principle that your conversations are yours. We don't sell data,
              we don't train on your prompts, and we don't share your information with advertisers.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-[15px] font-bold mb-2">1. Information We Collect</h2>
            <p className="text-white/45 text-[13px] leading-relaxed mb-2">
              <strong className="text-white/60">Account Information:</strong> Email address, name, and profile picture
              (if you sign in with Google/GitHub).
            </p>
            <p className="text-white/45 text-[13px] leading-relaxed">
              <strong className="text-white/60">Usage Data:</strong> Conversation history, IP address, browser type,
              and device information for security and abuse prevention.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-bold mb-2">2. How We Use Your Information</h2>
            <ul className="text-white/45 text-[13px] leading-relaxed space-y-1.5">
              <li>• To provide and maintain the Service</li>
              <li>• To detect and prevent abuse, spam, and security threats</li>
              <li>• To improve the quality of AI responses</li>
              <li>• To send important service updates (not marketing)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-bold mb-2">3. Data Sharing</h2>
            <p className="text-white/45 text-[13px] leading-relaxed">
              We do NOT sell your data. We do NOT share your conversations with third parties for advertising.
              We may share data with AI model providers (Google, OpenAI, Anthropic, etc.) solely to process
              your chat requests. These providers have their own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-bold mb-2">4. Data Retention</h2>
            <p className="text-white/45 text-[13px] leading-relaxed">
              Your conversation history is stored securely and retained as long as your account is active.
              You may delete your conversations at any time. Deleting your account removes all associated data.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-bold mb-2">5. Security</h2>
            <p className="text-white/45 text-[13px] leading-relaxed">
              We implement industry-standard security measures including encryption in transit (TLS 1.3),
              encryption at rest, and regular security audits. However, no system is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-bold mb-2">6. Cookies</h2>
            <p className="text-white/45 text-[13px] leading-relaxed">
              Plurix uses essential cookies for authentication and session management. We do not use
              advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-bold mb-2">7. Children's Privacy</h2>
            <p className="text-white/45 text-[13px] leading-relaxed">
              Plurix is not intended for children under 13. We do not knowingly collect data from children.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-bold mb-2">8. Your Rights</h2>
            <p className="text-white/45 text-[13px] leading-relaxed">
              You have the right to access, export, and delete your personal data. Contact us at{' '}
              <a href="mailto:privacy@plurix.app" className="text-white/70/70 hover:text-white/70 transition-colors">privacy@plurix.app</a>.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-bold mb-2">9. Changes</h2>
            <p className="text-white/45 text-[13px] leading-relaxed">
              We may update this policy. Significant changes will be communicated via email.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
