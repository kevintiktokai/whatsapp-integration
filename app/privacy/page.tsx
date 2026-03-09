import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | LayerSyncAI",
    description: "Privacy Policy for LayerSyncAI",
};

export default function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 lg:py-20">
            <div className="mb-12 border-b border-slate-200 pb-8">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy (LayerSyncAI)</h1>
                <p className="text-slate-500">
                    <strong>Effective date:</strong> March 5, 2026<br />
                    <strong>Last updated:</strong> March 5, 2026
                </p>
            </div>

            <div className="prose prose-slate prose-lg max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-a:text-emerald-600 hover:prose-a:text-emerald-700">
                <p>
                    This Privacy Policy explains how LayerSyncAI (&ldquo;LayerSyncAI,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects, uses, shares, and protects personal information when you use our website layersyncai.com (the &ldquo;Site&rdquo;) and our applications, products, and services (collectively, the &ldquo;Services&rdquo;).
                </p>
                <p>
                    If you do not agree with this Privacy Policy, please do not use the Services.
                </p>

                <h2 className="text-2xl mt-8 mb-4">1) Who We Are</h2>
                <ul className="list-none pl-0 space-y-2">
                    <li><strong>Controller / Responsible party:</strong> LayerSyncAI</li>
                    <li><strong>Contact:</strong> <a href="mailto:support@layersyncai.com">support@layersyncai.com</a> | +263 783 771 054</li>
                    <li><strong>Website:</strong> layersyncai.com</li>
                    <li><strong>Business address:</strong> [Insert business address, city, country]</li>
                </ul>

                <h2 className="text-2xl mt-8 mb-4">2) Information We Collect</h2>
                <p>We collect information in three main ways: (a) information you provide, (b) information collected automatically, and (c) information from third parties.</p>

                <h3 className="text-xl mt-6 mb-3">A. Information you provide</h3>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Account &amp; profile information:</strong> name, email, phone number, company name, job title, username, password (hashed).</li>
                    <li><strong>Customer support &amp; communications:</strong> messages you send us, meeting notes, feedback, attachments.</li>
                    <li><strong>Payments (if applicable):</strong> billing name, billing address, payment status, and transaction metadata. Payment card details are typically processed by our payment processor and not stored by us.</li>
                    <li><strong>Content you upload or enter:</strong> data you input into our app (e.g., CRM entries, notes, documents, images, leads, properties, tasks, pipelines).</li>
                </ul>

                <h3 className="text-xl mt-6 mb-3">B. Information collected automatically</h3>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Device and usage data:</strong> IP address, browser type, device identifiers, pages visited, actions taken, timestamps, referring URLs, crash logs.</li>
                    <li><strong>Cookies &amp; similar technologies:</strong> used for login, security, analytics, and preferences. See &ldquo;Cookies&rdquo; below.</li>
                </ul>

                <h3 className="text-xl mt-6 mb-3">C. Information from third parties (integrations)</h3>
                <p>
                    If you connect third-party services to LayerSyncAI (e.g., Google, Meta/WhatsApp, email providers), we may receive information from those services based on your settings and permissions (e.g., message metadata, contact info, conversation content you choose to sync, webhook event data).
                </p>

                <h2 className="text-2xl mt-8 mb-4">3) How We Use Information</h2>
                <p>We use personal information to:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Provide and operate the Services (accounts, authentication, core features, syncing, automation).</li>
                    <li>Improve and personalize features, performance, and user experience.</li>
                    <li>Communicate with you about updates, support requests, security alerts, and administrative messages.</li>
                    <li>Security and fraud prevention (monitoring, risk checks, enforcing terms).</li>
                    <li>Analytics and debugging to measure usage, fix issues, and enhance reliability.</li>
                    <li>Billing and subscription management (if applicable).</li>
                    <li>Legal compliance (responding to lawful requests, enforcing rights, resolving disputes).</li>
                    <li><strong>AI features:</strong> If the Services provide AI-assisted features (e.g., summarizing notes, generating follow-ups, lead insights), we process the information you submit to produce those outputs. We do not use your private content to train our general AI models unless you explicitly opt in (see Section 6).</li>
                </ul>

                <h2 className="text-2xl mt-8 mb-4">4) Legal Bases for Processing (Where Applicable)</h2>
                <p>Depending on your location and applicable law, we rely on:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Contract (to provide the Services you request),</li>
                    <li>Legitimate interests (security, improvement, analytics),</li>
                    <li>Consent (marketing emails, optional data uses, certain cookies),</li>
                    <li>Legal obligation (compliance, recordkeeping).</li>
                </ul>

                <h2 className="text-2xl mt-8 mb-4">5) How We Share Information</h2>
                <p>We may share personal information only as needed:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Service providers / processors:</strong> hosting, analytics, customer support tools, email delivery, payment processors, error monitoring (they process data on our instructions).</li>
                    <li><strong>Integrations you enable:</strong> when you connect third-party tools, you direct us to share data with them.</li>
                    <li><strong>Legal and safety:</strong> to comply with law, court orders, or protect rights, safety, and security.</li>
                    <li><strong>Business transfers:</strong> if we undergo a merger, acquisition, financing, or sale of assets, information may be transferred as part of that transaction.</li>
                    <li><strong>With your instruction:</strong> when you request or permit sharing.</li>
                </ul>
                <p>We do not sell your personal information.</p>

                <h2 className="text-2xl mt-8 mb-4">6) AI, Model Training, and Customer Content</h2>
                <p>Customer Content means the content you or your users upload or generate within the Services (e.g., CRM records, notes, messages you choose to sync).</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>By default, we use Customer Content only to provide the Services (including AI features you request).</li>
                    <li><strong>No training by default:</strong> We do not use your Customer Content to train or improve general AI models unless you opt in via a clear in-product setting or written agreement.</li>
                    <li><strong>De-identified/aggregated data:</strong> We may create aggregated or de-identified analytics (e.g., usage trends) that cannot reasonably identify you.</li>
                </ul>

                <h2 className="text-2xl mt-8 mb-4">7) Messaging and WhatsApp-Related Features (If Enabled)</h2>
                <p>If the Services offer WhatsApp or messaging integrations:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>You control which numbers/accounts are connected and what content is synced (where the feature allows selection).</li>
                    <li>We may process message content, attachments, and metadata (e.g., timestamps, sender/recipient identifiers) only to provide the messaging/CRM functionality and AI assistance you request.</li>
                    <li>Your use of WhatsApp is also governed by Meta&rsquo;s terms and policies.</li>
                    <li>We recommend you avoid sending sensitive personal data through messaging channels unless necessary.</li>
                </ul>

                <h2 className="text-2xl mt-8 mb-4">8) Cookies and Tracking Technologies</h2>
                <p>We use cookies and similar technologies to:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>keep you logged in and secure sessions,</li>
                    <li>remember preferences,</li>
                    <li>analyze performance and usage,</li>
                    <li>improve the Site and Services.</li>
                </ul>
                <p>
                    You can control cookies through your browser settings. If you disable certain cookies, parts of the Services may not work properly.
                </p>

                <h2 className="text-2xl mt-8 mb-4">9) Data Retention</h2>
                <p>We keep personal information for as long as necessary to:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>provide the Services,</li>
                    <li>comply with legal obligations,</li>
                    <li>resolve disputes, and</li>
                    <li>enforce agreements.</li>
                </ul>
                <p>
                    When you close an account, we will delete or anonymize data within a reasonable period, unless we must retain certain information for legal, security, or legitimate business purposes.
                </p>

                <h2 className="text-2xl mt-8 mb-4">10) Security</h2>
                <p>
                    We use reasonable administrative, technical, and physical safeguards designed to protect personal information (e.g., access controls, encryption in transit where applicable, logging, and least-privilege access). However, no system is 100% secure, and we cannot guarantee absolute security.
                </p>

                <h2 className="text-2xl mt-8 mb-4">11) Your Rights and Choices</h2>
                <p>Depending on your location, you may have rights to:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>access, correct, or delete your personal information,</li>
                    <li>object to or restrict processing,</li>
                    <li>withdraw consent (where processing is based on consent),</li>
                    <li>request data portability,</li>
                    <li>opt out of marketing communications.</li>
                </ul>
                <p>
                    To exercise your rights: email <a href="mailto:support@layersyncai.com">support@layersyncai.com</a>. We may need to verify your identity.
                </p>
                <p>
                    <strong>Marketing emails:</strong> You can unsubscribe using the link in the email.
                </p>

                <h2 className="text-2xl mt-8 mb-4">12) International Data Transfers</h2>
                <p>
                    If you access the Services from outside the country where our servers or providers are located, your information may be transferred and processed internationally. We take steps intended to ensure appropriate safeguards for such transfers where required by law.
                </p>

                <h2 className="text-2xl mt-8 mb-4">13) Children&rsquo;s Privacy</h2>
                <p>
                    The Services are not directed to children under 13 (or a higher age if required by local law). We do not knowingly collect personal information from children. If you believe a child has provided us information, contact us and we will take steps to delete it.
                </p>

                <h2 className="text-2xl mt-8 mb-4">14) Third-Party Links</h2>
                <p>
                    The Site and Services may link to third-party websites or services. Their privacy practices are governed by their own policies. We are not responsible for third-party practices.
                </p>

                <h2 className="text-2xl mt-8 mb-4">15) Changes to This Privacy Policy</h2>
                <p>
                    We may update this Privacy Policy from time to time. If we make material changes, we will post the updated policy on this page and update the &ldquo;Last updated&rdquo; date. Continued use of the Services after changes means you accept the updated policy.
                </p>

                <h2 className="text-2xl mt-8 mb-4">16) Contact Us</h2>
                <p>If you have questions about this Privacy Policy or our privacy practices:</p>
                <ul className="list-none pl-0 space-y-2">
                    <li><strong>LayerSyncAI</strong></li>
                    <li><strong>Email:</strong> <a href="mailto:support@layersyncai.com">support@layersyncai.com</a></li>
                    <li><strong>Phone:</strong> +263 783 771 054</li>
                    <li><strong>Address:</strong> [Insert business address]</li>
                </ul>

                <div className="mt-12 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                    <h3 className="text-lg font-bold mb-4">Optional Add-Ons</h3>
                    <h4 className="font-semibold mb-2">A) &ldquo;Do Not Track&rdquo;</h4>
                    <p className="mb-4">
                        Some browsers send &ldquo;Do Not Track&rdquo; signals. There is no consistent industry standard for responding to DNT, so we do not currently respond to those signals.
                    </p>
                    <h4 className="font-semibold mb-2">B) California / EEA / UK Disclosures</h4>
                    <p>
                        If you operate in or target users in the EEA/UK/California, you may need extra clauses (GDPR/UK GDPR/CCPA) including categories of data, &ldquo;sale/share&rdquo; definitions, SCCs, and a representative/DPO where applicable.
                    </p>
                </div>
            </div>
        </div>
    );
}
