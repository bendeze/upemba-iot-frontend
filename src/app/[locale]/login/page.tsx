import { LoginForm } from "@/components/features/auth/LoginForm";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

export default async function LoginPage() {
  const t = await getTranslations("Auth");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-background">
      <div className="w-full max-w-md z-10 relative">
        <LoginForm />
        
        <div className="mt-6 text-center space-y-1 text-sm text-muted-foreground">
          <p>
            {t("noAccessText")}{" "}
            <Link href="/register" className="text-primary hover:underline font-semibold">
              {t("registerSubmit")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
