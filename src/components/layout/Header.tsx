
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";

interface HeaderProps {
  className?: string;
  variant?: 'brand' | 'minimal';
}

export function Header({ className, variant = 'brand' }: HeaderProps) {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300",
      variant === 'brand' ? "bg-background" : "bg-[#f3f3f1]"
    )}>
      <nav className={cn(
        "max-w-7xl mx-auto border-4 rounded-full px-8 py-4 flex items-center justify-between transition-all",
        variant === 'brand' 
          ? "bg-white/10 border-primary" 
          : "bg-white border-foreground"
      )}>
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl font-black font-headline tracking-tighter uppercase">PopPulse*</span>
        </Link>
        <div className="hidden lg:flex items-center gap-10 font-black text-[10px] uppercase tracking-[0.2em]">
          <Link href="#features" className="hover:opacity-50 transition-opacity">Vibes</Link>
          <Link href="#how-it-works" className="hover:opacity-50 transition-opacity">Process</Link>
          <Link href="#impact" className="hover:opacity-50 transition-opacity">Impact</Link>
        </div>
        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Button variant="ghost" asChild className="rounded-full px-6 font-black uppercase text-xs hover:bg-primary hover:text-background transition-colors">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="rounded-full px-8 font-black uppercase text-xs bg-primary text-background border-4 border-primary hover:bg-transparent hover:text-primary transition-all">
                <Link href="/login?signup=true">Sign Up</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="rounded-full px-6 font-black uppercase text-xs">
                <Link href="/presenter" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" /> {user.displayName || "Me"}
                </Link>
              </Button>
              <Button onClick={handleSignOut} className="rounded-full px-8 font-black uppercase text-xs bg-foreground text-background border-4 border-foreground hover:bg-transparent hover:text-foreground transition-all">
                <LogOut className="h-4 w-4 mr-2" /> Out
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
