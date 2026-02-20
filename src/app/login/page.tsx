
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Mail, Lock, ArrowRight, Github } from "lucide-react";
import { useAuth } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";

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
      router.push("/presenter");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
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
      router.push("/presenter");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Sign-In Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row font-body">
      <Header className="hidden lg:flex" />
      
      {/* Left Expressive Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-20 relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <h1 className="text-[12rem] font-black leading-[0.75] text-background uppercase tracking-tighter">
            JOIN <br /> THE <br /> PULSE.
          </h1>
          <p className="text-3xl font-bold text-background uppercase tracking-tight opacity-80 max-w-lg">
            Elevate your interaction to a whole new frequency. Simple. Fast. Expressive.
          </p>
        </div>
        <div className="absolute -bottom-20 -left-20 bg-background/10 w-[40rem] h-[40rem] rounded-full blur-3xl" />
      </div>

      {/* Right Form Side */}
      <main className="flex-1 flex items-center justify-center p-6 bg-[#f3f3f1] lg:pt-32">
        <div className="max-w-md w-full space-y-12">
          <div className="text-center space-y-4">
             <h2 className="text-6xl font-black text-primary uppercase tracking-tighter">
               {isSignUp ? "START HERE." : "WELCOME BACK."}
             </h2>
             <p className="text-sm font-black text-primary uppercase opacity-40 tracking-[0.3em]">
               {isSignUp ? "CREATE YOUR ACCOUNT IN SECONDS" : "SIGN IN TO MANAGE YOUR VIBES"}
             </p>
          </div>

          <Card className="border-8 border-primary rounded-[4rem] bg-white overflow-hidden shadow-none transition-all">
            <CardContent className="p-10 space-y-8">
              <form onSubmit={handleAuth} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 ml-2 text-primary">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary opacity-20" />
                      <Input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="HELLO@POPPULSE.ME"
                        className="h-16 pl-14 pr-6 rounded-2xl border-4 border-primary/10 bg-primary/5 focus-visible:ring-0 font-bold text-primary placeholder:text-primary/20"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 ml-2 text-primary">Your Password</label>
                    <div className="relative">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary opacity-20" />
                      <Input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-16 pl-14 pr-6 rounded-2xl border-4 border-primary/10 bg-primary/5 focus-visible:ring-0 font-bold text-primary placeholder:text-primary/20"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-20 text-xl font-black rounded-2xl bg-primary text-background group hover:bg-transparent hover:text-primary border-4 border-primary transition-all uppercase tracking-tighter"
                >
                  {isSignUp ? "CREATE ACCOUNT" : "SIGN IN NOW"} 
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t-4 border-primary/10"></span></div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.5em] text-primary"><span className="bg-white px-4">OR USE GOOGLE</span></div>
              </div>

              <Button 
                variant="outline" 
                onClick={handleGoogleSignIn}
                className="w-full h-16 rounded-2xl border-4 border-primary/10 font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-colors"
              >
                <Zap className="mr-2 h-5 w-5 fill-primary text-primary" /> Continue with Google
              </Button>

              <p 
                className="text-center text-sm font-black uppercase tracking-tighter cursor-pointer hover:underline text-primary" 
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "ALREADY PART OF THE VIBE? LOG IN" : "NEED AN ACCOUNT? SIGN UP HERE"}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
