"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: boolean) => void;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
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
        setSettings(JSON.parse(saved));
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

    // Large Text (usually applied to HTML for rem scaling, but body is fine if we use CSS vars or explicit rules)
    const html = document.documentElement;
    if (settings.largeText) {
      html.classList.add("theme-large-text");
    } else {
      html.classList.remove("theme-large-text");
    }

    // Reduce Motion
    if (settings.reduceMotion) {
      body.classList.add("theme-reduce-motion");
    } else {
      body.classList.remove("theme-reduce-motion");
    }
  }, [settings, mounted]);

  const updateSetting = (key: keyof AccessibilitySettings, value: boolean) => {
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
