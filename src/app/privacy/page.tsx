"use client";

import { Header } from "@/components/layout/Header";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background font-body selection:bg-primary selection:text-primary-foreground">
      <Header variant="minimal" />
      
      <main className="studio-container py-32 space-y-12">
        <div className="flex items-center gap-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.back()} 
            className="rounded-[1.5rem] h-12 w-12 border-2 text-foreground hover:bg-muted shadow-none"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">Privacy Policy</h1>
        </div>

        <div className="max-w-4xl bg-card border-4 border-[#4c2f05]/10 p-12 rounded-[2rem] space-y-12 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div className="absolute top-10 right-10 opacity-5 rotate-12">
            <ShieldCheck className="h-40 w-40" />
          </div>

          <section className="space-y-6 relative z-10">
            <h2 className="text-3xl font-black uppercase tracking-tight text-primary">1. Data Protection at a Glance</h2>
            <h3 className="text-xl font-black uppercase tracking-widest opacity-40">General Information</h3>
            <p className="text-lg font-bold opacity-80 leading-snug uppercase tracking-tight">
              The following information provides a simple overview of what happens to your personal data when you visit this website. Personal data is any data with which you can be personally identified. Detailed information on the subject of data protection can be found in our privacy policy listed under this text.
            </p>
          </section>

          <section className="space-y-6 relative z-10">
            <h2 className="text-3xl font-black uppercase tracking-tight text-primary">2. Data Collection on This Website</h2>
            <h3 className="text-xl font-black uppercase tracking-widest opacity-40">Responsibility</h3>
            <p className="text-lg font-bold opacity-80 leading-snug uppercase tracking-tight">
              The data processing on this website is carried out by the website operator. You can find their contact details in the legal notice section of this website.
            </p>
          </section>

          <section className="space-y-6 relative z-10">
            <h2 className="text-3xl font-black uppercase tracking-tight text-primary">3. Your Rights</h2>
            <p className="text-sm opacity-60 leading-relaxed font-bold uppercase tracking-tight">
              You have the right at any time to receive information about the origin, recipient, and purpose of your stored personal data free of charge. You also have a right to demand the correction or deletion of this data. If you have given your consent to data processing, you can revoke this consent at any time for the future.
            </p>
          </section>

          <section className="space-y-6 relative z-10 pt-12 border-t-2 border-[#4c2f05]/10">
            <h2 className="text-3xl font-black uppercase tracking-tight text-primary opacity-50">4. Analysis and Third-Party Tools</h2>
            <p className="text-sm opacity-60 leading-relaxed font-bold uppercase tracking-tight">
              When visiting this website, your surfing behavior can be statistically evaluated. This is done primarily with analysis programs. We use Firebase services for authentication and data storage on this site.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
