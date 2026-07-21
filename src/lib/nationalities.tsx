import { type Country } from "react-phone-number-input"
import flags from "react-phone-number-input/flags"

interface NationalityDef {
  value: string
  label: string
  code?: Country
}

const NATIONALITIES_DATA: NationalityDef[] = [
  // GCC + Levant + North Africa
  { value: "سعودي", label: "سعودي", code: "SA" },
  { value: "إماراتي", label: "إماراتي", code: "AE" },
  { value: "كويتي", label: "كويتي", code: "KW" },
  { value: "قطري", label: "قطري", code: "QA" },
  { value: "بحريني", label: "بحريني", code: "BH" },
  { value: "عُماني", label: "عُماني", code: "OM" },
  { value: "أردني", label: "أردني", code: "JO" },
  { value: "مصري", label: "مصري", code: "EG" },
  { value: "عراقي", label: "عراقي", code: "IQ" },
  { value: "لبناني", label: "لبناني", code: "LB" },
  { value: "سوري", label: "سوري", code: "SY" },
  { value: "يمني", label: "يمني", code: "YE" },
  { value: "ليبي", label: "ليبي", code: "LY" },
  { value: "تونسي", label: "تونسي", code: "TN" },
  { value: "جزائري", label: "جزائري", code: "DZ" },
  { value: "مغربي", label: "مغربي", code: "MA" },
  { value: "سوداني", label: "سوداني", code: "SD" },
  { value: "فلسطيني", label: "فلسطيني", code: "PS" },
  { value: "موريتاني", label: "موريتاني", code: "MR" },
  { value: "جيبوتي", label: "جيبوتي", code: "DJ" },
  { value: "صومالي", label: "صومالي", code: "SO" },
  { value: "قمري", label: "قمري", code: "KM" },

  // Turkey & neighbors
  { value: "تركي", label: "تركي", code: "TR" },
  { value: "إيراني", label: "إيراني", code: "IR" },
  { value: "أذربيجاني", label: "أذربيجاني", code: "AZ" },
  { value: "أرمني", label: "أرمني", code: "AM" },
  { value: "جورجي", label: "جورجي", code: "GE" },

  // South & Central Asia
  { value: "باكستاني", label: "باكستاني", code: "PK" },
  { value: "هندي", label: "هندي", code: "IN" },
  { value: "بنغلاديشي", label: "بنغلاديشي", code: "BD" },
  { value: "أفغاني", label: "أفغاني", code: "AF" },
  { value: "سريلانكي", label: "سريلانكي", code: "LK" },
  { value: "نيبالي", label: "نيبالي", code: "NP" },
  { value: "بوتاني", label: "بوتاني", code: "BT" },
  { value: "كازاخستاني", label: "كازاخستاني", code: "KZ" },
  { value: "أوزبكستاني", label: "أوزبكستاني", code: "UZ" },
  { value: "تركمانستاني", label: "تركمانستاني", code: "TM" },
  { value: "قيرغيزستاني", label: "قيرغيزستاني", code: "KG" },
  { value: "طاجيكستاني", label: "طاجيكستاني", code: "TJ" },

  // Southeast & East Asia
  { value: "إندونيسي", label: "إندونيسي", code: "ID" },
  { value: "ماليزي", label: "ماليزي", code: "MY" },
  { value: "فلبيني", label: "فلبيني", code: "PH" },
  { value: "تايلاندي", label: "تايلاندي", code: "TH" },
  { value: "فيتنامي", label: "فيتنامي", code: "VN" },
  { value: "سنغافوري", label: "سنغافوري", code: "SG" },
  { value: "صيني", label: "صيني", code: "CN" },
  { value: "ياباني", label: "ياباني", code: "JP" },
  { value: "كوري جنوبي", label: "كوري جنوبي", code: "KR" },
  { value: "كوري شمالي", label: "كوري شمالي", code: "KP" },
  { value: "منغولي", label: "منغولي", code: "MN" },
  { value: "كمبودي", label: "كمبودي", code: "KH" },
  { value: "لاوسي", label: "لاوسي", code: "LA" },
  { value: "بورمي", label: "بورمي", code: "MM" },

  // Africa (non-Arab)
  { value: "نيجيري", label: "نيجيري", code: "NG" },
  { value: "إثيوبي", label: "إثيوبي", code: "ET" },
  { value: "كيني", label: "كيني", code: "KE" },
  { value: "غاني", label: "غاني", code: "GH" },
  { value: "سنغالي", label: "سنغالي", code: "SN" },
  { value: "إريتري", label: "إريتري", code: "ER" },
  { value: "أوغندي", label: "أوغندي", code: "UG" },
  { value: "تنزاني", label: "تنزاني", code: "TZ" },
  { value: "جنوب أفريقي", label: "جنوب أفريقي", code: "ZA" },
  { value: "كاميروني", label: "كاميروني", code: "CM" },
  { value: "مالي", label: "مالي", code: "ML" },
  { value: "نيجري", label: "نيجري", code: "NE" },
  { value: "تشادي", label: "تشادي", code: "TD" },
  { value: "إفواري", label: "إفواري", code: "CI" },
  { value: "زامبي", label: "زامبي", code: "ZM" },
  { value: "زيمبابوي", label: "زيمبابوي", code: "ZW" },
  { value: "رواندي", label: "رواندي", code: "RW" },
  { value: "غيني", label: "غيني", code: "GN" },
  { value: "بنيني", label: "بنيني", code: "BJ" },
  { value: "توغولي", label: "توغولي", code: "TG" },
  { value: "أنغولي", label: "أنغولي", code: "AO" },
  { value: "موزمبيقي", label: "موزمبيقي", code: "MZ" },
  { value: "جنوب سوداني", label: "جنوب سوداني", code: "SS" },
  { value: "كونغولي", label: "كونغولي", code: "CD" },
  { value: "غابوني", label: "غابوني", code: "GA" },

  // Europe
  { value: "بريطاني", label: "بريطاني", code: "GB" },
  { value: "فرنسي", label: "فرنسي", code: "FR" },
  { value: "ألماني", label: "ألماني", code: "DE" },
  { value: "إيطالي", label: "إيطالي", code: "IT" },
  { value: "إسباني", label: "إسباني", code: "ES" },
  { value: "برتغالي", label: "برتغالي", code: "PT" },
  { value: "هولندي", label: "هولندي", code: "NL" },
  { value: "بلجيكي", label: "بلجيكي", code: "BE" },
  { value: "سويسري", label: "سويسري", code: "CH" },
  { value: "نمساوي", label: "نمساوي", code: "AT" },
  { value: "سويدي", label: "سويدي", code: "SE" },
  { value: "نرويجي", label: "نرويجي", code: "NO" },
  { value: "دنماركي", label: "دنماركي", code: "DK" },
  { value: "فنلندي", label: "فنلندي", code: "FI" },
  { value: "بولندي", label: "بولندي", code: "PL" },
  { value: "روسي", label: "روسي", code: "RU" },
  { value: "أوكراني", label: "أوكراني", code: "UA" },
  { value: "يوناني", label: "يوناني", code: "GR" },
  { value: "روماني", label: "روماني", code: "RO" },
  { value: "بلغاري", label: "بلغاري", code: "BG" },
  { value: "تشيكي", label: "تشيكي", code: "CZ" },
  { value: "مجري", label: "مجري", code: "HU" },
  { value: "أيرلندي", label: "أيرلندي", code: "IE" },
  { value: "كرواتي", label: "كرواتي", code: "HR" },
  { value: "صربي", label: "صربي", code: "RS" },
  { value: "سلوفاكي", label: "سلوفاكي", code: "SK" },
  { value: "سلوفيني", label: "سلوفيني", code: "SI" },

  // Americas
  { value: "أمريكي", label: "أمريكي", code: "US" },
  { value: "كندي", label: "كندي", code: "CA" },
  { value: "برازيلي", label: "برازيلي", code: "BR" },
  { value: "مكسيكي", label: "مكسيكي", code: "MX" },
  { value: "أرجنتيني", label: "أرجنتيني", code: "AR" },
  { value: "تشيلي", label: "تشيلي", code: "CL" },
  { value: "كولومبي", label: "كولومبي", code: "CO" },
  { value: "بيروفي", label: "بيروفي", code: "PE" },
  { value: "فنزويلي", label: "فنزويلي", code: "VE" },
  { value: "كوبي", label: "كوبي", code: "CU" },

  // Oceania
  { value: "أسترالي", label: "أسترالي", code: "AU" },
  { value: "نيوزيلندي", label: "نيوزيلندي", code: "NZ" },

  { value: "أخرى", label: "أخرى" },
]

export const NATIONALITIES = NATIONALITIES_DATA.map(({ value, label, code }) => {
  const Flag = code ? flags[code] : undefined
  return {
    value,
    label,
    icon: Flag ? (
      <span className="inline-block aspect-[3/2] h-[0.8em] shrink-0 overflow-hidden rounded-[1px] [&>svg]:h-full [&>svg]:w-full">
        <Flag title={label} />
      </span>
    ) : undefined,
  }
})
