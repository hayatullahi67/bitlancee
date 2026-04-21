import React, { useState } from 'react';
import { 
  FileText, 
  File, 
  Download, 
  Play, 
  Image as ImageIcon, 
  FileArchive, 
  FileCode, 
  X,
  FileCheck2,
  FileSpreadsheet
} from 'lucide-react';

interface Attachment {
  name: string;
  size: string;
  url?: string;
  mimeType?: string;
  resourceType?: string;
}

interface ChatMessageProps {
  message: {
    id: string;
    sender: 'me' | 'them';
    text: string;
    timestamp: string;
    isRead?: boolean;
    attachment?: Attachment;
  };
  avatar?: string;
  initials?: string;
}

function MediaModal({ url, name, mimeType, onClose }: { url: string; name: string; mimeType?: string; onClose: () => void }) {
  const isVideo = (mimeType ?? '').startsWith('video/');
  
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 p-4 sm:p-8" onClick={onClose}>
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-white bg-black/20">
        <h3 className="text-sm font-medium truncate pr-8">{name}</h3>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {isVideo ? (
          <video src={url} controls autoPlay className="max-w-full max-h-[85vh] rounded-lg shadow-2xl" />
        ) : (
          <img src={url} alt={name} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
        )}
      </div>
      
      <div className="mt-6 flex gap-4">
        <a 
          href={`/api/chat/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}`}
          download={name}
          className="flex items-center gap-2 px-6 py-3 bg-[#CC7000] text-white rounded-full font-semibold hover:bg-[#A85C00] transition-colors shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <Download className="w-5 h-5" />
          Download
        </a>
      </div>
    </div>
  );
}

