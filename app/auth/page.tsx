"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  LockKeyhole,
  ShieldCheck,
  UserRound,
  UserRoundPlus
} from "lucide-react";
import { authSchema } from "@/lib/validation";
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
  const [mode, setMode] = useState<Mode>("signup");
  const [role, setRole] = useState<Role>("candidate");
  const [message, setMessage] = useState("Choose your role to start a polished demo session.");
  const form = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: roleContent.candidate.email,
      password: "password123",
      role: "candidate"
    }
  });

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

  const selectRole = (nextRole: Role) => {
    setRole(nextRole);
    form.setValue("role", nextRole);
    form.setValue("email", roleContent[nextRole].email);
  };

  const onSubmit = async (values: AuthForm) => {
    const response = await fetch("/api/auth/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, mode })
    });
    const data = await response.json();
    setMessage(data.message ?? `${roleContent[values.role].title} session prepared.`);
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
                      {mode === "signup" ? "Create a dedicated workspace with role-aware defaults." : "Resume your dedicated workspace and continue the demo."}
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
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-secondary/70 p-1">
                  {([
                    ["signup", "Sign up", UserRoundPlus],
                    ["signin", "Sign in", LockKeyhole]
                  ] as const).map(([value, label, Icon]) => (
                    <Button
                      key={value}
                      type="button"
                      variant={mode === value ? "default" : "ghost"}
                      onClick={() => setMode(value)}
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

                <form className="mt-5 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                  <input type="hidden" {...form.register("role")} />
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
                  <Button className="w-full" size="lg" type="submit">
                    {mode === "signup" ? "Create" : "Continue as"} {role}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>

                <div className="mt-5 rounded-lg border bg-background/70 p-4 text-sm text-muted-foreground">
                  <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                    <Eye className="h-4 w-4 text-primary" />
                    Demo status
                  </div>
                  {message}
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
