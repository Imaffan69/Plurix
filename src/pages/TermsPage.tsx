import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="border-b border-white/[0.05] px-5 py-3 flex items-center gap-3">
        <Link to="/" className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-white/60">
          <ArrowLeft size={16} />
        </Link>
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-violet-400/50" />
          <h1 className="text-[15px] font-bold">Terms of Service</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8 space-y-8">
        <div>
          <p className="text-white/25 text-[11px] mb-4">Last updated: August 2026</p>
          <p className="text-white/50 text-[13px] leading-relaxed">
            Welcome to Plurix AI ("Plurix," "we," "us," or "our"). These Terms of Service ("Terms") govern your access to and use of the Plurix AI platform, including our website, web application, APIs, and all related services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.
          </p>
        </div>

        <section>
          <h2 className="text-[15px] font-semibold mb-3 text-white/80">1. Acceptance of Terms</h2>
          <div className="text-[13px] text-white/40 leading-relaxed space-y-3">
            <p>By creating an account, accessing, or using Plurix AI, you confirm that you are at least 13 years of age (or the minimum age required in your jurisdiction) and have the legal capacity to enter into these Terms. If you are using the Service on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.</p>
            <p>We reserve the right to modify these Terms at any time. Material changes will be communicated via email or through a prominent notice on the Service. Your continued use of the Service after changes take effect constitutes acceptance of the updated Terms.</p>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold mb-3 text-white/80">2. Description of Service</h2>
          <div className="text-[13px] text-white/40 leading-relaxed space-y-3">
            <p>Plurix AI is a multi-modal AI platform that provides access to multiple artificial intelligence models from various providers including but not limited to Google (Gemini), NVIDIA (Nemotron), Alibaba (Qwen), and other open-source and commercial AI systems. The Service includes:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>AI-powered chat conversations with multiple model options</li>
              <li>Code generation, analysis, and execution capabilities</li>
              <li>Data analysis and visualization tools</li>
              <li>Image generation through third-party AI services</li>
              <li>File upload and document analysis</li>
              <li>Web search integration for real-time information</li>
            </ul>
            <p>The Service is provided "as is" and may be modified, updated, or discontinued at any time without prior notice.</p>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold mb-3 text-white/80">3. Account Registration</h2>
          <div className="text-[13px] text-white/40 leading-relaxed space-y-3">
            <p>To use certain features, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate. You are responsible for safeguarding your password and for all activity that occurs under your account.</p>
            <p>You may not share your account credentials with others or create multiple accounts for the same individual. You must notify us immediately of any unauthorized use of your account. We reserve the right to suspend or terminate accounts that violate these Terms.</p>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold mb-3 text-white/80">4. Acceptable Use</h2>
          <div className="text-[13px] text-white/40 leading-relaxed space-y-3">
            <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You shall not:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Use the Service to generate, store, or transmit content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</li>
              <li>Attempt to gain unauthorized access to any part of the Service, other accounts, or computer systems connected to the Service</li>
              <li>Use automated systems (bots, scrapers) to access or interact with the Service without our explicit written permission</li>
              <li>Reverse engineer, decompile, or disassemble any aspect of the Service</li>
              <li>Use the Service to develop competing products or services</li>
              <li>Impersonate any person or entity, or misrepresent your affiliation with any person or entity</li>
              <li>Use the Service to generate content that infringes on intellectual property rights of third parties</li>
              <li>Attempt to extract, scrape, or harvest the underlying AI models, training data, or algorithms</li>
              <li>Use the Service for any purpose that violates applicable local, state, national, or international law or regulation</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold mb-3 text-white/80">5. AI-Generated Content</h2>
          <div className="text-[13px] text-white/40 leading-relaxed space-y-3">
            <p>The Service generates content using artificial intelligence models. You acknowledge and agree that:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>AI-generated content may contain errors, inaccuracies, or biases. You are solely responsible for verifying the accuracy and appropriateness of any AI-generated content before relying on it.</li>
              <li>AI-generated content should not be considered professional advice (legal, medical, financial, or otherwise).</li>
              <li>You retain ownership of content you input into the Service. You retain ownership of AI-generated output to the extent permitted by applicable law.</li>
              <li>We do not claim ownership over your inputs or outputs. However, we may use anonymized interaction data to improve the Service.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold mb-3 text-white/80">6. Intellectual Property</h2>
          <div className="text-[13px] text-white/40 leading-relaxed space-y-3">
            <p>The Service, including its design, code, features, trademarks, and documentation, is owned by Plurix AI and protected by copyright, trademark, and other intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to use the Service for personal or internal business purposes, subject to these Terms.</p>
            <p>You may not copy, modify, distribute, sell, or lease any part of the Service without our prior written consent. All rights not expressly granted to you are reserved by Plurix AI.</p>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold mb-3 text-white/80">7. Third-Party Services</h2>
          <div className="text-[13px] text-white/40 leading-relaxed space-y-3">
            <p>The Service integrates with third-party AI providers, APIs, and services. Your use of these third-party services is subject to their respective terms of service and privacy policies. We are not responsible for the availability, accuracy, or practices of third-party services.</p>
            <p>We use various AI model providers to deliver our services. The specific models available and their providers may change without notice. We do not guarantee the continuous availability of any particular AI model.</p>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold mb-3 text-white/80">8. Data and Privacy</h2>
          <div className="text-[13px] text-white/40 leading-relaxed space-y-3">
            <p>Your privacy is important to us. Our collection and use of personal information is governed by our <Link to="/privacy" className="text-violet-400/70 hover:text-violet-400 underline underline-offset-2">Privacy Policy</Link>, which is incorporated into these Terms by reference.</p>
            <p>We do not sell your personal data to third parties. We do not train AI models on your conversations or uploaded content. Your conversations are encrypted and stored securely. You may request deletion of your data at any time through your account settings or by contacting us.</p>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold mb-3 text-white/80">9. Payment and Subscriptions</h2>
          <div className="text-[13px] text-white/40 leading-relaxed space-y-3">
            <p>Plurix AI currently offers its Service free of charge. We reserve the right to introduce paid features, subscriptions, or usage-based pricing in the future. If we introduce paid features:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>We will provide reasonable advance notice before any pricing changes take effect.</li>
              <li>Free-tier access will continue to be available for basic usage.</li>
              <li>Refund requests for paid features will be handled on a case-by-case basis.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold mb-3 text-white/80">10. Limitation of Liability</h2>
          <div className="text-[13px] text-white/40 leading-relaxed space-y-3">
            <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, PLURIX AI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.</p>
            <p>IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED THE AMOUNT YOU PAID US, IF ANY, IN THE PAST SIX MONTHS FOR THE SERVICES GIVING RISE TO THE CLAIM. THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold mb-3 text-white/80">11. Indemnification</h2>
          <div className="text-[13px] text-white/40 leading-relaxed space-y-3">
            <p>You agree to indemnify, defend, and hold harmless Plurix AI, its officers, directors, employees, contractors, agents, licensors, and suppliers from and against any claims, actions, demands, liabilities, and settlements, including reasonable legal and accounting fees, arising from or related to your violation of these Terms or your use of the Service.</p>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold mb-3 text-white/80">12. Termination</h2>
          <div className="text-[13px] text-white/40 leading-relaxed space-y-3">
            <p>We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason, including but not limited to a breach of these Terms. Upon termination, your right to use the Service ceases immediately.</p>
            <p>You may terminate your account at any time by contacting us or using the account deletion feature. Upon termination, we will delete your personal data in accordance with our Privacy Policy.</p>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold mb-3 text-white/80">13. Governing Law</h2>
          <div className="text-[13px] text-white/40 leading-relaxed space-y-3">
            <p>These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Plurix AI operates, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved in the competent courts of that jurisdiction.</p>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold mb-3 text-white/80">14. Changes to Terms</h2>
          <div className="text-[13px] text-white/40 leading-relaxed space-y-3">
            <p>We reserve the right to update these Terms at any time. We will notify you of material changes by posting the updated Terms on this page and updating the "Last updated" date. Your continued use of the Service after any changes indicates your acceptance of the new Terms.</p>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold mb-3 text-white/80">15. Contact</h2>
          <div className="text-[13px] text-white/40 leading-relaxed space-y-3">
            <p>If you have any questions about these Terms, please contact us at <a href="mailto:legal@plurix.app" className="text-violet-400/70 hover:text-violet-400 transition-colors">legal@plurix.app</a>.</p>
          </div>
        </section>
      </div>
    </div>
  )
}
