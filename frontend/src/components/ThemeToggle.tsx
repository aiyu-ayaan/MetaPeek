import { Monitor, Moon, Sun } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export type ThemeMode = 'auto' | 'light' | 'dark';

interface ThemeToggleProps {
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
}

export function ThemeToggle({ mode, onChange }: ThemeToggleProps) {
  const toggleTheme = () => {
    if (mode === 'light') onChange('dark');
    else if (mode === 'dark') onChange('auto');
    else onChange('light');
  };

  const Icon = mode === 'light' ? Sun : mode === 'dark' ? Moon : Monitor;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-muted transition hover:bg-panel hover:text-ink focus:outline-none"
      aria-label="Toggle theme"
      title={`Theme: ${mode} (Click to toggle)`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
