
"use client";

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#f3f3f1] dark:bg-zinc-950 border-t-4 border-[#4c2f05]/10 mt-auto">
      <div className="py-24 studio-container flex flex-col md:flex-row items-center justify-between gap-20 font-black px-4">
        <div className="flex flex-col gap-6 text-center md:text-left">
          <span className="text-5xl tracking-tighter uppercase leading-none text-[#4c2f05] dark:text-[#ff9312]">Quizbase</span>
          <p className="text-[14px] opacity-40 uppercase tracking-[0.4em] text-[#4c2f05] dark:text-white">&copy; {new Date().getFullYear()} Studio interaction</p>
        </div>
        <div className="flex flex-wrap justify-center gap-16 text-[14px] uppercase tracking-[0.4em] opacity-40 text-[#4c2f05] dark:text-white">
          <Link href="/design" className="hover:text-[#ff9312] transition-colors">Design System</Link>
          <Link href="/legal" className="hover:text-[#ff9312] transition-colors">Legal Notice</Link>
          <Link href="/privacy" className="hover:text-[#ff9312] transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-[#ff9312] transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
