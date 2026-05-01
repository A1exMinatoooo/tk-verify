"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { VerifyDialog } from "./verify-dialog"
import type { VerifyResult } from "@/lib/types"

export function PhoneSearch() {
  const [last4, setLast4] = useState("")
  const [results, setResults] = useState<VerifyResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [selectedPhone, setSelectedPhone] = useState<VerifyResult | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSearch = async () => {
    if (!/^\d{4}$/.test(last4)) {
      toast.error("请输入4位数字")
      return
    }

    setLoading(true)
    setSearched(true)

    try {
      const response = await fetch(`/api/verify?last4=${last4}`)
      const data = await response.json()

      if (data.success) {
        setResults(data.data || [])
      } else {
        toast.error(data.error || "查询失败")
        setResults([])
      }
    } catch {
      toast.error("查询失败")
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = (phone: VerifyResult) => {
    setSelectedPhone(phone)
    setDialogOpen(true)
  }

  const handleVerifySuccess = () => {
    if (selectedPhone) {
      setResults(results.filter((r) => r.phone !== selectedPhone.phone))
    }
    setDialogOpen(false)
    setSelectedPhone(null)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">查询手机号</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="请输入手机号后四位"
              value={last4}
              onChange={(e) => setLast4(e.target.value)}
              maxLength={4}
              inputMode="numeric"
              className="text-center text-xl tracking-[0.5em] h-14 font-semibold"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button 
              onClick={handleSearch} 
              disabled={loading}
              className="h-14 px-8 text-lg font-medium"
            >
              {loading ? "查询中..." : "查询"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {searched && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">查询结果</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">
                未找到匹配的手机号
              </p>
            ) : (
              <div className="space-y-3">
                {results.map((phone) => (
                  <div
                    key={phone.phone}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-mono">{phone.displayPhone}</span>
                      <Badge variant={phone.status === "verified" ? "default" : "secondary"}>
                        {phone.status === "verified" ? "已核销" : "待核销"}
                      </Badge>
                    </div>
                    {phone.status === "active" && (
                      <Button
                        variant="destructive"
                        className="h-11 w-full sm:w-auto text-base font-medium"
                        onClick={() => handleVerify(phone)}
                      >
                        核销
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedPhone && (
        <VerifyDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          phone={selectedPhone}
          onSuccess={handleVerifySuccess}
        />
      )}
    </div>
  )
}
