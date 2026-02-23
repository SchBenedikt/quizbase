"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, ShieldCheck } from "lucide-react";
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

          <div className="bg-card border-4 border-foreground/10 p-12 md:p-24 rounded-[3rem] space-y-20 shadow-[30px_30px_0px_0px_rgba(0,0,0,0.05)] relative overflow-hidden">
            <div className="absolute top-20 right-20 opacity-5 rotate-12 pointer-events-none">
              <ShieldCheck className="h-[400px] w-[400px]" />
            </div>

            <section className="space-y-8 relative z-10">
              <h2 className="text-4xl font-black uppercase tracking-tight text-primary">1. Data Protection at a Glance</h2>
              <h3 className="text-2xl font-black uppercase tracking-widest opacity-40">General Information</h3>
              <p className="text-2xl font-bold opacity-80 leading-snug uppercase tracking-tight max-w-5xl">
                The following information provides a simple overview of what happens to your personal data when you visit this website. Personal data is any data with which you can be personally identified. Detailed information on the subject of data protection can be found in our privacy policy listed under this text.
              </p>
            </section>

            <section className="space-y-8 relative z-10">
              <h2 className="text-4xl font-black uppercase tracking-tight text-primary">2. Data Collection on This Website</h2>
              <h3 className="text-2xl font-black uppercase tracking-widest opacity-40">Responsibility</h3>
              <p className="text-2xl font-bold opacity-80 leading-snug uppercase tracking-tight max-w-5xl">
                The data processing on this website is carried out by the website operator. You can find their contact details in the legal notice section of this website.
              </p>
            </section>

            <section className="space-y-8 relative z-10">
              <h2 className="text-4xl font-black uppercase tracking-tight text-primary">3. Your Rights</h2>
              <p className="text-lg opacity-60 leading-relaxed font-bold uppercase tracking-tight max-w-5xl">
                You have the right at any time to receive information about the origin, recipient, and purpose of your stored personal data free of charge. You also have a right to demand the correction or deletion of this data. If you have given your consent to data processing, you can revoke this consent at any time for the future.
              </p>
            </section>

            <section className="space-y-8 relative z-10 pt-20 border-t-4 border-foreground/5">
              <h2 className="text-4xl font-black uppercase tracking-tight text-primary opacity-50">4. Analysis and Third-Party Tools</h2>
              <p className="text-lg opacity-60 leading-relaxed font-bold uppercase tracking-tight max-w-5xl">
                When visiting this website, your surfing behavior can be statistically evaluated. This is done primarily with analysis programs. We use Firebase services for authentication and data storage on this site.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
