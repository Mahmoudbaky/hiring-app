import { cn } from "@/lib/utils"
import { Icon } from "@/components/icons"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="تبديل الوضع"
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card transition-colors hover:border-primary",
        className
      )}
    >
      <Icon
        name={isDark ? "sun" : "moon"}
        size={15}
        className={isDark ? "text-primary" : "text-muted-foreground"}
      />
    </button>
  )
}
