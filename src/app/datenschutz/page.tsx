"use client";

import { Header } from "@/components/layout/Header";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function DatenschutzPage() {
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
          <h1 className="text-5xl font-black uppercase tracking-tighter">Datenschutz</h1>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-4xl bg-card border-2 border-foreground/10 p-12 rounded-[2rem] space-y-10">
          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase tracking-tight">1. Datenschutz auf einen Blick</h2>
            <h3 className="text-lg font-black uppercase">Allgemeine Hinweise</h3>
            <p className="text-sm opacity-60 leading-relaxed font-bold uppercase tracking-tight">
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase tracking-tight">2. Datenerfassung auf dieser Website</h2>
            <h3 className="text-lg font-black uppercase">Wer ist verantwortlich für die Datenerfassung?</h3>
            <p className="font-bold opacity-70">
              Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase tracking-tight">3. Ihre Rechte</h2>
            <p className="text-sm opacity-60 leading-relaxed font-bold uppercase tracking-tight">
              Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese Einwilligung jederzeit für die Zukunft widerrufen.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase tracking-tight">4. Analyse-Tools und Tools von Drittanbietern</h2>
            <p className="text-sm opacity-60 leading-relaxed font-bold uppercase tracking-tight">
              Beim Besuch dieser Website kann Ihr Surf-Verhalten statistisch ausgewertet werden. Das geschieht vor allem mit sogenannten Analyse-Programmen. Wir setzen auf dieser Seite Firebase-Dienste zur Authentifizierung und Datenspeicherung ein.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
