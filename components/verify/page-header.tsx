"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function PageHeader() {
  const [title, setTitle] = useState("手机号核销系统")

  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const response = await fetch("/api/settings")
        const data = await response.json()
        if (data.success) {
          setTitle(data.data.title)
        }
      } catch {
        // 使用默认标题
      }
    }

    fetchTitle()
  }, [])

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold truncate mr-3">{title}</h1>
        <Link href="/admin">
          <Button variant="outline" size="sm" className="shrink-0">
            管理后台
          </Button>
        </Link>
      </div>
    </header>
  )
}
