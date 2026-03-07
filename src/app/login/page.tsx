
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
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8">
          <div className="flex bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 gap-2">
            <button 
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all ${!isSignUp ? 'bg-[#ff9312] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all ${isSignUp ? 'bg-[#ff9312] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              Sign Up
            </button>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isSignUp ? "Create an account" : "Welcome back"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isSignUp ? "Get started in minutes." : "Sign in to continue."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4" aria-label="Login form">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold opacity-50 ml-1 text-foreground" htmlFor="email">Email Address</label>
                <Input 
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine.email@beispiel.de"
                  className="h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 font-medium text-gray-900 dark:text-white"
                  aria-required="true"
                  aria-describedby="email-help"
                  required
                />
                <div id="email-help" className="sr-only">
                  Enter your email address to sign in or create an account
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold opacity-50 ml-1 text-foreground" htmlFor="password">Password</label>
                <Input 
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••••"
                  className="h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 font-medium text-gray-900 dark:text-white"
                  aria-required="true"
                  aria-describedby="password-help"
                  required
                />
                <div id="password-help" className="sr-only">
                  Enter your password to secure your account
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 font-semibold rounded-lg bg-[#ff9312] hover:bg-[#e68300] text-white transition-colors"
              aria-label={isSignUp ? "Create new account" : "Sign in to your account"}
            >
              {isSignUp ? "Create Account" : "Sign In"} 
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-300 dark:border-gray-600"></span></div>
            <div className="relative flex justify-center text-xs font-medium text-gray-500 dark:text-gray-400"><span className="bg-gray-50 dark:bg-gray-900 px-3">Or continue with</span></div>
          </div>

          <Button 
            variant="outline" 
            onClick={handleGoogleSignIn}
            className="w-full h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-gray-900 dark:text-white transition-colors"
          >
            <Zap className="mr-2 h-4 w-4 fill-current" /> Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
