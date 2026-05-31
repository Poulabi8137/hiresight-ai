"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Clapperboard,
  Eye,
  Fingerprint,
  Loader2,
  LockKeyhole,
  UserRound,
  UserRoundPlus
} from "lucide-react";
import { authSchema } from "@/lib/validation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AuthForm = z.infer<typeof authSchema>;
type Mode = "signin" | "signup";
type Role = "candidate" | "recruiter";

const roleContent = {
  candidate: {
    icon: UserRound,
    title: "Candidate access",
    email: "candidate@hiresight.ai",
    proof: ["Video profile", "Resume uploads", "AI fit insights"],
    destination: "/candidate"
  },
  recruiter: {
    icon: BriefcaseBusiness,
    title: "Recruiter access",
    email: "recruiter@hiresight.ai",
    proof: ["Job pipeline", "Ranked shortlist", "Recruiter notes"],
    destination: "/recruiter"
  }
};

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signup");
  const [role, setRole] = useState<Role>("candidate");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("Choose your role to sign in with a dedicated workspace.");
  const [fullName, setFullName] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const form = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: roleContent.candidate.email,
      password: "password123",
      role: "candidate"
    }
  });

  const isRecovery =
    typeof window !== "undefined" && window.location.hash.includes("type=recovery");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextRole = params.get("role");
    const nextMode = params.get("mode");

    if (nextRole === "candidate" || nextRole === "recruiter") {
      setRole(nextRole);
      form.setValue("role", nextRole);
      form.setValue("email", roleContent[nextRole].email);
    }
    if (nextMode === "signin" || nextMode === "signup") {
      setMode(nextMode);
    }
  }, [form]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    let cancelled = false;
    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      const currentRole = (data.session?.user.user_metadata?.role as Role | undefined) ?? null;
      if (data.session && (currentRole === "candidate" || currentRole === "recruiter")) {
        router.replace(roleContent[currentRole].destination);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  const selectRole = useCallback((nextRole: Role) => {
    setRole(nextRole);
    form.setValue("role", nextRole);
    form.setValue("email", roleContent[nextRole].email);
  }, [form]);

  const onSubmit = async (values: AuthForm) => {
    setStatus("loading");
    setShowReset(false);
    setMessage("Establishing your session…");

    try {
      const endpoint = mode === "signin" ? "/api/auth/signin" : "/api/auth/signup";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, fullName: mode === "signup" ? fullName : undefined })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok && (response.status === 500 || response.status === 501) && data.error === "Supabase not configured") {
        const demoResponse = await fetch("/api/auth/demo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, mode, fullName: mode === "signup" ? fullName : undefined })
        });
        const demoData = await demoResponse.json().catch(() => ({}));
        if (!demoResponse.ok) {
          setStatus("error");
          setMessage(demoData?.error ?? "Authentication failed.");
          return;
        }
        setStatus("success");
        setMessage(demoData.message ?? "Demo session established.");
        router.refresh();
        router.push(roleContent[values.role].destination);
        return;
      }

      if (!response.ok) {
        setStatus("error");
        setMessage(data?.error ?? "Authentication failed. Check your credentials or environment keys.");
        return;
      }

      setStatus("success");
      setMessage(data.message ?? "Session established.");

      if (data.requiresEmailConfirmation) {
        return;
      }

      router.refresh();
      router.push(roleContent[values.role].destination);
    } catch {
      setStatus("error");
      setMessage("Network error while authenticating. Please retry.");
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) return;
    setResetStatus("loading");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data.error ?? "Password reset request failed.");
        setStatus("error");
        setResetStatus("idle");
        return;
      }

      setResetStatus("sent");
      setMessage(data.message ?? "If an account with that email exists, a password reset link has been sent.");
      setStatus("success");
    } catch {
      setMessage("Network error. Please retry.");
      setStatus("error");
      setResetStatus("idle");
    }
  };

  const handleSetNewPassword = async () => {
    if (newPassword.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    setMessage("Updating your password…");

    try {
      const supabase = createClient();
      if (!supabase) {
        setStatus("error");
        setMessage("Supabase client unavailable.");
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }

      setStatus("success");
      setMessage("Password updated. Redirecting to sign in…");

      setTimeout(() => {
        window.location.hash = "";
        window.location.search = "mode=signin";
      }, 2000);
    } catch {
      setStatus("error");
      setMessage("Network error. Please retry.");
    }
  };

  const ActiveIcon = roleContent[role].icon;

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(125deg,rgba(248,250,252,0.94),rgba(236,253,245,0.78),rgba(255,247,237,0.86))] dark:bg-[linear-gradient(125deg,rgba(2,6,23,0.98),rgba(13,49,56,0.82),rgba(67,20,7,0.48))]" />
      <div className="absolute left-1/2 top-12 -z-10 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-teal-300/20 blur-3xl" />

      <div className="container grid min-h-[calc(100vh-4rem)] items-center gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
        >
          <Badge className="bg-background/70 shadow-glow">
            <Fingerprint className="mr-1 h-3.5 w-3.5" />
            Secure role-based entry
          </Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-6xl">
            Sign in or sign up without mixing candidate and recruiter flows.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            The demo works locally today and connects to Supabase Auth when live environment keys are configured.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              { icon: Clapperboard, label: "Candidate video profiles", copy: "Create a portfolio, add resume details, and upload interview clips." },
              { icon: Building2, label: "Recruiter workspaces", copy: "Open ranked talent lists, job pipelines, and review notes." }
            ].map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ y: -5 }}
                className="glass rounded-lg p-5"
              >
                <item.icon className="h-5 w-5 text-primary" />
                <h2 className="mt-4 font-semibold">{item.label}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.copy}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <Card className="glass overflow-hidden p-0">
            <div className="grid lg:grid-cols-[0.86fr_1.14fr]">
              <div className="relative min-h-80 overflow-hidden bg-slate-950 p-6 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_22%,rgba(45,212,191,0.42),transparent_34%),radial-gradient(circle_at_80%_78%,rgba(251,146,60,0.35),transparent_30%),linear-gradient(145deg,rgba(15,23,42,0.32),rgba(2,6,23,0.96))]" />
                <div className="relative flex h-full flex-col justify-between">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-slate-950 shadow-glow">
                      <ActiveIcon className="h-6 w-6" />
                    </div>
                    <h2 className="mt-5 text-2xl font-semibold">{roleContent[role].title}</h2>
                    <p className="mt-3 text-sm leading-6 text-white/70">
                      {isRecovery ? "Set a new password for your account." : mode === "signup" ? "Create a dedicated workspace with role-aware defaults." : "Resume your dedicated workspace and continue the demo."}
                    </p>
                  </div>
                  <div className="grid gap-3">
                    {roleContent[role].proof.map((item, index) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.08] px-4 py-3"
                      >
                        <BadgeCheck className="h-4 w-4 text-teal-300" />
                        <span className="text-sm">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-7">
                {isRecovery ? (
                  <div className="space-y-5">
                    <h3 className="text-lg font-semibold">Set new password</h3>
                    <div>
                      <label className="text-sm font-medium">New password</label>
                      <Input
                        className="mt-2 bg-background/70"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        autoComplete="new-password"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Confirm password</label>
                      <Input
                        className="mt-2 bg-background/70"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat your password"
                        autoComplete="new-password"
                      />
                    </div>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleSetNewPassword}
                      disabled={status === "loading" || !newPassword || !confirmPassword}
                    >
                      {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2 rounded-lg bg-secondary/70 p-1">
                      {([
                        ["signup", "Sign up", UserRoundPlus],
                        ["signin", "Sign in", LockKeyhole]
                      ] as const).map(([value, label, Icon]) => (
                        <Button
                          key={value}
                          type="button"
                          variant={mode === value ? "default" : "ghost"}
                          onClick={() => { setMode(value); setShowReset(false); }}
                          className="h-11"
                        >
                          <Icon className="h-4 w-4" />
                          {label}
                        </Button>
                      ))}
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {([
                        ["candidate", "Candidate", UserRound],
                        ["recruiter", "Recruiter", BriefcaseBusiness]
                      ] as const).map(([value, label, Icon]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => selectRole(value)}
                          className={`rounded-lg border p-4 text-left transition-all hover:-translate-y-0.5 ${
                            role === value
                              ? "border-primary bg-primary/10 shadow-glow"
                              : "border-border bg-background/65 hover:bg-secondary/60"
                          }`}
                        >
                          <Icon className="h-5 w-5 text-primary" />
                          <span className="mt-3 block font-semibold">{label}</span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {mode === "signup" ? "Create account" : "Continue session"}
                          </span>
                        </button>
                      ))}
                    </div>

                    {showReset ? (
                      <div className="mt-5 space-y-4">
                        <p className="text-sm text-muted-foreground">Enter your email to receive a password reset link.</p>
                        <Input
                          className="bg-background/70"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="your@email.com"
                          type="email"
                        />
                        <div className="flex gap-2">
                          <Button
                            className="flex-1"
                            size="lg"
                            onClick={handleResetPassword}
                            disabled={resetStatus === "loading" || !resetEmail}
                          >
                            {resetStatus === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
                          </Button>
                          <Button variant="ghost" size="lg" onClick={() => setShowReset(false)}>
                            Back
                          </Button>
                        </div>
                        {resetStatus === "sent" && (
                          <p className="text-sm text-green-600 dark:text-green-400">Check your email for the reset link.</p>
                        )}
                      </div>
                    ) : (
                      <form className="mt-5 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <input type="hidden" {...form.register("role")} />
                        {mode === "signup" ? (
                          <div>
                            <label className="text-sm font-medium">Full name</label>
                            <Input
                              className="mt-2 bg-background/70"
                              value={fullName}
                              onChange={(event) => setFullName(event.target.value)}
                              placeholder="Your name"
                              autoComplete="name"
                            />
                          </div>
                        ) : null}
                        <div>
                          <label className="text-sm font-medium">Email</label>
                          <Input className="mt-2 bg-background/70" autoComplete="email" {...form.register("email")} />
                          {form.formState.errors.email ? <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p> : null}
                        </div>
                        <div>
                          <label className="text-sm font-medium">Password</label>
                          <Input
                            className="mt-2 bg-background/70"
                            type="password"
                            autoComplete={mode === "signin" ? "current-password" : "new-password"}
                            {...form.register("password")}
                          />
                          {form.formState.errors.password ? <p className="mt-1 text-xs text-destructive">{form.formState.errors.password.message}</p> : null}
                        </div>
                        {mode === "signin" && (
                          <button
                            type="button"
                            onClick={() => setShowReset(true)}
                            className="text-sm text-primary hover:underline"
                          >
                            Forgot password?
                          </button>
                        )}
                        <Button className="w-full" size="lg" type="submit" disabled={status === "loading"}>
                          {mode === "signup" ? "Create" : "Continue as"} {role}
                          {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                        </Button>
                      </form>
                    )}
                  </>
                )}

                <div className="mt-5 rounded-lg border bg-background/70 p-4 text-sm text-muted-foreground">
                  <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                    <Eye className="h-4 w-4 text-primary" />
                    Auth status
                  </div>
                  <p className={status === "error" ? "text-destructive" : ""}>{message}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={roleContent[role].destination}>Open {role} workspace</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/">Back to showcase</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
