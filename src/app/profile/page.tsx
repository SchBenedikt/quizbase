"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Save, User, Mail, Moon, Sun, Laptop, Link2, Check, FileText } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const userRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "users", user.uid);
  }, [user, db]);

  const { data: userDoc } = useDoc<{ name?: string; bio?: string; username?: string }>(userRef);

  useEffect(() => {
    setMounted(true);
    if (!isUserLoading && !user) {
      router.push("/login");
    }
    if (user) {
      setName(user.displayName || "");
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (userDoc) {
      setBio(userDoc.bio || "");
      setUsername(userDoc.username || "");
    }
  }, [userDoc]);

  const profileUrl = typeof window !== "undefined"
    ? `${window.location.origin}/profile/${user?.uid}`
    : "";

  const handleCopyLink = async () => {
    if (!profileUrl) return;
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied!", description: "Profile link copied to clipboard." });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !user) return;
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      const ref = doc(db, "users", user.uid);
      await setDoc(ref, { name, bio, username, updatedAt: new Date() }, { merge: true });
      toast({ title: t.profile.profileSaved, description: t.profile.profileSavedDesc });
    } catch (e: any) {
      toast({ variant: "destructive", title: t.profile.updateFailed, description: e.message });
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading || !user) return null;

  const initials = (name || user.email || "?").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background font-body flex flex-col">
      <Header variant="minimal" />
      
      <main className="flex-1 studio-container py-28 pb-40 space-y-10">
        <div className="flex items-center gap-5">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.back()} 
            className="rounded-xl h-10 w-10 border shadow-none"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{t.profile.title}</h1>
        </div>

        {/* Profile card summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 rounded-2xl border bg-card shadow-none">
          <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shrink-0 select-none">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold truncate">{name || t.profile.anonymous}</p>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            {bio && <p className="text-sm opacity-60 mt-1 line-clamp-1">{bio}</p>}
          </div>
          <Button
            variant="outline"
            onClick={handleCopyLink}
            className={cn("shrink-0 h-9 rounded-lg gap-2 text-xs font-semibold shadow-none border transition-all", copied && "border-green-500 text-green-600")}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
            {copied ? t.profile.copied : t.profile.shareProfile}
          </Button>
        </div>

        <Tabs defaultValue="identity" className="w-full">
          <TabsList className="bg-muted p-1 h-auto rounded-xl mb-8 flex w-full max-w-md shadow-none">
            <TabsTrigger value="identity" className="flex-1 py-2.5 rounded-lg font-semibold text-xs data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              <User className="w-3.5 h-3.5 mr-1.5" /> {t.profile.profileTab}
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex-1 py-2.5 rounded-lg font-semibold text-xs data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              <Laptop className="w-3.5 h-3.5 mr-1.5" /> {t.profile.appearanceTab}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="identity" className="mt-0 max-w-2xl">
            <Card className="border rounded-2xl bg-card overflow-hidden shadow-none">
              <CardContent className="p-8 space-y-8">
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.profile.displayName}</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30" />
                      <Input 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="h-12 pl-11 pr-4 rounded-xl border bg-muted/50 focus-visible:ring-1 font-medium shadow-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.profile.username}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium select-none">@</span>
                      <Input 
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder={t.profile.usernamePlaceholder}
                        maxLength={30}
                        className="h-12 pl-8 pr-4 rounded-xl border bg-muted/50 focus-visible:ring-1 font-medium shadow-none"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground pl-1">{t.profile.usernameHint}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.profile.bio}</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-3.5 h-4 w-4 opacity-30" />
                      <textarea 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder={t.profile.bioPlaceholder}
                        rows={3}
                        maxLength={200}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border bg-muted/50 font-medium text-sm resize-none outline-none focus:ring-1 focus:ring-ring shadow-none"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground pl-1 text-right">{bio.length}/200</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.profile.email}</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30" />
                      <Input 
                        value={user.email || ""}
                        readOnly
                        className="h-12 pl-11 pr-4 rounded-xl border bg-muted/30 text-foreground/40 focus-visible:ring-0 font-medium cursor-not-allowed shadow-none"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-11 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all gap-2 shadow-none"
                  >
                    {loading ? t.profile.saving : t.profile.saveChanges} <Save className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="mt-0 max-w-2xl">
            <Card className="border rounded-2xl p-8 bg-card space-y-8 shadow-none">
              <div className="space-y-4">
                <h3 className="text-base font-semibold">{t.profile.theme}</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: t.profile.themeLight, icon: Sun },
                    { value: 'dark', label: t.profile.themeDark, icon: Moon },
                    { value: 'system', label: t.profile.themeSystem, icon: Laptop },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      className={cn(
                        "h-14 rounded-xl border text-sm font-semibold flex flex-col items-center justify-center gap-1.5 transition-all shadow-none",
                        mounted && theme === value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-foreground/10 hover:border-foreground/30 text-foreground/60"
                      )}
                    >
                      <Icon className="h-4 w-4" /> {label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
