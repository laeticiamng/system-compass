// Financial Intel Quick Verify Mode Component
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, Shield, AlertTriangle, CheckCircle, XCircle, 
  Loader2, Globe, Mail, Building2, HelpCircle, ExternalLink 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface VerificationResult {
  type: 'url' | 'email' | 'company' | 'opportunity';
  input: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
  recommendations: string[];
  sources?: string[];
}

interface QuickVerifyModeProps {
  country?: string;
  onDetailedAnalysis?: (input: string) => void;
}

export function QuickVerifyMode({ country, onDetailedAnalysis }: QuickVerifyModeProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const detectInputType = (text: string): 'url' | 'email' | 'company' | 'opportunity' => {
    if (text.includes('http://') || text.includes('https://') || text.includes('www.')) {
      return 'url';
    }
    if (text.includes('@') && text.includes('.')) {
      return 'email';
    }
    if (text.length < 50 && !text.includes(' ') || text.toLowerCase().includes('inc') || text.toLowerCase().includes('ltd')) {
      return 'company';
    }
    return 'opportunity';
  };

  const analyzeInput = async () => {
    if (!input.trim()) {
      toast.error(t('financialIntel.quickVerify.emptyInput', 'Please enter something to verify'));
      return;
    }

    setIsVerifying(true);
    setResult(null);

    try {
      // Simulate analysis (in production, this would call an edge function)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const type = detectInputType(input);
      const flags: string[] = [];
      const recommendations: string[] = [];
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

      // URL analysis
      if (type === 'url') {
        const url = input.toLowerCase();
        if (!url.startsWith('https://')) {
          flags.push(t('financialIntel.quickVerify.flags.noHttps', 'No HTTPS encryption'));
          riskLevel = 'medium';
        }
        if (url.includes('bit.ly') || url.includes('tinyurl') || url.includes('t.co')) {
          flags.push(t('financialIntel.quickVerify.flags.shortened', 'Shortened URL - destination hidden'));
          riskLevel = 'high';
        }
        if (url.includes('crypto') || url.includes('invest') || url.includes('profit')) {
          flags.push(t('financialIntel.quickVerify.flags.investmentTerms', 'Contains high-risk investment terms'));
          riskLevel = 'high';
        }
        if (url.match(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/)) {
          flags.push(t('financialIntel.quickVerify.flags.ipAddress', 'Uses IP address instead of domain'));
          riskLevel = 'critical';
        }
        recommendations.push(t('financialIntel.quickVerify.recommendations.checkWhois', 'Verify domain registration date and owner'));
        recommendations.push(t('financialIntel.quickVerify.recommendations.searchReviews', 'Search for reviews and complaints'));
      }

      // Email analysis
      if (type === 'email') {
        const email = input.toLowerCase();
        if (email.includes('gmail') || email.includes('yahoo') || email.includes('hotmail')) {
          flags.push(t('financialIntel.quickVerify.flags.freeEmail', 'Uses free email provider - not professional'));
          riskLevel = 'medium';
        }
        if (email.match(/[0-9]{4,}/)) {
          flags.push(t('financialIntel.quickVerify.flags.numbersInEmail', 'Contains suspicious number sequences'));
          riskLevel = 'medium';
        }
        recommendations.push(t('financialIntel.quickVerify.recommendations.verifyDomain', 'Verify the domain belongs to a real company'));
        recommendations.push(t('financialIntel.quickVerify.recommendations.neverSendMoney', 'Never send money based on email alone'));
      }

      // Company analysis
      if (type === 'company') {
        recommendations.push(t('financialIntel.quickVerify.recommendations.checkRegistry', 'Check official business registry'));
        recommendations.push(t('financialIntel.quickVerify.recommendations.verifyAddress', 'Verify physical address exists'));
        recommendations.push(t('financialIntel.quickVerify.recommendations.searchNews', 'Search for news and legal issues'));
        if (flags.length === 0) {
          flags.push(t('financialIntel.quickVerify.flags.needsVerification', 'Requires manual verification'));
          riskLevel = 'medium';
        }
      }

      // Opportunity analysis
      if (type === 'opportunity') {
        const text = input.toLowerCase();
        if (text.includes('guaranteed') || text.includes('garanti')) {
          flags.push(t('financialIntel.quickVerify.flags.guaranteedReturns', 'Claims guaranteed returns - major red flag'));
          riskLevel = 'critical';
        }
        if (text.includes('urgent') || text.includes('limited time') || text.includes('temps limité')) {
          flags.push(t('financialIntel.quickVerify.flags.urgency', 'Creates artificial urgency'));
          riskLevel = 'high';
        }
        if (text.includes('exclusive') || text.includes('secret') || text.includes('exclusif')) {
          flags.push(t('financialIntel.quickVerify.flags.exclusivity', 'Claims exclusivity or secrets'));
          riskLevel = 'high';
        }
        if (text.match(/\d+%/) && parseInt(text.match(/\d+/)?.[0] || '0') > 20) {
          flags.push(t('financialIntel.quickVerify.flags.highReturns', 'Promises unrealistic returns'));
          riskLevel = 'critical';
        }
        recommendations.push(t('financialIntel.quickVerify.recommendations.tooGoodTrue', 'If it sounds too good to be true, it probably is'));
        recommendations.push(t('financialIntel.quickVerify.recommendations.consultProfessional', 'Consult a licensed financial professional'));
      }

      // If no flags found
      if (flags.length === 0) {
        flags.push(t('financialIntel.quickVerify.flags.noObviousIssues', 'No obvious red flags detected'));
        recommendations.push(t('financialIntel.quickVerify.recommendations.stillVerify', 'Still recommended to verify through official channels'));
      }

      setResult({
        type,
        input,
        riskLevel,
        flags,
        recommendations,
      });
    } catch (error) {
      toast.error(t('financialIntel.quickVerify.error', 'Verification failed'));
    } finally {
      setIsVerifying(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-500/10 border-green-500/30';
      case 'medium': return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/30';
      case 'high': return 'text-orange-600 bg-orange-500/10 border-orange-500/30';
      case 'critical': return 'text-red-600 bg-red-500/10 border-red-500/30';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'medium': return <HelpCircle className="w-5 h-5 text-yellow-600" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'critical': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <HelpCircle className="w-5 h-5" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'url': return <Globe className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'company': return <Building2 className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="w-5 h-5" />
          {t('financialIntel.quickVerify.title', 'Quick Verify')}
          {country && <span className="text-sm font-normal text-muted-foreground">• {country}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t('financialIntel.quickVerify.description', 'Quickly check URLs, emails, companies, or opportunities for red flags.')}
        </p>

        {/* Input */}
        <div className="space-y-2">
          <Textarea
            placeholder={t('financialIntel.quickVerify.placeholder', 'Paste a URL, email, company name, or describe an opportunity...')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <Button 
            onClick={analyzeInput} 
            disabled={isVerifying || !input.trim()}
            className="w-full gap-2"
          >
            {isVerifying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {t('financialIntel.quickVerify.analyze', 'Analyze')}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4 pt-4 border-t">
            {/* Risk Level */}
            <div className={cn("p-4 rounded-lg border", getRiskColor(result.riskLevel))}>
              <div className="flex items-center gap-3">
                {getRiskIcon(result.riskLevel)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs gap-1">
                      {getTypeIcon(result.type)}
                      {result.type.toUpperCase()}
                    </Badge>
                    <Badge className={cn("border", getRiskColor(result.riskLevel))}>
                      {t(`financialIntel.quickVerify.risk.${result.riskLevel}`, result.riskLevel.toUpperCase())}
                    </Badge>
                  </div>
                  <p className="text-sm mt-1 font-medium">
                    {result.riskLevel === 'critical' 
                      ? t('financialIntel.quickVerify.result.critical', 'High probability of fraud or scam')
                      : result.riskLevel === 'high'
                        ? t('financialIntel.quickVerify.result.high', 'Multiple warning signs detected')
                        : result.riskLevel === 'medium'
                          ? t('financialIntel.quickVerify.result.medium', 'Some concerns - proceed with caution')
                          : t('financialIntel.quickVerify.result.low', 'No major red flags detected')
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Flags */}
            {result.flags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {t('financialIntel.quickVerify.flagsTitle', 'Detected Issues')}
                </h4>
                <ul className="space-y-1">
                  {result.flags.map((flag, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-destructive">•</span>
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {t('financialIntel.quickVerify.recommendationsTitle', 'Recommended Actions')}
                </h4>
                <ul className="space-y-1">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detailed Analysis CTA */}
            {onDetailedAnalysis && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDetailedAnalysis(input)}
                className="w-full gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                {t('financialIntel.quickVerify.detailedAnalysis', 'Get Detailed Analysis')}
              </Button>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center">
          {t('financialIntel.quickVerify.disclaimer', 'This is an automated screening tool. Always verify through official sources.')}
        </p>
      </CardContent>
    </Card>
  );
}
