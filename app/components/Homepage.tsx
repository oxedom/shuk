"use client";
import { gbc } from "@yuvalkarif/gradient-blob";
import { Suspense, useEffect, useState } from "react";
import LoginButton from "./LoginButton";
import { useIsMobile } from "app/hooks/use-mobile";
import { useTranslations } from "next-intl";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "app/components/ui/tabs";

import FlagLanguageSelector from "./FlagLanguageSelector";

export default function Homepage() {
  const { gb: generateBlob } = gbc({ cacheChance: 50 });
  const isMobile = useIsMobile();
  const t = useTranslations("Homepage.Tabs");

  const homeTab = { value: "home", label: t("home") };
  const mainTabs = [
    { value: "about", label: t("about") },
    { value: "pricing", label: t("pricing") },
    { value: "contact", label: t("contact") },
  ];

  const [blobs, setBlobs] = useState([
    { x: 0, cacheChance: 50, color: "text-[#ff0000]", path: "0% 0%" }, // red
    { x: 0, cacheChance: 50, color: "text-[#ea580c]", path: "0% 0%" }, // orange
    { x: 0, cacheChance: 50, color: "text-[#368ab1]", path: "0% 0%" }, // blue
    { x: 0, cacheChance: 50, color: "text-[#35a426]", path: "0% 0%" }, // green
    // { x: 0, cacheChance: 50, color: "text-[#ffff00]", path: "0% 0%" }, // Yellow
  ]);

  useEffect(() => {
    const generateNewPaths = () => {
      const updatedBlobs = blobs.map((blob, index) => {
        let res = {
          ...blob,
          path: generateBlob(35, {
            x: { min: 0, max: 100 },
            y: { min: 0, max: 100 },
            cacheChance: 35,
          }),
        };
        return res;
      });
      //randomize order of array
      const shuffledBlobs = updatedBlobs.sort(() => Math.random() - 0.5);
      setBlobs(shuffledBlobs);
    };

    // Generate initial paths
    generateNewPaths();

    // Set up interval to regenerate every 5 seconds
    const interval = setInterval(generateNewPaths, 7000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []); // Empty dependency array - run only once on mount

  const classForTab =
    "text-white shadow-none text-3xl data-[state=active]:bg-transparent data-[state=active]:text-white hover:opacity-80";

  return (
    //TODO overflow hiddens is hotfix but needs to be fixed
    <div></div>
  );
}
