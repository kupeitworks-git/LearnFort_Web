import React from "react";
import { FiArrowLeft, FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import bluwave from '../../images/bluewae.png'
import premium from '../../images/premeium.png'
import { FiSunrise, FiHome, FiZap } from "react-icons/fi";
import {
  GiCricketBat,
  GiWeightLiftingUp,
  GiBabyFace,
  GiForkKnifeSpoon,
  GiPathDistance,
} from "react-icons/gi";

// ✅ USE THIS amenities list (with icons)
export const amenities = [
  { name: "Lighting for Night Events", icon: FiSunrise },
  { name: "Bowling Machine for Practice", icon: GiCricketBat },
  { name: "Open Gym", icon: GiWeightLiftingUp },
  { name: "Children Play Area", icon: GiBabyFace },
  { name: "Rest Rooms", icon: FiHome },
  { name: "Food Court", icon: GiForkKnifeSpoon },
  { name: "Walking Pathway", icon: GiPathDistance },
  { name: "EV Charging Station", icon: FiZap },
];

const AboutUs = () => {
  const navigate = useNavigate();

  const sports = [
    "Skating", "Basketball", "Football (Turf)", "Volleyball",
    "Cricket (Turf)", "Net Practice", "Pickleball", "Kabbadi",
    "Karate", "Athletic Track", "Archery", "Badminton (Outdoor)"
  ];



  const handleBack = () => navigate(-1);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-[#F4FAFF] text-gray-800 font-['Inter',sans-serif]">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-gradient-to-r from-[#0077B6] to-[#00B4D8] text-white py-4 px-6 flex items-center shadow-lg sticky top-0 z-10"
      >
        <button
          onClick={handleBack}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 mr-4 transition"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold tracking-wide">
          About LearnFort
        </h1>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative bg-gradient-to-r from-[#0077B6] to-[#00B4D8] text-white px-6 py-14 md:py-20 overflow-hidden"
      >
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Welcome to LearnFort Sports Park
          </h2>
          <p className="text-white/90 max-w-2xl mx-auto">
            Where passion meets performance in the heart of Dindigul
          </p>
        </div>
        <div
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-20"
          style={{ backgroundImage: `url(${bluwave})` }}
        ></div>      </motion.section>

      {/* About Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-blue-50 hover:shadow-xl transition-all duration-300"
        >
          <div className="p-6 md:p-12 bg-gray-50">
            {/* Our Story Section */}
            <div className="max-w-5xl mx-auto flex flex-col gap-8">
              {/* Image on top */}
              <div className="w-full">
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={premium}
                    alt="LearnFort Sports Park"
                    className="w-full h-64 md:h-80 object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <div className="text-white">
                      <h3 className="text-xl font-bold mb-1">14,000 sq.ft</h3>
                      <p className="text-sm text-blue-200">Premium Sports Facility</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text content neatly aligned */}
              <div className="w-full space-y-4 md:space-y-5">

                <h2 className="text-2xl font-bold text-gray-900">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0077B6] to-[#00B4D8]">
                    Our Story
                  </span>
                </h2>

                <div className="border-l-4 border-[#00B4D8] pl-4 space-y-4 text-gray-700 leading-relaxed">

                  <p>
                    LearnFort Sports Park stands as a premier institution in the realm of sports management, dedicated to transforming the global sports ecosystem.
                  </p>

                  <p>
                    LearnFort Sports Park – a pioneering initiative dedicated to revolutionizing sports engagement across India. At the heart of our organization beats an unwavering commitment to ignite a nationwide passion for sports and transform the landscape of athletic participation.
                  </p>

                  <p>
                    LearnFort Sports Park is a hub which gives access to world-class coaching, and exhilarating tournaments converge seamlessly at your fingertips — a singular gateway to empowerment and self-discovery. Here, the spirit of sports thrives, bolstered by a vibrant ecosystem of support, guidance, and opportunity.
                  </p>

                  <p>
                    LearnFort Sports Park is a trailblazer in nurturing athletic talent and revolutionizing the sports industry. With a mission to empower athletes and communities, LearnFort Sports Park combines state-of-the-art facilities with cutting-edge training techniques to prepare individuals for success on and off the field.
                  </p>

                  <p>
                    LearnFort Sports Park envisions a dynamic future where sports transcend boundaries and become a catalyst for personal and community transformation. We aspire to elevate the sports experience for athletes and fans alike by fostering an environment of inclusivity, innovation, and excellence.
                  </p>

                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </section>

      {/* Sports Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0077B6] to-[#00B4D8]">
              Our Sports Facilities
            </span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#0077B6] to-[#00B4D8] mx-auto rounded-full"></div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          {sports.map((sport, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ y: -5 }}
              className="bg-white p-4 rounded-xl shadow-sm border border-blue-50 hover:border-blue-100 transition-all duration-300 cursor-default"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">
                  {sport.includes("Basketball")
                    ? "🏀"
                    : sport.includes("Football")
                      ? "⚽"
                      : sport.includes("Cricket")
                        ? "🏏"
                        : sport.includes("Badminton")
                          ? "🏸"
                          : "🏅"}
                </span>
              </div>
              <h4 className="text-sm font-medium text-center text-gray-800">
                {sport}
              </h4>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Amenities Section */}
      <section className="py-16 bg-gradient-to-br from-[#E6F7FF] to-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0077B6] to-[#00B4D8]">
                World-Class Amenities
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Designed to deliver peak performance and the best sports
              experience.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-[#0077B6] to-[#00B4D8] mx-auto rounded-full mt-3"></div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {amenities.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={index}
                  variants={item}
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50 
                      hover:shadow-xl hover:border-blue-200 transition-all duration-300 group"
                >
                  <div
                    className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 
                            group-hover:bg-gradient-to-r group-hover:from-[#0077B6] group-hover:to-[#00B4D8] 
                            group-hover:text-white text-[#0077B6] transition-all duration-300"
                  >
                    <Icon className="text-2xl" />
                  </div>

                  <h3 className="font-semibold text-gray-800 text-lg group-hover:text-[#0077B6] transition-colors">
                    {item.name}
                  </h3>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mb-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0077B6] to-[#00B4D8]">
              Find Us Here
            </span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#0077B6] to-[#00B4D8] mx-auto rounded-full"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden shadow-lg border border-blue-100 group"
        >
          {/* Clickable Map Container */}
          <a
            href="https://www.google.com/maps/place/LearnFort+Sports+Park/@10.168391,77.8158151,17z/data=!3m1!4b1!4m6!3m5!1s0x3b074f005fc2e393:0xd21427417fa359e2!8m2!3d10.168391!4d77.8158151!16s%2Fg%2F11yk350zvj?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-full relative"
          >
            {/* Map Iframe - pointer-events-none ensures the click goes to the anchor tag */}
            <iframe
              title="LearnFort Sports Park Location"
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src="https://maps.google.com/maps?q=LearnFort+Sports+Park&t=&z=17&ie=UTF8&iwloc=&output=embed"
              allowFullScreen
              className="w-full h-full pointer-events-none"
            ></iframe>

            {/* Overlay Text (optional, to encourage clicking) */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0">
                <span className="font-semibold text-blue-600 flex items-center gap-2">
                  <FiMapPin /> Open in Google Maps
                </span>
              </div>
            </div>
          </a>
        </motion.div>
      </section>

    </div>
  );
};

export default AboutUs;
