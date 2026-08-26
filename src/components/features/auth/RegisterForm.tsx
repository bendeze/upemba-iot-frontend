"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormValues } from "@/lib/zodAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

import { applyApiErrorsToForm } from "@/lib/apiErrors";
import Cookies from "js-cookie";

export function RegisterForm() {
  const router = useRouter();
  const t = useTranslations("Auth");

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { 
      username: "", 
      email: "",
      name: "",
      password: "",
      passwordConfirm: "",
      role: "RANGER"
    },
  });

  const { register, handleSubmit, formState: { errors }, setError } = form;

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterFormValues) => {
      const { passwordConfirm, ...submitData } = credentials;
      const response = await apiClient.post("/register/", submitData);
      return response.data;
    },
    onSuccess: (data: any, variables: RegisterFormValues) => {
      // Force redirect to the Activation Route carrying the email implicitly
      router.push(`/activation?email=${encodeURIComponent(variables.email)}`);
    },
    onError: (error) => {
      applyApiErrorsToForm(error, setError, t("registerError"));
    },
  });

  function onSubmit(data: RegisterFormValues) {
    registerMutation.mutate(data);
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-md shadow-lg">
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">{t("registerTitle")}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {t("registerDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("usernameLabel")}</Label>
              <Input id="username" className="h-10 bg-background/50 text-sm" placeholder="johndoe" {...register("username")} />
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("emailLabel")}</Label>
              <Input id="email" className="h-10 bg-background/50 text-sm" placeholder="tech@upemba.com" type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("nameLabel")}</Label>
            <Input id="name" className="h-10 bg-background/50 text-sm" placeholder="John Doe" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("passwordLabel")}</Label>
              <Input id="password" type="password" className="h-10 bg-background/50 text-sm tracking-widest" placeholder="••••••••" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="passwordConfirm" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("confirmPasswordLabel")}</Label>
              <Input id="passwordConfirm" type="password" className="h-10 bg-background/50 text-sm tracking-widest" placeholder="••••••••" {...register("passwordConfirm")} />
              {errors.passwordConfirm && <p className="text-xs text-destructive">{errors.passwordConfirm.message}</p>}
            </div>
          </div>
          
          {errors.root && (
            <p className="text-xs font-medium text-destructive bg-destructive/10 p-2.5 rounded-md">
              {errors.root.message}
            </p>
          )}

          <Button type="submit" className="w-full h-10 text-sm font-semibold shadow-sm mt-2" disabled={registerMutation.isPending}>
             {registerMutation.isPending ? t("registerLoading") : t("registerSubmit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
