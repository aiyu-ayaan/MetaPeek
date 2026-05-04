
import { Globe, MessageCircle } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface SocialPreviewProps {
  data: {
    title: string;
    description: string;
    image: string;
    url: string;
    site_name: string;
    og?: any;
    twitter?: any;
  } | null;
}

type Platform = 'twitter' | 'facebook' | 'linkedin' | 'whatsapp';

export function SocialPreview({ data }: SocialPreviewProps) {
  if (!data) return null;

  const title = data.og?.title || data.twitter?.title || data.title || 'No title available';
  const description = data.og?.description || data.twitter?.description || data.description || 'No description available';
  const image = data.og?.image || data.twitter?.image || data.image;
  const domain = data.site_name || (data.url ? new URL(data.url).hostname.replace('www.', '') : 'website.com');

  const renderPreview = (platform: Platform) => {
    switch (platform) {
      case 'twitter':
        return (
          <div className="w-full max-w-[500px] mx-auto bg-black rounded-xl border border-gray-800 overflow-hidden font-sans">
            {image ? (
              <div className="w-full aspect-[1.91/1] bg-gray-900 relative overflow-hidden border-b border-gray-800">
                <img src={image} alt={title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x418?text=Image+Not+Found'; }} />
              </div>
            ) : (
              <div className="w-full aspect-[1.91/1] bg-gray-900 flex items-center justify-center border-b border-gray-800">
                <Globe className="w-12 h-12 text-gray-700" />
              </div>
            )}
            <div className="p-3 bg-black">
              <p className="text-[15px] font-normal text-white leading-tight mb-0.5 line-clamp-1">{title}</p>
              <p className="text-[15px] text-gray-500 leading-snug line-clamp-2">{description}</p>
              <p className="text-[15px] text-gray-500 mt-1">{domain}</p>
            </div>
          </div>
        );

      case 'facebook':
        return (
          <div className="w-full max-w-[500px] mx-auto bg-[#F0F2F5] rounded-none border border-gray-300 font-sans text-left">
            {image ? (
              <div className="w-full aspect-[1.91/1] bg-gray-200 relative overflow-hidden">
                <img src={image} alt={title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x418?text=Image+Not+Found'; }} />
              </div>
            ) : (
              <div className="w-full aspect-[1.91/1] bg-gray-200 flex items-center justify-center">
                <Globe className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <div className="px-4 py-2.5 bg-[#F0F2F5] border-t border-gray-300">
              <p className="text-[12px] font-normal text-[#606770] uppercase tracking-wider mb-1">
                {domain}
              </p>
              <h3 className="text-[16px] font-semibold text-[#1D2129] leading-tight mb-1 line-clamp-1">
                {title}
              </h3>
              <p className="text-[14px] text-[#606770] leading-snug line-clamp-1">
                {description}
              </p>
            </div>
          </div>
        );

      case 'linkedin':
        return (
          <div className="w-full max-w-[500px] mx-auto bg-white border border-[#BFCCD6] font-sans text-left">
            {image ? (
              <div className="w-full aspect-[1.91/1] bg-[#F8FAFD] relative overflow-hidden">
                <img src={image} alt={title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x418?text=Image+Not+Found'; }} />
              </div>
            ) : (
              <div className="w-full aspect-[1.91/1] bg-[#F8FAFD] flex items-center justify-center">
                <Globe className="w-12 h-12 text-[#BFCCD6]" />
              </div>
            )}
            <div className="px-4 py-2 bg-[#EEF3F8]">
              <h3 className="text-[14px] font-semibold text-[#000000e6] leading-tight mb-0.5 line-clamp-1">
                {title}
              </h3>
              <p className="text-[12px] text-[#00000099] leading-snug line-clamp-1">
                {domain}
              </p>
            </div>
          </div>
        );

      case 'whatsapp':
        return (
          <div className="w-full max-w-[400px] mx-auto bg-[#E1F6CB] rounded-lg p-1.5 font-sans relative shadow-sm">
             <div className="bg-[#E1F6CB] rounded-md overflow-hidden border border-[#D1E6BB] flex">
                {image ? (
                  <div className="w-[100px] h-[100px] bg-gray-200 shrink-0">
                    <img src={image} alt={title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=NA'; }} />
                  </div>
                ) : (
                  <div className="w-[100px] h-[100px] bg-gray-200 shrink-0 flex items-center justify-center">
                    <Globe className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="p-2 flex flex-col justify-center bg-[#F2FBF1] flex-1 min-w-0">
                  <h3 className="text-[14px] font-semibold text-[#111B21] leading-tight mb-1 line-clamp-1">
                    {title}
                  </h3>
                  <p className="text-[13px] text-[#667781] leading-snug line-clamp-2 mb-1">
                    {description}
                  </p>
                  <p className="text-[12px] text-[#667781] line-clamp-1">
                    {domain}
                  </p>
                </div>
             </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const platforms = [
    { 
      id: 'twitter', 
      icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 4.09H5.078z"/></svg>, 
      label: 'Twitter / X' 
    },
    { 
      id: 'facebook', 
      icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/></svg>, 
      label: 'Facebook' 
    },
    { 
      id: 'linkedin', 
      icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>, 
      label: 'LinkedIn' 
    },
    { 
      id: 'whatsapp', 
      icon: MessageCircle, 
      label: 'WhatsApp' 
    },
  ] as const;

  return (
    <div className="w-full space-y-12 pb-12">
      {platforms.map((p) => (
        <div key={p.id} className="space-y-4">
          <div className="flex items-center gap-2 text-text-main font-semibold text-lg pb-2 border-b border-border/50">
            <p.icon />
            <span>{p.label} Preview</span>
          </div>
          <div className="bg-[#E2E8F0] dark:bg-black/20 p-8 rounded-2xl flex items-center justify-center min-h-[400px]">
            {renderPreview(p.id)}
          </div>
        </div>
      ))}
    </div>
  );
}
