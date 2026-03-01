
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
      <div className="lg:w-1/2 bg-[#ff9312] p-10 lg:p-16 flex flex-col justify-center text-[#4c2f05]">
        <div className="space-y-6 max-w-xl">
          <h1 className="text-5xl lg:text-7xl font-black leading-[0.9] tracking-tighter uppercase">
            Quizbase
          </h1>
          <div className="space-y-3">
            <p className="text-xl lg:text-2xl font-bold leading-tight">
              Your voice, amplified. <br />
              One simple pulse.
            </p>
            <p className="text-base font-medium opacity-60 leading-relaxed">
              Transform classrooms and boardrooms into living engagement hubs in seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16 bg-[#f3f3f1] dark:bg-zinc-950">
        <div className="w-full max-w-md space-y-8">
          <div className="flex bg-white/50 dark:bg-white/5 p-1.5 rounded-xl border border-foreground/10 mb-6">
            <button 
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all ${!isSignUp ? 'bg-foreground text-primary' : 'text-foreground opacity-40'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all ${isSignUp ? 'bg-foreground text-primary' : 'text-foreground opacity-40'}`}
            >
              Sign Up
            </button>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">
              {isSignUp ? "Create an account" : "Welcome back"}
            </h2>
            <p className="text-sm text-foreground/50">
              {isSignUp ? "Get started in minutes." : "Sign in to continue."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold opacity-50 ml-1 text-foreground">Email Address</label>
                <Input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
                  className="h-12 px-4 rounded-lg border bg-white dark:bg-zinc-900 focus-visible:ring-1 focus-visible:ring-primary font-medium text-foreground shadow-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold opacity-50 ml-1 text-foreground">Password</label>
                <Input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 px-4 rounded-lg border bg-white dark:bg-zinc-900 focus-visible:ring-1 focus-visible:ring-primary font-medium text-foreground shadow-none"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-none"
            >
              {isSignUp ? "Create Account" : "Sign In"} 
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-foreground/10"></span></div>
            <div className="relative flex justify-center text-xs font-medium text-foreground opacity-40"><span className="bg-[#f3f3f1] dark:bg-zinc-950 px-3">Or continue with</span></div>
          </div>

          <Button 
            variant="outline" 
            onClick={handleGoogleSignIn}
            className="w-full h-12 rounded-lg border bg-white dark:bg-zinc-900 font-semibold text-foreground hover:bg-foreground/5 transition-all shadow-none"
          >
            <Zap className="mr-2 h-4 w-4 fill-current" /> Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
