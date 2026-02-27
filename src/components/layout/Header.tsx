
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Zap, Settings, Moon, Sun, LayoutDashboard, Globe } from "lucide-react";
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
      "fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300",
      className
    )}>
      <div className="studio-container">
        <nav className={cn(
          "border rounded-xl px-6 py-3 flex items-center justify-between backdrop-blur-md transition-all shadow-none",
          variant === 'brand' 
            ? "bg-white/10 border-foreground/5 dark:bg-black/20" 
            : "bg-background/90 border-foreground/10"
        )}>
          {/* Branding */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="bg-primary p-1.5 rounded-lg transition-transform group-hover:scale-110">
              <Zap className="h-4 w-4 text-primary-foreground fill-current" />
            </div>
            <span className="text-lg font-bold font-headline tracking-tight">Quizbase</span>
          </Link>
          
          {/* Navigation */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-foreground/5 p-1 rounded-lg border border-foreground/5">
              <Button 
                variant="ghost" 
                asChild 
                className={cn(
                  "rounded-md px-3 font-semibold text-xs h-8 transition-all",
                  pathname === '/discover' ? "bg-foreground text-background" : "hover:bg-foreground/10"
                )}
              >
                <Link href="/discover">
                  <Globe className="h-3 w-3 mr-1.5" /> Discover
                </Link>
              </Button>

              {user ? (
                <>
                  <Button 
                    variant="ghost" 
                    asChild 
                    className={cn(
                      "rounded-md px-3 font-semibold text-xs h-8 transition-all",
                      pathname === '/dashboard' ? "bg-foreground text-background" : "hover:bg-foreground/10"
                    )}
                  >
                    <Link href="/dashboard">
                      <LayoutDashboard className="h-3 w-3 mr-1.5" /> Dashboard
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    asChild 
                    className={cn(
                      "rounded-md px-3 font-semibold text-xs h-8 transition-all",
                      pathname === '/profile' ? "bg-foreground text-background" : "hover:bg-foreground/10"
                    )}
                  >
                    <Link href="/profile">
                      <Settings className="h-3 w-3 mr-1.5" /> Settings
                    </Link>
                  </Button>
                  <Button 
                    onClick={handleSignOut} 
                    variant="ghost" 
                    className="rounded-md px-3 font-semibold text-xs h-8 transition-all hover:bg-foreground/10"
                  >
                    <LogOut className="h-3 w-3 mr-1.5" /> Logout
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Button variant="ghost" asChild className="rounded-lg px-4 h-9 font-semibold text-xs hover:bg-foreground/5 shadow-none">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild className="hidden sm:inline-flex rounded-lg px-5 h-9 font-semibold text-xs bg-foreground text-background border border-foreground hover:bg-transparent hover:text-foreground transition-all shadow-none">
                    <Link href="/login?signup=true">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>

            {mounted && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                className="rounded-lg h-9 w-9 border border-foreground/10 hover:bg-foreground/5 transition-all shadow-none"
                aria-label="Toggle theme"
              >
                {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
