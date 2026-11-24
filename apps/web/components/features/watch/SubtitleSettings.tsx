"use client";

import { useAppStore } from "@/lib/initializations/store";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";

type FontSize = "small" | "medium" | "large";
const FONT_SIZES: FontSize[] = ["small", "medium", "large"];

export default function SubtitleSettingsPanel() {
  const { subtitleSettings, setSubtitleSettings } = useAppStore();

  return (
    <Card className="h-auto overflow-scroll m-0.5 ring-0 pt-2">
      <CardHeader className="px-4 pb-2">
        <CardTitle className="text-lg text-primary-foreground font-medium uppercase tracking-wider">
          Subtitle Settings
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 pb-4 flex flex-col gap-4">
        {/* Visibility toggles */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <Label
              htmlFor="toggle-source"
              className="text-sm text-primary-foreground font-normal cursor-pointer"
            >
              Show source
            </Label>
            <Switch
              id="toggle-source"
              checked={subtitleSettings.showSource}
              onCheckedChange={(v) => setSubtitleSettings({ showSource: v })}
            />
          </div>
          <div className="flex flex-1 items-center justify-between gap-4">
            <Label
              htmlFor="toggle-translation"
              className="text-sm text-primary-foreground font-normal cursor-pointer"
            >
              Show translation
            </Label>
            <Switch
              id="toggle-translation"
              checked={subtitleSettings.showTranslation}
              onCheckedChange={(v) =>
                setSubtitleSettings({ showTranslation: v })
              }
            />
          </div>
        </div>

        <Separator />

        {/* Font size pickers */}
        <div className="flex flex-col gap-4">
          <Field className="gap-2">
            <FieldLabel className="text-sm text-primary-foreground font-normal">
              Source font size
            </FieldLabel>
            <Tabs
              value={subtitleSettings.sourceFontSize}
              onValueChange={(v) =>
                setSubtitleSettings({ sourceFontSize: v as FontSize })
              }
            >
              <TabsList className="w-full">
                {FONT_SIZES.map((size) => (
                  <TabsTrigger
                    key={size}
                    value={size}
                    className="capitalize dark:data-active:bg-primary"
                  >
                    {size}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </Field>

          <Field className="gap-2">
            <FieldLabel className="text-sm text-primary-foreground font-normal">
              Translation font size
            </FieldLabel>
            <Tabs
              value={subtitleSettings.translationFontSize}
              onValueChange={(v) =>
                setSubtitleSettings({ translationFontSize: v as FontSize })
              }
            >
              <TabsList className="w-full">
                {FONT_SIZES.map((size) => (
                  <TabsTrigger
                    key={size}
                    value={size}
                    className="capitalize dark:data-active:bg-primary"
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
        <Field className="gap-2 flex-1">
          <FieldLabel className="text-sm text-primary-foreground font-normal">
            Highlight Font
          </FieldLabel>
          <input
            type="color"
            value={subtitleSettings.highlightFontColor}
            onChange={(e) =>
              setSubtitleSettings({ highlightFontColor: e.target.value })
            }
            className="h-8 cursor-pointer"
          />
        </Field>
        <div className="flex gap-4">
          <div className="flex-1">
            <Field className="gap-2 flex-1 mb-4">
              <FieldLabel className="text-sm text-primary-foreground font-normal">
                Source Font
              </FieldLabel>
              <input
                type="color"
                value={subtitleSettings.sourceFontColor}
                onChange={(e) =>
                  setSubtitleSettings({ sourceFontColor: e.target.value })
                }
                className="h-8 cursor-pointer"
              />
            </Field>
            <Field className="gap-2 flex-1">
              <FieldLabel className="text-sm text-primary-foreground font-normal">
                Source BG
              </FieldLabel>
              <input
                type="color"
                value={subtitleSettings.sourceBackgroundColor}
                onChange={(e) =>
                  setSubtitleSettings({ sourceBackgroundColor: e.target.value })
                }
                className="h-8 cursor-pointer"
              />
            </Field>
          </div>
          <div className="flex-1">
            <Field className="gap-2 flex-1 mb-4">
              <FieldLabel className="text-sm text-primary-foreground font-normal">
                Translation Font
              </FieldLabel>
              <input
                type="color"
                value={subtitleSettings.translationFontColor}
                onChange={(e) =>
                  setSubtitleSettings({ translationFontColor: e.target.value })
                }
                className="h-8 cursor-pointer"
              />
            </Field>
            <Field className="gap-2 flex-1">
              <FieldLabel className="text-sm text-primary-foreground font-normal">
                Translation BG
              </FieldLabel>
              <input
                type="color"
                value={subtitleSettings.translationBackgroundColor}
                onChange={(e) =>
                  setSubtitleSettings({
                    translationBackgroundColor: e.target.value,
                  })
                }
                className="h-8 cursor-pointer"
              />
            </Field>
          </div>
        </div>

        <Separator />

        {/* Opacity sliders */}
        <div className="flex flex-col gap-4">
          <Field className="gap-2">
            <FieldLabel className="text-sm text-primary-foreground font-normal">
              Font opacity
              <span className="text-primary-foreground">
                {Math.round(subtitleSettings.fontOpacity * 100)}%
              </span>
            </FieldLabel>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[subtitleSettings.fontOpacity]}
              onValueChange={([v]) => setSubtitleSettings({ fontOpacity: v })}
            />
          </Field>
          <Field className="gap-2">
            <FieldLabel className="text-sm text-primary-foreground font-normal">
              Background opacity{" "}
              <span className="text-primary-foreground">
                {Math.round(subtitleSettings.backgroundOpacity * 100)}%
              </span>
            </FieldLabel>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[subtitleSettings.backgroundOpacity]}
              onValueChange={([v]) =>
                setSubtitleSettings({ backgroundOpacity: v })
              }
            />
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}
