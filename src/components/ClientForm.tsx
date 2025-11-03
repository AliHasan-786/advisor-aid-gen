import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ClientFormData } from "@/pages/Index";

interface ClientFormProps {
  onSubmit: (data: ClientFormData) => void;
  disabled?: boolean;
}

export const ClientForm = ({ onSubmit, disabled }: ClientFormProps) => {
  const [formData, setFormData] = useState<ClientFormData>({
    ageRange: "36-50",
    primaryGoal: "",
    milestones: "",
    dependents: "0",
    employerBenefits: "",
    riskComfort: "Moderate",
    meetingObjective: "Annual Review",
    channel: "In-Person",
    timeAvailable: "30"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="p-6 shadow-medium">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Age Range */}
          <div className="space-y-2">
            <Label htmlFor="ageRange">Client Age Range</Label>
            <Select value={formData.ageRange} onValueChange={(v) => updateField('ageRange', v)}>
              <SelectTrigger id="ageRange">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25-35">25-35</SelectItem>
                <SelectItem value="36-50">36-50</SelectItem>
                <SelectItem value="51-65">51-65</SelectItem>
                <SelectItem value="65+">65+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Risk Comfort */}
          <div className="space-y-2">
            <Label htmlFor="riskComfort">Risk Comfort Level</Label>
            <Select value={formData.riskComfort} onValueChange={(v) => updateField('riskComfort', v)}>
              <SelectTrigger id="riskComfort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Moderate">Moderate</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Primary Goal */}
          <div className="space-y-2">
            <Label htmlFor="primaryGoal">Primary Financial Goal</Label>
            <Input
              id="primaryGoal"
              value={formData.primaryGoal}
              onChange={(e) => updateField('primaryGoal', e.target.value)}
              placeholder="e.g., Retirement savings, college fund"
              required
            />
          </div>

          {/* Dependents */}
          <div className="space-y-2">
            <Label htmlFor="dependents">Number of Dependents</Label>
            <Input
              id="dependents"
              type="number"
              min="0"
              value={formData.dependents}
              onChange={(e) => updateField('dependents', e.target.value)}
            />
          </div>

          {/* Meeting Objective */}
          <div className="space-y-2">
            <Label htmlFor="meetingObjective">Meeting Objective</Label>
            <Select value={formData.meetingObjective} onValueChange={(v) => updateField('meetingObjective', v)}>
              <SelectTrigger id="meetingObjective">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Annual Review">Annual Review</SelectItem>
                <SelectItem value="Life Event">Life Event</SelectItem>
                <SelectItem value="Retirement Planning">Retirement Planning</SelectItem>
                <SelectItem value="Investment Check-In">Investment Check-In</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Available */}
          <div className="space-y-2">
            <Label>Time Available</Label>
            <RadioGroup
              value={formData.timeAvailable}
              onValueChange={(v) => updateField('timeAvailable', v)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="15" id="time15" />
                <Label htmlFor="time15" className="font-normal cursor-pointer">15 min</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="30" id="time30" />
                <Label htmlFor="time30" className="font-normal cursor-pointer">30 min</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="60" id="time60" />
                <Label htmlFor="time60" className="font-normal cursor-pointer">60 min</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Full-width fields */}
        <div className="space-y-2">
          <Label htmlFor="milestones">Financial Milestones</Label>
          <Textarea
            id="milestones"
            value={formData.milestones}
            onChange={(e) => updateField('milestones', e.target.value)}
            placeholder="e.g., Recent home purchase, upcoming marriage"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employerBenefits">Employer Benefits Available</Label>
          <Textarea
            id="employerBenefits"
            value={formData.employerBenefits}
            onChange={(e) => updateField('employerBenefits', e.target.value)}
            placeholder="e.g., 401(k) match, health insurance"
            rows={2}
          />
        </div>

        {/* Meeting Channel */}
        <div className="space-y-2">
          <Label>Meeting Channel</Label>
          <RadioGroup
            value={formData.channel}
            onValueChange={(v) => updateField('channel', v)}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="In-Person" id="channelInPerson" />
              <Label htmlFor="channelInPerson" className="font-normal cursor-pointer">In-Person</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Virtual" id="channelVirtual" />
              <Label htmlFor="channelVirtual" className="font-normal cursor-pointer">Virtual</Label>
            </div>
          </RadioGroup>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={disabled}>
          Generate Brief
        </Button>
      </form>
    </Card>
  );
};