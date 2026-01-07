import { ExternalLink, FileText, Shield, Wallet, GraduationCap, Globe } from 'lucide-react';

const resourceCategories = [
  {
    title: 'Financial Independence',
    icon: Wallet,
    description: 'Build your financial foundation regardless of location',
    resources: [
      { name: 'Emergency Fund Calculator', description: '6-12 months of expenses minimum' },
      { name: 'Multiple Income Streams', description: 'Never depend on one source' },
      { name: 'Offshore Banking Basics', description: 'Legitimate diversification strategies' },
      { name: 'Tax Optimization', description: 'Legal structures for your situation' },
    ],
  },
  {
    title: 'Exportable Skills',
    icon: GraduationCap,
    description: 'Skills that transfer across borders and systems',
    resources: [
      { name: 'Remote-First Skills', description: 'Tech, writing, design, consulting' },
      { name: 'Certifications That Travel', description: 'Internationally recognized credentials' },
      { name: 'Language Acquisition', description: 'Strategic language learning priorities' },
      { name: 'Digital Presence', description: 'Build reputation that precedes you' },
    ],
  },
  {
    title: 'Mobility Preparation',
    icon: Globe,
    description: 'Ready yourself for movement when opportunity comes',
    resources: [
      { name: 'Document Security', description: 'Keep all papers organized and updated' },
      { name: 'Visa Strategy Matrix', description: 'Know your options before you need them' },
      { name: 'Second Residency Options', description: 'Investment and skill-based paths' },
      { name: 'Digital Nomad Frameworks', description: 'Test locations before committing' },
    ],
  },
  {
    title: 'Security & Discretion',
    icon: Shield,
    description: 'Protect yourself in high-risk environments',
    resources: [
      { name: 'Operational Security Basics', description: 'Minimize your exposure profile' },
      { name: 'Digital Privacy', description: 'Secure communications and data' },
      { name: 'Asset Protection', description: 'Structure to minimize seizure risk' },
      { name: 'Network Safety', description: 'Who to trust and how to verify' },
    ],
  },
];

const checklists = [
  {
    title: '30-Day Survival Kickstart',
    items: [
      'Audit your current financial position',
      'Identify your top exportable skill',
      'Secure all identity documents',
      'Start emergency fund (even $50/month)',
      'Map your current network value',
      'Research one potential destination',
    ],
  },
  {
    title: 'Pre-Move Checklist',
    items: [
      'Valid passport (6+ months remaining)',
      'Clean digital footprint',
      'Income source that travels',
      'Bank account with international access',
      'Health records and prescriptions',
      'Power of attorney for home country affairs',
    ],
  },
];

export default function Resources() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mb-12">
          <h1 className="font-display text-4xl font-bold mb-4">Resources</h1>
          <p className="text-muted-foreground">
            Practical tools and frameworks for building optionality. 
            No fantasies—just actionable steps.
          </p>
        </div>

        {/* Resource Categories */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {resourceCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.title} className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {category.resources.map((resource, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">{resource.name}</div>
                        <div className="text-xs text-muted-foreground">{resource.description}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Checklists */}
        <div className="mb-16">
          <h2 className="font-display text-2xl font-bold mb-6">Quick Checklists</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {checklists.map((checklist) => (
              <div key={checklist.title} className="glass-card rounded-xl p-6">
                <h3 className="font-display font-semibold mb-4">{checklist.title}</h3>
                <ul className="space-y-2">
                  {checklist.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
                        {i + 1}
                      </div>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="glass-card rounded-xl p-6 border-l-4 border-primary">
          <h3 className="font-display font-semibold mb-2">Important Disclaimer</h3>
          <p className="text-sm text-muted-foreground">
            This site provides analytical frameworks only. It is not legal, financial, 
            or immigration advice. Always consult qualified professionals for your specific 
            situation. Every action has consequences—plan carefully and never take 
            unnecessary risks.
          </p>
        </div>
      </div>
    </div>
  );
}
