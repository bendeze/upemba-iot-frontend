import { getTranslations } from "next-intl/server";
import { PredictionDashboard } from "@/components/features/dashboard/predictions";

export default async function PredictionsPage() {
  const t = await getTranslations("Predictions");

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t("pageTitle")}
        </h1>
        <p className="text-sm font-medium text-muted-foreground max-w-3xl">
          {t("pageDesc")}
        </p>
      </div>
      
      <PredictionDashboard />
    </div>
  );
}
