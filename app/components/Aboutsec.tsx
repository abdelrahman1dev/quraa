"use client";
import React from "react";
import texts from "@/public/locales/texts.json";

function Aboutsec() {
  return (
    <section className="w-full bg-cream py-16 px-6 lg:px-20">
      <div className="max-w-5xl mx-auto text-center lg:text-right space-y-6">
        {/* Section Title */}
        <h2 className="text-3xl lg:text-4xl font-bold text-darkgreen">
          {texts.about.title} {/* this is "قصتنا" */}
        </h2>

        {/* Section Content */}
        <p className="text-gray-700 leading-relaxed text-lg max-w-3xl mx-auto lg:mx-0">
          {`"${texts.about.description}"`}
        </p>
      </div>
    </section>
  );
}

export default Aboutsec;
