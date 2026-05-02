import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/icons"

interface Country {
  code: string
  name: string
  dial: string
  flag: string
}

const COUNTRIES: Country[] = [
  // GCC + Arab world first
  { code: "SA", name: "السعودية",          dial: "+966", flag: "🇸🇦" },
  { code: "AE", name: "الإمارات",           dial: "+971", flag: "🇦🇪" },
  { code: "KW", name: "الكويت",             dial: "+965", flag: "🇰🇼" },
  { code: "QA", name: "قطر",               dial: "+974", flag: "🇶🇦" },
  { code: "BH", name: "البحرين",            dial: "+973", flag: "🇧🇭" },
  { code: "OM", name: "عُمان",              dial: "+968", flag: "🇴🇲" },
  { code: "JO", name: "الأردن",             dial: "+962", flag: "🇯🇴" },
  { code: "EG", name: "مصر",               dial: "+20",  flag: "🇪🇬" },
  { code: "IQ", name: "العراق",             dial: "+964", flag: "🇮🇶" },
  { code: "LB", name: "لبنان",              dial: "+961", flag: "🇱🇧" },
  { code: "SY", name: "سوريا",              dial: "+963", flag: "🇸🇾" },
  { code: "YE", name: "اليمن",              dial: "+967", flag: "🇾🇪" },
  { code: "LY", name: "ليبيا",              dial: "+218", flag: "🇱🇾" },
  { code: "TN", name: "تونس",               dial: "+216", flag: "🇹🇳" },
  { code: "DZ", name: "الجزائر",            dial: "+213", flag: "🇩🇿" },
  { code: "MA", name: "المغرب",             dial: "+212", flag: "🇲🇦" },
  { code: "SD", name: "السودان",            dial: "+249", flag: "🇸🇩" },
  { code: "PS", name: "فلسطين",             dial: "+970", flag: "🇵🇸" },
  // International
  { code: "TR", name: "تركيا",              dial: "+90",  flag: "🇹🇷" },
  { code: "PK", name: "باكستان",            dial: "+92",  flag: "🇵🇰" },
  { code: "IN", name: "الهند",              dial: "+91",  flag: "🇮🇳" },
  { code: "US", name: "الولايات المتحدة",   dial: "+1",   flag: "🇺🇸" },
  { code: "GB", name: "المملكة المتحدة",    dial: "+44",  flag: "🇬🇧" },
  { code: "FR", name: "فرنسا",              dial: "+33",  flag: "🇫🇷" },
  { code: "DE", name: "ألمانيا",            dial: "+49",  flag: "🇩🇪" },
  { code: "CA", name: "كندا",               dial: "+1",   flag: "🇨🇦" },
  { code: "AU", name: "أستراليا",           dial: "+61",  flag: "🇦🇺" },
]

interface PhoneInputProps {
  dialCode: string
  onDialCodeChange: (dial: string) => void
  number: string
  onNumberChange: (n: string) => void
  placeholder?: string
  className?: string
}

export function PhoneInput({
  dialCode,
  onDialCodeChange,
  number,
  onNumberChange,
  placeholder = "5xxxxxxxx",
  className,
}: PhoneInputProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selected = COUNTRIES.find((c) => c.dial === dialCode) ?? COUNTRIES[0]

  const filtered = search.trim()
    ? COUNTRIES.filter(
        (c) =>
          c.name.includes(search) ||
          c.dial.includes(search) ||
          c.code.toLowerCase().includes(search.toLowerCase())
      )
    : COUNTRIES

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50)
  }, [open])

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Combined input row */}
      <div className="flex h-10 overflow-hidden rounded-md border border-[var(--input)] bg-[var(--card)] focus-within:ring-2 focus-within:ring-[var(--ring)] focus-within:ring-offset-0 transition-shadow">
        {/* Number input — fills remaining space */}
        <input
          type="tel"
          value={number}
          onChange={(e) => onNumberChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent px-3 text-[13.5px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none"
        />

        {/* Separator */}
        <div className="my-2 w-px bg-[var(--border)]" />

        {/* Dial-code trigger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex shrink-0 items-center gap-1.5 px-3 text-[13px] hover:bg-[var(--accent)] transition-colors"
        >
          <span className="text-[16px] leading-none">{selected.flag}</span>
          <span className="font-medium text-[var(--foreground)]">{selected.dial}</span>
          <Icon
            name="chevDown"
            size={13}
            className={cn(
              "text-[var(--muted-foreground)] transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute end-0 z-30 mt-1 w-64 rounded-md border border-[var(--border)] bg-[var(--card)] shadow-lg anim-pop overflow-hidden">
          {/* Search */}
          <div className="border-b border-[var(--border)] p-2">
            <div className="relative">
              <Icon
                name="search"
                size={13}
                className="pointer-events-none absolute inset-y-0 start-2.5 my-auto text-[var(--muted-foreground)]"
              />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن دولة…"
                className="h-8 w-full rounded-md border border-[var(--input)] bg-[var(--card)] ps-8 pe-3 text-[12.5px] placeholder:text-[var(--muted-foreground)] outline-none focus:ring-1 focus:ring-[var(--ring)]"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-[12.5px] text-[var(--muted-foreground)]">
                لا توجد نتائج
              </div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    onDialCodeChange(c.dial)
                    setOpen(false)
                    setSearch("")
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-[13px] hover:bg-[var(--accent)] transition-colors",
                    c.dial === dialCode && "bg-[var(--accent)]"
                  )}
                >
                  <span className="text-[16px] leading-none">{c.flag}</span>
                  <span className="flex-1 text-start">{c.name}</span>
                  <span className="tabular text-[12px] text-[var(--muted-foreground)]">
                    {c.dial}
                  </span>
                  {c.dial === dialCode && (
                    <Icon name="check" size={13} className="text-[var(--primary)]" />
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
