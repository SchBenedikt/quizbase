"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Zap, Settings } from "lucide-react";

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
      "fixed top-0 left-0 right-0 z-50 px-6 py-6 transition-all duration-300",
      variant === 'brand' ? "bg-transparent" : "bg-transparent"
    )}>
      <nav className={cn(
        "max-w-7xl mx-auto border-2 rounded-[1.5rem] px-8 py-4 flex items-center justify-between backdrop-blur-md transition-all shadow-none",
        variant === 'brand' 
          ? "bg-white/10 border-primary/20" 
          : "bg-white/90 border-foreground/10"
      )}>
        <Link href="/" className="flex items-center gap-3 group">
          <Zap className={cn("h-7 w-7 fill-current transition-transform group-hover:scale-110", variant === 'brand' ? "text-primary" : "text-primary")} />
          <span className="text-2xl font-black font-headline tracking-tighter uppercase">PopPulse*</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Button variant="ghost" asChild className="rounded-[1rem] px-6 font-black uppercase text-xs tracking-widest hover:bg-primary/10 shadow-none">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="rounded-[1rem] px-8 font-black uppercase text-xs tracking-widest bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary transition-all shadow-none">
                <Link href="/login?signup=true">Sign Up</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="rounded-[1rem] px-6 font-black uppercase text-xs tracking-widest shadow-none">
                <Link href="/presenter" className="flex items-center gap-2">
                   Vault
                </Link>
              </Button>
              <Button variant="ghost" asChild className="rounded-[1rem] px-6 font-black uppercase text-xs tracking-widest shadow-none">
                <Link href="/profile" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Settings
                </Link>
              </Button>
              <Button onClick={handleSignOut} size="sm" variant="outline" className="rounded-[1rem] px-6 border-2 font-black uppercase text-xs tracking-widest shadow-none">
                <LogOut className="h-3.5 w-3.5 mr-2" /> Out
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
