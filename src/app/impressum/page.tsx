"use client";

import { Header } from "@/components/layout/Header";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ImpressumPage() {
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
          <h1 className="text-5xl font-black uppercase tracking-tighter">Impressum</h1>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-4xl bg-card border-2 border-foreground/10 p-12 rounded-[2rem] space-y-10">
          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase tracking-tight">Angaben gemäß § 5 TMG</h2>
            <p className="font-bold opacity-70">
              PopPulse* Interactive Studio<br />
              Musterstraße 123<br />
              12345 Musterstadt
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase tracking-tight">Kontakt</h2>
            <p className="font-bold opacity-70">
              Telefon: +49 (0) 123 456789<br />
              E-Mail: hello@poppulse.studio
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase tracking-tight">Vertreten durch</h2>
            <p className="font-bold opacity-70">
              Max Mustermann (Geschäftsführer)
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase tracking-tight">Umsatzsteuer-ID</h2>
            <p className="font-bold opacity-70">
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
              DE 123 456 789
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase tracking-tight">Haftung für Inhalte</h2>
            <p className="text-sm opacity-60 leading-relaxed font-bold uppercase tracking-tight">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
