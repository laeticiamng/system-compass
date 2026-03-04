
UPDATE countries SET 
  risks = jsonb_build_object('legal', 35, 'safety', 85, 'corruption', 35, 'volatility', 80, 'bureaucracy', 45),
  visa = jsonb_set(COALESCE(visa, '{}'::jsonb), '{notes}', '"Zone de conflit actif. Voyages fortement déconseillés. Réservistes rappelés. Impact sécuritaire régional majeur (Gaza, Liban). Service militaire obligatoire."'::jsonb),
  updated_at = now()
WHERE iso2 = 'IL';

UPDATE countries SET 
  risks = jsonb_build_object('legal', 30, 'safety', 40, 'corruption', 50, 'volatility', 50, 'bureaucracy', 45),
  visa = jsonb_set(COALESCE(visa, '{}'::jsonb), '{notes}', '"Stabilité relative mais tensions frontalières nord (Syrie) et ouest (conflit Gaza). Afflux de réfugiés. Économie sous pression. Visa de travail accessible."'::jsonb),
  updated_at = now()
WHERE iso2 = 'JO';

UPDATE countries SET 
  risks = jsonb_build_object('legal', 15, 'safety', 35, 'corruption', 25, 'volatility', 65, 'bureaucracy', 25),
  visa = jsonb_set(COALESCE(visa, '{}'::jsonb), '{notes}', '"Tensions militaires avec la Chine en hausse. Exercices militaires réguliers dans le détroit. Risque de blocus estimé 15-25%. Plans d''évacuation recommandés. Gold Card visa attractif."'::jsonb),
  updated_at = now()
WHERE iso2 = 'TW';
