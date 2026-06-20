import { useState } from 'react';
import { createDispute } from '@/lib/disputes';
import { firebaseAuth } from '@/lib/firebase';
import { AlertCircle } from 'lucide-react';

interface DisputeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  contractTitle: string;
  raisedBy: 'client' | 'freelancer';
}

export default function DisputeFormModal({ isOpen, onClose, contractId, contractTitle, raisedBy }: DisputeFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadContractFile = async (file: File) => {
    const idToken = await firebaseAuth.currentUser?.getIdToken();
    if (!idToken) throw new Error("Please log in before uploading files.");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/chat/upload", { method: "POST", headers: { Authorization: `Bearer ${idToken}` }, body: formData });
    const payload = (await res.json()) as any;
    if (!res.ok || !payload?.url) throw new Error(payload?.error || "Failed to upload attachment.");
    return payload.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide both title and description.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      let finalAttachmentUrl = undefined;
      if (selectedFile) {
        finalAttachmentUrl = await uploadContractFile(selectedFile);
      }
      await createDispute(contractId, raisedBy, title, description, finalAttachmentUrl);
      // reset and close
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      onClose();
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to create dispute. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center px-2 py-2 sm:items-center sm:px-4 sm:py-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-[101] max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="px-5 pt-5 pb-4 border-b border-gray-50 relative">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 text-lg transition-colors"
          >
            ✕
          </button>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Contracts</span>
          </div>
          <h2 className="text-[20px] font-black text-gray-900 leading-tight">Raise Dispute</h2>
          <p className="mt-1.5 text-[13px] text-gray-500">
            For: <span className="font-semibold text-gray-800">{contractTitle}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[12px] text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">
              Dispute Title
            </label>
            <input
              type="text"
              required
              disabled={submitting}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Unfinished work, quality issue"
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">
              Description / Evidence
            </label>
            <textarea
              required
              disabled={submitting}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed explanation of the issue and your request..."
              rows={4}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">
              Attachment (Optional)
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              disabled={submitting}
              className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-colors file:font-semibold"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFile(file);
                }
              }}
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-red-600 py-3 text-[13px] font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Dispute'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
