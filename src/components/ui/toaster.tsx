
import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  return (
    <SonnerToaster 
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group glass-panel group-[.toaster]:border-tron-blue/20 group-[.toaster]:bg-tron-background/80 group-[.toaster]:text-tron-blue group-[.toaster]:shadow-[0_0_15px_rgba(12,208,255,0.2)]",
          description: "group-[.toast]:text-tron-text/80",
          actionButton:
            "group-[.toast]:bg-tron-blue/20 group-[.toast]:text-tron-blue group-[.toast]:hover:bg-tron-blue/30",
          cancelButton:
            "group-[.toast]:bg-red-500/20 group-[.toast]:text-red-400 group-[.toast]:hover:bg-red-500/30",
        },
      }}
    />
  )
}
