import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
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
    if (!url) {
      setError('Please enter a URL');
      return;
    }
    
    try {
      new URL(url);
      setError('');
      onExtract(url);
    } catch {
      setError('Please enter a valid URL (e.g., https://example.com)');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="relative group">
        <div className={twMerge(
          "relative flex items-center w-full rounded-2xl overflow-hidden",
          "bg-card border-2 transition-all duration-300",
          error ? "border-red-500/50" : "border-border hover:border-primary/50 focus-within:border-primary",
          "shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
        )}>
          <div className="pl-4 text-text-muted">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError('');
            }}
            placeholder="Paste a URL here to extract metadata..."
            className="w-full py-4 px-4 bg-transparent outline-none text-text-main placeholder-text-muted/60"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !url}
            className={twMerge(
              "absolute right-2 px-6 py-2 rounded-xl font-medium transition-all duration-300",
              "bg-primary text-white hover:bg-primary-hover active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:active:scale-100",
              "flex items-center gap-2"
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
          <p className="absolute -bottom-6 left-2 text-sm text-red-400 font-medium animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
