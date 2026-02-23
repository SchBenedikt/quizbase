"use client";

import { Header } from "@/components/layout/Header";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LegalNoticePage() {
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
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">Legal Notice</h1>
        </div>

        <div className="max-w-4xl bg-card border-4 border-[#4c2f05]/10 p-12 rounded-[2rem] space-y-12 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)]">
          <section className="space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tight text-primary">Information according to § 5 TMG</h2>
            <p className="text-xl font-bold opacity-80 leading-tight">
              PopPulse* Interactive Studio<br />
              Innovation Street 123<br />
              12345 London, UK
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tight text-primary">Contact</h2>
            <p className="text-xl font-bold opacity-80 leading-tight">
              Phone: +44 (0) 20 1234 5678<br />
              Email: hello@poppulse.studio
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tight text-primary">Represented By</h2>
            <p className="text-xl font-bold opacity-80 leading-tight">
              John Doe (CEO)
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tight text-primary">VAT ID</h2>
            <p className="text-xl font-bold opacity-80 leading-tight">
              VAT identification number according to § 27 a of the Value Added Tax Act:<br />
              GB 123 456 789
            </p>
          </section>

          <section className="space-y-6 pt-12 border-t-2 border-[#4c2f05]/10">
            <h2 className="text-3xl font-black uppercase tracking-tight text-primary opacity-50">Disclaimer</h2>
            <p className="text-sm opacity-60 leading-relaxed font-bold uppercase tracking-tight">
              As a service provider, we are responsible for our own content on these pages in accordance with general laws. However, as a service provider, we are not obliged to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
