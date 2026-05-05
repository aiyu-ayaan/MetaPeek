import { Globe2, MessageCircle, Gamepad2, Hash } from 'lucide-react';
import type { MetadataResult } from '../App';

interface SocialPreviewProps {
  data: MetadataResult;
}

type Platform = 'x' | 'facebook' | 'linkedin' | 'whatsapp' | 'discord' | 'slack';

const platformLabels: Record<Platform, string> = {
  x: 'X / Twitter',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
  discord: 'Discord',
  slack: 'Slack',
};

export function SocialPreview({ data }: SocialPreviewProps) {
  const title = data.og?.title || data.twitter?.title || data.title || 'No title available';
  const description = data.og?.description || data.twitter?.description || data.description || 'No description available';
  const image = data.og?.image || data.twitter?.image || data.image;
  const domain = getDomain(data);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {(['x', 'facebook', 'linkedin', 'whatsapp', 'discord', 'slack'] as Platform[]).map((platform) => (
        <section key={platform} className="rounded-lg border border-border bg-background p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <PlatformIcon platform={platform} />
              <h3 className="truncate text-sm font-semibold text-ink">{platformLabels[platform]}</h3>
            </div>
            <span className="rounded-full border border-border bg-panel px-2.5 py-1 text-xs font-medium text-muted">
              {platform === 'whatsapp' ? 'Compact' : platform === 'slack' || platform === 'discord' ? 'Embed' : 'Card'}
            </span>
          </div>
          <div className="flex min-h-[340px] items-center justify-center rounded-lg border border-border bg-panel p-4 sm:p-6">
            {renderPreview(platform, { title, description, image, domain })}
          </div>
        </section>
      ))}
    </div>
  );
}

function renderPreview(
  platform: Platform,
  content: { title: string; description: string; image: string; domain: string }
) {
  if (platform === 'whatsapp') {
    return (
      <div className="w-full max-w-[440px] rounded-lg bg-[#d9fdd3] p-1.5 shadow-sm">
        <div className="flex overflow-hidden rounded-md border border-[#c5e7bd] bg-[#f6fff4]">
          <MediaBlock image={content.image} title={content.title} className="h-[118px] w-[118px] shrink-0" />
          <div className="min-w-0 flex-1 p-3">
            <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-[#111b21]">{content.title}</h4>
            <p className="mt-1 line-clamp-2 text-xs leading-snug text-[#667781]">{content.description}</p>
            <p className="mt-2 truncate text-xs text-[#667781]">{content.domain}</p>
          </div>
        </div>
      </div>
    );
  }

  if (platform === 'linkedin') {
    return (
      <div className="w-full max-w-[640px] overflow-hidden border border-[#bfccd6] bg-white text-left">
        <MediaBlock image={content.image} title={content.title} className="aspect-[1.91/1] w-full" />
        <div className="bg-[#eef3f8] px-4 py-3">
          <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-[#000000e6]">{content.title}</h4>
          <p className="mt-1 truncate text-xs text-[#00000099]">{content.domain}</p>
        </div>
      </div>
    );
  }

  if (platform === 'facebook') {
    return (
      <div className="w-full max-w-[640px] overflow-hidden border border-[#ccd0d5] bg-[#f0f2f5] text-left">
        <MediaBlock image={content.image} title={content.title} className="aspect-[1.91/1] w-full" />
        <div className="border-t border-[#ccd0d5] px-4 py-3">
          <p className="truncate text-xs uppercase text-[#606770]">{content.domain}</p>
          <h4 className="mt-1 line-clamp-2 text-base font-semibold leading-tight text-[#1d2129]">{content.title}</h4>
          <p className="mt-1 line-clamp-2 text-sm text-[#606770]">{content.description}</p>
        </div>
      </div>
    );
  }

  if (platform === 'discord') {
    return (
      <div className="w-full max-w-[520px] rounded border-l-4 border-[#5865F2] bg-[#2B2D31] p-4 text-left shadow-sm">
        <div className="mb-1 text-xs font-semibold text-[#DBDEE1]">{content.domain}</div>
        <div className="mb-2 text-base font-semibold text-[#00A8FC] cursor-pointer hover:underline">{content.title}</div>
        <div className="mb-3 text-sm leading-snug text-[#DBDEE1]">{content.description}</div>
        <MediaBlock image={content.image} title={content.title} className="max-w-[400px] aspect-[1.91/1] rounded-lg" />
      </div>
    );
  }

  if (platform === 'slack') {
    return (
      <div className="w-full max-w-[500px] text-left">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-4 w-4 items-center justify-center overflow-hidden rounded bg-slate-200">
            <img src={`https://www.google.com/s2/favicons?domain=${content.domain}&sz=32`} alt="" className="h-full w-full object-cover" />
          </div>
          <span className="text-[13px] font-bold text-ink">{content.domain}</span>
        </div>
        <div className="ml-2 border-l-[4px] border-[#E0E1E5] pl-3">
          <div className="mb-1 cursor-pointer text-[15px] font-bold text-[#1164A3] hover:underline">{content.title}</div>
          <div className="mb-2 text-[15px] leading-snug text-ink">{content.description}</div>
          <MediaBlock image={content.image} title={content.title} className="max-w-[360px] aspect-[1.91/1] rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[640px] overflow-hidden rounded-2xl border border-[#2f3336] bg-black text-left">
      <MediaBlock image={content.image} title={content.title} className="aspect-[1.91/1] w-full border-b border-[#2f3336]" />
      <div className="p-3">
        <h4 className="line-clamp-1 text-[15px] leading-snug text-white">{content.title}</h4>
        <p className="mt-1 line-clamp-2 text-[15px] leading-snug text-[#71767b]">{content.description}</p>
        <p className="mt-2 truncate text-[15px] text-[#71767b]">{content.domain}</p>
      </div>
    </div>
  );
}

function MediaBlock({ image, title, className }: { image: string; title: string; className: string }) {
  if (!image) {
    return (
      <div className={`${className} flex items-center justify-center bg-slate-100`}>
        <Globe2 className="h-10 w-10 text-slate-400" />
      </div>
    );
  }

  return (
    <div className={`${className} overflow-hidden bg-slate-100`}>
      <img
        src={image}
        alt={title}
        className="h-full w-full object-cover"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
}

function PlatformIcon({ platform }: { platform: Platform }) {
  if (platform === 'whatsapp') return <MessageCircle className="h-4 w-4 text-primary" />;
  if (platform === 'discord') return <Gamepad2 className="h-4 w-4 text-[#5865F2]" />;
  if (platform === 'slack') return <Hash className="h-4 w-4 text-[#E01E5A]" />;
  if (platform === 'x') return <span className="text-sm font-bold text-ink">X</span>;
  if (platform === 'facebook') return <span className="text-sm font-bold text-[#1877f2]">f</span>;
  return <span className="text-sm font-bold text-[#0a66c2]">in</span>;
}

function getDomain(data: MetadataResult) {
  if (data.site_name) return data.site_name;

  try {
    return new URL(data.url).hostname.replace('www.', '');
  } catch {
    return 'website.com';
  }
}
