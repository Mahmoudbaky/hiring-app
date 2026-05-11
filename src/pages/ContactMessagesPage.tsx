import { useEffect, useState } from "react"
import { PageHeader, Btn, Th, Td } from "@/components/shell"
import { DDialog } from "@/components/ui/ddialog"
import { Icon } from "@/components/icons"
import { cn } from "@/lib/utils"
import {
  useContactMessages,
  useMarkContactRead,
  useDeleteContact,
} from "@/hooks/useContact"
import type { ContactMessage } from "@/types/api"

/* ── helpers ─────────────────────────────────────────────────────── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/* ── Message detail dialog ───────────────────────────────────────── */
function MessageDialog({
  msg,
  onClose,
}: {
  msg: ContactMessage | null
  onClose: () => void
}) {
  const { mutate: markRead } = useMarkContactRead()

  useEffect(() => {
    if (msg && !msg.isRead) markRead(msg.id)
  }, [msg?.id])

  if (!msg) return null

  return (
    <DDialog open={!!msg} onClose={onClose} size="md">
      <div className="flex items-start justify-between border-b border-[var(--border)] p-5">
        <div className="flex items-center gap-3">
          <div className="tone-sky flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
            <Icon name="mail" size={17} />
          </div>
          <div>
            <h2 className="text-[16px] font-bold">{msg.subject}</h2>
            <div className="text-[12px] text-[var(--muted-foreground)]">
              {formatDate(msg.createdAt)}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-[var(--accent)]"
        >
          <Icon name="x" size={16} />
        </button>
      </div>

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mb-1 text-[11.5px] text-[var(--muted-foreground)]">الاسم</div>
            <div className="text-[13.5px] font-medium">{msg.fullName}</div>
          </div>
          <div>
            <div className="mb-1 text-[11.5px] text-[var(--muted-foreground)]">رقم الهاتف</div>
            <div className="tabular text-[13.5px] font-medium" dir="ltr">{msg.phone}</div>
          </div>
          <div className="col-span-2">
            <div className="mb-1 text-[11.5px] text-[var(--muted-foreground)]">البريد الإلكتروني</div>
            <div className="text-[13.5px] font-medium" dir="ltr">{msg.email}</div>
          </div>
        </div>

        <div>
          <div className="mb-2 text-[11.5px] text-[var(--muted-foreground)]">الرسالة</div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 p-4 text-[13.5px] leading-relaxed whitespace-pre-wrap">
            {msg.message}
          </div>
        </div>
      </div>
    </DDialog>
  )
}

/* ── Page ─────────────────────────────────────────────────────────── */
export function ContactMessagesPage() {
  const { data: messages = [], isLoading } = useContactMessages()
  const { mutate: markRead } = useMarkContactRead()
  const { mutate: remove } = useDeleteContact()
  const [viewing, setViewing] = useState<ContactMessage | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const unreadCount = messages.filter((m) => !m.isRead).length

  function openMessage(msg: ContactMessage) {
    setViewing(msg)
    if (!msg.isRead) markRead(msg.id)
  }

  function handleDelete() {
    if (!confirmDeleteId) return
    remove(confirmDeleteId, { onSuccess: () => setConfirmDeleteId(null) })
  }

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        icon="mail"
        title="رسائل التواصل"
        desc={
          unreadCount > 0
            ? `${unreadCount} رسالة غير مقروءة`
            : "جميع الرسائل مقروءة"
        }
      />

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-[13.5px] text-[var(--muted-foreground)]">
            جاري التحميل...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-[var(--muted-foreground)]">
            <Icon name="mail" size={32} className="opacity-30" />
            <span className="text-[13.5px]">لا توجد رسائل بعد</span>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <Th className="w-8"></Th>
                <Th>الاسم</Th>
                <Th className="hidden sm:table-cell">البريد الإلكتروني</Th>
                <Th>الموضوع</Th>
                <Th className="hidden md:table-cell">التاريخ</Th>
                <Th className="w-20 text-center">إجراءات</Th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr
                  key={msg.id}
                  onClick={() => openMessage(msg)}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-[var(--accent)]",
                    !msg.isRead && "bg-[oklch(0.98_0.02_30)] dark:bg-[oklch(0.2_0.03_30)]"
                  )}
                >
                  <Td>
                    {!msg.isRead && (
                      <span className="block h-2 w-2 rounded-full bg-[var(--primary)]" />
                    )}
                  </Td>
                  <Td>
                    <span className={cn("text-[13.5px]", !msg.isRead && "font-semibold")}>
                      {msg.fullName}
                    </span>
                  </Td>
                  <Td className="hidden sm:table-cell">
                    <span className="text-[13px] text-[var(--muted-foreground)]" dir="ltr">
                      {msg.email}
                    </span>
                  </Td>
                  <Td>
                    <span className="line-clamp-1 text-[13.5px]">{msg.subject}</span>
                  </Td>
                  <Td className="hidden md:table-cell">
                    <span className="tabular text-[12.5px] text-[var(--muted-foreground)]">
                      {formatDate(msg.createdAt)}
                    </span>
                  </Td>
                  <Td className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {!msg.isRead && (
                        <button
                          title="تحديد كمقروء"
                          onClick={(e) => {
                            e.stopPropagation()
                            markRead(msg.id)
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
                        >
                          <Icon name="check" size={14} />
                        </button>
                      )}
                      <button
                        title="حذف"
                        onClick={(e) => {
                          e.stopPropagation()
                          setConfirmDeleteId(msg.id)
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--destructive)]"
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Message detail dialog */}
      <MessageDialog msg={viewing} onClose={() => setViewing(null)} />

      {/* Delete confirm dialog */}
      <DDialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        size="sm"
      >
        <div className="p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[oklch(0.97_0.03_25)] dark:bg-[oklch(0.25_0.04_25)]">
            <Icon name="trash" size={20} className="text-[var(--destructive)]" />
          </div>
          <h3 className="text-[16px] font-bold">حذف الرسالة</h3>
          <p className="mt-1 text-[13.5px] text-[var(--muted-foreground)]">
            هل أنت متأكد من حذف هذه الرسالة؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <div className="mt-5 flex gap-2">
            <Btn variant="destructive" onClick={handleDelete}>
              حذف
            </Btn>
            <Btn variant="outline" onClick={() => setConfirmDeleteId(null)}>
              إلغاء
            </Btn>
          </div>
        </div>
      </DDialog>
    </div>
  )
}
