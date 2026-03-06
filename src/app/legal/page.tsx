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
        <div className="studio-container space-y-12">
          <div className="flex items-center gap-6">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => router.back()} 
              className="rounded-[1.25rem] h-12 w-12 border-2 text-foreground hover:bg-muted shadow-none border-foreground/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">Legal Notice</h1>
          </div>

          <div className="bg-card border-2 border-foreground/10 p-10 md:p-16 rounded-[2.5rem] space-y-16 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.03)]">
            <div className="grid lg:grid-cols-2 gap-16">
              <section className="space-y-4">
                <h2 className="text-2xl font-black uppercase tracking-tight text-primary">Information according to § 5 TMG</h2>
                <div className="text-lg font-bold opacity-80 leading-relaxed space-y-1">
                  <p>PopPulse* Interactive Studio Ltd.</p>
                  <p>Innovation Street 123</p>
                  <p>12345 London, UK</p>
                </div>

                <section className="space-y-4 mt-8">
                  <h2 className="text-2xl font-black uppercase tracking-tight text-primary">Contact</h2>
                  <div className="text-lg font-bold opacity-80 leading-relaxed space-y-1">
                    <p>Phone: +44 (0) 20 1234 5678</p>
                    <p>Email: hello@poppulse.studio</p>
                    <p>Web: www.poppulse.studio</p>
                  </div>
                </section>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-black uppercase tracking-tight text-primary">Represented By</h2>
                <p className="text-lg font-bold opacity-80">
                  John Doe (Chief Executive Officer)
                </p>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-black uppercase tracking-tight text-primary">VAT ID</h2>
                <p className="text-lg font-bold opacity-80">
                  VAT identification number according to § 27 a of the Value Added Tax Act:<br />
                  GB 123 456 789
                </p>
              </section>
            </div>

            <section className="space-y-6 pt-12 border-t-2 border-foreground/5">
              <h2 className="text-2xl font-black uppercase tracking-tight text-primary">Dispute Resolution</h2>
              <p className="text-lg opacity-70 leading-relaxed font-medium max-w-4xl">
                The European Commission provides a platform for online dispute resolution (OS): <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://ec.europa.eu/consumers/odr</a>. Our e-mail address can be found above in the legal notice. We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-black uppercase tracking-tight text-primary opacity-50">Liability for Content</h2>
              <p className="text-lg opacity-70 leading-relaxed font-medium max-w-4xl">
                As a service provider, we are responsible for our own content on these pages in accordance with general laws. However, according to §§ 8 to 10 TMG, we are not obliged to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity. Obligations to remove or block the use of information under general laws remain unaffected.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
