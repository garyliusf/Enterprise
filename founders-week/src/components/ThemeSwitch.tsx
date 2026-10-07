import { useState } from 'react';

type ThemeChoice = 'system' | 'light' | 'dark';
type ThemeWindow = Window & { __scSetTheme?: (c: ThemeChoice) => void; __scThemeChoice?: () => ThemeChoice };

const OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

/* The marketing sandbox's theme switch (.sc-theme-switch in solutions.html),
   fixed bottom-right. Drives the resolver in index.html, which saves the
   choice under the same "sc-theme" key the sandbox pages use. */
export function ThemeSwitch() {
  const w = window as ThemeWindow;
  const [choice, setChoice] = useState<ThemeChoice>(() => w.__scThemeChoice?.() ?? 'system');
  return (
    <div className="sc-theme-switch" role="group" aria-label="Theme">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={choice === o.value}
          onClick={() => {
            w.__scSetTheme?.(o.value);
            setChoice(o.value);
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
