"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Save, User, Mail } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useUser, useAuth } from "@/firebase";
import { updateProfile } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
    if (user) {
      setName(user.displayName || "");
    }
  }, [user, isUserLoading, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      toast({ title: "Profile Updated", description: "Your display name has been synced." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Update Failed", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading || !user) return null;

  return (
    <div className="min-h-screen bg-[#f3f3f1] presenter-ui font-body flex flex-col">
      <Header variant="minimal" />
      
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 mt-32 space-y-12">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-14 w-14 border-4 border-primary text-primary">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-6xl font-black uppercase tracking-tighter text-primary">Identity.</h1>
        </div>

        <Card className="border-8 border-primary rounded-[4rem] bg-white overflow-hidden shadow-none">
          <CardContent className="p-12 space-y-12">
            <form onSubmit={handleUpdate} className="space-y-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-[0.5em] opacity-40 ml-4">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-primary opacity-20" />
                    <Input 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Full Name"
                      className="h-20 pl-16 pr-10 rounded-[2rem] border-4 border-primary/10 focus-visible:ring-0 font-black text-2xl uppercase shadow-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-[0.5em] opacity-40 ml-4">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-primary opacity-20" />
                    <Input 
                      value={user.email || ""}
                      readOnly
                      className="h-20 pl-16 pr-10 rounded-[2rem] border-4 border-primary/5 bg-primary/5 text-primary/40 focus-visible:ring-0 font-black text-2xl shadow-none"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-24 text-2xl font-black rounded-[3rem] bg-primary text-background border-4 border-primary hover:bg-transparent hover:text-primary transition-all uppercase tracking-tighter"
              >
                {loading ? "Syncing..." : "Update Identity"} <Save className="ml-3 h-8 w-8" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}