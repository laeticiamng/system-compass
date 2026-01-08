-- Add game_statistics table for tracking player stats
CREATE TABLE public.game_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_games_played INTEGER NOT NULL DEFAULT 0,
  total_turns_played INTEGER NOT NULL DEFAULT 0,
  best_score_solo INTEGER DEFAULT 0,
  best_score_race INTEGER DEFAULT 0,
  archetypes_used JSONB DEFAULT '[]'::jsonb,
  countries_visited TEXT[] DEFAULT ARRAY[]::TEXT[],
  total_risk_events INTEGER DEFAULT 0,
  risk_successes INTEGER DEFAULT 0,
  risk_failures INTEGER DEFAULT 0,
  total_money_earned INTEGER DEFAULT 0,
  total_money_lost INTEGER DEFAULT 0,
  total_health_lost INTEGER DEFAULT 0,
  favorite_actions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_stats UNIQUE (user_id)
);

-- Enable Row Level Security
ALTER TABLE public.game_statistics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own statistics" 
ON public.game_statistics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own statistics" 
ON public.game_statistics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own statistics" 
ON public.game_statistics 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_game_statistics_updated_at
BEFORE UPDATE ON public.game_statistics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enhance profiles table with additional fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS nationalities TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS education_level TEXT,
ADD COLUMN IF NOT EXISTS profession_id TEXT,
ADD COLUMN IF NOT EXISTS motor_profile TEXT,
ADD COLUMN IF NOT EXISTS risk_tolerance TEXT DEFAULT 'medium';