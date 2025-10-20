"use client";

import { A11y, Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Card } from "./ui/card";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/a11y";

export function SwiperDemo() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Swiper
        modules={[Navigation, Pagination, A11y, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        navigation
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        className="rounded-lg shadow-lg"
        style={
          {
            "--swiper-navigation-color": "#fff",
            "--swiper-pagination-color": "#fff",
            "--swiper-pagination-bullet-inactive-color": "#999999",
            "--swiper-pagination-bullet-inactive-opacity": "1",
            "--swiper-pagination-bullet-size": "12px",
            "--swiper-pagination-bullet-horizontal-gap": "6px",
          } as any
        }
      >
        <SwiperSlide>
          <Card className="h-[400px] flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
            <h1 className="text-4xl font-bold text-white">Welcome to Swiper</h1>
          </Card>
        </SwiperSlide>
        <SwiperSlide>
          <Card className="h-[400px] flex items-center justify-center bg-gradient-to-r from-green-500 to-teal-600">
            <h1 className="text-4xl font-bold text-white">
              Smooth Transitions
            </h1>
          </Card>
        </SwiperSlide>
        <SwiperSlide>
          <Card className="h-[400px] flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-600">
            <h1 className="text-4xl font-bold text-white">Responsive Design</h1>
          </Card>
        </SwiperSlide>
        <SwiperSlide>
          <Card className="h-[400px] flex items-center justify-center bg-gradient-to-r from-pink-500 to-rose-600">
            <button className="px-6 py-3 bg-white rounded-lg text-pink-600 font-semibold hover:bg-opacity-90 transition-all">
              Get Started
            </button>
          </Card>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
