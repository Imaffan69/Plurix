import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="border-b border-white/[0.05] px-5 py-3 flex items-center gap-3">
        <Link to="/" className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-white/60">
          <ArrowLeft size={16} />
        </Link>
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-violet-400/50" />
          <h1 className="text-[15px] font-bold">Privacy Policy</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8 space-y-8">
        <div>
          <p className="text-white/25 text-[11px] mb-4">Last updated: August 2026</p>
          <p className="text-white/50 text-[13px] leading-relaxed">
            Plurix AI ("Plurix," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI platform and related services (the "Service"). Please read this policy carefully to understand our practices regarding your personal data.
          </p>
        </div>

        <section>
          <h2 className="text-[15px] font-semibold mb-3 text-white/80">1. Information We Collect</h2>
          <div className="text-[13px] text-white/40 leading-relaxed space-y-3">
            <p className="font-medium text-white/50">Account Information</p>
            <p>When you create an account, we collect your email address, display name, and authentication credentials. If you sign in through a third-party provider (Google, GitHub), we receive your basic profile information (name, email, avatar) as authorized by you through the OAuth consent screen.</p>

            <p className="font-medium text-white/50 mt-4">Conversation Data</p>
            <p>We store the text of your conversations with AI models, including your prompts and the AI responses. This data is stored encrypted and is used solely to provide you with the Service (conversation history, context continuity). We do not use your conversation data to train AI models.</p>

            <p className="font-medium text-white/50 mt-4">File Uploads</p>
            <p>When you upload files (documents, images, spreadsheets), we temporarily process them to provide analysis or context to the AI model. Uploaded files are processed in memory and are not permanently stored on our servers unless you explicitly save them to your account.</p>

            <p className="font-medium text-white/50 mt-4">Usage Data</p>
            <p>We automatically collect certain information when you use the Service, including: IP address, browser type and version, operating system, device type, pages visited, time spent on pages, referring URLs, and interaction patterns (clicks, inputs). This data is collected for analytics and Service improvement purposes.</p>

            <p className="font-medium text-white/50 mt-4">Technical Data</p>
            <p>We collect log data including error reports, performance metrics, and diagnostic information. This helps us identify and fix issues, improve performance, and ensure the security of the Service.</p>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold mb-3 text-white/80">2. How We Use Your Information</h2>
          <div className="text-[13px] text-white/40 leading-relaxed space-y-3">
            <p>We use the information we collect for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Providing the Service:</strong> Delivering AI chat, code generation, data analysis, and other features you request.</li>
              <li><strong>Authentication and Security:</strong> Verifying your identity, preventing fraud, and protecting against unauthorized access.</li>
              <li><strong>Service Improvement:</strong> Analyzing anonymized usage patterns to improve features, performance, and user experience.</li>
              <li><strong>Communication:</strong> Sending you account-related notifications, security alerts, and (with your consent) product updates.</li>
              <li><strong>Analytics:</strong> Understanding how users interact with the Service to inform product decisions.</li>
              <li><strong>Legal Compliance:</strong> Complying with applicable laws, regulations, and legal processes.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold mb-3 text-white/80">3. How We Share Your Information</h2>
          <div className="text-[13px] text-white/40 leading-relaxed space-y-3">
            <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>AI Model Providers:</strong> When you send a chat message, your prompt is transmitted to the selected AI model provider (Google, Groq, OpenRouter, etc.) for processing. These providers process your input to generate a response and do not retain your data beyond what is necessary for the API call.</li>
              <li><strong>Authentication Providers:</strong> When you use Google or GitHub sign-in, we communicate with these providers solely for authentication purposes.</li>
              <li><strong>Service Providers:</strong> We may share data with trusted third-party service providers who assist in operating the Service (hosting, analytics, payment processing). These providers are contractually bound to use your data only for the purposes we specify.</li>
              <li><strong>Legal Requirements:</strong> We may disclose your information if required by law, court order, or governmental regulation, or if we believe disclosure is necessary to protect our rights, your safety, or the safety of others.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any change in ownership or use of your personal information.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold mb-3 text-white/80">4. Data Security</h2>
          <div className="text-[13px] text-white/40 leading-relaxed space-y-3">
            <p>We implement industry-standard security measures to protect your personal information, including:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Encryption of data in transit (TLS 1.3) and at rest (AES-256)</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Secure infrastructure hosted on reputable cloud providers</li>
              <li>Automated threat detection and monitoring</li>
            </ul>
            <p>While we strive to use commercially acceptable means to protect your data, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.</p>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold mb-3 text-white/80">5. Data Retention</h2>
          <div className="text-[13px] text-white/40 leading-relaxed space-y-3">
            <p>We retain your personal information for as long as your account is active or as needed to provide the Service. When you delete your account, we will delete or anonymize your personal data within 30 days, except where we need to retain certain information for legal or legitimate business purposes.</p>
            <p>Conversation history is retained as long as your account exists. You may delete individual conversations at any time. Uploaded files are processed temporarily and are not retained beyond the session unless explicitly saved.</p>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold mb-3 text-white/80">6. Your Rights</h2>
          <div className="text-[13px] text-white/40 leading-relaxed space-y-3">
            <p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data ("right to be forgotten").</li>
              <li><strong>Portability:</strong> Request a copy of your data in a structured, machine-readable format.</li>
              <li><strong>Restriction:</strong> Request restriction of processing of your personal data.</li>
              <li><strong>Objection:</strong> Object to the processing of your personal data for certain purposes.</li>
              <li><strong>Withdraw Consent:</strong> Where processing is based on consent, withdraw that consent at any time.</li>
            </ul>
            <p>To exercise any of these rights, please contact us at <a href="mailto:privacy@plurix.app" className="text-violet-400/70 hover:text-violet-400 transition-colors">privacy@plurix.app</a>. We will respond to your request within 30 days.</p>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold mb-3 text-white/80">7. Cookies and Tracking</h2>
          <div className="text-[13px] text-white/40 leading-relaxed space-y-3">
            <p>We use essential cookies to maintain your session and authentication state. These cookies are strictly necessary for the Service to function and do not require your consent.</p>
            <p>We may use analytics tools (such as privacy-respecting alternatives to Google Analytics) to understand usage patterns. These tools use cookies or similar technologies to collect anonymized usage data. You can control cookie settings through your browser preferences.</p>
            <p>We do not use advertising cookies or share your data with advertising networks.</p>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold mb-3 text-white/80">8. Children's Privacy</h2>
          <div className="text-[13px] text-white/40 leading-relaxed space-y-3">
            <p>The Service is not intended for children under 13 years of age (or the minimum age required in your jurisdiction). We do not knowingly collect personal information from children. If we become aware that we have collected personal data from a child, we will take steps to delete that information promptly.</p>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold mb-3 text-white/80">9. International Data Transfers</h2>
          <div className="text-[13px] text-white/40 leading-relaxed space-y-3">
            <p>Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. We ensure that appropriate safeguards are in place for international transfers, including standard contractual clauses where required.</p>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold mb-3 text-white/80">10. Changes to This Policy</h2>
          <div className="text-[13px] text-white/40 leading-relaxed space-y-3">
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page and, where required, by email. Your continued use of the Service after changes take effect constitutes acceptance of the updated policy.</p>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold mb-3 text-white/80">11. Contact Us</h2>
          <div className="text-[13px] text-white/40 leading-relaxed space-y-3">
            <p>If you have any questions about this Privacy Policy or our data practices, please contact us at <a href="mailto:privacy@plurix.app" className="text-violet-400/70 hover:text-violet-400 transition-colors">privacy@plurix.app</a>.</p>
          </div>
        </section>
      </div>
    </div>
  )
}
