"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Zap, Settings, Moon, Sun, LayoutDashboard, PlusCircle } from "lucide-react";
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
      "fixed top-0 left-0 right-0 z-50 px-6 py-6 transition-all duration-300",
      className
    )}>
      <nav className={cn(
        "max-w-[1400px] mx-auto border-2 rounded-[1.5rem] px-8 py-4 flex items-center justify-between backdrop-blur-md transition-all shadow-none",
        variant === 'brand' 
          ? "bg-white/10 border-primary/20 dark:bg-black/20" 
          : "bg-background/90 border-foreground/10"
      )}>
        {/* Left: Branding */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="bg-primary p-2 rounded-[1rem] transition-transform group-hover:scale-110">
            <Zap className="h-5 w-5 text-primary-foreground fill-current" />
          </div>
          <span className="text-2xl font-black font-headline tracking-tighter uppercase hidden sm:block">PopPulse*</span>
        </Link>
        
        {/* Center: Main Navigation */}
        {user && (
          <div className="hidden md:flex items-center gap-2 bg-foreground/5 p-1.5 rounded-[1.25rem] border-2 border-foreground/5">
            <Button 
              variant="ghost" 
              asChild 
              className={cn(
                "rounded-[1rem] px-5 font-black uppercase text-xs tracking-widest h-10 transition-all shadow-none",
                pathname === '/dashboard' ? "bg-foreground text-background" : "hover:bg-foreground/10"
              )}
            >
              <Link href="/dashboard">
                <LayoutDashboard className="h-3.5 w-3.5 mr-2" /> Dashboard
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              asChild 
              className={cn(
                "rounded-[1rem] px-5 font-black uppercase text-xs tracking-widest h-10 transition-all shadow-none",
                pathname === '/profile' ? "bg-foreground text-background" : "hover:bg-foreground/10"
              )}
            >
              <Link href="/profile">
                <Settings className="h-3.5 w-3.5 mr-2" /> Settings
              </Link>
            </Button>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {mounted && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="rounded-[1rem] h-11 w-11 border-2 border-foreground/10 hover:bg-foreground/5 transition-all shadow-none"
            >
              {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}

          {!user ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild className="rounded-[1.25rem] px-6 h-11 font-black uppercase text-xs tracking-widest hover:bg-foreground/5 shadow-none">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="rounded-[1.25rem] px-8 h-11 font-black uppercase text-xs tracking-widest bg-foreground text-background border-2 border-foreground hover:bg-transparent hover:text-foreground transition-all shadow-none">
                <Link href="/login?signup=true">Sign Up</Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button onClick={handleSignOut} variant="outline" className="rounded-[1.25rem] h-11 px-6 border-2 border-foreground/10 font-black uppercase text-xs tracking-widest hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all shadow-none">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}