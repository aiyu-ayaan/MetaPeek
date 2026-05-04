import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Activity,
  BarChart3,
  Clock3,
  Code2,
  Globe2,
  History,
  LayoutTemplate,
  Link2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { JsonViewer } from './components/JsonViewer';
import { SkeletonLoader } from './components/SkeletonLoader';
import { SocialPreview } from './components/SocialPreview';
import { UrlInput } from './components/UrlInput';

export interface MetadataResult {
  title: string;
  description: string;
  image: string;
  url: string;
  site_name: string;
  score?: number;
  extractedAt?: string;
  og?: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    site_name?: string;
  };
  twitter?: {
    title?: string;
    description?: string;
    image?: string;
    card?: string;
  };
}

interface RecentExtraction {
  _id: string;
  normalizedUrl: string;
  result?: {
    title?: string;
    site_name?: string;
  };
  responseTimeMs?: number;
  createdAt: string;
}

function App() {
  const [data, setData] = useState<MetadataResult | null>(null);
  const [recent, setRecent] = useState<RecentExtraction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [view, setView] = useState<'preview' | 'json'>('preview');
  const [error, setError] = useState('');

  useEffect(() => {
    void refreshRecent();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      return;
    }

    setProgress(12);
    const timer = window.setInterval(() => {
      setProgress((current) => Math.min(current + Math.max(4, Math.round((92 - current) / 8)), 92));
    }, 280);

    return () => window.clearInterval(timer);
  }, [isLoading]);

  const refreshRecent = async () => {
    try {
      const response = await axios.get<RecentExtraction[]>('/api/extractions/recent');
      setRecent(response.data);
    } catch {
      setRecent([]);
    }
  };

  const handleExtract = async (url: string) => {
    setIsLoading(true);
    setError('');
    setData(null);

    try {
      const response = await axios.post<MetadataResult>('/api/extract', { url });
      setProgress(100);
      setData(response.data);
      setView('preview');
      void refreshRecent();
    } catch (requestError) {
      const message = axios.isAxiosError(requestError)
        ? requestError.response?.data?.error || requestError.message
        : 'Failed to extract metadata';
      setError(message);
    } finally {
      window.setTimeout(() => setIsLoading(false), 220);
    }
  };

  const score = data?.score ?? 0;
  const domain = useMemo(() => {
    if (!data?.url) return 'No URL loaded';

    try {
      return new URL(data.url).hostname.replace('www.', '');
    } catch {
      return data.url;
    }
  }, [data?.url]);

  const statCards = [
    { label: 'Quality score', value: data ? `${score}%` : '--', icon: BarChart3 },
    { label: 'Recent scans', value: recent.length.toString(), icon: History },
    { label: 'Result source', value: data?.site_name || domain, icon: Globe2 },
  ];

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-panel">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-ink sm:text-3xl">MetaPeek</h1>
                <p className="text-sm text-muted">Social card metadata inspector</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted">
              <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Mongo tracking
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5">
                <Activity className="h-3.5 w-3.5 text-primary" />
                Mobile ready
              </span>
            </div>
          </header>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase text-primary">Inspect before you share</p>
                <h2 className="max-w-3xl text-3xl font-semibold leading-tight text-ink sm:text-5xl">
                  Preview how any link appears across social platforms.
                </h2>
              </div>
              <UrlInput onExtract={handleExtract} isLoading={isLoading} />
              {error && (
                <div className="rounded-lg border border-danger/30 bg-orange-50 px-4 py-3 text-sm font-medium text-danger">
                  {error}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border bg-background p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">Extraction progress</span>
                <span className="text-sm font-semibold text-primary">{isLoading ? `${progress}%` : data ? '100%' : 'Ready'}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-border">
                <div
                  className={twMerge(
                    'h-full rounded-full bg-primary transition-all duration-300',
                    isLoading && 'progress-stripes'
                  )}
                  style={{ width: `${isLoading ? progress : data ? 100 : 0}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-muted">
                {isLoading ? 'Fetching HTML, resolving tags, and preparing previews.' : 'Paste a URL to begin a fresh scan.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {statCards.map((item) => (
              <div key={item.label} className="rounded-lg border border-border bg-panel p-4 glass-border">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-primary">
                  <item.icon className="h-4 w-4" />
                </div>
                <p className="text-sm text-muted">{item.label}</p>
                <p className="mt-1 truncate text-lg font-semibold text-ink">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-panel p-3 glass-border sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink">Results</h2>
                <p className="text-sm text-muted">{data ? `Loaded metadata for ${domain}` : 'Your previews and JSON output will appear here.'}</p>
              </div>
              <div className="grid grid-cols-2 rounded-lg border border-border bg-background p-1">
                <button
                  onClick={() => setView('preview')}
                  className={twMerge(
                    'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition',
                    view === 'preview' ? 'bg-panel text-primary shadow-sm' : 'text-muted hover:text-ink'
                  )}
                >
                  <LayoutTemplate className="h-4 w-4" />
                  Preview
                </button>
                <button
                  onClick={() => setView('json')}
                  className={twMerge(
                    'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition',
                    view === 'json' ? 'bg-panel text-primary shadow-sm' : 'text-muted hover:text-ink'
                  )}
                >
                  <Code2 className="h-4 w-4" />
                  JSON
                </button>
              </div>
            </div>

            <div className="min-h-[420px]">
              {isLoading ? <SkeletonLoader /> : data ? view === 'preview' ? <SocialPreview data={data} /> : <JsonViewer data={data} /> : <EmptyState />}
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-lg border border-border bg-panel p-5 glass-border">
            <h2 className="mb-4 text-lg font-semibold text-ink">Recent scans</h2>
            <div className="space-y-3">
              {recent.length ? (
                recent.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => handleExtract(item.normalizedUrl)}
                    className="w-full rounded-lg border border-border bg-background p-3 text-left transition hover:border-primary hover:bg-teal-50"
                  >
                    <p className="truncate text-sm font-semibold text-ink">{item.result?.title || item.normalizedUrl}</p>
                    <p className="mt-1 truncate text-xs text-muted">{item.result?.site_name || item.normalizedUrl}</p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        {item.responseTimeMs || 0}ms
                      </span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted">
                  MongoDB-backed scan history will show up once you extract a link.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-ink p-5 text-white glass-border">
            <h2 className="text-lg font-semibold">Production notes</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p className="flex gap-2">
                <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                Relative images and canonical URLs are resolved before previews render.
              </p>
              <p className="flex gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                Each extraction is stored with status, latency, and result payload when MongoDB is connected.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-teal-50 text-primary">
        <LayoutTemplate className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-ink">No link inspected yet</h3>
      <p className="mt-2 max-w-sm text-sm text-muted">Run a URL through MetaPeek to see platform previews, raw metadata, score, and scan history.</p>
    </div>
  );
}

export default App;