function FileAttachment({ attachment }: { attachment: Attachment }) {
  const [showModal, setShowModal] = useState(false);
  const mime = attachment.mimeType ?? '';
  const isImage = mime.startsWith('image/');
  const isVideo = mime.startsWith('video/') || attachment.resourceType === 'video';
  const isPdf = mime === 'application/pdf' || attachment.name.toLowerCase().endsWith('.pdf');
  const isDoc = mime.includes('word') || attachment.name.toLowerCase().endsWith('.doc') || attachment.name.toLowerCase().endsWith('.docx');
  const isSpreadsheet = mime.includes('excel') || mime.includes('spreadsheet') || attachment.name.toLowerCase().endsWith('.xls') || attachment.name.toLowerCase().endsWith('.xlsx');

  const getFileIcon = () => {
    if (isPdf) return <FileText className="w-5 h-5 text-red-500" />;
    if (isDoc) return <FileText className="w-5 h-5 text-blue-500" />;
    if (isSpreadsheet) return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
    if (isVideo) return <Play className="w-5 h-5 text-[#CC7000]" />;
    if (isImage) return <ImageIcon className="w-5 h-5 text-purple-500" />;
    return <File className="w-5 h-5 text-gray-400" />;
  };

  const onDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!attachment.url) return;

    // 🚀 Using a direct link to our proxy is the only way to FORCE a download for PDFs
    // cross-origin (from Cloudinary). Client-side fetching often hits CORS blocks.
    const proxyUrl = `/api/chat/download?url=${encodeURIComponent(attachment.url)}&name=${encodeURIComponent(attachment.name)}`;
    
    // We use a temporary link to ensure the 'download' behavior is respected
    const link = document.createElement('a');
    link.href = proxyUrl;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onPreviewClick = (e: React.MouseEvent) => {
    if (isImage || isVideo) {
      setShowModal(true);
    } else {
      // For all other files, trigger direct download
      void onDownloadClick(e);
    }
  };

  return (
    <div className="mt-3 space-y-2 max-w-full">
      {/* 🖼️ MEDIA PREVIEW (FOR IMAGES/VIDEOS) */}
      {(isImage || isVideo) && attachment.url && (
        <div 
          onClick={onPreviewClick}
          className="relative group cursor-pointer overflow-hidden rounded-xl border border-[#e8dfd4] bg-[#f5f0ea] hover:shadow-md transition-all duration-300"
        >
          {isImage ? (
            <img 
              src={attachment.url} 
              alt={attachment.name} 
              className="max-h-[220px] w-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          ) : (
            <div className="relative aspect-video flex items-center justify-center bg-[#1a1a1a]">
              <video src={attachment.url} className="w-full h-full object-contain opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center ring-1 ring-white/30 group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-white fill-white" />
                </div>
              </div>
            </div>
          )}
          
          <div className="absolute top-2 right-2 flex gap-2 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
            <button 
              onClick={onDownloadClick}
              className="p-2 bg-black/50 hover:bg-[#CC7000] text-white rounded-lg backdrop-blur-sm shadow-xl transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 📄 FILE ITEM (FOR DOCUMENTS AND GENERAL FILES) */}
      <div 
        onClick={onPreviewClick}
        className={`
          flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer group/item
          ${(isImage || isVideo) ? 'bg-[#FAF8F5] border-[#E8E2D9]' : 'bg-white border-[#E8E2D9] hover:border-[#CC7000] shadow-sm hover:shadow-md'}
        `}
      >
        <div className="flex-shrink-0 w-11 h-11 bg-white border border-[#E8E2D9] rounded-xl flex items-center justify-center shadow-sm group-hover/item:scale-105 transition-transform">
          {getFileIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#1A1A1A] truncate pr-2 leading-tight">
            {attachment.name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded uppercase">
              {attachment.size}
            </span>
            <span className="text-[11px] font-medium text-gray-500 truncate">
              {isPdf ? 'PDF Document' : isDoc ? 'Word Doc' : isSpreadsheet ? 'Spreadsheet' : isImage ? 'Image' : isVideo ? 'Video' : 'File'}
            </span>
          </div>
        </div>

        <button
          onClick={onDownloadClick}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#CC7000] border border-transparent hover:border-[#CC7000] rounded-xl transition-all"
          title="Download File"
        >
          <Download className="w-4.5 h-4.5" />
        </button>
      </div>

      {showModal && attachment.url && (
        <MediaModal 
          url={attachment.url} 
          name={attachment.name} 
          mimeType={attachment.mimeType}
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
}

function DoubleCheckIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="10" viewBox="0 0 16 10" fill="none" className={className}>
      <path d="M1 5L4.5 8.5L10 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 5L8.5 8.5L14 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ChatMessage({ message, avatar, initials = 'SN' }: ChatMessageProps) {
  const isMe = message.sender === 'me';

  return (
    <div className={`flex items-end gap-2 mb-4 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      {isMe ? (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#CC7000] flex items-center justify-center text-white text-xs font-semibold mb-1 shadow-sm">
          {initials}
        </div>
      ) : (
        <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-gray-200 mb-1 border border-[#e8dfd4] shadow-sm">
          {avatar ? (
            <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#e8dfd4] flex items-center justify-center text-[#8C4F00] text-xs font-bold font-serif italic">B</div>
          )}
        </div>
      )}

      <div
        className={`
        max-w-[78%] px-4 py-3 rounded-2xl shadow-sm
        ${isMe ? 'bg-[#CC7000] text-white rounded-br-md shadow-orange-950/10' : 'bg-white text-[#232323] border border-[#ece7df] rounded-bl-md shadow-gray-200'}
      `}
      >
        {message.text ? <p className="text-sm leading-relaxed whitespace-pre-line break-words">{message.text}</p> : null}

        {message.attachment ? <FileAttachment attachment={message.attachment} /> : null}

        <div className={`flex items-center gap-1 mt-1.5 text-[10px] sm:text-xs font-medium tracking-wide uppercase ${isMe ? 'justify-end text-orange-100/70' : 'text-gray-400'}`}>
          <span>{message.timestamp}</span>
          {isMe && message.isRead && <DoubleCheckIcon className="text-orange-200 w-3.5" />}
        </div>
      </div>
    </div>
  );
}