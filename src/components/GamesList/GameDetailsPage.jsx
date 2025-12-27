import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    FaLightbulb,
    FaRestroom,
    FaWifi,
    FaUtensils,
    FaDumbbell,
} from "react-icons/fa";
import { FiArrowLeft } from "react-icons/fi";

const gameDetails = {
    1: {
        name: "Skating",
        image: "https://via.placeholder.com/600x400?text=Skating",
        about:
            "Skating builds balance, endurance, and agility while keeping you active. Our smooth, wide rink offers a safe space for both beginners and experts to enjoy the thrill of motion on wheels.",
    },
    2: {
        name: "Pickle Ball",
        image: "https://via.placeholder.com/600x400?text=Pickle+Ball",
        about:
            "Pickleball combines elements of tennis and ping-pong into a fun, fast-paced game. Perfect for players of all ages, it’s a great way to stay fit and enjoy friendly competition.",
    },
    3: {
        name: "Basketball",
        image: "https://via.placeholder.com/600x400?text=Basketball",
        about:
            "Basketball promotes teamwork, coordination, and endurance. Our well-lit court provides the perfect setup for exciting games, training sessions, and tournaments.",
    },
    4: {
        name: "Kabaddi",
        image: "https://via.placeholder.com/600x400?text=Kabaddi",
        about:
            "Kabaddi is a traditional Indian contact sport that enhances strength, focus, and quick reflexes. Enjoy competitive matches on our professional outdoor court.",
    },
    5: {
        name: "Football (Turf) 14,000sqft",
        image: "https://via.placeholder.com/600x400?text=Football",
        about:
            "Our 14,000 sq. ft. turf ground is ideal for five-a-side and full-field football. It features soft turf, proper drainage, and night lighting for matches under the stars.",
    },
    6: {
        name: "Karate",
        image: "https://via.placeholder.com/600x400?text=Karate",
        about:
            "Karate teaches discipline, confidence, and strength through structured training. Our dojo-style setup provides a professional environment for learning self-defense and fitness.",
    },
    7: {
        name: "Volleyball",
        image: "https://via.placeholder.com/600x400?text=Volleyball",
        about:
            "Volleyball is a high-energy team sport that develops agility and strategy. Enjoy friendly and competitive matches on our regulation-size, well-maintained court.",
    },
    8: {
        name: "Athletic Track",
        image: "https://via.placeholder.com/600x400?text=Athletic+Track",
        about:
            "Our synthetic athletic track supports sprints, distance running, and relays. Designed for training and professional use, it’s perfect for improving stamina and speed.",
    },
    9: {
        name: "Cricket (Turf)",
        image: "https://via.placeholder.com/600x400?text=Cricket+Turf",
        about:
            "Play like a pro on our lush turf cricket field equipped with boundary nets and lighting. Ideal for practice, local matches, and friendly weekend games.",
    },
    10: {
        name: "Archery",
        image: "https://via.placeholder.com/600x400?text=Archery",
        about:
            "Archery enhances focus and precision. Our range is equipped with proper safety zones and adjustable targets to suit both beginner and advanced archers.",
    },
    11: {
        name: "Cricket (Net Practice)",
        image: "https://via.placeholder.com/600x400?text=Cricket+Net",
        about:
            "Train like professionals in our cricket nets built for batting and bowling practice. The setup includes protective mesh and even lighting for evening sessions.",
    },
    12: {
        name: "Badminton (Outdoor)",
        image: "https://via.placeholder.com/600x400?text=Badminton",
        about:
            "Outdoor badminton is an excellent cardio workout. Our open-air courts come with durable flooring, proper nets, and night lighting for evening play.",
    },
};

const facilities = [
    { name: "Night Lighting", icon: <FaLightbulb className="text-yellow-400 w-5 h-5" /> },
    { name: "Rest Rooms", icon: <FaRestroom className="text-blue-400 w-5 h-5" /> },
    { name: "Wi-Fi", icon: <FaWifi className="text-indigo-400 w-5 h-5" /> },
    { name: "Food Court", icon: <FaUtensils className="text-green-400 w-5 h-5" /> },
    { name: "Open Gym", icon: <FaDumbbell className="text-gray-400 w-5 h-5" /> },
];

const GameDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const game = gameDetails[id];

    if (!game) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <p className="text-lg text-gray-600">Game not found</p>
            </div>
        );
    }

    const handleBookNow = () => {
        const formattedName = game.name.toLowerCase().replace(/\s+/g, "-").replace(/[()]/g, "");
        navigate(`/book/${formattedName}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-md sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/10 mr-4 transition"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">{game.name}</h1>
                </div>
            </header>

            {/* Image */}
            <div className="relative w-full h-72 sm:h-96 overflow-hidden">
                <img
                    src={game.image}
                    alt={game.name}
                    className="w-full h-full object-cover rounded-b-3xl shadow-md"
                />
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-6 py-10">
                {/* --- Book a Slot --- */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-indigo-700 mb-4">
                        Book a Slot Now
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Secure your game time and enjoy an amazing experience with world-class facilities.
                    </p>
                    <button
                        onClick={handleBookNow}
                        className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform duration-300 shadow-md hover:shadow-lg"
                    >
                        Book Now
                    </button>
                </div>

                {/* --- About Section --- */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                    <h3 className="text-2xl font-semibold text-indigo-700 font-bold mb-3">
                        About
                    </h3>
                    <p className="text-black leading-relaxed text-justify">
                        {game.about}
                    </p>
                </div>

                {/* --- Facilities Section --- */}
                <div className="bg-gradient-to-br from-indigo-100 via-white to-blue-100 rounded-2xl shadow-lg p-8 border border-gray-100">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                        Facilities Available
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                        {facilities.map((facility) => (
                            <div
                                key={facility.name}
                                className="flex flex-col items-center bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-5 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300"
                            >
                                <div className="text-3xl mb-2">{facility.icon}</div>
                                <p className="text-white font-bold">{facility.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameDetailsPage;
