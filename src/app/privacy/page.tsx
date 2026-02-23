"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, ShieldCheck, Database, Lock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background font-body selection:bg-primary selection:text-primary-foreground flex flex-col">
      <Header variant="minimal" />
      
      <main className="flex-grow pt-40 pb-24">
        <div className="studio-container space-y-16">
          <div className="flex items-center gap-8">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => router.back()} 
              className="rounded-[1.5rem] h-16 w-16 border-4 text-foreground hover:bg-muted shadow-none border-foreground/10"
            >
              <ArrowLeft className="h-8 w-8" />
            </Button>
            <h1 className="text-7xl md:text-[9rem] font-black uppercase tracking-tighter leading-none">Privacy Policy</h1>
          </div>

          <div className="bg-card border-4 border-foreground/10 p-12 md:p-24 rounded-[3rem] space-y-24 shadow-[30px_30px_0px_0px_rgba(0,0,0,0.05)] relative overflow-hidden">
            <div className="absolute top-20 right-20 opacity-5 rotate-12 pointer-events-none">
              <ShieldCheck className="h-[400px] w-[400px]" />
            </div>

            <section className="space-y-10 relative z-10">
              <div className="flex items-center gap-6 text-primary">
                <Database className="h-10 w-10" />
                <h2 className="text-4xl font-black uppercase tracking-tight">1. Data Protection at a Glance</h2>
              </div>
              <div className="space-y-6 text-xl font-medium opacity-80 leading-relaxed max-w-5xl">
                <p>
                  The following information provides a simple overview of what happens to your personal data when you visit this website. Personal data is any data with which you can be personally identified.
                </p>
                <p>
                  Data collection on this website is carried out by the website operator. Their contact details can be found in the "Legal Notice" section of this website. Your data is collected on the one hand by you communicating it to us (e.g. registration) and on the other hand by our IT systems (e.g. usage data).
                </p>
              </div>
            </section>

            <section className="space-y-10 relative z-10">
              <div className="flex items-center gap-6 text-primary">
                <Lock className="h-10 w-10" />
                <h2 className="text-4xl font-black uppercase tracking-tight">2. Your Rights</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-12 text-xl font-medium opacity-80 leading-relaxed max-w-5xl">
                <div className="space-y-4">
                  <h3 className="text-2xl font-black uppercase tracking-widest text-foreground">Right to Information</h3>
                  <p>You have the right to receive information about the origin, recipient and purpose of your stored personal data at any time free of charge.</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black uppercase tracking-widest text-foreground">Right to Correction</h3>
                  <p>You have the right to request the correction or deletion of your data if it is incorrect or no longer required.</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black uppercase tracking-widest text-foreground">Revocation</h3>
                  <p>If you have given your consent to data processing, you can revoke this consent at any time for the future.</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black uppercase tracking-widest text-foreground">Complaint</h3>
                  <p>You have the right to lodge a complaint with the competent supervisory authority.</p>
                </div>
              </div>
            </section>

            <section className="space-y-10 relative z-10 pt-20 border-t-4 border-foreground/5">
              <div className="flex items-center gap-6 text-primary">
                <Eye className="h-10 w-10" />
                <h2 className="text-4xl font-black uppercase tracking-tight">3. Analysis & Third-Party Tools</h2>
              </div>
              <div className="space-y-8 text-xl font-medium opacity-80 leading-relaxed max-w-5xl">
                <div className="p-8 bg-foreground/5 rounded-[2rem] border-2 border-foreground/5">
                  <h3 className="text-2xl font-black uppercase tracking-widest text-foreground mb-4">Firebase Services</h3>
                  <p>
                    This website uses Firebase, a platform from Google, to provide authentication and real-time database services. Firebase helps us secure your sessions and provide instant synchronization between presenters and participants. Data is stored on Google servers, which may be located outside the UK or EU.
                  </p>
                </div>
                <div className="p-8 bg-foreground/5 rounded-[2rem] border-2 border-foreground/5">
                  <h3 className="text-2xl font-black uppercase tracking-widest text-foreground mb-4">Server Log Files</h3>
                  <p>
                    The provider of the pages automatically collects and stores information in so-called server log files, which your browser automatically transmits to us. These include browser type, operating system, referrer URL, and time of the server request.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
