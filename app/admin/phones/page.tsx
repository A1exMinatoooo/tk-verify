"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
      toast.error("获取数据失败")
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    fetchPhones()
  }, [fetchPhones])

  const handleDelete = async (phone: string) => {
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
        toast.success("删除成功")
        fetchPhones()
      } else {
        toast.error(data.error || "删除失败")
      }
    } catch {
      toast.error("删除失败")
    }
  }

  const handleDeleteAll = async () => {
    try {
      const token = sessionStorage.getItem("admin_token")
      const response = await fetch("/api/admin/phones", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "deleteAll" }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success(data.message)
        fetchPhones()
      } else {
        toast.error(data.error || "删除失败")
      }
    } catch {
      toast.error("删除失败")
    }
  }

  const handleResetVerification = async () => {
    try {
      const token = sessionStorage.getItem("admin_token")
      const response = await fetch("/api/admin/phones", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "resetVerification" }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success(data.message)
        fetchPhones()
      } else {
        toast.error(data.error || "重置失败")
      }
    } catch {
      toast.error("重置失败")
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
        toast.error("导出失败")
      }
    } catch {
      toast.error("导出失败")
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("zh-CN")
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <CardTitle>手机号管理</CardTitle>
            <div className="flex flex-wrap gap-2">
              <AlertDialog>
                <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>清空核销状态</AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认清空核销状态</AlertDialogTitle>
                    <AlertDialogDescription>
                      此操作将把所有已核销的手机号重置为待核销状态，此操作不可撤销。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetVerification}>
                      确认清空
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>删除所有手机号</AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认删除所有手机号</AlertDialogTitle>
                    <AlertDialogDescription>
                      此操作将永久删除所有手机号数据，此操作不可撤销。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAll}>
                      确认删除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button onClick={handleExport} variant="outline" size="sm">导出CSV</Button>
            </div>
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
                        <AlertDialog>
                          <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>删除</AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除</AlertDialogTitle>
                              <AlertDialogDescription>
                                确定要删除手机号 {phone.phone} 吗？此操作不可撤销。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(phone.phone)}>
                                确认删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
