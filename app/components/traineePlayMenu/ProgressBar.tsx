"use client";
import React, { useState, useEffect } from "react";

interface ProgressBarProps {
  total: number;
  completedExerciseArray: boolean[] | null;
}

// ${accordionValue.includes(generateAccordionItemId(i)) ? "shadow-sm shadow-primary" : ""}
export function ProgressBar({
  total,
  completedExerciseArray,
}: ProgressBarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile on client side
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setIsVisible(true); // Always visible on desktop
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 30);
    };

    // Set initial state
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobile]);

  const segments = Array.from({ length: total }, (_, i) => (
    <div
      key={i}
      className={`h-2.5 w-full rounded ${
        completedExerciseArray?.[i] ? "bg-primary" : "bg-gray-300"
      } `}
    />
  ));

  return (
    <div
      className={`fixed z-50 top-0 left-0 right-0 bg-background px-4 py-6 md:p-2 w-full gap-y-3 flex-col items-center md:bg-transparent md:static md:flex md:my-2 transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="flex gap-1.5 w-full">{segments}</div>
    </div>
  );
}
