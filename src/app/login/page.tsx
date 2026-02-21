"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, ArrowRight } from "lucide-react";
import { useAuth } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Auth Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f3f3f1] font-body">
      {/* Left Branding Side */}
      <div className="lg:w-1/2 bg-[#ff9312] p-12 lg:p-24 flex flex-col justify-center text-[#4c2f05]">
        <div className="space-y-8 max-w-xl">
          <h1 className="text-8xl lg:text-[10rem] font-black leading-[0.8] tracking-tighter uppercase">
            PopPulse*
          </h1>
          <div className="space-y-4">
            <p className="text-3xl lg:text-4xl font-bold uppercase leading-none tracking-tight">
              Your voice, amplified. <br />
              One simple pulse.
            </p>
            <p className="text-xl font-bold opacity-70 uppercase leading-tight">
              Transform classrooms and boardrooms into living energy fields in seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-24 bg-[#f3f3f1] dark:bg-zinc-950">
        <div className="w-full max-w-md space-y-12">
          <div className="flex bg-white/50 dark:bg-white/5 p-2 rounded-[1.5rem] border-2 border-foreground/10 mb-8">
            <button 
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-4 rounded-[1.5rem] font-black uppercase text-sm transition-all ${!isSignUp ? 'bg-foreground text-primary' : 'text-foreground opacity-40'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-4 rounded-[1.5rem] font-black uppercase text-sm transition-all ${isSignUp ? 'bg-foreground text-primary' : 'text-foreground opacity-40'}`}
            >
              Sign Up
            </button>
          </div>

          <div className="space-y-4">
            <h2 className="text-5xl font-black text-foreground uppercase tracking-tighter">
              {isSignUp ? "Join the pulse." : "Welcome back."}
            </h2>
            <p className="text-sm font-bold text-foreground opacity-40 uppercase tracking-widest leading-none">
              {isSignUp ? "Create your personal hub in minutes." : "Log in to your account to continue."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.4em] opacity-40 ml-2 text-foreground">Email Address</label>
                <Input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
                  className="h-16 px-6 rounded-[1.5rem] border-2 border-foreground/10 bg-white dark:bg-zinc-900 focus-visible:ring-0 font-bold text-foreground shadow-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.4em] opacity-40 ml-2 text-foreground">Password</label>
                <Input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-16 px-6 rounded-[1.5rem] border-2 border-foreground/10 bg-white dark:bg-zinc-900 focus-visible:ring-0 font-bold text-foreground shadow-none"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-20 text-xl font-black rounded-[1.5rem] bg-foreground text-primary border-2 border-foreground hover:bg-transparent hover:text-foreground transition-all uppercase tracking-tighter shadow-none"
            >
              {isSignUp ? "Create Account" : "Login"} 
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t-2 border-foreground/10"></span></div>
            <div className="relative flex justify-center text-xs font-black uppercase tracking-[0.4em] text-foreground"><span className="bg-[#f3f3f1] dark:bg-zinc-950 px-4">Or continue with</span></div>
          </div>

          <Button 
            variant="outline" 
            onClick={handleGoogleSignIn}
            className="w-full h-16 rounded-[1.5rem] border-2 border-foreground/10 bg-white dark:bg-zinc-900 font-black uppercase tracking-widest text-foreground hover:bg-foreground/5 transition-all shadow-none"
          >
            <Zap className="mr-2 h-5 w-5 fill-current" /> Google
          </Button>
        </div>
      </div>
    </div>
  );
}