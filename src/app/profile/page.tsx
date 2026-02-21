"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Save, User, Mail, Shield, Smartphone, Bell, Eye } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useUser, useAuth } from "@/firebase";
import { updateProfile } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      toast({ title: "Identity Synced", description: "Your profile has been updated across all pulses." });
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
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 mt-32 space-y-12 pb-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-14 w-14 border-4 border-primary text-primary">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-6xl font-black uppercase tracking-tighter text-primary">Settings.</h1>
          </div>
        </div>

        <Tabs defaultValue="identity" className="w-full">
          <TabsList className="bg-white/50 border-4 border-primary/10 p-2 h-auto rounded-[2rem] mb-12 flex w-full">
            <TabsTrigger value="identity" className="flex-1 py-4 rounded-[1.5rem] font-black uppercase text-xs data-[state=active]:bg-primary data-[state=active]:text-background">
              <User className="w-4 h-4 mr-2" /> Identity
            </TabsTrigger>
            <TabsTrigger value="security" className="flex-1 py-4 rounded-[1.5rem] font-black uppercase text-xs data-[state=active]:bg-primary data-[state=active]:text-background">
              <Shield className="w-4 h-4 mr-2" /> Security
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex-1 py-4 rounded-[1.5rem] font-black uppercase text-xs data-[state=active]:bg-primary data-[state=active]:text-background">
              <Eye className="w-4 h-4 mr-2" /> Interface
            </TabsTrigger>
          </TabsList>

          <TabsContent value="identity">
            <Card className="border-8 border-primary rounded-[4rem] bg-white overflow-hidden">
              <CardContent className="p-12 space-y-12">
                <form onSubmit={handleUpdate} className="space-y-10">
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-[0.5em] opacity-40 ml-6 text-primary">Display Name</label>
                      <div className="relative">
                        <User className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-primary opacity-20" />
                        <Input 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your Professional Handle"
                          className="h-20 pl-20 pr-10 rounded-[2.5rem] border-4 border-primary/10 focus-visible:ring-0 font-black text-2xl uppercase"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-[0.5em] opacity-40 ml-6 text-primary">Email Protocol</label>
                      <div className="relative">
                        <Mail className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-primary opacity-20" />
                        <Input 
                          value={user.email || ""}
                          readOnly
                          className="h-20 pl-20 pr-10 rounded-[2.5rem] border-4 border-primary/5 bg-primary/5 text-primary/40 focus-visible:ring-0 font-black text-2xl"
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-24 text-2xl font-black rounded-[3rem] bg-primary text-background border-4 border-primary hover:bg-transparent hover:text-primary transition-all uppercase tracking-tighter"
                  >
                    {loading ? "Syncing..." : "Commit Changes"} <Save className="ml-3 h-8 w-8" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { icon: Shield, title: "Auth Check", desc: "Two-step verification for presenter vault." },
                { icon: Smartphone, title: "Device Sync", desc: "Manage active presenter terminals." },
              ].map((item, i) => (
                <Card key={i} className="border-4 border-primary/10 rounded-[3rem] p-8 space-y-4 hover:border-primary transition-all bg-white">
                  <item.icon className="h-10 w-10 text-primary" />
                  <h3 className="text-2xl font-black uppercase tracking-tight text-primary">{item.title}</h3>
                  <p className="text-sm font-bold opacity-40 uppercase leading-tight">{item.desc}</p>
                  <Button variant="outline" className="w-full rounded-2xl h-12 border-2 border-primary/10 font-black uppercase text-[10px] tracking-widest">Manage</Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="preferences">
             <Card className="border-4 border-primary/10 rounded-[3rem] p-12 bg-white space-y-8">
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <h4 className="text-xl font-black uppercase text-primary tracking-tight">Vibe Pre-selection</h4>
                      <p className="text-xs font-bold opacity-40 uppercase">Default theme for new pulses.</p>
                   </div>
                   <div className="flex gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#ff9312] border-4 border-primary" />
                      <div className="w-10 h-10 rounded-full bg-[#14ae5c] opacity-20" />
                      <div className="w-10 h-10 rounded-full bg-[#f24822] opacity-20" />
                      <div className="w-10 h-10 rounded-full bg-[#0d99ff] opacity-20" />
                   </div>
                </div>
                <div className="h-px bg-primary/5 w-full" />
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <h4 className="text-xl font-black uppercase text-primary tracking-tight">Audio Feedback</h4>
                      <p className="text-xs font-bold opacity-40 uppercase">Sound on every new participant pulse.</p>
                   </div>
                   <div className="w-16 h-8 bg-primary/10 rounded-full relative">
                      <div className="absolute right-1 top-1 w-6 h-6 bg-primary rounded-full" />
                   </div>
                </div>
             </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}