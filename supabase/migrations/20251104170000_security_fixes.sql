-- Ensure existing brief sessions have a user_id before enforcing NOT NULL
DELETE FROM public.brief_sessions
WHERE user_id IS NULL;

ALTER TABLE public.brief_sessions
ALTER COLUMN user_id SET NOT NULL;

-- Allow system components to manage user roles while preserving user visibility
CREATE POLICY "Service role can manage user roles"
ON public.user_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to register their own default role when needed
CREATE POLICY "Users can register with default role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND role = 'user');

-- Allow users to delete their profile records (e.g., for data removal requests)
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
