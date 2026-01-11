-- Protect music_cache - public read, admin write
DROP POLICY IF EXISTS "Anyone can read music cache" ON public.music_cache;
DROP POLICY IF EXISTS "Admins can manage music cache" ON public.music_cache;
DROP POLICY IF EXISTS "Public read access" ON public.music_cache;

CREATE POLICY "Anyone can read music cache" 
ON public.music_cache 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage music cache" 
ON public.music_cache 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Protect country_tags - public read, admin write
DROP POLICY IF EXISTS "Anyone can read country tags" ON public.country_tags;
DROP POLICY IF EXISTS "Admins can manage country tags" ON public.country_tags;
DROP POLICY IF EXISTS "Public read access" ON public.country_tags;

CREATE POLICY "Anyone can read country tags" 
ON public.country_tags 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage country tags" 
ON public.country_tags 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Protect country_intelligence - public read, admin write
DROP POLICY IF EXISTS "Anyone can read country intelligence" ON public.country_intelligence;
DROP POLICY IF EXISTS "Admins can manage country intelligence" ON public.country_intelligence;
DROP POLICY IF EXISTS "Public read access" ON public.country_intelligence;

CREATE POLICY "Anyone can read country intelligence" 
ON public.country_intelligence 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage country intelligence" 
ON public.country_intelligence 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Protect country_variants - public read, admin write
DROP POLICY IF EXISTS "Anyone can read country variants" ON public.country_variants;
DROP POLICY IF EXISTS "Admins can manage country variants" ON public.country_variants;
DROP POLICY IF EXISTS "Public read access" ON public.country_variants;

CREATE POLICY "Anyone can read country variants" 
ON public.country_variants 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage country variants" 
ON public.country_variants 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Protect country_intelligence_translations - public read, admin write
DROP POLICY IF EXISTS "Anyone can read intelligence translations" ON public.country_intelligence_translations;
DROP POLICY IF EXISTS "Admins can manage intelligence translations" ON public.country_intelligence_translations;
DROP POLICY IF EXISTS "Public read access" ON public.country_intelligence_translations;

CREATE POLICY "Anyone can read intelligence translations" 
ON public.country_intelligence_translations 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage intelligence translations" 
ON public.country_intelligence_translations 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Protect country_variants_translations - public read, admin write
DROP POLICY IF EXISTS "Anyone can read variants translations" ON public.country_variants_translations;
DROP POLICY IF EXISTS "Admins can manage variants translations" ON public.country_variants_translations;
DROP POLICY IF EXISTS "Public read access" ON public.country_variants_translations;

CREATE POLICY "Anyone can read variants translations" 
ON public.country_variants_translations 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage variants translations" 
ON public.country_variants_translations 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));