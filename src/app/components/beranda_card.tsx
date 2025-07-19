"use client";

import React, { useState, useEffect, useRef } from "react";
import CountUp from "react-countup";
import Image from "next/image";

function BerandaCard() {
  const [showCard, setShowCard] = useState(false);
  const cardRef = useRef(null);
  const [stats, setStats] = useState({
    perusahaan: 0,
    pcl: 0,
    survei: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch stats data from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();

        if (result.success) {
          setStats(result.data);
        } else {
          throw new Error(result.message || "Failed to fetch statistics");
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowCard(true);
      } else {
        setShowCard(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className="absolute hidden md:block w-full z-20 mt-8 md:-mt-24"
      ref={cardRef}
    >
      <div
        className={`bg-white w-6/12 max-w-5xl p-3 flex flex-col md:flex-row items-center justify-around mx-auto rounded-xl shadow-md space-y-3 md:space-y-0 transition-all duration-500 ${
          showCard ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-24'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="hover:-translate-y-1 transition-transform duration-200">
            <Image
              src="/image/factory.png"
              alt="Perusahaan"
              width={60}
              height={60}
            />
          </div>
          {showCard && !isLoading && (
            <h5 className="text-center text-3xl text-cdark font-bold font-roboto">
              <CountUp end={stats.perusahaan} duration={5} />
            </h5>
          )}
          <p className="text-center text-lg text-cdark font-roboto font-semibold">
            Perusahaan
          </p>
        </div>

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="hover:-translate-y-1 transition-transform duration-200">
            <Image src="/image/pcl.png" alt="PCL" width={60} height={60} />
          </div>
          {showCard && !isLoading && (
            <h5 className="text-center text-3xl text-cdark font-bold font-roboto">
              <CountUp end={stats.pcl} duration={2} />
            </h5>
          )}
          <p className="text-center text-lg text-cdark font-roboto font-semibold">
            Pencacah
          </p>
        </div>

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="hover:-translate-y-1 transition-transform duration-200">
            <Image
              src="/image/survey.png"
              alt="Survei"
              width={60}
              height={60}
            />
          </div>
          {showCard && !isLoading && (
            <h5 className="text-center text-3xl text-cdark font-bold font-roboto">
              <CountUp end={stats.survei} duration={1} />
            </h5>
          )}
          <p className="text-center text-lg text-cdark font-roboto font-semibold">
            Survei
          </p>
        </div>
      </div>
    </div>
  );
}

export default BerandaCard;
