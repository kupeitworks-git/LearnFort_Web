import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiMapPin } from "react-icons/fi";
import Gramcourt from "../../images/Court.png";
import football from '../../images/football.png'
import cricket from '../../images/cricket.png'
import Badminton from '../../images/Badminton.png';
import swim from '../../images/swim.png'
import tennis from '../../images/tenniscourt.png'
import hoops from '../../images/hoops.png'
import victory from '../../images/victory.png'
import basketball from '../../images/basketball.png'







const venueData = {
    football: {
        name: "Victory Sports Arena",
        location: "Downtown, Dindigul",
        price: 1200,
        image:football,
        about:
            "A premium 7-a-side football turf with professional lighting, high-quality artificial grass, and ample sidelines for substitutes.",
        facilities: ["Night Lighting", "Changing Room", "Free Parking", "Drinking Water", "High-Speed WiFi"],
    },
    cricket: {
        name: "Elite Cricket Ground",
        location: "Westside, Dindigul",
        price: 1500,
        image:cricket,
        about:
            "Well-maintained cricket turf with bowling machine support, boundary nets, and marked pitch for professional practice.",
        facilities: ["Night Lighting", "Changing Room", "Food Court", "Free Parking", "Drinking Water"],
    },
    tennis: {
        name: "Grand Slam Courts",
        location: "Riverside, Dindigul",
        price: 600,
        image: tennis,
        about:
            "Hard-court tennis surfaces with proper markings, lighting, and spectator space for friendly matches and coaching.",
        facilities: ["Night Lighting", "Changing Room", "Gym Area", "Free Parking", "Drinking Water"],
    },
    basketball: {
        name: "Hoops Arena",
        location: "East End, Dindigul",
        price: 800,
        image:basketball,
        about:
            "Full-sized basketball court with acrylic flooring, breakaway rims, and perimeter lighting for evening games.",
        facilities: ["Night Lighting", "Changing Room", "Food Court", "Free Parking", "Drinking Water"],
    },
    badminton: {
        name: "Smash Point Arena",
        location: "Central, Dindigul",
        price: 400,
        image: Badminton,
        about:
            "Indoor badminton setup with non-slip flooring, proper court markings, and evenly distributed lighting.",
        facilities: ["Night Lighting", "Changing Room", "High-Speed WiFi", "Free Parking", "Drinking Water"],
    },
    swimming: {
        name: "Blue Wave Pool",
        location: "Lakeside, Dindigul",
        price: 300,
        image:swim,
        about:
            "Crystal clear half-Olympic pool with trained lifeguards, shower area, and kids-friendly sections.",
        facilities: ["Changing Room", "Free Parking", "Drinking Water", "Food Court"],
    },
};

const VenueDetails = () => {
    const { sportType } = useParams();
    const navigate = useNavigate();

    const venue = venueData[sportType] || {
        name: "LearnFort Sports Venue",
        location: "Dindigul",
        price: 500,
        image:
            "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1470&q=80",
        about:
            "A versatile sports venue powered by LearnFort Sports Park, ideal for practice, coaching, and friendly matches.",
        facilities: ["Night Lighting", "Changing Room", "Free Parking", "Drinking Water"],
    };

    const sportLabel = sportType
        ? sportType
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")
        : "Sport";

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200">

            {/* HERO IMAGE */}
            <div className="relative w-full h-60 md:h-80 overflow-hidden  shadow-lg">
                <img
                    src={venue.image}
                    alt={venue.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* BACK BUTTON */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 bg-black/60 hover:bg-black/75 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm shadow-lg transition"
                >
                    <FiArrowLeft />
                    Back
                </button>
            </div>

            {/* Main card */}
            <div className="max-w-5xl mx-auto px-4 pb-16 mt-12">
                <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">

                    {/* Mobile Header Band */}
                    <div className="bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#38BDF8] text-white px-5 py-6 md:px-8 md:py-6 md:hidden">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-blue-100">
                            LearnFort Sports Park
                        </p>
                        <p className="text-[11px] text-blue-100/90 mt-1">{sportLabel} Venue</p>
                        <h1 className="text-2xl font-semibold mt-1">{venue.name}</h1>
                        <div className="flex items-center text-sm text-blue-100 mt-2">
                            <FiMapPin className="mr-1" />
                            {venue.location}
                        </div>
                        <div className="flex items-end gap-2 mt-4">
                            <span className="text-3xl font-bold">${venue.price}</span>
                            <span className="text-sm text-blue-100 mb-1">per slot</span>
                        </div>
                    </div>

                    {/* Grid Layout */}
                    <div className="md:px-8 md:py-10 px-5 py-6 grid md:grid-cols-[2fr,1.3fr] gap-10">

                        {/* LEFT SECTION — ABOUT + FACILITIES */}
                        <div>
                            {/* <p className="text-xl md:text-base text-slate-600 mb-1">
                                <span className="font-bold">{sportLabel}</span>
                            </p> */}
                            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3">
                                About this venue
                            </h2>

                            <p className="text-slate-700 text-sm md:text-base leading-relaxed text-justify">
                                {venue.about}
                            </p>

                            <h3 className="mt-10 text-xl md:text-2xl font-semibold text-slate-900 mb-4">
                                Facilities Available
                            </h3>

                            <div className="flex flex-wrap gap-3">
                                {venue.facilities.map((f) => (
                                    <span
                                        key={f}
                                        className="px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium shadow-sm"
                                    >
                                        {f}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT SECTION — BOOKING CARD */}
                        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-md">
                            <p className="text-lg font-bold tracking-widest text-slate-700 uppercase">
                                {sportLabel} slot details
                            </p>

                            <p className="mt-2 text-3xl font-bold text-slate-900">
                                ${venue.price}
                                <span className="ml-1 text-sm text-slate-500 font-normal">per slot</span>
                            </p>

                            <p className="mt-3 text-xs text-emerald-700 inline-flex items-center bg-emerald-100 px-3 py-1 rounded-full font-medium">
                                ● Open for bookings
                            </p>

                            <p className="mt-3 text-xs text-slate-500">
                                Prices may vary for weekends and special events.
                            </p>

                            <div className="mt-6 flex flex-col gap-3">
                                <button
                                    onClick={() => navigate(`/book/${sportType}`)}
                                    className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white font-semibold py-3 rounded-full shadow-md hover:shadow-xl transition transform hover:-translate-y-0.5"
                                >
                                    Book this venue
                                </button>

                                {/* <button
                                    type="button"
                                    className="w-full border border-slate-300 text-slate-700 font-medium py-3 rounded-full hover:bg-slate-100 transition text-sm"
                                >
                                    Call to know more
                                </button> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default VenueDetails;
