import { Latent } from '@/components/latent/Latent';

export default function LatentModule() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pt-20 md:pt-24">
      <div className="container mx-auto px-4 py-8">
        <Latent />
      </div>
    </div>
  );
}
