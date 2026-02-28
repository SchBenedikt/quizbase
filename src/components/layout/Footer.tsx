
"use client";

import Link from 'next/link';
import { Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#f3f3f1] dark:bg-zinc-950 border-t border-[#4c2f05]/10">
      <div className="studio-container px-4 pt-14 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary p-1.5 rounded-lg">
                <Zap className="h-4 w-4 text-primary-foreground fill-current" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[#4c2f05] dark:text-[#ff9312]">Quizbase</span>
            </div>
            <p className="text-xs text-[#4c2f05]/50 dark:text-white/40 leading-relaxed max-w-[180px]">
              Live interaction for every room. Free, open, real-time.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#4c2f05]/40 dark:text-white/30">Product</h4>
            <ul className="space-y-3 text-sm font-medium text-[#4c2f05]/60 dark:text-white/50">
              <li><Link href="/dashboard">Dashboard</Link></li>
              <li><Link href="/discover">Discover</Link></li>
              <li><Link href="/analytics">Analytics</Link></li>
              <li><Link href="/join">Join Session</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#4c2f05]/40 dark:text-white/30">Resources</h4>
            <ul className="space-y-3 text-sm font-medium text-[#4c2f05]/60 dark:text-white/50">
              <li><Link href="/design">Design System</Link></li>
              <li><Link href="/legal">Legal Notice</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/datenschutz">Datenschutz</Link></li>
            </ul>
          </div>

          {/* Question types quick list */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#4c2f05]/40 dark:text-white/30">Question Types</h4>
            <ul className="space-y-2 text-xs font-medium text-[#4c2f05]/50 dark:text-white/40 columns-1">
              {['Multiple Choice', 'True / False', 'Star Rating', 'Open Text', 'Word Cloud', 'Slider', 'Scale', 'Ranking', 'Guess the Number'].map(t => (
                <li key={t} className="leading-relaxed">{t}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#4c2f05]/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#4c2f05]/30 dark:text-white/20 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Quizbase · Studio Interaction
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-[#4c2f05]/30 dark:text-white/20 uppercase tracking-wider">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
