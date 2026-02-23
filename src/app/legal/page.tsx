"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LegalNoticePage() {
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
            <h1 className="text-7xl md:text-[9rem] font-black uppercase tracking-tighter leading-none">Legal Notice</h1>
          </div>

          <div className="bg-card border-4 border-foreground/10 p-12 md:p-24 rounded-[3rem] space-y-20 shadow-[30px_30px_0px_0px_rgba(0,0,0,0.05)]">
            <section className="space-y-8">
              <h2 className="text-4xl font-black uppercase tracking-tight text-primary">Information according to § 5 TMG</h2>
              <p className="text-2xl font-bold opacity-80 leading-tight">
                PopPulse* Interactive Studio<br />
                Innovation Street 123<br />
                12345 London, UK
              </p>
            </section>

            <section className="space-y-8">
              <h2 className="text-4xl font-black uppercase tracking-tight text-primary">Contact</h2>
              <p className="text-2xl font-bold opacity-80 leading-tight">
                Phone: +44 (0) 20 1234 5678<br />
                Email: hello@poppulse.studio
              </p>
            </section>

            <section className="space-y-8">
              <h2 className="text-4xl font-black uppercase tracking-tight text-primary">Represented By</h2>
              <p className="text-2xl font-bold opacity-80 leading-tight">
                John Doe (CEO)
              </p>
            </section>

            <section className="space-y-8">
              <h2 className="text-4xl font-black uppercase tracking-tight text-primary">VAT ID</h2>
              <p className="text-2xl font-bold opacity-80 leading-tight">
                VAT identification number according to § 27 a of the Value Added Tax Act:<br />
                GB 123 456 789
              </p>
            </section>

            <section className="space-y-8 pt-20 border-t-4 border-foreground/5">
              <h2 className="text-4xl font-black uppercase tracking-tight text-primary opacity-50">Disclaimer</h2>
              <p className="text-lg opacity-60 leading-relaxed font-bold uppercase tracking-tight max-w-5xl">
                As a service provider, we are responsible for our own content on these pages in accordance with general laws. However, as a service provider, we are not obliged to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
