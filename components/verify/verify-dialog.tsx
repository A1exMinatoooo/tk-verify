"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { VerifyResult } from "@/lib/types"

interface VerifyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  phone: VerifyResult
  onSuccess: () => void
}

export function VerifyDialog({
  open,
  onOpenChange,
  phone,
  onSuccess,
}: VerifyDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: phone.phone }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("核销成功")
        onSuccess()
      } else {
        toast.error(data.message || "核销失败")
      }
    } catch {
      toast.error("核销失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认核销</DialogTitle>
          <DialogDescription>
            确定要核销以下手机号吗？此操作不可撤销。
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-center text-lg font-mono">{phone.displayPhone}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={handleVerify}
            disabled={loading}
          >
            {loading ? "核销中..." : "确认核销"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
