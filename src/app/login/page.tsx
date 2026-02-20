
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6 mt-20">
        <div className="max-w-md w-full space-y-12">
          <div className="text-center space-y-4">
             <div className="bg-primary w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto rotate-6 border-4 border-primary">
                <Zap className="text-background h-10 w-10" />
             </div>
             <h1 className="text-6xl font-black uppercase tracking-tighter">
               {isSignUp ? "JOIN US." : "LOG IN."}
             </h1>
             <p className="text-sm font-black uppercase opacity-40 tracking-[0.3em]">
               Vibe is waiting for you.
             </p>
          </div>

          <Card className="border-8 border-primary rounded-[4rem] bg-white overflow-hidden shadow-none">
            <CardContent className="p-10 space-y-8">
              <form onSubmit={handleAuth} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 ml-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 opacity-20" />
                      <Input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="HELLO@WORLD.COM"
                        className="h-16 pl-14 pr-6 rounded-2xl border-4 border-primary/10 bg-primary/5 focus-visible:ring-0 font-bold"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 ml-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 opacity-20" />
                      <Input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-16 pl-14 pr-6 rounded-2xl border-4 border-primary/10 bg-primary/5 focus-visible:ring-0 font-bold"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-20 text-xl font-black rounded-2xl bg-primary text-background group hover:bg-transparent hover:text-primary border-4 border-primary transition-all"
                >
                  {isSignUp ? "CREATE ACCOUNT" : "SIGN IN"} 
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t-4 border-primary/10"></span></div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.5em]"><span className="bg-white px-4">OR</span></div>
              </div>

              <Button 
                variant="outline" 
                onClick={handleGoogleSignIn}
                className="w-full h-16 rounded-2xl border-4 border-primary/10 font-black uppercase tracking-widest hover:bg-primary/5"
              >
                <Zap className="mr-2 h-5 w-5 fill-primary text-primary" /> Sign in with Google
              </Button>

              <p className="text-center text-sm font-black uppercase tracking-tighter cursor-pointer hover:underline" onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? "Already have an account? Log in" : "Don't have an account? Sign up"}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
