import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClientForm } from "@/components/ClientForm";
import { BriefResults } from "@/components/BriefResults";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";
import type { Session, User } from "@supabase/supabase-js";

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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingBrief, setGeneratingBrief] = useState(false);
  const [briefData, setBriefData] = useState<BriefData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleGenerateBrief = async (formData: ClientFormData) => {
    if (!user || !session) {
      toast({
        title: "Session Expired",
        description: "Please sign in again to generate a new brief.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setGeneratingBrief(true);
    setBriefData(null);

    try {
      // Call edge function to generate brief
      const { data, error } = await supabase.functions.invoke('generate-brief', {
        body: { clientData: formData }
      });

      if (error) throw error;

      setBriefData(data.brief);
      
      // Store session in telemetry with user_id
      const { data: sessionData, error: sessionError } = await supabase
        .from('brief_sessions')
        .insert({
          user_id: user.id,
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
      setGeneratingBrief(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--nyl-accent))]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={handleLogout} size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-primary">
            Compliant Advisor Brief Builder
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate structured, compliance-aware meeting briefs to help you prepare for client conversations with confidence.
          </p>
        </div>

        <div className="grid gap-8">
          <ClientForm onSubmit={handleGenerateBrief} disabled={generatingBrief} />

          {generatingBrief && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-lg text-muted-foreground">
                Generating your brief...
              </span>
            </div>
          )}

          {briefData && !generatingBrief && (
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