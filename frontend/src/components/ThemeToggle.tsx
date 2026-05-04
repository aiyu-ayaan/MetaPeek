import { Monitor, Moon, Sun } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export type ThemeMode = 'auto' | 'light' | 'dark';

interface ThemeToggleProps {
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
}

const options = [
  { value: 'auto', label: 'Auto', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
] as const;

export function ThemeToggle({ mode, onChange }: ThemeToggleProps) {
  return (
    <div className="rounded-lg border border-border bg-background p-1" aria-label="Theme selector">
      <div className="grid grid-cols-3 gap-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={twMerge(
              'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition',
              mode === option.value ? 'bg-panel text-primary shadow-sm' : 'text-muted hover:text-ink'
            )}
            aria-pressed={mode === option.value}
            title={`${option.label} theme`}
          >
            <option.icon className="h-3.5 w-3.5" />
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
