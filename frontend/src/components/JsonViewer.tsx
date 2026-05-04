import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface JsonViewerProps {
  data: any;
}

export function JsonViewer({ data }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full relative group">
      <div className="absolute right-4 top-4 z-10">
        <button
          onClick={handleCopy}
          className={twMerge(
            "p-2 rounded-lg bg-background/50 backdrop-blur border border-border transition-all duration-300",
            "hover:bg-primary/20 hover:border-primary/50 text-text-muted hover:text-primary",
            copied && "bg-green-500/20 border-green-500/50 text-green-400 hover:text-green-400"
          )}
          title="Copy JSON"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="bg-background rounded-xl border border-border p-6 overflow-x-auto">
        <pre className="text-sm font-mono text-text-muted">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      </div>
    </div>
  );
}
