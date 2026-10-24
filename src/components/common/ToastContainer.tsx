import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg border text-xs font-semibold animate-in fade-in slide-in-from-right-5 duration-200 ${
            toast.type === 'success'
              ? 'bg-[#EBF7EE] border-[#B7E5C0] text-[#14532D]'
              : toast.type === 'error'
              ? 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
              : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-fresh flex-shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />}
          
          <div className="flex-1 leading-tight">{toast.message}</div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-gray-600 p-0.5"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
