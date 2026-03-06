
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Zap, Settings, Moon, Sun, LayoutDashboard, Compass, BarChart3, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTranslation, type Locale } from "@/contexts/LanguageContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  const { t, locale, setLocale } = useTranslation();

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

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'de' : 'en');
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container mx-auto px-6 h-14 flex items-center justify-between max-w-screen-2xl">
        {/* Branding */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-md bg-foreground flex items-center justify-center transition-transform group-hover:scale-105">
            <Zap className="h-4 w-4 text-background" />
          </div>
          <span className="text-lg font-semibold">Quizbase</span>
        </Link>
        
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            asChild 
            className={cn(
              "h-9 px-3 text-sm font-medium",
              pathname === '/discover' ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Link href="/discover">
              <Compass className="h-4 w-4 mr-2" /> Discover
            </Link>
          </Button>

          {user && (
            <Button 
              variant="ghost" 
              asChild 
              className={cn(
                "h-9 px-3 text-sm font-medium",
                pathname === '/dashboard' ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
              </Link>
            </Button>
          )}

          <div className="h-6 w-px bg-border mx-1" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9"
                title="Toggle theme"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLocale}
              className="h-9 w-9 text-xs font-medium"
              title="Toggle language"
            >
              {locale === 'en' ? 'DE' : 'EN'}
            </Button>

            {user ? (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className="h-9 w-9 rounded-full"
                  title="Profile Settings"
                >
                  <Link href="/profile">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-foreground text-background text-sm font-medium">
                        {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="h-9 px-3 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </Button>
              </>
            ) : (
              <Button
                asChild
                className="h-9 px-4 text-sm font-medium bg-foreground text-background hover:bg-foreground/90"
              >
                <Link href="/login">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

