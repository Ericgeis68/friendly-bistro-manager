"use client";

import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner 
      className="toaster group" 
      toastOptions={{ 
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-950 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-gray-500",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-500",
        },
      }}
    />
  );
}

export { Sonner };
