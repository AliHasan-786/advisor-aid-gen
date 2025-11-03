import { useState } from "react";
import { ClientForm } from "@/components/ClientForm";
import { BriefResults } from "@/components/BriefResults";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, BarChart3, ClipboardList, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateBrief } from "@/lib/demoBriefGenerator";
import type { BriefData, ClientFormData } from "@/types/brief";

const highlights = [
  {
    title: "Compliance autopilot",
    description: "Translates Reg BI, DFS 187, and NYL field guidance into conversational prompts — no manual checklist juggling.",
    icon: ShieldCheck
  },
  {
    title: "Data-fed opportunity engine",
    description: "Uses structured client inputs to surface cross-sell plays tied to NYL playbooks, not generic AI guesswork.",
    icon: BarChart3
  },
  {
    title: "Supervisor-ready telemetry",
    description: "Every output is formatted for Salesforce logging and compliance review so nothing stays trapped in a chat window.",
    icon: ClipboardList
  }
];

const Index = () => {
  const [generatingBrief, setGeneratingBrief] = useState(false);
  const [briefData, setBriefData] = useState<BriefData | null>(null);
  const { toast } = useToast();

  const handleGenerateBrief = async (formData: ClientFormData) => {
    setGeneratingBrief(true);
    setBriefData(null);

    // Simulate latency so the prototype feels like a real service call
    await new Promise((resolve) => setTimeout(resolve, 650));

    const brief = generateBrief(formData);
    setBriefData(brief);

    toast({
      title: "Brief generated",
      description: "Tailored NYL-ready agenda, questions, and guardrails are ready for review.",
    });

    setGeneratingBrief(false);
  };

  const handleFeedback = (satisfaction: number) => {
    toast({
      title: satisfaction > 0 ? "Thanks for the signal!" : "Appreciate the candid feedback",
      description:
        satisfaction > 0
          ? "This helps showcase how the prototype resonates with advisors."
          : "I'll use this to call out additional enhancements during interviews.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3 max-w-2xl">
            <Badge variant="secondary" className="w-fit gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Recruiter demo mode
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-primary">
              NYL Advisor Brief Builder Prototype
            </h1>
            <p className="text-lg text-muted-foreground">
              A guided experience that turns a few structured inputs into a compliance-ready meeting plan,
              highlighting how I think about AI products for regulated financial services.
            </p>
          </div>

          <Card className="border-dashed border-primary/40 bg-primary/5 max-w-sm">
            <CardHeader>
              <CardTitle className="text-base">What to look for</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Differentiated workflows vs. raw ChatGPT prompts</p>
              <p>• Built-in compliance guardrails and telemetry</p>
              <p>• Product storytelling aligned with NYL's internship charter</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="shadow-sm border border-primary/20">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {item.description}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-8">
          <ClientForm onSubmit={handleGenerateBrief} disabled={generatingBrief} />

          {generatingBrief && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-lg text-muted-foreground">
                Generating your NYL-aligned brief...
              </span>
            </div>
          )}

          {briefData && !generatingBrief && (
            <BriefResults data={briefData} onFeedback={handleFeedback} />
          )}
        </div>
      </main>

      <footer className="text-center py-8 text-sm text-muted-foreground border-t mt-16">
        Compliant Advisor Brief Builder – Portfolio Prototype by Ali Hasan
      </footer>
    </div>
  );
};

export default Index;
