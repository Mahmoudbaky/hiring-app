import { forwardRef, useEffect, useRef, useState } from "react"
import RPNInput, {
  type Country,
  getCountryCallingCode,
} from "react-phone-number-input"
import flags from "react-phone-number-input/flags"
import ar from "react-phone-number-input/locale/ar.json"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/icons"

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function PhoneInput({
  value,
  onChange,
  placeholder = "5xxxxxxxx",
  disabled,
  className,
}: PhoneInputProps) {
  return (
    <RPNInput
      defaultCountry="SA"
      addInternationalOption={false}
      countryOptionsOrder={[
        "SA", "AE", "KW", "QA", "BH", "OM", "JO", "EG", "IQ", "LB", "SY",
        "YE", "LY", "TN", "DZ", "MA", "SD", "PS", "|", "...",
      ]}
      flags={flags}
      labels={ar}
      value={value}
      onChange={(v) => onChange(v ?? "")}
      placeholder={placeholder}
      disabled={disabled}
      inputComponent={NumberInput}
      countrySelectComponent={CountrySelect}
      numberInputProps={{
        className:
          "h-full min-w-0 flex-1 bg-transparent px-3 text-[13.5px] text-foreground placeholder:text-muted-foreground outline-none",
      }}
      className={cn(
        "flex h-11 w-full items-center rounded-md border border-input bg-card transition-shadow focus-within:ring-2 focus-within:ring-ring",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    />
  )
}

const NumberInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...rest }, ref) => (
  <input
    ref={ref}
    type="tel"
    inputMode="tel"
    dir="ltr"
    className={className}
    {...rest}
  />
))
NumberInput.displayName = "NumberInput"

interface CountryOption {
  value?: Country
  label: string
  divider?: boolean
}

interface CountrySelectProps {
  value?: Country
  onChange: (country: Country) => void
  options: CountryOption[]
  disabled?: boolean
  iconComponent: React.ComponentType<{ country?: Country; label?: string }>
}

function CountrySelect({
  value,
  onChange,
  options,
  disabled,
  iconComponent: FlagIcon,
}: CountrySelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const countries = options.filter(
    (o): o is { value: Country; label: string } => !o.divider && !!o.value
  )

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  const q = query.trim().toLowerCase()
  const filtered = q
    ? countries.filter(
      (c) =>
        c.label.includes(query) ||
        getCountryCallingCode(c.value).includes(q) ||
        c.value.toLowerCase().includes(q)
    )
    : countries

  const selected = countries.find((c) => c.value === value)

  return (
    <div ref={ref} className="relative h-full shrink-0 border-e border-border">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="focus-ring flex h-full items-center gap-1.5 rounded-s-md px-3 text-[13px] transition-colors hover:bg-accent disabled:pointer-events-none"
      >
        {selected && <FlagIcon country={selected.value} label={selected.label} />}
        <span dir="ltr" className="font-medium text-foreground">
          {selected ? `+${getCountryCallingCode(selected.value)}` : ""}
        </span>
        <Icon
          name="chevDown"
          size={12}
          className={cn(
            "text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute start-0 z-30 mt-1 w-64 overflow-hidden rounded-md border border-border bg-card shadow-lg anim-pop">
          <div className="border-b border-border p-2">
            <div className="relative">
              <Icon
                name="search"
                size={13}
                className="pointer-events-none absolute inset-y-0 start-2.5 my-auto text-muted-foreground"
              />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن دولة…"
                className="h-8 w-full rounded-md border border-input bg-card ps-8 pe-3 text-[12.5px] outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-[12.5px] text-muted-foreground">
                لا توجد نتائج
              </div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    onChange(c.value)
                    setOpen(false)
                    setQuery("")
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-[13px] transition-colors hover:bg-accent",
                    c.value === value && "bg-accent"
                  )}
                >
                  <FlagIcon country={c.value} label={c.label} />
                  <span className="flex-1 text-start">{c.label}</span>
                  <span dir="ltr" className="text-[12px] text-muted-foreground">
                    +{getCountryCallingCode(c.value)}
                  </span>
                  {c.value === value && (
                    <Icon name="check" size={13} className="text-primary" />
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
