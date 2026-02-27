
"use client";

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#f3f3f1] dark:bg-zinc-950 border-t border-[#4c2f05]/10 mt-auto">
      <div className="py-12 studio-container flex flex-col md:flex-row items-center justify-between gap-8 px-4">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <span className="text-2xl font-bold tracking-tight text-[#4c2f05] dark:text-[#ff9312]">Quizbase</span>
          <p className="text-xs opacity-40 uppercase tracking-widest text-[#4c2f05] dark:text-white">&copy; {new Date().getFullYear()} Studio Interaction</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8 text-xs opacity-40 text-[#4c2f05] dark:text-white">
          <Link href="/design" className="hover:text-[#ff9312] hover:opacity-100 transition-all">Design System</Link>
          <Link href="/legal" className="hover:text-[#ff9312] hover:opacity-100 transition-all">Legal Notice</Link>
          <Link href="/privacy" className="hover:text-[#ff9312] hover:opacity-100 transition-all">Privacy Policy</Link>
          <Link href="#" className="hover:text-[#ff9312] hover:opacity-100 transition-all">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
