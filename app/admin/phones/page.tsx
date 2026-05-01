"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { PhoneRecord } from "@/lib/types"

export default function PhonesPage() {
  const [phones, setPhones] = useState<PhoneRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "verified">("all")

  const fetchPhones = useCallback(async () => {
    setLoading(true)
    try {
      const token = sessionStorage.getItem("admin_token")
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (statusFilter !== "all") params.set("status", statusFilter)

      const response = await fetch(`/api/admin/phones?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setPhones(data.data || [])
      }
    } catch {
      alert("获取数据失败")
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    fetchPhones()
  }, [fetchPhones])

  const handleDelete = async (phone: string) => {
    if (!confirm(`确定要删除 ${phone} 吗？`)) {
      return
    }

    try {
      const token = sessionStorage.getItem("admin_token")
      const response = await fetch("/api/admin/phones", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone }),
      })

      const data = await response.json()
      if (data.success) {
        fetchPhones()
      } else {
        alert(data.error || "删除失败")
      }
    } catch {
      alert("删除失败")
    }
  }

  const handleExport = async () => {
    try {
      const token = sessionStorage.getItem("admin_token")
      const response = await fetch("/api/admin/export", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `phones-${Date.now()}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert("导出失败")
      }
    } catch {
      alert("导出失败")
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("zh-CN")
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>手机号管理</CardTitle>
            <Button onClick={handleExport}>导出CSV</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="搜索手机号..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <div className="flex gap-1">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  全部
                </Button>
                <Button
                  variant={statusFilter === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("active")}
                >
                  待核销
                </Button>
                <Button
                  variant={statusFilter === "verified" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("verified")}
                >
                  已核销
                </Button>
              </div>
            </div>

            {loading ? (
              <p className="text-center py-4">加载中...</p>
            ) : phones.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                暂无数据
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>手机号</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>录入时间</TableHead>
                    <TableHead>核销时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {phones.map((phone) => (
                    <TableRow key={phone.phone}>
                      <TableCell className="font-mono">{phone.phone}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            phone.status === "verified" ? "default" : "secondary"
                          }
                        >
                          {phone.status === "verified" ? "已核销" : "待核销"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(phone.createdAt)}</TableCell>
                      <TableCell>
                        {phone.verifiedAt ? formatDate(phone.verifiedAt) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(phone.phone)}
                        >
                          删除
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
