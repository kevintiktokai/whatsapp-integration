import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service | LayerSyncAI",
    description: "Terms of Service for LayerSyncAI",
};

export default function TermsOfService() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 lg:py-20">
            <div className="mb-12 border-b border-slate-200 pb-8">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms of Service (LayerSyncAI)</h1>
                <p className="text-slate-500">
                    <strong>Effective date:</strong> March 5, 2026<br />
                    <strong>Last updated:</strong> March 5, 2026
                </p>
            </div>

            <div className="prose prose-slate prose-lg max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-a:text-emerald-600 hover:prose-a:text-emerald-700">
                <p>
                    These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of layersyncai.com (the &ldquo;Site&rdquo;) and any apps, products, software, services, and features provided by LayerSyncAI (&ldquo;LayerSyncAI,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) (collectively, the &ldquo;Services&rdquo;).
                </p>
                <p>
                    By accessing or using the Services, you agree to these Terms. If you do not agree, do not use the Services.
                </p>

                <h2 className="text-2xl mt-8 mb-4">1) Who We Are and How to Contact Us</h2>
                <ul className="list-none pl-0 space-y-2">
                    <li><strong>Provider:</strong> LayerSyncAI</li>
                    <li><strong>Email:</strong> <a href="mailto:support@layersyncai.com">support@layersyncai.com</a></li>
                    <li><strong>Phone:</strong> +263 783 771 054</li>
                    <li><strong>Address:</strong> [Insert business address, city, country]</li>
                </ul>

                <h2 className="text-2xl mt-8 mb-4">2) Eligibility and Account Registration</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li>You must be at least 18 years old (or the age of majority in your location) to use the Services.</li>
                    <li>You agree to provide accurate information and keep it up to date.</li>
                    <li>You are responsible for safeguarding your login credentials and for all activity under your account.</li>
                </ul>

                <h2 className="text-2xl mt-8 mb-4">3) The Services</h2>
                <p>
                    LayerSyncAI provides software and related services that may include (depending on your plan): CRM functionality, automation, AI-assisted features, analytics, integrations, and related tools.
                </p>
                <p>
                    We may update, change, suspend, or discontinue any part of the Services at any time. Where practical, we&rsquo;ll try to provide notice of material changes.
                </p>

                <h2 className="text-2xl mt-8 mb-4">4) Subscriptions, Trials, and Billing (If Applicable)</h2>
                <p>If you purchase a subscription:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Fees:</strong> You agree to pay all applicable fees, taxes, and charges.</li>
                    <li><strong>Billing:</strong> Subscriptions may renew automatically unless cancelled before renewal.</li>
                    <li><strong>Trials / Beta:</strong> If you are on a free trial or beta, features may change, and the Services may contain bugs. We do not guarantee availability or performance during beta.</li>
                    <li><strong>Refunds:</strong> All fees are non-refundable unless required by law.</li>
                    <li><strong>Non-payment:</strong> We may suspend or terminate access if payment is overdue.</li>
                </ul>

                <h2 className="text-2xl mt-8 mb-4">5) Customer Content and Your Responsibilities</h2>
                <p>
                    &ldquo;Customer Content&rdquo; means any data, text, messages, contacts, files, media, or other content submitted to the Services by you or your authorized users.
                </p>
                <p>You represent and warrant that:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>you have the rights and permissions to upload and process Customer Content;</li>
                    <li>Customer Content does not violate any law or third-party rights; and</li>
                    <li>you are responsible for your users&rsquo; activity and compliance with these Terms.</li>
                </ul>
                <p>You are responsible for maintaining appropriate backups of Customer Content.</p>

                <h2 className="text-2xl mt-8 mb-4">6) License and Acceptable Use</h2>
                <h3 className="text-xl mt-6 mb-3">A. License to you</h3>
                <p>
                    We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Services for your internal business purposes, subject to these Terms.
                </p>
                <h3 className="text-xl mt-6 mb-3">B. Restrictions</h3>
                <p>You may not:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>copy, modify, or create derivative works of the Services (except where permitted by law);</li>
                    <li>reverse engineer, decompile, or attempt to extract source code (except where permitted by law);</li>
                    <li>misuse the Services, including attempting to gain unauthorized access or disrupt systems;</li>
                    <li>upload malware or harmful code;</li>
                    <li>use the Services to violate privacy, spam, harass, or engage in unlawful conduct;</li>
                    <li>use the Services to develop or improve competing products using our confidential information.</li>
                </ul>
                <p>We may investigate and take action for violations, including suspension or termination.</p>

                <h2 className="text-2xl mt-8 mb-4">7) AI Features and Outputs</h2>
                <p>
                    Some features may use AI to generate summaries, suggestions, drafts, follow-ups, classifications, or other outputs (&ldquo;AI Output&rdquo;).
                </p>
                <p>You acknowledge:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>AI Output may be inaccurate or incomplete and should be reviewed before relying on it.</li>
                    <li>You are responsible for decisions made based on AI Output.</li>
                    <li>AI Output does not constitute professional advice (legal, medical, financial, etc.).</li>
                </ul>

                <h2 className="text-2xl mt-8 mb-4">8) Integrations (Including Messaging / WhatsApp, If Enabled)</h2>
                <p>If you connect third-party services (e.g., Google, email, Meta/WhatsApp, other tools):</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>your use of those services is governed by their own terms and policies;</li>
                    <li>you authorize us to exchange data with them to provide the integration;</li>
                    <li>we are not responsible for third-party service outages, changes, or policy enforcement.</li>
                </ul>
                <p>
                    <strong>Messaging/WhatsApp note:</strong> If messaging integrations are enabled, you must ensure you have legal grounds to process message content and contacts, and you must comply with applicable messaging policies (including anti-spam rules).
                </p>

                <h2 className="text-2xl mt-8 mb-4">9) Intellectual Property</h2>
                <p>
                    We own all rights, title, and interest in the Services, including software, designs, logos, trademarks, and content provided by us (excluding Customer Content).
                </p>
                <p>
                    You retain ownership of Customer Content. You grant us a worldwide, non-exclusive license to host, process, transmit, and display Customer Content solely to provide and improve the Services and as otherwise permitted by these Terms and our Privacy Policy.
                </p>

                <h2 className="text-2xl mt-8 mb-4">10) Confidentiality</h2>
                <p>
                    Each party may receive confidential information from the other. Both parties agree to protect confidential information using reasonable care and not disclose it except:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>to service providers bound by confidentiality,</li>
                    <li>as required by law, or</li>
                    <li>with written permission.</li>
                </ul>

                <h2 className="text-2xl mt-8 mb-4">11) Security and Privacy</h2>
                <p>
                    We use reasonable safeguards designed to protect Customer Content. You understand that no method of transmission or storage is fully secure.
                </p>
                <p>
                    Our handling of personal data is described in our Privacy Policy (incorporated by reference into these Terms).
                </p>

                <h2 className="text-2xl mt-8 mb-4">12) Suspension and Termination</h2>
                <h3 className="text-xl mt-6 mb-3">A. By you</h3>
                <p>
                    You may stop using the Services at any time and may cancel a subscription per your account settings or by contacting support.
                </p>
                <h3 className="text-xl mt-6 mb-3">B. By us</h3>
                <p>We may suspend or terminate your access if:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>you violate these Terms,</li>
                    <li>your use poses a security risk,</li>
                    <li>we are required to do so by law, or</li>
                    <li>payment is overdue.</li>
                </ul>
                <p>We may also terminate the Services generally with reasonable notice where practical.</p>

                <h2 className="text-2xl mt-8 mb-4">13) Disclaimers</h2>
                <p>To the maximum extent permitted by law:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>The Services are provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo;</li>
                    <li>We disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.</li>
                    <li>We do not warrant that the Services will be uninterrupted, error-free, or completely secure.</li>
                </ul>

                <h2 className="text-2xl mt-8 mb-4">14) Limitation of Liability</h2>
                <p>To the maximum extent permitted by law:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>LayerSyncAI will not be liable for indirect, incidental, special, consequential, or punitive damages, or loss of profits, revenue, data, or goodwill.</li>
                    <li>Our total liability for any claim relating to the Services will not exceed the amount you paid to LayerSyncAI for the Services in the 12 months preceding the event giving rise to the claim, or USD $100, whichever is greater.</li>
                    <li>Some jurisdictions do not allow certain limitations, so some of the above may not apply to you.</li>
                </ul>

                <h2 className="text-2xl mt-8 mb-4">15) Indemnification</h2>
                <p>
                    You agree to indemnify and hold harmless LayerSyncAI and its affiliates, directors, employees, and agents from any claims, damages, losses, and expenses (including reasonable legal fees) arising from:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>your Customer Content,</li>
                    <li>your use of the Services,</li>
                    <li>your violation of these Terms, or</li>
                    <li>your violation of any law or third-party rights.</li>
                </ul>

                <h2 className="text-2xl mt-8 mb-4">16) Governing Law and Dispute Resolution</h2>
                <p>
                    These Terms are governed by the laws of Zimbabwe, without regard to conflict-of-law rules. Any dispute arising from these Terms or the Services will be resolved in the courts of Harare, Zimbabwe, and you consent to that jurisdiction and venue.
                </p>

                <h2 className="text-2xl mt-8 mb-4">17) Changes to These Terms</h2>
                <p>
                    We may update these Terms from time to time. If we make material changes, we will post the updated Terms and update the &ldquo;Last updated&rdquo; date. Continued use after changes means you accept the updated Terms.
                </p>

                <h2 className="text-2xl mt-8 mb-4">18) Miscellaneous</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Entire agreement:</strong> These Terms and any referenced policies constitute the entire agreement between you and LayerSyncAI regarding the Services.</li>
                    <li><strong>Severability:</strong> If any provision is unenforceable, the rest remain in effect.</li>
                    <li><strong>No waiver:</strong> Failure to enforce a provision is not a waiver.</li>
                    <li><strong>Assignment:</strong> You may not assign these Terms without our consent. We may assign them as part of a merger or sale of assets.</li>
                    <li><strong>Force majeure:</strong> Neither party is liable for delays caused by events beyond reasonable control.</li>
                </ul>

                <h2 className="text-2xl mt-8 mb-4">19) Contact</h2>
                <p>Questions about these Terms:</p>
                <ul className="list-none pl-0 space-y-2">
                    <li><a href="mailto:support@layersyncai.com">support@layersyncai.com</a></li>
                    <li>+263 783 771 054</li>
                </ul>
            </div>
        </div>
    );
}
