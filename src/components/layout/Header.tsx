
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { LogOut, Zap, Settings, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface HeaderProps {
  className?: string;
  variant?: 'brand' | 'minimal';
}

export function Header({ className, variant = 'brand' }: HeaderProps) {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 px-6 py-6 transition-all duration-300",
      className
    )}>
      <nav className={cn(
        "max-w-[1400px] mx-auto border-2 rounded-[1.5rem] px-8 py-3 flex items-center justify-between backdrop-blur-md transition-all shadow-none",
        variant === 'brand' 
          ? "bg-white/10 border-primary/20 dark:bg-black/20" 
          : "bg-background/90 border-foreground/10"
      )}>
        <Link href="/" className="flex items-center gap-2 group">
          <Zap className="h-6 w-6 text-primary fill-current transition-transform group-hover:scale-110" />
          <span className="text-xl font-black font-headline tracking-tighter uppercase">PopPulse*</span>
        </Link>
        
        <div className="flex items-center gap-2">
          {mounted && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="rounded-[1rem] h-10 w-10 border-2 border-transparent hover:border-foreground/10 transition-all"
            >
              {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}

          {!user ? (
            <div className="flex items-center gap-2 ml-2">
              <Button variant="ghost" asChild className="rounded-[1rem] px-5 font-black uppercase text-xs tracking-widest hover:bg-primary/10 shadow-none">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="rounded-[1rem] px-6 font-black uppercase text-xs tracking-widest bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary transition-all shadow-none">
                <Link href="/login?signup=true">Sign Up</Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Button variant="ghost" asChild className="rounded-[1rem] px-5 font-black uppercase text-xs tracking-widest shadow-none">
                <Link href="/presenter">Dashboard</Link>
              </Button>
              <Button variant="ghost" asChild className="rounded-[1rem] h-10 w-10 p-0 shadow-none">
                <Link href="/profile">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
              <Button onClick={handleSignOut} variant="outline" size="sm" className="rounded-[1rem] px-4 ml-2 border-2 font-black uppercase text-xs tracking-widest shadow-none">
                <LogOut className="h-3.5 w-3.5 mr-2" /> Logout
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
