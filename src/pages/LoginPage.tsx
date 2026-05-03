import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/icons"
import { BrandLogo, Btn, DInput } from "@/components/shell"
import { Badge } from "@/components/ui/badge"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useApp } from "@/context/AppContext"

const loginSchema = z.object({
  email: z.email("البريد الإلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
  remember: z.boolean(),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login } = useApp()
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  })

  const { isSubmitting, errors } = form.formState

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values.email, values.password, values.remember)
      navigate("/dashboard", { replace: true })
    } catch (err) {
      form.setError("root", {
        message: err instanceof Error ? err.message : "حدث خطأ غير متوقع",
      })
    }
  }

  return (
    <div
      className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_520px]"
      dir="rtl"
    >
      {/* ── Left dark panel ──────────────────────────────────────── */}
      <div className="relative hidden overflow-hidden bg-[oklch(0.18_0.02_30)] text-white lg:block">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 0% 100%, oklch(0.55 0.22 30 / 0.5), transparent 60%), radial-gradient(80% 60% at 100% 0%, oklch(0.45 0.18 350 / 0.35), transparent 55%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.95 0 0 / 0.6) 1px, transparent 1px), linear-gradient(90deg, oklch(0.95 0 0 / 0.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="relative flex h-full flex-col p-12">
          <BrandLogo size={36} />

          <div className="flex max-w-[480px] flex-1 flex-col justify-center">
            <Badge
              tone="rose"
              className="mb-5 w-fit border-white/15 bg-white/10 text-white"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
              منصة إدارة التوظيف
            </Badge>

            <h1 className="text-[42px] leading-[1.15] font-bold tracking-tight text-balance">
              أدر طلبات التوظيف
              <br />
              من <span className="text-[oklch(0.78_0.18_30)]">مكان واحد</span>.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-white/70">
              راجع المتقدمين، صنّف السير الذاتية، وانشر الوظائف الجديدة. كل ما
              تحتاجه لبناء فريقك في واجهة واحدة بسيطة.
            </p>
          </div>

          <div className="text-[12px] text-white/50">
            © 2026 ضم — جميع الحقوق محفوظة.
          </div>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────── */}
      <div className="flex flex-col bg-background">
        <div className="flex items-center justify-between p-6">
          <div className="text-[12.5px] text-muted-foreground">
            ليس لديك حساب؟
          </div>
          <Link to="/register">
            <Btn variant="outline" size="sm">
              إنشاء حساب
            </Btn>
          </Link>
        </div>

        <div className="flex flex-1 items-center px-8 lg:px-12">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mx-auto w-full max-w-[400px]"
            >
              <h2 className="text-[26px] font-bold tracking-tight">
                تسجيل الدخول
              </h2>
              <p className="mt-1 text-[13.5px] text-muted-foreground">
                أدخل بياناتك للوصول إلى لوحة التحكم.
              </p>

              <div className="my-5" />

              <div className="space-y-4">
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <DInput
                          icon={<Icon name="mail" size={14} />}
                          type="email"
                          placeholder="name@company.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel required>كلمة المرور</FormLabel>
                        <button
                          type="button"
                          className="text-[12px] text-[var(--primary)] hover:underline"
                        >
                          نسيت كلمة المرور؟
                        </button>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <DInput
                            type={showPw ? "text" : "password"}
                            placeholder="أدخل كلمة المرور"
                            className="pe-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw((s) => !s)}
                            className="absolute inset-y-0 end-0 flex items-center pe-3 text-muted-foreground hover:text-foreground"
                          >
                            <Icon name="eye" size={15} />
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Remember me */}
                <FormField
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <FormItem>
                      <label className="flex cursor-pointer items-center gap-2 select-none">
                        <FormControl>
                          <button
                            type="button"
                            onClick={() => field.onChange(!field.value)}
                            className={cn(
                              "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                              field.value
                                ? "border-primary bg-primary"
                                : "border-border bg-background"
                            )}
                          >
                            {field.value && (
                              <Icon
                                name="check"
                                size={11}
                                className="text-white"
                                strokeWidth={3}
                              />
                            )}
                          </button>
                        </FormControl>
                        <span className="text-[13px]">تذكرني على هذا الجهاز</span>
                      </label>
                    </FormItem>
                  )}
                />

                {/* Root / server error */}
                {errors.root && (
                  <div className="flex items-center gap-2 rounded-md border border-[oklch(0.9_0.05_25)] bg-[oklch(0.97_0.03_25)] px-3 py-2 text-[12.5px] text-[oklch(0.5_0.15_25)]">
                    <Icon name="info" size={13} /> {errors.root.message}
                  </div>
                )}

                <Btn
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        viewBox="0 0 24 24"
                        width="14"
                        height="14"
                        className="animate-spin"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray="30 60"
                        />
                      </svg>
                      جاري تسجيل الدخول…
                    </>
                  ) : (
                    <>
                      تسجيل الدخول <Icon name="chevLeft" size={14} />
                    </>
                  )}
                </Btn>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
