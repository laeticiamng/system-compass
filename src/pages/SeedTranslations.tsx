import { useEffect, useState } from 'react';
import { seedAllTranslations } from '@/lib/translations-seeder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function SeedTranslationsPage() {
  const [status, setStatus] = useState<'idle' | 'seeding' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<{ success: number; errors: number } | null>(null);

  useEffect(() => {
    const runSeed = async () => {
      setStatus('seeding');
      try {
        const res = await seedAllTranslations();
        setResult(res);
        setStatus('done');
      } catch (err) {
        console.error('Seeding error:', err);
        setStatus('error');
      }
    };
    runSeed();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Translations Seeder</CardTitle>
        </CardHeader>
        <CardContent>
          {status === 'seeding' && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Seeding translations to database...</span>
            </div>
          )}
          {status === 'done' && result && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Done! {result.success} translations seeded ({result.errors} errors)</span>
            </div>
          )}
          {status === 'error' && (
            <div className="text-red-600">
              Error during seeding. Check console for details.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
