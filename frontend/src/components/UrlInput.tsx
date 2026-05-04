import { useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface UrlInputProps {
  onExtract: (url: string) => void;
  isLoading: boolean;
}

export function UrlInput({ onExtract, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextUrl = url.trim();

    if (!nextUrl) {
      setError('Please enter a URL');
      return;
    }
    
    try {
      new URL(nextUrl);
      setError('');
      onExtract(nextUrl);
    } catch {
      setError('Please enter a valid URL (e.g., https://example.com)');
    }
  };

  return (
    <div className="w-full max-w-3xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className={twMerge(
          'grid w-full gap-2 rounded-lg border bg-white p-2 transition sm:grid-cols-[1fr_auto]',
          error ? 'border-danger/60' : 'border-border focus-within:border-primary'
        )}>
          <div className="flex min-w-0 items-center gap-2 px-2">
            <Search className="h-5 w-5 shrink-0 text-muted" />
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError('');
              }}
              placeholder="https://example.com/article"
              className="min-h-11 w-full min-w-0 bg-transparent text-base text-ink outline-none placeholder:text-muted"
              disabled={isLoading}
              inputMode="url"
              autoCapitalize="none"
              autoComplete="url"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !url}
            className={twMerge(
              'inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 font-semibold text-white transition',
              'hover:bg-primary-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting</span>
              </>
            ) : (
              'Extract'
            )}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm font-medium text-danger">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
