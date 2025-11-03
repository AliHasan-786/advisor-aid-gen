import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {

    const { clientData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Service configuration error. Please contact support.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Input validation schema
    const clientDataSchema = z.object({
      ageRange: z.enum(['25-35', '36-50', '51-65', '65+']),
      primaryGoal: z.string().trim().min(1).max(200),
      milestones: z.string().max(500).optional(),
      dependents: z.string().regex(/^\d+$/, 'Must be a number'),
      employerBenefits: z.string().max(500).optional(),
      riskComfort: z.enum(['Low', 'Moderate', 'High']),
      meetingObjective: z.enum(['Annual Review', 'Life Event', 'Retirement Planning', 'Investment Check-In']),
      channel: z.enum(['In-Person', 'Virtual']),
      timeAvailable: z.enum(['15', '30', '60'])
    });

    // Validate input
    let validatedData;
    try {
      validatedData = clientDataSchema.parse(clientData);
    } catch (validationError: any) {
      console.error('Input validation failed:', validationError);
      return new Response(
        JSON.stringify({ error: 'Invalid input data. Please check your form fields.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client for compliance rules
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch compliance rules
    const { data: complianceRules } = await supabase
      .from('compliance_rules')
      .select('forbidden_phrase');
    
    const forbiddenPhrases = complianceRules?.map(r => r.forbidden_phrase) || [];

    // Sanitize inputs to prevent prompt injection
    const sanitize = (text: string): string => {
      return text
        .replace(/[<>]/g, '')
        .replace(/ignore previous/gi, '[filtered]')
        .replace(/system prompt/gi, '[filtered]')
        .trim();
    };

    // Build system prompt with compliance rules
    const systemPrompt = `You are an AI compliance-aware assistant for a regulated financial-services company (New York Life).
Generate a professional meeting brief for a financial advisor based on the client context provided.

CRITICAL COMPLIANCE RULES:
- Use clear, empathetic, neutral tone (no promises, guarantees, or performance claims)
- NEVER use these forbidden phrases: ${forbiddenPhrases.join(', ')}
- Avoid promissory language like "will outperform", "guaranteed", "assured"
- Always maintain educational, transparent, neutral, empathetic tone
- Focus on questions and discovery, not recommendations
- All recommendations must be reviewed by a licensed representative

Client Context:
- Age Range: ${sanitize(validatedData.ageRange)}
- Primary Goal: ${sanitize(validatedData.primaryGoal)}
- Financial Milestones: ${sanitize(validatedData.milestones || 'None specified')}
- Dependents: ${validatedData.dependents}
- Employer Benefits: ${sanitize(validatedData.employerBenefits || 'None specified')}
- Risk Comfort: ${sanitize(validatedData.riskComfort)}
- Meeting Objective: ${sanitize(validatedData.meetingObjective)}
- Meeting Channel: ${sanitize(validatedData.channel)}
- Time Available: ${validatedData.timeAvailable} minutes

Generate a structured brief with exactly these sections:
1. Meeting Agenda (3-5 items): Key topics to cover based on time available
2. Questions to Ask (5-7 items): Discovery questions to understand client needs
3. Compliance Reminders (3-4 items): Regulatory considerations for this meeting
4. Disclosure Statement: Standard disclosure text (keep professional and brief)
5. Follow-Up Actions (3-4 items): Post-meeting checklist items

Return ONLY valid JSON with this exact structure:
{
  "agenda": ["item1", "item2", ...],
  "questions": ["question1", "question2", ...],
  "compliance_hints": ["hint1", "hint2", ...],
  "disclosure_stub": "disclosure text here",
  "followups": ["action1", "action2", ...]
}`;

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate the meeting brief based on the client context provided.' }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      // Return user-friendly error messages
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Service is temporarily busy. Please try again in a few minutes.' }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Unable to generate brief. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;
    
    // Parse JSON from response
    let brief;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      brief = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return new Response(
        JSON.stringify({ error: 'Unable to process AI response. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter forbidden phrases from all text fields
    const filterForbidden = (text: string): string => {
      let filtered = text;
      forbiddenPhrases.forEach(phrase => {
        const regex = new RegExp(phrase, 'gi');
        filtered = filtered.replace(regex, '[compliant language]');
      });
      return filtered;
    };

    // Apply filtering to all arrays and strings
    brief.agenda = brief.agenda.map(filterForbidden);
    brief.questions = brief.questions.map(filterForbidden);
    brief.compliance_hints = brief.compliance_hints.map(filterForbidden);
    brief.disclosure_stub = filterForbidden(brief.disclosure_stub);
    brief.followups = brief.followups.map(filterForbidden);

    return new Response(
      JSON.stringify({ brief }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in generate-brief:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while generating your brief. Please try again.' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});