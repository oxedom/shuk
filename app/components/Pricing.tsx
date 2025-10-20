"use client";

import { Button } from "app/components/ui/button";
import { useTranslations } from "next-intl";
import { toast } from "app/hooks/use-toast";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  isPopular?: boolean;
  buttonVariant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "ghost"
    | "link";
}

export default function Pricing() {
  const t = useTranslations("Homepage.Pricing");

  const pricingPlans: PricingPlan[] = [
    {
      id: "basic",
      name: t("basic.name"),
      price: 9,
      features: [
        t("basic.features.access"),
        t("basic.features.tracking"),
        t("basic.features.mobile"),
      ],
      buttonVariant: "outline",
    },
    {
      id: "pro",
      name: t("pro.name"),
      price: 19,
      features: [
        t("pro.features.everything"),
        t("pro.features.custom"),
        t("pro.features.coach"),
        t("pro.features.analytics"),
      ],
      isPopular: true,
      buttonVariant: "default",
    },
    {
      id: "premium",
      name: t("premium.name"),
      price: 29,
      features: [
        t("premium.features.everything"),
        t("premium.features.coaching"),
        t("premium.features.nutrition"),
        t("premium.features.support"),
      ],
      buttonVariant: "secondary",
    },
  ];

  const handleBuyNow = (plan: PricingPlan) => {
    console.log(`Purchasing plan: ${plan.name} for $${plan.price}/month`);

    toast({
      title: t("toastTitle", { planName: plan.name }),
      description: t("toastDescription", { price: `$${plan.price}` }),
    });

    // Here you would typically redirect to a payment processor
    // or open a checkout modal
    // Example: router.push(`/checkout?plan=${plan.id}`);
  };

  return (
    <div className="text-white text-center space-y-6">
      <h2 className="text-6xl font-bold mb-8">{t("title")}</h2>
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {pricingPlans.map((plan) => (
          <div
            key={plan.id}
            className={`backdrop-blur-sm rounded-lg p-6 relative flex flex-col ${
              plan.isPopular
                ? "bg-white/20 border-2 border-white"
                : "bg-white/10 border border-white/20"
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white   text-black px-4 py-1 rounded-full text-sm font-semibold">
                {t("pro.popular")}
              </div>
            )}

            <h3 className="text-xl font-semibold mb-4">{plan.name}</h3>

            <div className="text-3xl font-bold mb-4">
              ${plan.price}
              <span className="text-lg">{t("month")}</span>
            </div>

            <ul className="space-y-2 text-sm mb-6 flex-grow">
              {plan.features.map((feature, index) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>

            <Button
              onClick={() => handleBuyNow(plan)}
              className="w-full mt-auto  bg-black text-white"
            >
              {t("buyNow")}
            </Button>
          </div>
        ))}
      </div> */}
    </div>
  );
}
