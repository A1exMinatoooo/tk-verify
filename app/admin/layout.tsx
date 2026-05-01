"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const token = sessionStorage.getItem("admin_token")
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = async () => {
    if (!password) {
      setError("请输入密码")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (data.success) {
        sessionStorage.setItem("admin_token", password)
        setIsAuthenticated(true)
      } else {
        setError(data.error || "密码错误")
      }
    } catch {
      setError("验证失败")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token")
    setIsAuthenticated(false)
    router.push("/admin")
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">管理后台登录</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="请输入管理密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
              <Button
                className="w-full"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "验证中..." : "登录"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">管理后台</h1>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline">核销页面</Button>
            </Link>
            <Button variant="outline" onClick={handleLogout}>
              退出
            </Button>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-4">
        <nav className="flex gap-2 mb-6">
          <Link href="/admin">
            <Button variant={pathname === "/admin" ? "default" : "outline"}>
              录入手机号
            </Button>
          </Link>
          <Link href="/admin/phones">
            <Button
              variant={pathname === "/admin/phones" ? "default" : "outline"}
            >
              手机号管理
            </Button>
          </Link>
          <Link href="/admin/stats">
            <Button
              variant={pathname === "/admin/stats" ? "default" : "outline"}
            >
              统计信息
            </Button>
          </Link>
        </nav>
        {children}
      </div>
    </div>
  )
}
