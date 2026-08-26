"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/lib/zodAuth";
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

export function LoginForm() {
  const router = useRouter();
  const t = useTranslations("Auth");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const { register, handleSubmit, formState: { errors }, setError } = form;

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginFormValues) => {
      // Native Simple JWT Token Authentication
      const response = await apiClient.post("/token/", credentials);
      return response.data;
    },
    onSuccess: (data: any) => {
      // JWT Payload contains access and refresh tokens
      if (data?.access) {
        Cookies.set("access_token", data.access, { path: "/", secure: process.env.NODE_ENV === "production" });
      }
      if (data?.refresh) {
        Cookies.set("refresh_token", data.refresh, { path: "/", secure: process.env.NODE_ENV === "production" });
      }
      router.push("/dashboard");
    },
    onError: (error) => {
      applyApiErrorsToForm(error, setError, t("loginError"));
    },
  });

  function onSubmit(data: LoginFormValues) {
    loginMutation.mutate(data);
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-md shadow-lg">
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">{t("loginTitle")}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {t("loginDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("usernameLabel")}
            </Label>
            <Input 
              id="username"
              className="h-10 bg-background/50 text-sm" 
              placeholder="admin" 
              {...register("username")} 
            />
            {errors.username && (
              <p className="text-xs font-medium text-destructive">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("passwordLabel")}
            </Label>
            <Input 
              id="password"
              className="h-10 bg-background/50 text-sm tracking-widest" 
              type="password" 
              placeholder="••••••••" 
              {...register("password")} 
            />
            {errors.password && (
              <p className="text-xs font-medium text-destructive">{errors.password.message}</p>
            )}
          </div>
          
          {errors.root && (
            <p className="text-xs font-medium text-destructive bg-destructive/10 p-2.5 rounded-md">
              {errors.root.message}
            </p>
          )}

          <Button type="submit" className="w-full h-10 text-sm font-semibold shadow-sm mt-2" disabled={loginMutation.isPending}>
             {loginMutation.isPending ? t("loginLoading") : t("loginSubmit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
