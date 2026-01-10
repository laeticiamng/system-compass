import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Heart, Users, Ban, Eye, FileText } from "lucide-react";

const CHARTER_PRINCIPLES = [
  {
    icon: Heart,
    title: "Primauté de la lucidité",
    description: "Toute présentation de Pyramid Compass doit refléter fidèlement ses usages réels, sans exagération ni promesse implicite."
  },
  {
    icon: Shield,
    title: "Contribution réelle uniquement",
    description: "Aucune reconnaissance n'est accordée sans création de valeur mesurable."
  },
  {
    icon: Users,
    title: "Indépendance des partenaires",
    description: "Chaque partenaire agit de manière autonome, sans dépendance ni relation de subordination avec d'autres partenaires."
  },
  {
    icon: Ban,
    title: "Absence de discours financier incitatif",
    description: "Pyramid Compass n'est pas présenté comme une opportunité financière."
  },
  {
    icon: Eye,
    title: "Respect des utilisateurs finaux",
    description: "Aucune pression, manipulation ou discours trompeur n'est toléré."
  },
  {
    icon: FileText,
    title: "Transparence totale des règles",
    description: "Les conditions du programme sont publiques, stables et assumées."
  }
];

export function EthicsCharter() {
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-primary" />
          Charte éthique des partenaires
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <p className="text-sm text-muted-foreground mb-6">
            Tout participant au programme s'engage à respecter les principes suivants :
          </p>
          
          <div className="space-y-4">
            {CHARTER_PRINCIPLES.map((principle, index) => (
              <div 
                key={index}
                className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-shrink-0">
                  <principle.icon className="h-5 w-5 text-primary mt-0.5" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">{index + 1}. {principle.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {principle.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="text-sm font-medium text-destructive">
              Tout manquement entraîne la suspension immédiate du poste partenaire.
            </p>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
