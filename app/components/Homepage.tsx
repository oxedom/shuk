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
import About from "./About";
import Pricing from "./Pricing";
import Contact from "./Contact";
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
    <div className="relative bg-black min-h-screen overflow-x-hidden">
      {/* Content overlay */}
      <div className="absolute z-10 w-full left-0 top-0 h-full flex flex-col px-4">
        <Tabs defaultValue="home" className="w-full h-full flex flex-col">
          {/* Mobile and Desktop responsive header */}
          <div className="flex flex-col lg:relative lg:h-auto pt-4 pb-6 lg:pb-0">
            {/* Desktop layout with absolute positioning */}
            <div className="hidden lg:block">
              <TabsList className="absolute w-full top-4 bg-transparent mt-1">
                {/* Home tab - absolutely positioned within the TabsList */}
                <TabsTrigger
                  value={homeTab.value}
                  className={`absolute left-4 ${classForTab}`}
                >
                  {homeTab.label}
                </TabsTrigger>

                {/* Language selector - absolutely positioned on the right */}
                <div className="absolute left-4 top-16 -translate-y-1/2">
                  <FlagLanguageSelector />
                </div>

                {/* Centered main tabs container */}
                <div className="grid grid-cols-3 absolute left-1/2 -translate-x-1/2 gap-16">
                  {/* {mainTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={`${classForTab} data-[state=active]:underline underline-offset-8 `}
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))} */}
                </div>
              </TabsList>
            </div>

            {/* Mobile layout with flexbox */}
            <div className="lg:hidden space-y-4 ">
              <TabsList className="bg-transparent ">
                {/* Mobile navigation - flex row layout */}
                <div className="w-full">
                  <div className="flex flex-col shadow-none  gap-3">
                    {/*TODO REMOVE SHADOW */}
                    <TabsTrigger
                      value={homeTab.value}
                      className={`${classForTab} text-xl shadow-transparent`}
                    >
                      <span className="text-xl shadow-none shadow-transparent ">
                        {homeTab.label}
                      </span>
                    </TabsTrigger>
                    {/* {mainTabs.map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className={`${classForTab} text-sm data-[state=active]:underline underline-offset-4`}
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))} */}
                    <div className="flex justify-start">
                      <FlagLanguageSelector />
                    </div>
                  </div>
                </div>
              </TabsList>
            </div>
          </div>

          {/* Content area - responsive layout */}
          <div className="flex-1 flex flex-col mt-16 lg:mt-0 lg:justify-center">
            <TabsContent value="home" className="text-center">
              <div className="space-y-6">
                <h1 className="text-center text-5xl lg:text-9xl font-bold text-white mb-8">
                  MyTraining
                </h1>
                <div className="flex justify-center items-center gap-1">
                  <Suspense fallback={<div>Loading...</div>}>
                    <LoginButton />
                  </Suspense>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="about" className="lg:text-center">
              <About />
            </TabsContent>

            <TabsContent value="pricing" className="lg:text-center">
              <Pricing />
            </TabsContent>

            <TabsContent value="contact" className="lg:text-center">
              <Contact />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Multiple layered blobs */}
      {blobs.map((blob, index) => (
        <div
          key={index}
          className={`h-full w-full cursor-pointer opacity-100 absolute top-0 ${blob.color}`}
          style={{
            filter: "blur(125px)",
            opacity: "100%",
          }}
        >
          <div
            className="flex w-full h-full transition-all ease-in-out duration-1000 bg-current"
            style={{
              clipPath: `polygon(${blob.path})`,
              transitionDuration: "4s",
            }}
          />
        </div>
      ))}
    </div>
  );
}
