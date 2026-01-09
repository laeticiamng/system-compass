import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";

const SubscriptionSuccess = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { checkSubscription, tier } = useSubscription();

  useEffect(() => {
    // Refresh subscription status after successful checkout
    checkSubscription();
  }, [checkSubscription]);

  const tierLabels: Record<string, string> = {
    premium: "Premium",
    pro: "Pro",
    free: "Free"
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">
            {t("subscription.successTitle", "Subscription Activated!")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold">
              {tierLabels[tier] || "Premium"}
            </span>
          </div>
          
          <p className="text-muted-foreground">
            {t("subscription.successDescription", "Thank you for subscribing! You now have access to all premium features.")}
          </p>

          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate("/countries")} className="w-full">
              {t("subscription.exploreCountries", "Explore Countries")}
            </Button>
            <Button variant="outline" onClick={() => navigate("/")} className="w-full">
              {t("common.back", "Back to Home")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSuccess;
