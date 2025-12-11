import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

        <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
          <p className="text-sm text-gray-500">Last Updated: November 9, 2025</p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Purely Plutonic ("the Service"), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Eligibility</h2>
            <p>
              You must be at least 18 years old to use this Service. By using the Service, you represent and warrant
              that you meet this age requirement and have the legal capacity to enter into these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Account Responsibilities</h2>
            <p>You agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access to your account</li>
              <li>Be responsible for all activities that occur under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. User Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Post false, misleading, or fraudulent content</li>
              <li>Impersonate any person or entity</li>
              <li>Share content that is hateful, threatening, or discriminatory</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
              <li>Use the Service for commercial purposes without our consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Content</h2>
            <p>
              You retain ownership of content you post on the Service. However, by posting content, you grant us
              a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display your content
              in connection with operating and providing the Service.
            </p>
            <p className="mt-4">
              You are solely responsible for the content you post and must ensure it does not violate any third-party
              rights or applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Safety and Meetings</h2>
            <p>
              Purely Plutonic is a platform for meeting new people for platonic friendships. When meeting someone
              in person:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Always meet in public places</li>
              <li>Tell a friend or family member about your plans</li>
              <li>Trust your instincts and prioritize your safety</li>
              <li>We are not responsible for interactions between users off the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Verification and Profile Photos</h2>
            <p>
              We may use facial recognition technology to verify user identities and ensure profile photos are authentic.
              By using the Service, you consent to this verification process. Verified badges are provided to enhance
              trust and safety within the community.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time, with or without notice, for
              violating these Terms or for any other reason. You may also delete your account at any time through
              the app settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Disclaimers</h2>
            <p>
              The Service is provided "as is" without warranties of any kind. We do not guarantee that the Service
              will be uninterrupted, secure, or error-free. We are not responsible for the conduct of users, whether
              online or offline.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Purely Plutonic shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly
              or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of
              the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Privacy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use,
              and protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. We will notify you of any material changes by posting the new
              Terms on the Service and updating the "Last Updated" date. Your continued use of the Service after
              changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the United States,
              without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">14. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at support@purelyplutonic.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
