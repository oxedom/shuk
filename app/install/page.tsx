"use client";

import { useState, useEffect } from "react";
import { Button } from "app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "app/components/ui/card";
import { Download, Smartphone, Check, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocaleInfo } from "app/hooks/use-locale-info";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPage() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installResult, setInstallResult] = useState<
    "success" | "dismissed" | "error" | null
  >(null);
  const [isClient, setIsClient] = useState(false);
  const { dir } = useLocaleInfo();
  const t = useTranslations("Install");

  useEffect(() => {
    setIsClient(true);

    // Check if app is already installed
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    const isInWebApp = (window.navigator as any).standalone === true;

    if (isStandalone || isInWebApp) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsInstallable(false);
      setInstallResult("success");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    setInstallResult(null);

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setInstallResult("success");
        setIsInstallable(false);
      } else {
        setInstallResult("dismissed");
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error("Error during PWA installation:", error);
      setInstallResult("error");
    } finally {
      setIsInstalling(false);
    }
  };

  const getInstallInstructions = () => {
    if (!isClient) {
      return {
        browser: t("browsers.yourBrowser"),
        steps: t.raw("instructions.generic") as string[],
      };
    }

    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes("chrome") && userAgent.includes("android")) {
      return {
        browser: t("browsers.chromeAndroid"),
        steps: t.raw("instructions.chromeAndroid") as string[],
      };
    } else if (userAgent.includes("safari") && userAgent.includes("iphone")) {
      return {
        browser: t("browsers.safariIphone"),
        steps: t.raw("instructions.safariIphone") as string[],
      };
    } else if (userAgent.includes("chrome")) {
      return {
        browser: t("browsers.chromeDesktop"),
        steps: t.raw("instructions.chromeDesktop") as string[],
      };
    } else {
      return {
        browser: t("browsers.yourBrowser"),
        steps: t.raw("instructions.generic") as string[],
      };
    }
  };

  return (
    <div
      dir={dir}
      className="min-h-screen bg-background p-4 flex items-center justify-center"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary rounded-2xl flex items-center justify-center">
            <Smartphone className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Install My Training App
          </h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* Installation Status Card */}
        <Card dir={dir}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isInstalled ? (
                <>
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  {t("statusInstalled")}
                </>
              ) : isInstallable ? (
                <>
                  <Download className="w-5 h-5 text-primary" />
                  {t("statusReady")}
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  {t("statusAvailable")}
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isInstalled
                ? t("descriptionInstalled")
                : isInstallable
                  ? t("descriptionReady")
                  : t("descriptionAvailable")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Install Button */}
            {isInstallable && !isInstalled && (
              <Button
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="w-full h-12 text-lg"
                size="lg"
              >
                {isInstalling ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2" />
                    {t("installing")}
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    {t("installButton")}
                  </>
                )}
              </Button>
            )}

            {/* Installation Result */}
            {installResult && (
              <div
                className={`p-3 rounded-md border ${
                  installResult === "success"
                    ? "bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800"
                    : installResult === "error"
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : "bg-orange-50 dark:bg-orange-950 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800"
                }`}
              >
                {installResult === "success" && t("successMessage")}
                {installResult === "dismissed" && t("dismissedMessage")}
                {installResult === "error" && t("errorMessage")}
              </div>
            )}

            {/* Already Installed Message */}
            {isInstalled && (
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-green-800 dark:text-green-200">
                    {t("alreadyInstalledMessage")}
                  </p>
                </div>
                <Button asChild className="w-full">
                  <a href="/dashboard">{t("openApp")}</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            {t("troubleText")}{" "}
            <a
              href="tel:+972555585637"
              className="text-primary hover:text-primary/80 underline"
            >
              {t("contactUs")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
