import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      expand={false}
      richColors
      closeButton
      style={{
        "--scale": "0.95",
      } as React.CSSProperties}
      toastOptions={{
        duration: 2000,
        classNames: {
          toast: [
            "group toast",
            "group-[.toaster]:bg-background dark:group-[.toaster]:bg-secondary",
            "group-[.toaster]:text-foreground dark:group-[.toaster]:text-secondary-foreground",
            "group-[.toaster]:border-border dark:group-[.toaster]:border-secondary",
            "group-[.toaster]:shadow-lg dark:group-[.toaster]:shadow-2xl",
            "data-[type=success]:!bg-emerald-50 dark:data-[type=success]:!bg-emerald-950/50",
            "data-[type=success]:!text-emerald-800 dark:data-[type=success]:!text-emerald-200",
            "data-[type=success]:!border-emerald-200/50 dark:data-[type=success]:!border-emerald-900/50",
            "data-[type=error]:!bg-red-50 dark:data-[type=error]:!bg-red-950/50",
            "data-[type=error]:!text-red-800 dark:data-[type=error]:!text-red-200",
            "data-[type=error]:!border-red-200/50 dark:data-[type=error]:!border-red-900/50",
            "data-[type=info]:!bg-blue-50 dark:data-[type=info]:!bg-blue-950/50",
            "data-[type=info]:!text-blue-800 dark:data-[type=info]:!text-blue-200",
            "data-[type=info]:!border-blue-200/50 dark:data-[type=info]:!border-blue-900/50",
            "data-[type=warning]:!bg-yellow-50 dark:data-[type=warning]:!bg-yellow-950/50",
            "data-[type=warning]:!text-yellow-800 dark:data-[type=warning]:!text-yellow-200",
            "data-[type=warning]:!border-yellow-200/50 dark:data-[type=warning]:!border-yellow-900/50",
            "relative flex w-full items-center gap-4",
            "rounded-lg border p-4 shadow-lg",
            "transition-all duration-300 ease-in-out",
            "data-[swipe=move]:transition-none",
            "data-[swipe=cancel]:translate-x-0",
            "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
            "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-80 data-[state=open]:fade-in-0",
            "data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full",
            "data-[swipe=end]:animate-out data-[swipe=end]:fade-out-80",
            "sm:data-[state=open]:slide-in-from-bottom-full",
          ].join(" "),
          title: [
            "text-sm font-semibold",
            "data-[type=success]:text-emerald-900 dark:data-[type=success]:text-emerald-100",
            "data-[type=error]:text-red-900 dark:data-[type=error]:text-red-100",
            "data-[type=info]:text-blue-900 dark:data-[type=info]:text-blue-100",
            "data-[type=warning]:text-yellow-900 dark:data-[type=warning]:text-yellow-100",
            "group-hover:opacity-100 transition-opacity duration-200",
          ].join(" "),
          description: [
            "text-sm opacity-90",
            "data-[type=success]:text-emerald-800 dark:data-[type=success]:text-emerald-200",
            "data-[type=error]:text-red-800 dark:data-[type=error]:text-red-200",
            "data-[type=info]:text-blue-800 dark:data-[type=info]:text-blue-200",
            "data-[type=warning]:text-yellow-800 dark:data-[type=warning]:text-yellow-200",
            "group-hover:opacity-100 transition-opacity duration-200",
          ].join(" "),
          actionButton: [
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
            "inline-flex items-center justify-center",
            "rounded-md text-sm font-medium",
            "px-3 py-2 h-8",
            "transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:pointer-events-none disabled:opacity-50",
            "hover:opacity-90 active:opacity-80",
            "data-[type=success]:!bg-emerald-100 dark:data-[type=success]:!bg-emerald-800",
            "data-[type=success]:!text-emerald-900 dark:data-[type=success]:!text-emerald-100",
            "data-[type=error]:!bg-red-100 dark:data-[type=error]:!bg-red-800",
            "data-[type=error]:!text-red-900 dark:data-[type=error]:!text-red-100",
            "data-[type=info]:!bg-blue-100 dark:data-[type=info]:!bg-blue-800",
            "data-[type=info]:!text-blue-900 dark:data-[type=info]:!text-blue-100",
            "data-[type=warning]:!bg-yellow-100 dark:data-[type=warning]:!bg-yellow-800",
            "data-[type=warning]:!text-yellow-900 dark:data-[type=warning]:!text-yellow-100",
          ].join(" "),
          cancelButton: [
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
            "inline-flex items-center justify-center",
            "rounded-md text-sm font-medium",
            "px-3 py-2 h-8",
            "border border-input bg-background",
            "transition-colors duration-200",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:pointer-events-none disabled:opacity-50",
          ].join(" "),
          closeButton: [
            "absolute right-2 top-2",
            "rounded-md p-1",
            "text-foreground/50 opacity-0 transition-opacity",
            "hover:text-foreground focus:opacity-100",
            "group-hover:opacity-100",
            "data-[type=success]:!text-emerald-900/50 dark:data-[type=success]:!text-emerald-100/50",
            "data-[type=success]:hover:!text-emerald-900 dark:data-[type=success]:hover:!text-emerald-100",
            "data-[type=error]:!text-red-900/50 dark:data-[type=error]:!text-red-100/50",
            "data-[type=error]:hover:!text-red-900 dark:data-[type=error]:hover:!text-red-100",
            "data-[type=info]:!text-blue-900/50 dark:data-[type=info]:!text-blue-100/50",
            "data-[type=info]:hover:!text-blue-900 dark:data-[type=info]:hover:!text-blue-100",
            "data-[type=warning]:!text-yellow-900/50 dark:data-[type=warning]:!text-yellow-100/50",
            "data-[type=warning]:hover:!text-yellow-900 dark:data-[type=warning]:hover:!text-yellow-100",
          ].join(" "),
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
