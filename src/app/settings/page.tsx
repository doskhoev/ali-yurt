"use client";

import * as React from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Moon, Monitor, Palette } from "lucide-react";

const accentColors = [
  { id: "default", name: "По умолчанию", color: "oklch(0.5 0 0)" },
  { id: "red", name: "Красный", color: "oklch(0.55 0.2 20)" },
  { id: "orange", name: "Оранжевый", color: "oklch(0.6 0.2 50)" },
  { id: "yellow", name: "Желтый", color: "oklch(0.9 0.2 100)" },
  { id: "green", name: "Зеленый", color: "oklch(0.5 0.2 150)" },
  { id: "lightBlue", name: "Голубой", color: "oklch(0.6 0.2 220)" },
  { id: "blue", name: "Синий", color: "oklch(0.5 0.2 250)" },
  { id: "purple", name: "Фиолетовый", color: "oklch(0.5 0.2 300)" },
  { id: "pink", name: "Розовый", color: "oklch(0.6 0.2 340)" },
] as const;

export default function SettingsPage() {
  const { theme, accentColor, updateTheme, updateAccentColor } = useTheme();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Настройки</h1>
        <p className="text-sm text-muted-foreground">
          Настройте внешний вид сайта под себя.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Тема
          </CardTitle>
          <CardDescription>Выберите светлую или темную тему</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => updateTheme("light")}
              className="flex-1"
            >
              <Sun className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Светлая</span>
              <span className="sm:hidden">Светлая</span>
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => updateTheme("dark")}
              className="flex-1"
            >
              <Moon className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Темная</span>
              <span className="sm:hidden">Темная</span>
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              onClick={() => updateTheme("system")}
              className="flex-1"
            >
              <Monitor className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Системная</span>
              <span className="sm:hidden">Системная</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Цвет акцента
          </CardTitle>
          <CardDescription>Выберите цвет для акцентных элементов</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {accentColors.map((accent) => (
              <button
                key={accent.id}
                onClick={() => updateAccentColor(accent.id as any)}
                className={`relative w-16 h-16 rounded-full border-2 transition-all ${accentColor === accent.id
                  ? "border-foreground scale-110"
                  : "border-border hover:border-foreground/50"
                  } ${accent.id === "default"
                    ? "bg-black dark:bg-white"
                    : ""
                  }`}
                style={accent.id !== "default" ? { backgroundColor: accent.color } : undefined}
                title={accent.name}
              >
                {accentColor === accent.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-4 h-4 rounded-full ${accent.id === 'default'
                      ? "bg-background"
                      : "bg-foreground"
                      }`} />
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-3 text-center">
            {accentColors.find((a) => a.id === accentColor)?.name}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

