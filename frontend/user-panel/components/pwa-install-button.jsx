"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Download } from "lucide-react";
import clsx from "clsx";

function isStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function getFallbackMessage() {
  if (typeof window === "undefined") {
    return "Install option will appear when your browser allows it.";
  }

  const userAgent = window.navigator.userAgent || "";
  const isIos = /iphone|ipad|ipod/i.test(userAgent);

  if (isIos) {
    return "Use Safari Share menu and tap Add to Home Screen.";
  }

  return "Install option will appear when your browser allows it.";
}

export function PwaInstallButton({
  containerClassName = "",
  buttonClassName = "",
  hintClassName = "",
}) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installHint, setInstallHint] = useState("");

  useEffect(() => {
    const syncInstalledState = () => {
      setIsInstalled(isStandaloneMode());
    };

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setInstallHint("");
      syncInstalledState();
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setInstallHint("GossipGo installed successfully.");
      setIsInstalled(true);
      setIsInstalling(false);
    };

    syncInstalledState();
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (isInstalled) {
      setInstallHint("GossipGo is already installed on this device.");
      return;
    }

    if (!deferredPrompt) {
      setInstallHint(getFallbackMessage());
      return;
    }

    setIsInstalling(true);
    setInstallHint("");

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      setDeferredPrompt(null);

      if (choiceResult?.outcome === "accepted") {
        setInstallHint("Install request sent to your browser.");
      } else {
        setInstallHint("Install was cancelled. You can try again when the prompt is available.");
      }
    } catch (_error) {
      setInstallHint("Install prompt could not be opened right now.");
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className={clsx("flex w-full flex-col gap-2", containerClassName)}>
      <button
        type="button"
        onClick={handleInstall}
        className={clsx(
          "inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-3.5 text-[13px] font-semibold transition sm:px-8 sm:py-4 sm:text-lg sm:font-bold",
          buttonClassName,
          isInstalled
            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600"
            : "border-[rgb(var(--border))] bg-surface text-text hover:-translate-y-1 hover:border-brand/40 hover:bg-card/50"
        )}
      >
        {isInstalled ? (
          <CheckCircle2 className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
        ) : (
          <Download className="h-[18px] w-[18px] text-brand sm:h-5 sm:w-5" />
        )}
        <span>{isInstalling ? "Opening..." : isInstalled ? "Installed" : "Install Now"}</span>
      </button>

      {installHint ? (
        <p className={clsx("px-2 text-center text-xs leading-5 text-muted sm:text-left", hintClassName)}>
          {installHint}
        </p>
      ) : null}
    </div>
  );
}
