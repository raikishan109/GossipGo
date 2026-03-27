"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    const isLocalhost = /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

    if (!("serviceWorker" in navigator) || (!window.isSecureContext && !isLocalhost)) {
      return;
    }

    navigator.serviceWorker.register("/sw.js").then((registration) => {
      registration.update().catch(() => {});
    }).catch(() => {});
  }, []);

  return null;
}
