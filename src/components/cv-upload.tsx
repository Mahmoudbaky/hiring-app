import { useRef, useState } from "react"
import type { AxiosProgressEvent } from "axios"
import api from "@/lib/api"
import {
  Upload,
  X,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; filename: string; progress: number }
  | { status: "done"; filename: string }
  | { status: "error"; filename: string; message: string }

interface CvUploadProps {
  value?: string
  onChange: (url: string | undefined) => void
}

export function CvUpload({ onChange }: CvUploadProps) {
  const [state, setState] = useState<UploadState>({ status: "idle" })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setState({ status: "uploading", filename: file.name, progress: 0 })

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await api.post<{ success: boolean; data: { url: string } }>(
        "upload/cv",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e: AxiosProgressEvent) => {
            if (e.total) {
              const pct = Math.round((e.loaded / e.total) * 100)
              setState((prev) =>
                prev.status === "uploading" ? { ...prev, progress: pct } : prev,
              )
            }
          },
        },
      )
      onChange(res.data.data.url)
      setState({ status: "done", filename: file.name })
    } catch {
      setState({
        status: "error",
        filename: file.name,
        message: "فشل رفع الملف، يرجى المحاولة مجدداً",
      })
      onChange(undefined)
    }
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ""
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const clear = () => {
    setState({ status: "idle" })
    onChange(undefined)
  }

  if (state.status === "idle") {
    return (
      <>
        <Card
          className="group flex h-[120px] w-full cursor-pointer flex-col items-center justify-center gap-2 border-dashed shadow-none transition-colors hover:bg-[var(--muted)]"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          <Upload className="size-5 text-[var(--muted-foreground)]" />
          <div className="text-[13px] text-[var(--muted-foreground)]">
            اسحب الملف هنا أو{" "}
            <span className="text-[var(--primary)]">اختر من جهازك</span>
          </div>
          <span className="text-[11.5px] text-[var(--muted-foreground)]">
            PDF أو Word — حجم أقصى 10 ميجابايت
          </span>
        </Card>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx"
          onChange={onInputChange}
        />
      </>
    )
  }

  return (
    <div className="rounded-lg border border-[var(--border)] p-4">
      <div className="flex items-center gap-3">
        <div className="grid size-10 shrink-0 place-content-center rounded border bg-[var(--muted)]">
          {state.status === "uploading" ? (
            <Loader2 className="size-4 animate-spin text-[var(--muted-foreground)]" />
          ) : state.status === "done" ? (
            <CheckCircle className="size-4 text-[oklch(0.6_0.15_155)]" />
          ) : (
            <AlertCircle className="size-4 text-[oklch(0.5_0.15_25)]" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[13px] text-[var(--foreground)]">
              {state.filename}
            </span>
            {state.status !== "uploading" && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-6 shrink-0 p-0"
                onClick={clear}
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>

          {state.status === "uploading" && (
            <>
              <Progress value={state.progress} className="h-1.5" />
              <span className="text-[11.5px] text-[var(--muted-foreground)]">
                جاري الرفع… {state.progress}%
              </span>
            </>
          )}
          {state.status === "done" && (
            <span className="text-[11.5px] text-[oklch(0.6_0.15_155)]">
              تم الرفع بنجاح
            </span>
          )}
          {state.status === "error" && (
            <span className="text-[11.5px] text-[oklch(0.5_0.15_25)]">
              {state.message}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
