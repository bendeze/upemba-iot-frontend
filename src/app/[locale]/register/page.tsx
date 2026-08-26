import { RegisterForm } from "@/components/features/auth/RegisterForm";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

export default async function RegisterPage() {
  const t = await getTranslations("Auth");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-background">
      <div className="w-full max-w-lg z-10 relative">
        <RegisterForm />
        
        <div className="mt-6 text-center space-y-1 text-sm text-muted-foreground">
          <p>
            {t("haveAccessText")}{" "}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              {t("loginSubmit")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
