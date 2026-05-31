"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface AccessibilitySettings {
  highContrast: boolean;
  fontSizeScaling: number; // 100 to 150
  reduceMotion: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  fontSizeScaling: 100,
  reduceMotion: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("accessibility-settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({
          highContrast: parsed.highContrast ?? defaultSettings.highContrast,
          fontSizeScaling: parsed.fontSizeScaling ?? defaultSettings.fontSizeScaling,
          reduceMotion: parsed.reduceMotion ?? defaultSettings.reduceMotion,
        });
      } catch (e) {
        console.error("Failed to parse accessibility settings", e);
      }
    }
  }, []);

  // Save to localStorage and apply classes to <body>
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("accessibility-settings", JSON.stringify(settings));

    const body = document.body;
    
    // High Contrast
    if (settings.highContrast) {
      body.classList.add("theme-high-contrast");
    } else {
      body.classList.remove("theme-high-contrast");
    }

    // Font Size Scaling
    const html = document.documentElement;
    html.style.fontSize = `${settings.fontSizeScaling}%`;

    // Reduce Motion
    if (settings.reduceMotion) {
      body.classList.add("theme-reduce-motion");
    } else {
      body.classList.remove("theme-reduce-motion");
    }
  }, [settings, mounted]);

  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}
