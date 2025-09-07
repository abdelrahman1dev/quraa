"use client";
import React from "react";
import texts from "@/public/locales/texts.json";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Button from "./ui/Button";
import { ArrowDown } from "lucide-react";

function HeroSec() {
  return (
    <section className="flex relative flex-col lg:mt-0 mt-25 lg:flex-row-reverse items-center justify-between min-h-screen px-6 lg:px-20 py-12 gap-12 lg:mr-35">
      {/* Text Side */}
      <div className="flex-1 text-center lg:text-right space-y-6">
        <h1 className="text-4xl lg:text-5xl font-bold text-darkgreen leading-snug">
          {texts.home.heroTitle}
        </h1>
        <p className="text-lg text-gray-700 max-w-xl mx-auto lg:mx-0">
          {texts.home.heroSubtitle}
        </p>
     
        <Button text={texts.navbar.readers} />
      </div>

      {/* Animation Side */}
      <div className="flex-1 relative flex justify-center lg:justify-end">
        <div className="w-64 h-64 lg:w-96 lg:h-96 rounded-full bg-mint/20 flex items-center justify-center shadow-lg relative">
          <DotLottieReact src="/animations/Quran.json" loop autoplay />
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-beige rounded-full border-4 border-gold shadow-md" />
        </div>
      </div>
      <div className="w-32  absolute bottom-0 left-1/2 transform -translate-x-1/2 lg:right-20 lg:translate-x-0">
         <DotLottieReact src="/animations/scrolldown.json" loop autoplay />
        
      </div>
    </section>
  );
}

export default HeroSec;
