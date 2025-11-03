import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, ListChecks, MessageSquareQuote, Shield, FileText, CheckSquare } from "lucide-react";
import { BriefData } from "@/pages/Index";
import { useState } from "react";

interface BriefResultsProps {
  data: BriefData;
  onFeedback: (satisfaction: number) => void;
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
    onFeedback(value);
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
    </div>
  );
};