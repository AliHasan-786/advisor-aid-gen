-- Create telemetry table for storing brief generation sessions
CREATE TABLE IF NOT EXISTS public.brief_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  meeting_objective TEXT,
  time_available INTEGER,
  client_age_range TEXT,
  primary_goal TEXT,
  risk_comfort TEXT,
  meeting_channel TEXT,
  satisfaction INTEGER CHECK (satisfaction IN (-1, 0, 1)),
  feedback_text TEXT
);

-- Enable RLS
ALTER TABLE public.brief_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public app)
CREATE POLICY "Anyone can insert sessions"
  ON public.brief_sessions
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read (for analytics)
CREATE POLICY "Anyone can read sessions"
  ON public.brief_sessions
  FOR SELECT
  USING (true);

-- Create compliance rules reference table
CREATE TABLE IF NOT EXISTS public.compliance_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forbidden_phrase TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert initial forbidden phrases
INSERT INTO public.compliance_rules (forbidden_phrase, severity) VALUES
  ('guaranteed', 'high'),
  ('promise', 'high'),
  ('outperform', 'medium'),
  ('surefire', 'high'),
  ('no-risk', 'high'),
  ('assured', 'high'),
  ('certain returns', 'high'),
  ('will definitely', 'medium');

-- Enable RLS for compliance rules
ALTER TABLE public.compliance_rules ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read compliance rules
CREATE POLICY "Anyone can read compliance rules"
  ON public.compliance_rules
  FOR SELECT
  USING (true);