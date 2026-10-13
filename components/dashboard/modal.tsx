"use client";

import { X } from "lucide-react";

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ title, onClose, children }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 bg-pizarra-950/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-pizarra-100 sticky top-0 bg-white">
          <h2 className="text-sm font-semibold text-pizarra-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-pizarra-400 hover:text-pizarra-700 hover:bg-pizarra-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
