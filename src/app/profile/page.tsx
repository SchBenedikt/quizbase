"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Save, User, Mail, Shield, Smartphone, Bell, Eye, Palette } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
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
    if (!auth.currentUser || !user) return;
    setLoading(true);
    try {
      // Update Auth Profile
      await updateProfile(auth.currentUser, { displayName: name });
      
      // Sync to Firestore User Doc
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { name });

      toast({ 
        title: "Identity Synced", 
        description: "Your profile has been updated across all pulses." 
      });
    } catch (e: any) {
      toast({ 
        variant: "destructive", 
        title: "Update Failed", 
        description: e.message 
      });
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background presenter-ui font-body flex flex-col">
      <Header variant="minimal" />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-32 space-y-12 pb-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => router.back()} 
              className="rounded-[1.5rem] h-12 w-12 border-2 text-foreground hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-5xl font-black uppercase tracking-tighter">Settings</h1>
          </div>
        </div>

        <Tabs defaultValue="identity" className="w-full">
          <TabsList className="bg-muted border-2 p-1 h-auto rounded-[1.5rem] mb-12 flex w-full">
            <TabsTrigger value="identity" className="flex-1 py-4 rounded-[1.5rem] font-black uppercase text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <User className="w-4 h-4 mr-2" /> Identity
            </TabsTrigger>
            <TabsTrigger value="security" className="flex-1 py-4 rounded-[1.5rem] font-black uppercase text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Shield className="w-4 h-4 mr-2" /> Security
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex-1 py-4 rounded-[1.5rem] font-black uppercase text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Eye className="w-4 h-4 mr-2" /> Interface
            </TabsTrigger>
          </TabsList>

          <TabsContent value="identity" className="mt-0">
            <Card className="border-2 rounded-[1.5rem] bg-card overflow-hidden shadow-none">
              <CardContent className="p-10 space-y-10">
                <form onSubmit={handleUpdate} className="space-y-10">
                  <div className="grid gap-8">
                    <div className="space-y-3">
                      <label className="text-sm font-black uppercase tracking-widest opacity-40 ml-2">Display Name</label>
                      <div className="relative">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 opacity-20" />
                        <Input 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Studio Master"
                          className="h-16 pl-16 pr-8 rounded-[1.5rem] border-2 bg-muted focus-visible:ring-1 font-bold text-xl uppercase shadow-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-black uppercase tracking-widest opacity-40 ml-2">Protocol Address</label>
                      <div className="relative">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 opacity-20" />
                        <Input 
                          value={user.email || ""}
                          readOnly
                          className="h-16 pl-16 pr-8 rounded-[1.5rem] border-2 bg-muted/50 text-foreground/40 focus-visible:ring-0 font-bold text-xl cursor-not-allowed shadow-none"
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-20 text-xl font-black rounded-[1.5rem] bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary transition-all uppercase tracking-tight shadow-none"
                  >
                    {loading ? "Syncing..." : "Commit Changes"} <Save className="ml-3 h-6 w-6" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-0">
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: Shield, title: "Auth Check", desc: "Two-step verification for presenter vault." },
                { icon: Smartphone, title: "Terminal Sync", desc: "Manage active presenter devices." },
              ].map((item, i) => (
                <Card key={i} className="border-2 rounded-[1.5rem] p-8 space-y-4 bg-card shadow-none">
                  <item.icon className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-black uppercase tracking-tight">{item.title}</h3>
                  <p className="text-sm font-bold opacity-60 uppercase leading-tight">{item.desc}</p>
                  <Button variant="outline" className="w-full rounded-[1rem] h-12 border-2 font-black uppercase text-xs tracking-widest shadow-none">Configure</Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="mt-0">
             <Card className="border-2 rounded-[1.5rem] p-10 bg-card space-y-8 shadow-none">
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <h4 className="text-xl font-black uppercase tracking-tight">Vibe Pre-selection</h4>
                      <p className="text-sm font-bold opacity-40 uppercase">Default theme for your next pulse.</p>
                   </div>
                   <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#ff9312] border-2 border-foreground" />
                      <div className="w-8 h-8 rounded-full bg-[#14ae5c] opacity-20 border-2 border-transparent" />
                      <div className="w-8 h-8 rounded-full bg-[#f24822] opacity-20 border-2 border-transparent" />
                      <div className="w-8 h-8 rounded-full bg-[#0d99ff] opacity-20 border-2 border-transparent" />
                   </div>
                </div>
                <div className="h-px bg-foreground/10 w-full" />
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <h4 className="text-xl font-black uppercase tracking-tight">Audio Feedback</h4>
                      <p className="text-sm font-bold opacity-40 uppercase">Play sound on every incoming pulse.</p>
                   </div>
                   <div className="w-14 h-7 bg-primary/10 rounded-full relative cursor-pointer border-2 border-primary/20">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-primary rounded-full" />
                   </div>
                </div>
             </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
