"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import CountUp from "react-countup";

function BerandaCard() {
  const [showCard, setShowCard] = useState(false);
  const controls = useAnimation();
  const cardRef = useRef(null);
  const [stats, setStats] = useState({
    perusahaan: 0,
    pcl: 0,
    survei: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError(err.message);
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

  useEffect(() => {
    if (showCard) {
      controls.start({ opacity: 1, y: 0 });
    } else {
      controls.start({ opacity: 0, y: 100 });
    }
  }, [showCard, controls]);

  return (
    <div
      className="absolute hidden md:block w-full z-20 mt-8 md:-mt-24"
      ref={cardRef}
    >
      <motion.div
        className="bg-white w-6/12 max-w-5xl p-3 flex flex-col md:flex-row items-center justify-around mx-auto rounded-xl shadow-md space-y-3 md:space-y-0"
        initial={{ opacity: 0, y: -100 }}
        animate={controls}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <motion.img
            className="hover:cursor-pointer"
            src="/image/factory.png"
            alt="Perusahaan"
            whileHover={{ translateY: -5 }}
            srcSet=""
            width={60}
          />
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
          <motion.img
            className="hover:cursor-pointer"
            src="/image/pcl.png"
            alt="PCL"
            whileHover={{ translateY: -5 }}
            srcSet=""
            width={60}
          />
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
          <motion.img
            className="hover:cursor-pointer"
            src="/image/survey.png"
            alt="Survei"
            whileHover={{ translateY: -5 }}
            srcSet=""
            width={60}
          />
          {showCard && !isLoading && (
            <h5 className="text-center text-3xl text-cdark font-bold font-roboto">
              <CountUp end={stats.survei} duration={1} />
            </h5>
          )}
          <p className="text-center text-lg text-cdark font-roboto font-semibold">
            Survei
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default BerandaCard;
