"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { Suspense } from 'react';

const activationSchema = z.object({
  code: z.string().min(4, "Activation code must be at least 4 characters").max(20, "Code is too long"),
});

type ActivationFormValues = z.infer<typeof activationSchema>;

// Inner component wrapped in Suspense because it uses `useSearchParams()`
function ActivationFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const form = useForm<ActivationFormValues>({
    resolver: zodResolver(activationSchema),
    defaultValues: { code: "" },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const activateMutation = useMutation({
    mutationFn: async ({ code }: ActivationFormValues) => {
      const response = await apiClient.post("/activate/", { email, code });
      return response.data;
    },
    onSuccess: (data: any) => {
      if (data?.access) {
        Cookies.set("access_token", data.access, { path: "/", secure: process.env.NODE_ENV === "production" });
      }
      if (data?.refresh) {
        Cookies.set("refresh_token", data.refresh, { path: "/", secure: process.env.NODE_ENV === "production" });
      }
      // Redirect to the dashboard native workspace
      router.push("/dashboard");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.detail || "Invalid or expired activation code.";
      form.setError("root", { message: msg });
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post("/resend-otp/", { email });
      return response.data;
    },
    onSuccess: () => {
      form.clearErrors("root");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.detail || "Failed to resend activation code.";
      form.setError("root", { message: msg });
    },
  });

  function onSubmit(data: ActivationFormValues) {
    if (!email) {
      form.setError("root", { message: "No email address found in the URL. Please register again." });
      return;
    }
    activateMutation.mutate(data);
  }

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl transition-all hover:shadow-primary/5">
      <CardHeader className="space-y-2 text-center sm:text-left">
        <CardTitle className="text-3xl font-bold tracking-tight">Activate Account</CardTitle>
        <CardDescription className="text-base font-medium">
          {email ? (
            <>An activation code was sent to <strong className="text-primary">{email}</strong>. Entering it below will automatically sign you in.</>
          ) : (
            "Please explicitly enter the 4-8 digit OTP code shipped to your inbox natively."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="code" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Activation Code</Label>
            <Input 
              id="code" 
              className="h-14 bg-background/50 text-2xl tracking-[0.5em] text-center font-mono uppercase" 
              placeholder="A1B2C3" 
              {...register("code")} 
            />
            {errors.code && <p className="text-sm text-destructive font-medium">{errors.code.message}</p>}
          </div>

          {errors.root && (
            <p className="text-sm font-medium animate-pulse text-destructive bg-destructive/10 p-3 rounded-md">
              {errors.root.message}
            </p>
          )}

          <Button type="submit" className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20" disabled={activateMutation.isPending || !email}>
             {activateMutation.isPending ? "Verifying Token..." : "Activate & Join Core"}
          </Button>

          <div className="text-center mt-2">
            <Button
              type="button"
              variant="link"
              className="text-sm text-muted-foreground hover:text-primary transition-colors h-auto p-0"
              onClick={() => resendMutation.mutate()}
              disabled={resendMutation.isPending || resendMutation.isSuccess || !email}
            >
              {resendMutation.isPending ? "Resending..." : resendMutation.isSuccess ? "Code Resent!" : "Didn't receive the code? Resend"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function ActivationForm() {
    return (
        <Suspense fallback={<div className="h-64 flex items-center justify-center animate-pulse"><div className="w-8 h-8 rounded-full bg-primary/20" /></div>}>
            <ActivationFormInner />
        </Suspense>
    );
}

