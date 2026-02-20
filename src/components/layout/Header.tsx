"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
  variant?: 'brand' | 'minimal';
}

export function Header({ className, variant = 'brand' }: HeaderProps) {
  return (
    <header className={cn("px-6 py-8 max-w-7xl mx-auto w-full", className)}>
      <nav className={cn(
        "border-4 rounded-full px-8 py-4 flex items-center justify-between transition-all",
        variant === 'brand' 
          ? "bg-white/10 border-primary" 
          : "bg-white border-foreground"
      )}>
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl font-black font-headline tracking-tighter uppercase">PopPulse*</span>
        </Link>
        <div className="hidden lg:flex items-center gap-10 font-black text-xs uppercase tracking-[0.2em]">
          <Link href="#" className="hover:opacity-50 transition-opacity">Manifesto</Link>
          <Link href="#" className="hover:opacity-50 transition-opacity">The Tools</Link>
          <Link href="#" className="hover:opacity-50 transition-opacity">Showcase</Link>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="rounded-full px-6 font-black uppercase text-xs hover:bg-primary hover:text-background transition-colors">
            <Link href="/join">Join</Link>
          </Button>
          <Button asChild className="rounded-full px-8 font-black uppercase text-xs bg-primary text-background border-4 border-primary hover:bg-transparent hover:text-primary transition-all">
            <Link href="/presenter">Dashboard</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}