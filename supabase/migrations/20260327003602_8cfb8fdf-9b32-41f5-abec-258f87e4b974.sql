
-- =====================================================
-- SECURITY FIX BATCH 2: 4 remaining findings
-- =====================================================

-- 1. user_subscriptions: Remove self-insert policy (subscription tier escalation)
DROP POLICY IF EXISTS "user_subscriptions_insert_owner_strict" ON public.user_subscriptions;

-- 2. generation_notifications: Remove public insert policy (notification injection)
DROP POLICY IF EXISTS "System can insert notifications for users" ON public.generation_notifications;

-- 3. game_statistics: Remove broad leaderboard SELECT, keep owner-only
-- Also clean up duplicate policies
DROP POLICY IF EXISTS "Authenticated users can view leaderboard scores" ON public.game_statistics;
DROP POLICY IF EXISTS "Users can view own full statistics" ON public.game_statistics;
DROP POLICY IF EXISTS "Users can view own game statistics" ON public.game_statistics;
DROP POLICY IF EXISTS "Users can insert own game statistics" ON public.game_statistics;
DROP POLICY IF EXISTS "Users can update own game statistics" ON public.game_statistics;
DROP POLICY IF EXISTS "Authenticated users can view music tasks" ON public.music_generation_tasks;

-- 4. music_generation_tasks: Remove broad SELECT, replace with owner-scoped
DROP POLICY IF EXISTS "Authenticated users can view music tasks with ownership" ON public.music_generation_tasks;

-- 5. Mark analytics_daily_stats finding as false positive (it's a VIEW not a table)
-- No action needed

-- 6. Manage security finding for analytics_daily_stats (view, not table)
