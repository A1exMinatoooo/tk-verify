"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function AdminPage() {
  const [phones, setPhones] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: number
    failed: number
    messages: string[]
  } | null>(null)

  const handleSubmit = async () => {
    if (!phones.trim()) {
      alert("请输入手机号")
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const token = sessionStorage.getItem("admin_token")
      const response = await fetch("/api/admin/phones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phones }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        setPhones("")
      } else {
        alert(data.error || "录入失败")
      }
    } catch {
      alert("录入失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>录入手机号</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              请输入手机号，每行一个，支持逗号、空格分隔
            </p>
            <Textarea
              placeholder="13812345678&#10;13987654321&#10;..."
              value={phones}
              onChange={(e) => setPhones(e.target.value)}
              rows={10}
              className="font-mono"
            />
            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? "录入中..." : "录入"}
            </Button>

            {result && (
              <Card className={result.failed > 0 ? "border-destructive" : "border-green-500"}>
                <CardContent className="pt-4">
                  <p className="font-medium">
                    录入完成：成功 {result.success} 个，失败 {result.failed} 个
                  </p>
                  {result.messages.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {result.messages.map((msg, i) => (
                        <p key={i} className="text-sm text-destructive">
                          {msg}
                        </p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
