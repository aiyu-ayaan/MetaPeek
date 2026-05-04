import { useState } from 'react';
import axios from 'axios';
import { UrlInput } from './components/UrlInput';
import { SocialPreview } from './components/SocialPreview';
import { JsonViewer } from './components/JsonViewer';
import { SkeletonLoader } from './components/SkeletonLoader';
import { Sparkles, Code2, LayoutTemplate } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

function App() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'preview' | 'json'>('preview');

  const handleExtract = async (url: string) => {
    setIsLoading(true);
    setData(null);
    try {
      // In development, the proxy will handle this.
      // In production, you'd use a full URL or relative path if served together.
      const response = await axios.post('/api/extract', { url });
      setData(response.data);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to extract metadata';
      // In a real app, you'd use a toast notification here.
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-main py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Meta<span className="text-primary">Peek</span>
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Extract rich metadata and preview social cards instantly. Perfect for SEO testing and link optimization.
          </p>
        </div>

        {/* Input section */}
        <UrlInput onExtract={handleExtract} isLoading={isLoading} />

        {/* Results section */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center gap-8 animate-in fade-in duration-500">
              <SkeletonLoader />
            </div>
          ) : data ? (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
              {/* View Toggle */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setView('preview')}
                  className={twMerge(
                    "flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-300",
                    view === 'preview' 
                      ? "bg-card border-2 border-primary text-primary shadow-lg shadow-primary/10" 
                      : "bg-background border-2 border-border text-text-muted hover:border-text-muted/50"
                  )}
                >
                  <LayoutTemplate className="w-4 h-4" />
                  Visual Preview
                </button>
                <button
                  onClick={() => setView('json')}
                  className={twMerge(
                    "flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-300",
                    view === 'json' 
                      ? "bg-card border-2 border-primary text-primary shadow-lg shadow-primary/10" 
                      : "bg-background border-2 border-border text-text-muted hover:border-text-muted/50"
                  )}
                >
                  <Code2 className="w-4 h-4" />
                  Raw JSON
                </button>
              </div>

              {/* Content */}
              <div className="transition-all duration-500">
                {view === 'preview' ? (
                  <SocialPreview data={data} />
                ) : (
                  <JsonViewer data={data} />
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-text-muted/50 space-y-4">
              <div className="p-6 rounded-full bg-card/50 border border-border">
                <LayoutTemplate className="w-12 h-12" />
              </div>
              <p>Paste a link above to see the magic happen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
