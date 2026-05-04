import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { MetadataResult } from '../App';

interface JsonViewerProps {
  data: MetadataResult;
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
      <div className="absolute right-3 top-3 z-10">
        <button
          onClick={handleCopy}
          className={twMerge(
            'rounded-md border border-border bg-panel p-2 text-muted transition hover:border-primary hover:text-primary',
            copied && 'border-primary bg-teal-50 text-primary'
          )}
          title="Copy JSON"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="max-h-[680px] overflow-auto rounded-lg border border-border bg-[#111827] p-4 pt-14 sm:p-6 sm:pt-14">
        <pre className="text-sm font-mono leading-relaxed text-slate-200">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      </div>
    </div>
  );
}
