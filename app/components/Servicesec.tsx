"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import  Button  from "./ui/Button";

function Servicesec() {
  const services = [
    {
      title: "استمع للتلاوات",
      description: "اكتشف أجمل التلاوات من قراء مدينة الرياض بجودة عالية وسهولة في الوصول.",
      cta: "استمع الآن",
    },
    {
      title: "أضف قارئ جديد",
      description: "ساهم في المنصة عبر إضافة قارئ من منطقتك مع بيانات المسجد وروابط التلاوة.",
      cta: "أضف قارئ",
    },
    {
      title: "التفاعل والتعليقات",
      description: "شارك آرائك وتعليقاتك مع الزوار الآخرين وكن جزءًا من التجربة.",
      cta: "أضف تعليق",
    },
  ];

  return (
    <section className="w-full py-16 px-6 lg:px-20 bg-cream">
      <div className="max-w-6xl mx-auto text-center space-y-10">
        {/* Section Heading */}
        <h2 className="text-3xl lg:text-4xl font-bold text-darkgreen">
          خدمات المنصة
        </h2>
        <p className="text-gray-700 max-w-2xl mx-auto">
          نقدم خدمات متعددة لتسهيل وصولك إلى القراء والتفاعل مع المنصة
        </p>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className="flex flex-col justify-between shadow-md hover:shadow-lg transition rounded-2xl"
            >
              <CardHeader>
                <CardTitle className="text-xl text-darkgreen">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-6 flex-1">
                <p className="text-gray-600">{service.description}</p>
                <Button className="bg-mint text-darkgreen hover:bg-darkgreen hover:text-white transition rounded-xl">
                  {service.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Servicesec;
