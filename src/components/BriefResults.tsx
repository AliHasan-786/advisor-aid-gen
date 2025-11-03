import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  ListChecks,
  MessageSquareQuote,
  Shield,
  FileText,
  CheckSquare,
  Sparkles,
  Target,
  BarChart3
} from "lucide-react";
import type { BriefData } from "@/types/brief";

interface BriefResultsProps {
  data: BriefData;
  onFeedback?: (satisfaction: number) => void;
}

export const BriefResults = ({ data, onFeedback }: BriefResultsProps) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    agenda: true,
    questions: true,
    compliance: true,
    disclosure: true,
    followups: true
  });
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFeedback = (value: number) => {
    onFeedback?.(value);
    setFeedbackGiven(true);
  };

  const sections = [
    {
      id: 'agenda',
      title: 'Meeting Agenda',
      icon: ListChecks,
      items: data.agenda,
      description: 'Structured talking points for the meeting'
    },
    {
      id: 'questions',
      title: 'Questions to Ask',
      icon: MessageSquareQuote,
      items: data.questions,
      description: 'Key questions to guide the conversation'
    },
    {
      id: 'compliance',
      title: 'Compliance Reminders',
      icon: Shield,
      items: data.compliance_hints,
      description: 'Important regulatory considerations'
    },
    {
      id: 'disclosure',
      title: 'Disclosure Statement',
      icon: FileText,
      items: [data.disclosure_stub],
      description: 'Required disclosure for client meetings'
    },
    {
      id: 'followups',
      title: 'Follow-Up Checklist',
      icon: CheckSquare,
      items: data.followups,
      description: 'Post-meeting action items'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Your Meeting Brief</h2>
        {!feedbackGiven && (
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground mr-2">Was this helpful?</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleFeedback(1)}
              className="gap-2"
            >
              <ThumbsUp className="h-4 w-4" />
              Yes
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleFeedback(-1)}
              className="gap-2"
            >
              <ThumbsDown className="h-4 w-4" />
              No
            </Button>
          </div>
        )}
        {feedbackGiven && (
          <span className="text-sm text-muted-foreground">✓ Feedback recorded</span>
        )}
      </div>

      {sections.map((section) => {
        const Icon = section.icon;
        const isOpen = openSections[section.id];

        return (
          <Card key={section.id} className="shadow-medium">
            <Collapsible open={isOpen} onOpenChange={() => toggleSection(section.id)}>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="cursor-pointer hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{section.description}</p>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  <ul className="space-y-3">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="text-primary font-semibold min-w-[24px]">
                          {idx + 1}.
                        </span>
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-medium lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Opportunity Playbook</CardTitle>
                <p className="text-sm text-muted-foreground">
                  High-impact NYL plays derived from the client's data signals
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.opportunities.map((opportunity, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-primary">{opportunity.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{opportunity.rationale}</p>
                  </div>
                </div>
                <p className="text-sm">
                  <span className="font-medium text-primary">Impact:</span> {opportunity.impact}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Signals & Guardrails</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Data cues captured for compliance-ready follow-through
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Guardrails</h4>
              <ul className="space-y-2 text-sm">
                {data.guardrails.map((guardrail, idx) => (
                  <li key={idx} className="flex gap-2">
                    <Badge variant="outline" className="mt-0.5">{idx + 1}</Badge>
                    <span>{guardrail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Data Signals</h4>
              <div className="space-y-3">
                {data.dataSignals.map((signal, idx) => (
                  <div key={idx} className="border rounded-lg p-3">
                    <p className="text-sm font-semibold text-primary">{signal.label}</p>
                    <p className="text-sm text-muted-foreground mt-1">{signal.insight}</p>
                    <p className="text-xs mt-2 text-muted-foreground/80">
                      <span className="font-medium text-foreground">Action:</span> {signal.action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-medium">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Why this beats a generic chatbot</CardTitle>
              <p className="text-sm text-muted-foreground">
                Differentiators tailored to NYL's product and compliance environment
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {data.differentiators.map((item, idx) => (
              <li key={idx} className="flex gap-3 text-sm">
                <Badge variant="secondary">{idx + 1}</Badge>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};