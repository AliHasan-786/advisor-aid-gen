import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import type { Brief } from '@/types/mindshare';
import { getComplianceIQColor, getCoverageColor } from '@/lib/complianceScoring';

interface BriefDetailDrawerProps {
  brief: Brief;
  onClose: () => void;
  supervisorView: boolean;
}

export function BriefDetailDrawer({ brief, onClose, supervisorView }: BriefDetailDrawerProps) {
  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Brief Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* Header Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{brief.advisor.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {brief.office} • {brief.product}
                </p>
              </div>
              <Badge variant={brief.approved ? 'default' : 'destructive'}>
                {brief.approved ? 'Approved' : 'Pending'}
              </Badge>
            </div>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span>Tenure: {brief.advisor.tenure}</span>
              <span>•</span>
              <span>{brief.channel}</span>
              <span>•</span>
              <span>{brief.timeAvailableMin} min</span>
              <span>•</span>
              <span>{new Date(brief.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Compliance IQ */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Compliance IQ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div 
                  className="text-4xl font-bold"
                  style={{ color: getComplianceIQColor(brief.complianceIQ) }}
                >
                  {brief.complianceIQ}
                </div>
                <div className="flex-1">
                  <Progress 
                    value={brief.complianceIQ} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {brief.complianceIQ >= 85 ? 'Excellent' : brief.complianceIQ >= 70 ? 'Acceptable' : 'Needs Improvement'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coverage Dimensions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Coverage Dimensions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(brief.coverage).map(([dimension, score]) => (
                <div key={dimension}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{dimension.replace(/_/g, ' ')}</span>
                    <span style={{ color: getCoverageColor(score) }}>
                      {Math.round(score * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={score * 100}
                    className="h-1.5"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Redlines */}
          {brief.flags.length > 0 && (
            <Card className="border-destructive/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  Compliance Redlines ({brief.flags.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {brief.flags.map((flag, idx) => (
                  <div key={idx} className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <X className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium line-through text-destructive">"{flag.text}"</p>
                        <p className="text-muted-foreground text-xs mt-1">{flag.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 ml-6">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-green-700 dark:text-green-400">
                        Suggested: "{flag.fix}"
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Brief Text */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Meeting Brief</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs whitespace-pre-wrap font-mono bg-muted p-3 rounded">
                {brief.briefText}
              </pre>
            </CardContent>
          </Card>

          {/* Supervisor Actions */}
          {supervisorView && !brief.approved && (
            <div className="flex gap-2">
              <Button className="flex-1" variant="default">
                Approve
              </Button>
              <Button className="flex-1" variant="outline">
                Request Changes
              </Button>
            </div>
          )}

          {brief.supervisorComment && (
            <Card className="bg-muted">
              <CardContent className="pt-4">
                <p className="text-sm">
                  <span className="font-semibold">Supervisor:</span> {brief.supervisorComment}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Watermark */}
          <p className="text-xs text-center text-muted-foreground">
            Synthetic Demo Data • Not affiliated with any real firm
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
