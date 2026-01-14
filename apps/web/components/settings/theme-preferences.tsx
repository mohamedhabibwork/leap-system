'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Sun, Moon, Monitor, Palette, Type, Eye, Layout } from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type FeedDensity = 'compact' | 'comfortable' | 'spacious';
type AccentColor = 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'pink';

export function ThemePreferences() {
  const t = useTranslations('settings.theme');
  const { theme, setTheme } = useTheme();
  
  const [fontSize, setFontSize] = useState(16);
  const [feedDensity, setFeedDensity] = useState<FeedDensity>('comfortable');
  const [accentColor, setAccentColor] = useState<AccentColor>('blue');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  const handleSave = () => {
    // Save preferences to localStorage or API
    localStorage.setItem('theme-preferences', JSON.stringify({
      theme,
      fontSize,
      feedDensity,
      accentColor,
      reducedMotion,
      highContrast,
    }));
    
    // Apply CSS variables
    document.documentElement.style.fontSize = `${fontSize}px`;
    document.documentElement.setAttribute('data-density', feedDensity);
    document.documentElement.setAttribute('data-accent', accentColor);
    
    if (reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    toast.success(t('saved'));
  };

  const accentColors: { value: AccentColor; label: string; class: string }[] = [
    { value: 'blue', label: t('colors.blue'), class: 'bg-blue-500' },
    { value: 'purple', label: t('colors.purple'), class: 'bg-purple-500' },
    { value: 'green', label: t('colors.green'), class: 'bg-green-500' },
    { value: 'orange', label: t('colors.orange'), class: 'bg-orange-500' },
    { value: 'red', label: t('colors.red'), class: 'bg-red-500' },
    { value: 'pink', label: t('colors.pink'), class: 'bg-pink-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Theme Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {t('appearance')}
          </CardTitle>
          <CardDescription>{t('appearanceDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>{t('themeMode')}</Label>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-colors hover:bg-muted',
                  theme === 'light' && 'border-primary bg-primary/5'
                )}
              >
                <Sun className="h-6 w-6" />
                <span className="text-sm font-medium">{t('light')}</span>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-colors hover:bg-muted',
                  theme === 'dark' && 'border-primary bg-primary/5'
                )}
              >
                <Moon className="h-6 w-6" />
                <span className="text-sm font-medium">{t('dark')}</span>
              </button>

              <button
                onClick={() => setTheme('system')}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-colors hover:bg-muted',
                  theme === 'system' && 'border-primary bg-primary/5'
                )}
              >
                <Monitor className="h-6 w-6" />
                <span className="text-sm font-medium">{t('system')}</span>
              </button>
            </div>
          </div>

          <Separator />

          {/* Accent Color */}
          <div className="space-y-3">
            <Label>{t('accentColor')}</Label>
            <div className="grid grid-cols-6 gap-3">
              {accentColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setAccentColor(color.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 border-2 rounded-lg transition-colors hover:bg-muted',
                    accentColor === color.value && 'border-primary'
                  )}
                  title={color.label}
                >
                  <div className={cn('w-8 h-8 rounded-full', color.class)} />
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            {t('typography')}
          </CardTitle>
          <CardDescription>{t('typographyDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="font-size">{t('fontSize')}</Label>
              <span className="text-sm text-muted-foreground">{fontSize}px</span>
            </div>
            <Slider
              id="font-size"
              min={12}
              max={20}
              step={1}
              value={[fontSize]}
              onValueChange={(value) => setFontSize(value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('small')}</span>
              <span>{t('medium')}</span>
              <span>{t('large')}</span>
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-muted/50">
            <p style={{ fontSize: `${fontSize}px` }}>
              {t('previewText')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Feed Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            {t('feedLayout')}
          </CardTitle>
          <CardDescription>{t('feedLayoutDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label>{t('density')}</Label>
            <RadioGroup value={feedDensity} onValueChange={(value) => setFeedDensity(value as FeedDensity)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="compact" id="compact" />
                <Label htmlFor="compact" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium">{t('compact')}</p>
                    <p className="text-sm text-muted-foreground">{t('compactDescription')}</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="comfortable" id="comfortable" />
                <Label htmlFor="comfortable" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium">{t('comfortable')}</p>
                    <p className="text-sm text-muted-foreground">{t('comfortableDescription')}</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="spacious" id="spacious" />
                <Label htmlFor="spacious" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium">{t('spacious')}</p>
                    <p className="text-sm text-muted-foreground">{t('spaciousDescription')}</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {t('accessibility')}
          </CardTitle>
          <CardDescription>{t('accessibilityDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('reducedMotion')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('reducedMotionDescription')}
              </p>
            </div>
            <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('highContrast')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('highContrastDescription')}
              </p>
            </div>
            <Switch checked={highContrast} onCheckedChange={setHighContrast} />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          {t('savePreferences')}
        </Button>
      </div>
    </div>
  );
}
