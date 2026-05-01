"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
      alert("请输入4位数字")
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
        alert(data.error || "查询失败")
        setResults([])
      }
    } catch {
      alert("查询失败")
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>查询手机号</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="请输入手机号后四位"
              value={last4}
              onChange={(e) => setLast4(e.target.value)}
              maxLength={4}
              className="text-center text-lg tracking-widest"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? "查询中..." : "查询"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {searched && (
        <Card>
          <CardHeader>
            <CardTitle>查询结果</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                未找到匹配的手机号
              </p>
            ) : (
              <div className="space-y-2">
                {results.map((phone) => (
                  <div
                    key={phone.phone}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <span className="text-lg font-mono">{phone.phone}</span>
                    <Button
                      variant="destructive"
                      onClick={() => handleVerify(phone)}
                    >
                      核销
                    </Button>
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
