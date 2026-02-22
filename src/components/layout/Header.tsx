"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Zap, Settings, Moon, Sun, LayoutDashboard } from "lucide-react";
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
  const pathname = usePathname();
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
      "fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 sm:py-6 transition-all duration-300",
      className
    )}>
      <nav className={cn(
        "max-w-[1400px] mx-auto border-2 rounded-[1.5rem] px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between backdrop-blur-md transition-all shadow-none",
        variant === 'brand' 
          ? "bg-white/10 border-foreground/5 dark:bg-black/20" 
          : "bg-background/90 border-foreground/10"
      )}>
        {/* Branding */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
          <div className="bg-primary p-2 rounded-[1rem] transition-transform group-hover:scale-110">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground fill-current" />
          </div>
          <span className="text-xl sm:text-2xl font-black font-headline tracking-tighter uppercase">PopPulse*</span>
        </Link>
        
        {/* Navigation */}
        <div className="flex items-center gap-2 sm:gap-4">
          {user && (
            <div className="hidden sm:flex items-center gap-1 bg-foreground/5 p-1 rounded-[1.25rem] border-2 border-foreground/5">
              <Button 
                variant="ghost" 
                asChild 
                className={cn(
                  "rounded-[1rem] px-4 font-black uppercase text-[10px] tracking-widest h-9 transition-all",
                  pathname === '/dashboard' ? "bg-foreground text-background" : "hover:bg-foreground/10"
                )}
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="h-3 w-3 mr-2" /> Dashboard
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                asChild 
                className={cn(
                  "rounded-[1rem] px-4 font-black uppercase text-[10px] tracking-widest h-9 transition-all",
                  pathname === '/profile' ? "bg-foreground text-background" : "hover:bg-foreground/10"
                )}
              >
                <Link href="/profile">
                  <Settings className="h-3 w-3 mr-2" /> Settings
                </Link>
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {mounted && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                className="rounded-[1rem] h-9 w-9 sm:h-11 sm:w-11 border-2 border-foreground/10 hover:bg-foreground/5 transition-all shadow-none"
                aria-label="Toggle theme"
              >
                {resolvedTheme === 'dark' ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>
            )}

            {!user ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="rounded-[1.25rem] px-4 sm:px-6 h-9 sm:h-11 font-black uppercase text-[10px] sm:text-xs tracking-widest hover:bg-foreground/5 shadow-none">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="hidden sm:inline-flex rounded-[1.25rem] px-8 h-11 font-black uppercase text-xs tracking-widest bg-foreground text-background border-2 border-foreground hover:bg-transparent hover:text-foreground transition-all shadow-none">
                  <Link href="/login?signup=true">Sign Up</Link>
                </Button>
              </div>
            ) : (
              <Button onClick={handleSignOut} variant="outline" className="rounded-[1.25rem] h-9 sm:h-11 px-4 sm:px-6 border-2 border-foreground/10 font-black uppercase text-[10px] sm:text-xs tracking-widest hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all shadow-none">
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" /> <span className="hidden sm:inline">Logout</span>
              </Button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
