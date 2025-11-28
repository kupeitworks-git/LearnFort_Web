import React from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-white text-gray-800 font-['Inter',sans-serif]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 mr-4 transition"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">
            Privacy Policy
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 text-left">
        <div className="bg-white rounded-2xl shadow-md border border-blue-100 p-6 sm:p-8 space-y-6 text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Privacy Policies</h2>
            <p>
              You may consult this list to find the privacy policy for each of the advertising partners of LearnFort Sports Park. Third-party ad servers or ad networks use technologies like cookies, JavaScript, or web beacons that are used in their respective advertisements and links that appear on LearnFort Sports Park, which are sent directly to users’ browsers. They automatically receive your IP address when this occurs.
            </p>
            <p>
              These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalise the advertising content that you see on websites that you visit. Please note that LearnFort Sports Park has no access to or control over these cookies that are used by third-party advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Third-Party Privacy Policies</h2>
            <p>
              LearnFort Sports Park’s privacy policy does not apply to other advertisers or websites. Thus, we advise you to consult the respective privacy policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt out of certain options.
            </p>
            <p>
              You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers’ respective websites.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Player’s Information</h2>
            <p>
              We encourage parents and guardians to observe, participate in and/or monitor and guide their online activity. LearnFort Sports Park does not knowingly collect any personally identifiable information from children. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our website.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              Cancellation & Refund Policy
            </h2>

            <p className="font-medium text-gray-800 mb-1">a) User-initiated cancellation:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Cancellations made 4 hours before slot time → eligible for full refund or one-time rescheduling (subject to availability).</li>
              <li>Cancellations made within 4 hours → no refund, but one-time rescheduling is allowed (subject to availability).</li>
            </ul>

            <p className="font-medium text-gray-800 mb-1 mt-3">b) Facility-initiated cancellation:</p>
            <p>
              If cancelled by the facility (maintenance, operational issues, weather, etc.), users will receive a full refund or may choose a rescheduled slot depending on availability.
            </p>

            <p className="font-medium text-gray-800 mb-1 mt-3">c) Refund timelines:</p>
            <p>
              Refunds may take 5–10 working days depending on the payment gateway’s policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Rescheduling Policy</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Rescheduling is allowed once per booking (subject to availability).</li>
              <li>Rescheduling requests should be made at least 4 hours before the reserved slot time.</li>
            </ul>
          </section>


          <section>
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Online Privacy Policy Only</h2>
            <p>
              Our Privacy Policy applies only to our online activities and is valid for visitors to our website with regards to the information that they shared and/or collected in LearnFort Sports Park. This policy is not applicable to any information collected offline or via channels other than this website.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Voluntary Information</h2>
            <p>
              LearnFort Sports Park may collect personal information from visitors who voluntarily provide it, such as when they register for an account, submit a form, or contact the school through the website. This information may include name, email address, phone number, and other contact information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Use of Information</h2>
            <p>
              LearnFort Sports Park uses personal information collected from visitors to the website for the following purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>
                To provide visitors with the services they request, such as registering for an account, submitting a form, or contacting the school through the website.
              </li>
              <li>
                To improve the website experience, such as by tracking website usage and analyzing trends.
              </li>
              <li>
                To send marketing communications, such as email newsletters or promotional offers. Visitors can opt out of receiving marketing communications by clicking the “unsubscribe” link at the bottom of any marketing email.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Sharing of Information</h2>
            <p className="font-medium text-gray-800 mb-1">1. With service providers</p>
            <p>
              LearnFort Sports Park may share personal information with third-party service providers who help operate the website, such as hosting providers and email marketing services.
            </p>
            <p className="font-medium text-gray-800 mb-1 mt-3">2. With law enforcement</p>
            <p>
              LearnFort Sports Park may share personal information with law enforcement if required to do so by law or if we believe that sharing the information is necessary to protect our rights or the rights of others.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Consent</h2>
            <p>
              By using our website, you hereby consent to our privacy policy and agree to its terms.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
