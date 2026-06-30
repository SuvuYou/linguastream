"use client";

import type { SubtitleSettings } from "@/lib/initializations/store";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";

interface SubtitleSettingsPanelProps {
  settings: SubtitleSettings;
  onSettingsChange: (s: Partial<SubtitleSettings>) => void;
}

type FontSize = "small" | "medium" | "large";
const FONT_SIZES: FontSize[] = ["small", "medium", "large"];

export default function SubtitleSettingsPanel({
  settings,
  onSettingsChange,
}: SubtitleSettingsPanelProps) {
  return (
    <Card className="absolute bottom-14 right-0 w-72 z-20 shadow-xl rounded-none">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-xs text-secondary-text font-medium uppercase tracking-wider">
          Subtitle Settings
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 pb-4 flex flex-col gap-4">
        {/* Visibility toggles */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="toggle-source"
              className="text-xs text-primary-text font-normal cursor-pointer"
            >
              Show source
            </Label>
            <Switch
              id="toggle-source"
              checked={settings.showSource}
              onCheckedChange={(v) => onSettingsChange({ showSource: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label
              htmlFor="toggle-translation"
              className="text-xs text-primary-text font-normal cursor-pointer"
            >
              Show translation
            </Label>
            <Switch
              id="toggle-translation"
              checked={settings.showTranslation}
              onCheckedChange={(v) => onSettingsChange({ showTranslation: v })}
            />
          </div>
        </div>

        <Separator />

        {/* Font size pickers */}
        <div className="flex flex-col gap-2">
          <Field className="gap-1">
            <FieldLabel className="text-xs text-secondary-text font-normal">
              Source font size
            </FieldLabel>
            <Tabs
              value={settings.sourceFontSize}
              onValueChange={(v) =>
                onSettingsChange({ sourceFontSize: v as FontSize })
              }
            >
              <TabsList className="w-full">
                {FONT_SIZES.map((size) => (
                  <TabsTrigger
                    key={size}
                    value={size}
                    className="flex-1 text-xs capitalize"
                  >
                    {size}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </Field>

          <Field className="gap-1">
            <FieldLabel className="text-xs text-secondary-text font-normal">
              Translation font size
            </FieldLabel>
            <Tabs
              value={settings.translationFontSize}
              onValueChange={(v) =>
                onSettingsChange({ translationFontSize: v as FontSize })
              }
            >
              <TabsList className="w-full">
                {FONT_SIZES.map((size) => (
                  <TabsTrigger
                    key={size}
                    value={size}
                    className="flex-1 text-xs capitalize"
                  >
                    {size}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </Field>
        </div>

        <Separator />

        {/* Color pickers */}
        <div className="flex gap-3">
          <Field className="gap-1 flex-1">
            <FieldLabel className="text-xs text-secondary-text font-normal">
              Font color
            </FieldLabel>
            <input
              type="color"
              value={settings.fontColor}
              onChange={(e) => onSettingsChange({ fontColor: e.target.value })}
              className="w-full h-8 bg-background border border-primary-border cursor-pointer"
            />
          </Field>
          <Field className="gap-1 flex-1">
            <FieldLabel className="text-xs text-secondary-text font-normal">
              Background color
            </FieldLabel>
            <input
              type="color"
              value={settings.backgroundColor}
              onChange={(e) =>
                onSettingsChange({ backgroundColor: e.target.value })
              }
              className="w-full h-8 bg-background border border-primary-border cursor-pointer"
            />
          </Field>
        </div>

        <Separator />

        {/* Opacity sliders */}
        <div className="flex flex-col gap-2">
          <Field className="gap-1">
            <FieldLabel className="text-xs text-secondary-text font-normal">
              Font opacity{" "}
              <span className="text-primary-text">
                {Math.round(settings.fontOpacity * 100)}%
              </span>
            </FieldLabel>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={[settings.fontOpacity]}
              onValueChange={([v]) => onSettingsChange({ fontOpacity: v })}
            />
          </Field>
          <Field className="gap-1">
            <FieldLabel className="text-xs text-secondary-text font-normal">
              Background opacity{" "}
              <span className="text-primary-text">
                {Math.round(settings.backgroundOpacity * 100)}%
              </span>
            </FieldLabel>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={[settings.backgroundOpacity]}
              onValueChange={([v]) =>
                onSettingsChange({ backgroundOpacity: v })
              }
            />
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}
