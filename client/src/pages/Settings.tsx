import { useApp } from "@/contexts/AppContext";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Globe,
  Moon,
  Sun,
  LogOut,
  User,
  ChevronRight,
  Shield,
} from "lucide-react";
import { languageNames } from "@/lib/i18n";
import type { Language } from "@shared/schema";

export default function Settings() {
  const { t, user, setUser, language, setLanguage, isDarkMode, toggleDarkMode, isRtl } = useApp();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const updateLanguageMutation = useMutation({
    mutationFn: async (newLanguage: Language) => {
      const res = await apiRequest("PATCH", "/api/users/language", { language: newLanguage });
      return res.json();
    },
    onSuccess: (data) => {
      setLanguage(data.language);
      if (user) {
        setUser({ ...user, language: data.language });
      }
      toast({
        title: t("changeLanguage"),
        description: languageNames[data.language as Language],
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      setUser(null);
      navigate("/");
    } catch (error) {
      toast({ title: "Error", description: "Failed to logout", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b border-border">
        <div className="p-4 max-w-lg mx-auto">
          <h1 className="text-xl font-bold">{t("settings")}</h1>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-4">
        <Card className="ios-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-border">
                <AvatarFallback className={`text-lg font-semibold ${user?.role === "owner" ? "bg-ios-blue text-white" : "bg-ios-green text-white"}`}>
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-lg font-bold">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">@{user?.username}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${user?.role === "owner" ? "bg-ios-blue" : "bg-ios-green"}`} />
                  <span className="text-sm text-muted-foreground capitalize">{t(user?.role || "")}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
            Preferences
          </h3>
          <Card className="ios-card">
            <CardContent className="p-0 divide-y divide-border">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Globe className="w-5 h-5 text-ios-blue" />
                  </div>
                  <div>
                    <p className="font-medium">{t("language")}</p>
                    <p className="text-sm text-muted-foreground">{languageNames[language]}</p>
                  </div>
                </div>
                <Select
                  value={language}
                  onValueChange={(value) => updateLanguageMutation.mutate(value as Language)}
                >
                  <SelectTrigger className="w-auto border-0 p-0 h-auto shadow-none" data-testid="select-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(languageNames).map(([code, name]) => (
                      <SelectItem key={code} value={code}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-orange-100"}`}>
                    {isDarkMode ? (
                      <Moon className="w-5 h-5 text-gray-200" />
                    ) : (
                      <Sun className="w-5 h-5 text-ios-orange" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{isDarkMode ? t("darkMode") : t("lightMode")}</p>
                    <p className="text-sm text-muted-foreground">
                      {isDarkMode ? "Dark theme enabled" : "Light theme enabled"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={toggleDarkMode}
                  data-testid="switch-dark-mode"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
            Account
          </h3>
          <Card className="ios-card">
            <CardContent className="p-0 divide-y divide-border">
              <button
                className="flex items-center justify-between p-4 w-full text-left hover-elevate active-elevate-2"
                data-testid="button-profile"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <User className="w-5 h-5 text-ios-gray" />
                  </div>
                  <p className="font-medium">{t("profile")}</p>
                </div>
                <ChevronRight className={`w-5 h-5 text-muted-foreground ${isRtl ? "rotate-180" : ""}`} />
              </button>

              <button
                className="flex items-center justify-between p-4 w-full text-left hover-elevate active-elevate-2"
                data-testid="button-security"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Shield className="w-5 h-5 text-ios-green" />
                  </div>
                  <p className="font-medium">Security</p>
                </div>
                <ChevronRight className={`w-5 h-5 text-muted-foreground ${isRtl ? "rotate-180" : ""}`} />
              </button>
            </CardContent>
          </Card>
        </section>

        <Card className="ios-card">
          <CardContent className="p-0">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 p-4 w-full text-left text-destructive hover-elevate active-elevate-2"
              data-testid="button-logout"
            >
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <LogOut className="w-5 h-5 text-destructive" />
              </div>
              <p className="font-medium">{t("logout")}</p>
            </button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground pt-4">
          MaidManager v1.0.0
        </p>
      </main>

      <BottomNav />
    </div>
  );
}
