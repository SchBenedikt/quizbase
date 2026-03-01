"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, User, Mail, Moon, Sun, Laptop, Link2, Check, FileText, BarChart3, Trophy, AtSign } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase, useCollection } from "@/firebase";
import { updateProfile } from "firebase/auth";
import { doc, setDoc, collection, query, where } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
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
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance'>('profile');

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const userRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "users", user.uid);
  }, [user, db]);

  const { data: userDoc } = useDoc<{ name?: string; bio?: string; username?: string }>(userRef);

  // Count public surveys
  const surveysQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, `users/${user.uid}/surveys`), where("isPublic", "==", true));
  }, [db, user]);
  const { data: publicSurveys } = useCollection(surveysQuery);

  // Count sessions hosted
  const sessionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "sessions"), where("userId", "==", user.uid));
  }, [db, user]);
  const { data: sessions } = useCollection(sessionsQuery);

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
    toast({ title: t.profile.copied, description: profileUrl });
    setTimeout(() => setCopied(false), 2000);
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
      
      <main className="flex-1 studio-container py-28 pb-16">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-10">
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

        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          {/* LEFT SIDEBAR — Avatar, stats, share */}
          <aside className="space-y-5">
            {/* Avatar card */}
            <div className="rounded-2xl border bg-card p-8 flex flex-col items-center text-center space-y-5 shadow-none">
              <div className="w-24 h-24 rounded-3xl bg-primary text-primary-foreground flex items-center justify-center text-4xl font-black select-none">
                {initials}
              </div>
              <div className="space-y-1.5 w-full">
                <p className="text-xl font-bold truncate">{name || t.profile.anonymous}</p>
                {username && <p className="text-sm text-muted-foreground">@{username}</p>}
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                {bio && <p className="text-sm opacity-60 mt-3 leading-relaxed line-clamp-3">{bio}</p>}
              </div>
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className={cn(
                  "w-full h-10 rounded-xl gap-2 text-sm font-semibold shadow-none border transition-all",
                  copied && "border-green-500 text-green-600 dark:text-green-400"
                )}
              >
                {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                {copied ? t.profile.copied : t.profile.shareProfile}
              </Button>
            </div>

            {/* Stats card */}
            <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-none">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-sm font-medium">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Public Surveys
                  </div>
                  <span className="text-lg font-bold tabular-nums">{publicSurveys?.length ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-sm font-medium">
                    <Trophy className="h-4 w-4 text-primary" />
                    Sessions Hosted
                  </div>
                  <span className="text-lg font-bold tabular-nums">{sessions?.length ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-2 p-1 bg-muted rounded-xl">
              <button
                onClick={() => setActiveTab('profile')}
                className={cn(
                  "flex-1 h-9 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
                  activeTab === 'profile'
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <User className="h-3.5 w-3.5" /> {t.profile.profileTab}
              </button>
              <button
                onClick={() => setActiveTab('appearance')}
                className={cn(
                  "flex-1 h-9 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
                  activeTab === 'appearance'
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Laptop className="h-3.5 w-3.5" /> {t.profile.appearanceTab}
              </button>
            </div>
          </aside>

          {/* RIGHT CONTENT PANEL */}
          <div className="rounded-2xl border bg-card shadow-none overflow-hidden">
            {activeTab === 'profile' ? (
              <form onSubmit={handleUpdate} className="p-8 space-y-8">
                <div className="border-b pb-6 mb-2">
                  <h2 className="text-lg font-bold">Account Information</h2>
                  <p className="text-sm text-muted-foreground mt-1">Update your display name, username and bio.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Display Name */}
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

                  {/* Username */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.profile.username}</label>
                    <div className="relative">
                      <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30" />
                      <Input 
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder={t.profile.usernamePlaceholder}
                        maxLength={30}
                        className="h-12 pl-11 pr-4 rounded-xl border bg-muted/50 focus-visible:ring-1 font-medium shadow-none"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">{t.profile.usernameHint}</p>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.profile.bio}</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-3.5 h-4 w-4 opacity-30" />
                    <textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder={t.profile.bioPlaceholder}
                      rows={4}
                      maxLength={300}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border bg-muted/50 font-medium text-sm resize-none outline-none focus:ring-1 focus:ring-ring shadow-none"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground text-right">{bio.length}/300</p>
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.profile.email}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30" />
                    <Input 
                      value={user.email || ""}
                      readOnly
                      className="h-12 pl-11 pr-4 rounded-xl border bg-muted/20 text-foreground/40 focus-visible:ring-0 font-medium cursor-not-allowed shadow-none"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Email cannot be changed here.</p>
                </div>

                <div className="pt-2 flex gap-3">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="h-12 px-8 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all gap-2 shadow-none"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? t.profile.saving : t.profile.saveChanges}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-8 space-y-8">
                <div className="border-b pb-6 mb-2">
                  <h2 className="text-lg font-bold">{t.profile.theme}</h2>
                  <p className="text-sm text-muted-foreground mt-1">Choose how Quizbase looks on your device.</p>
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-lg">
                  {[
                    { value: 'light', label: t.profile.themeLight, icon: Sun, desc: 'Clean and bright' },
                    { value: 'dark', label: t.profile.themeDark, icon: Moon, desc: 'Easy on the eyes' },
                    { value: 'system', label: t.profile.themeSystem, icon: Laptop, desc: 'Follows OS setting' },
                  ].map(({ value, label, icon: Icon, desc }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      className={cn(
                        "p-5 rounded-2xl border text-left flex flex-col gap-3 transition-all shadow-none",
                        mounted && theme === value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-foreground/10 hover:border-foreground/20 text-foreground/60 hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("h-6 w-6", mounted && theme === value ? "text-primary" : "")} />
                      <div>
                        <p className="text-sm font-bold text-foreground">{label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

