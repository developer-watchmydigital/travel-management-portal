"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

interface MagicBentoCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  depth?: number;
  onClick?: () => void;
}

export const MagicBentoCard: React.FC<MagicBentoCardProps> = ({
  children,
  className = "",
  glowColor = "rgba(255, 90, 60, 0.15)",
  depth = 15,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    // Calculate rotation (-depth to +depth degrees)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -depth;
    const rotateY = ((x - centerX) / centerX) * depth;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: isHovered ? rotate.x : 0,
        rotateY: isHovered ? rotate.y : 0,
        scale: isHovered ? 1.015 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
      }}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className={`relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-gradient-to-b dark:from-[#111A35]/90 dark:to-[#0A1024]/90 backdrop-blur-xl transition-all duration-300 ${
        isHovered
          ? "shadow-2xl shadow-slate-300/60 dark:shadow-black/60 border-[#FF5A3C]/30 dark:border-white/20"
          : "shadow-md shadow-slate-200/50 dark:shadow-black/30"
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {/* Dynamic Cursor Spotlight Radial Glow */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 70%)`,
        }}
      />

      {/* Internal Content with preserve-3d */}
      <div className="relative z-10 h-full w-full">{children}</div>
    </motion.div>
  );
};
