import React from "react";
import { FiArrowLeft, FiHome } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const TermsAndConditions = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-blue-50 via-indigo-50 to-white text-gray-800 font-['Inter',sans-serif]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 mr-4 transition"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">
            Terms & Conditions
          </h1>
          <button
            onClick={() => navigate('/')}
            className="ml-auto p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            title="Go Home"
          >
            <FiHome className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 text-left">
        <div className="bg-white rounded-2xl shadow-md border border-blue-100 p-6 sm:p-8 space-y-6 text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              1. Definitions
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>
                <span className="font-medium">“Facility”</span> refers to the sports venue/turf/court/ground being booked.
              </li>
              <li>
                <span className="font-medium">“User/Player/Customer”</span> refers to the person making the booking.
              </li>
              <li>
                <span className="font-medium">“Booking Platform/Service Provider”</span> refers to the company or entity offering the booking service.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              2. Booking & Payment
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>All bookings have to be made in advance through the authorized online platform, app, or at the venue.</li>
              <li>Full payment has to be completed to confirm a slot.</li>
              <li>Chargess may vary based on time, day, sport, or facility type.</li>
              <li>The platform reserves the right to modify charges without prior notice.</li>
              <li>In case of any technical issue, system error, or double booking of the same slot, the facility management reserves the right to take the final decision, including rescheduling or issuing a refund, as deemed appropriate.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              3. Cancellation & Refund Policy
            </h2>
            <p className="font-medium text-gray-800 mb-1">a) User-initiated cancellation:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-3">
              <li>Cancellations made 4 hours before slot time → eligible for full refund or one-time rescheduling, subject to availability.</li>
              <li>Cancellations made within 4 hours → no refund, but one-time rescheduling is allowed, subject to availability.</li>
            </ul>
            <p className="font-medium text-gray-800 mb-1">b) Facility-initiated cancellation (e.g., maintenance, operational issues etc.):</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-3">
              <li>Users will receive full refund or a rescheduled slot depending on availability.</li>
            </ul>
            <p className="font-medium text-gray-800 mb-1">c) Refund timelines:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Refunds may take 5–10 working days depending on payment gateway rules.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-blue-800 mb-2">4. Rescheduling Policy</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Rescheduling is allowed once per booking (subject to availability).</li>
              <li>Rescheduling requests should be made at least 4 hours before the reserved slot time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-blue-800 mb-2">5. Usage Rules and Player Conduct</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Users should arrive on time; delayed arrival does not entitle allocation of extra time.</li>
              <li>Players should use proper sports attire and equipment.</li>
              <li>Users should follow all safety guidelines and instructions issued by facility staff.</li>
              <li>Any damage to equipment or facility caused by the user will be charged to the user.</li>
              <li>Smoking, alcohol, drugs etc., are strictly prohibited inside the facility.</li>
              <li>Abusive behaviour, harassment, or misconduct may result in cancellation without refund.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-blue-800 mb-2">6. Facility Rules</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>The facility may refuse entry to anyone deemed unfit, unsafe, or under the influence.</li>
              <li>The management reserves the right to group multiple users if booking rules permit shared usage.</li>
              <li>In case of rain, extreme weather or natural calamities, the facility’s weather policy will apply.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-blue-800 mb-2">7. Liability & Safety</h2>
            <p className="text-gray-700 mb-1">a) Users participate at their own risk.</p>
            <p className="text-gray-700 mb-1">b) The management will not be liable for:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-1">
              <li>Injuries during play,</li>
              <li>Loss or theft of personal belongings,</li>
              <li>Accidents caused by negligence or unsafe conduct.</li>
            </ul>
            <p className="text-gray-700">c) The user confirms that they are medically fit to participate.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-blue-800 mb-2">8. Children & Minors</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Children under 14 years should be accompanied by a parent/guardian.</li>
              <li>The facility is not responsible for supervision of minors unless explicitly stated.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-blue-800 mb-2">9. Photography & Media</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>The facility may use photos/videos for promotional purposes.</li>
              <li>Users should not take photo/video of other players without their consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-blue-800 mb-2">10. Prohibited Activities</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Unauthorized coaching.</li>
              <li>Commercial events without permission.</li>
              <li>Bringing outside food/drinks (unless permitted by the facility).</li>
              <li>Hazardous, antisocial, illegal or damaging activities.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-blue-800 mb-2">11. Privacy & Data Use</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>User information may be collected for booking, safety, and operational purposes.</li>
              <li>Personal data will not be shared with third parties except payment processors or legal authorities.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-blue-800 mb-2">12. Governing Law & Jurisdiction</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>These Terms & Conditions are governed by the laws of India.</li>
              <li>Any disputes shall be settled under the jurisdiction of the local courts where the facility is located.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-blue-800 mb-2">13. Changes to Terms</h2>
            <p className="text-gray-700">
              The facility or platform may update these Terms at any time. Continued use of the booking platform or facility
              implies acceptance of the updated Terms.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TermsAndConditions;
