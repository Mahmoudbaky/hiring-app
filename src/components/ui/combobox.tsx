import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/icons"

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  value: string
  onChange: (v: string) => void
  options: ComboboxOption[]
  placeholder?: string
  searchPlaceholder?: string
  className?: string
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = "اختر…",
  searchPlaceholder = "بحث…",
  className = "",
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0)
  }, [open])

  const filtered = query
    ? options.filter((o) => o.label.includes(query))
    : options

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v)
          setQuery("")
        }}
        className="focus-ring h-10 w-full rounded-md border border-input bg-card px-3 text-[13.5px] flex items-center justify-between"
      >
        <span className={selected ? "text-foreground" : "text-muted-foreground"}>
          {selected ? selected.label : placeholder}
        </span>
        <Icon name="chevDown" size={14} className="text-muted-foreground shrink-0" />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 right-0 left-0 bg-card border border-border rounded-md shadow-md py-1 anim-pop flex flex-col">
          <div className="px-2 pt-1 pb-1">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="focus-ring h-8 w-full rounded border border-input bg-background px-2 text-[13px] outline-none"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-[13px] text-muted-foreground">لا توجد نتائج</p>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value)
                    setOpen(false)
                    setQuery("")
                  }}
                  className={cn(
                    "w-full text-start px-3 py-2 text-[13.5px] hover:bg-accent flex items-center justify-between",
                    o.value === value && "bg-accent",
                  )}
                >
                  <span>{o.label}</span>
                  {o.value === value && (
                    <Icon name="check" size={14} className="text-primary" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
