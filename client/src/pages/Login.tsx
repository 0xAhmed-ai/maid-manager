import { useState } from "react";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Home, User, Loader2 } from "lucide-react";
import type { UserRole } from "@shared/schema";

export default function Login() {
  const [, navigate] = useLocation();
  const { t, setUser, setLanguage } = useApp();
  const { toast } = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    role: "owner" as UserRole,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const res = await apiRequest("POST", endpoint, data);
      return res.json();
    },
    onSuccess: (data) => {
      setUser(data.user);
      if (data.user.language) {
        setLanguage(data.user.language);
      }
      toast({
        title: t("welcomeBack"),
        description: `${t("welcome")}, ${data.user.name}!`,
      });
      navigate(data.user.role === "owner" ? "/dashboard" : "/my-tasks");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md ios-card">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto w-16 h-16 bg-ios-blue rounded-2xl flex items-center justify-center mb-2">
            <Home className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-semibold">{t("appName")}</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {isRegister ? t("register") : t("login")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">{t("name")}</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t("name")}
                  className="h-12 text-base touch-target"
                  required
                  data-testid="input-name"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">{t("username")}</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder={t("username")}
                className="h-12 text-base touch-target"
                required
                data-testid="input-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={t("password")}
                className="h-12 text-base touch-target"
                required
                data-testid="input-password"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t("role")}</Label>
              <RadioGroup
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                className="grid grid-cols-2 gap-3"
              >
                <Label
                  htmlFor="role-owner"
                  className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all touch-target ${
                    formData.role === "owner"
                      ? "border-ios-blue bg-accent"
                      : "border-border hover-elevate"
                  }`}
                  data-testid="radio-owner"
                >
                  <RadioGroupItem value="owner" id="role-owner" className="sr-only" />
                  <Home className="w-5 h-5 text-ios-blue" />
                  <span className="font-medium">{t("owner")}</span>
                </Label>
                <Label
                  htmlFor="role-maid"
                  className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all touch-target ${
                    formData.role === "maid"
                      ? "border-ios-blue bg-accent"
                      : "border-border hover-elevate"
                  }`}
                  data-testid="radio-maid"
                >
                  <RadioGroupItem value="maid" id="role-maid" className="sr-only" />
                  <User className="w-5 h-5 text-ios-green" />
                  <span className="font-medium">{t("maid")}</span>
                </Label>
              </RadioGroup>
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold touch-target"
              disabled={loginMutation.isPending}
              data-testid="button-submit"
            >
              {loginMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isRegister ? (
                t("register")
              ) : (
                t("login")
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-ios-blue text-sm font-medium touch-target"
              data-testid="button-toggle-auth"
            >
              {isRegister ? t("alreadyHaveAccount") : t("dontHaveAccount")}{" "}
              <span className="underline">
                {isRegister ? t("loginHere") : t("signUpHere")}
              </span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
