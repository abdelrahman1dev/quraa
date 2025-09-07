"use client";
import React from "react";
import texts from "@/public/locales/texts.json";
import Link from "next/link";

function Footer() {
  return (
    <footer className="bg-darkgreen text-cream mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-mint mb-4">
            {texts.app.title}
          </h2>
          <p className="text-sm opacity-80 leading-relaxed">
            {texts.app.description}
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-lg font-semibold text-gold mb-3">
            {texts.navbar.title}
          </h3>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:opacity-70">{texts.navbar.home}</Link></li>
            <li><Link href="/readers" className="hover:opacity-70">{texts.navbar.readers}</Link></li>
            <li><Link href="/about" className="hover:opacity-70">{texts.navbar.about}</Link></li>
            <li><Link href="/contact" className="hover:opacity-70">{texts.navbar.contact}</Link></li>
          </ul>
        </div>

        {/* Readers Info */}
        <div>
          <h3 className="text-lg font-semibold text-gold mb-3">
            {texts.home.featuredReaders}
          </h3>
          <p className="text-sm opacity-80">{texts.home.registeredReaders}: 120+</p>
          <p className="text-sm opacity-80">{texts.home.latestReaders}: 15</p>
        </div>

        {/* Contact / Social */}
        <div>
          <h3 className="text-lg font-semibold text-gold mb-3">
            {texts.navbar.contact}
          </h3>
          <p className="text-sm opacity-80">📧 info@quraa.com</p>
          <p className="text-sm opacity-80">📍 Riyadh, Saudi Arabia</p>
          <div className="flex gap-4 mt-4">
            <Link href="https://twitter.com" target="_blank" className="hover:opacity-70">🐦</Link>
            <Link href="https://facebook.com" target="_blank" className="hover:opacity-70">📘</Link>
            <Link href="https://instagram.com" target="_blank" className="hover:opacity-70">📸</Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-cream/20 mt-6 py-4 text-center text-sm text-cream/80">
        © {new Date().getFullYear()} {texts.app.title}. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
