"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = sessionStorage.getItem("admin_token")
        const response = await fetch("/api/admin/settings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()
        if (data.success) {
          setTitle(data.data.title)
        }
      } catch {
        toast.error("获取设置失败")
      } finally {
        setFetching(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("请输入标题")
      return
    }

    setLoading(true)

    try {
      const token = sessionStorage.getItem("admin_token")
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("设置已保存")
      } else {
        toast.error(data.error || "保存失败")
      }
    } catch {
      toast.error("保存失败")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <p className="text-center py-4">加载中...</p>
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>系统设置</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">页面标题</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="请输入页面标题"
              />
              <p className="text-sm text-muted-foreground">
                此标题将显示在核销页面的标题栏和页头位置
              </p>
            </div>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "保存中..." : "保存设置"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
