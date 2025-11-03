import { useState } from "react";
import { ClientForm } from "@/components/ClientForm";
import { BriefResults } from "@/components/BriefResults";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export interface ClientFormData {
  ageRange: string;
  primaryGoal: string;
  milestones: string;
  dependents: string;
  employerBenefits: string;
  riskComfort: string;
  meetingObjective: string;
  channel: string;
  timeAvailable: string;
}

export interface BriefData {
  agenda: string[];
  questions: string[];
  compliance_hints: string[];
  disclosure_stub: string;
  followups: string[];
}

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [briefData, setBriefData] = useState<BriefData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateBrief = async (formData: ClientFormData) => {
    setLoading(true);
    setBriefData(null);

    try {
      // Call edge function to generate brief
      const { data, error } = await supabase.functions.invoke('generate-brief', {
        body: { clientData: formData }
      });

      if (error) throw error;

      setBriefData(data.brief);
      
      // Store session in telemetry
      const { data: sessionData, error: sessionError } = await supabase
        .from('brief_sessions')
        .insert({
          meeting_objective: formData.meetingObjective,
          time_available: parseInt(formData.timeAvailable),
          client_age_range: formData.ageRange,
          primary_goal: formData.primaryGoal,
          risk_comfort: formData.riskComfort,
          meeting_channel: formData.channel
        })
        .select('id')
        .single();

      if (!sessionError && sessionData) {
        setSessionId(sessionData.id);
      }

      toast({
        title: "Brief Generated",
        description: "Your meeting brief is ready for review.",
      });
    } catch (err: any) {
      console.error('Error generating brief:', err);
      toast({
        title: "Generation Failed",
        description: err.message || "Failed to generate brief. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (satisfaction: number) => {
    if (!sessionId) return;

    try {
      await supabase
        .from('brief_sessions')
        .update({ satisfaction })
        .eq('id', sessionId);

      toast({
        title: "Feedback Logged",
        description: "Thank you for your feedback!",
      });
    } catch (err) {
      console.error('Error logging feedback:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-primary">
            Compliant Advisor Brief Builder
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate structured, compliance-aware meeting briefs to help you prepare for client conversations with confidence.
          </p>
        </div>

        <div className="grid gap-8">
          <ClientForm onSubmit={handleGenerateBrief} disabled={loading} />

          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-lg text-muted-foreground">
                Generating your brief...
              </span>
            </div>
          )}

          {briefData && !loading && (
            <BriefResults data={briefData} onFeedback={handleFeedback} />
          )}
        </div>
      </main>

      <footer className="text-center py-8 text-sm text-muted-foreground border-t mt-16">
        Compliant Advisor Brief Builder – AI Safety-by-Design Prototype
      </footer>
    </div>
  );
};

export default Index;