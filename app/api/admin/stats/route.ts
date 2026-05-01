import { NextRequest, NextResponse } from "next/server"
import { verifyAdminPassword } from "@/lib/auth"
import { getStats } from "@/lib/db"
import type { ApiResponse, StatsData } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "未授权" },
        { status: 401 }
      )
    }

    const password = authHeader.substring(7)
    if (!verifyAdminPassword(password)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "未授权" },
        { status: 401 }
      )
    }

    const stats = await getStats()

    return NextResponse.json<ApiResponse<StatsData>>({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("获取统计失败:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "获取统计失败" },
      { status: 500 }
    )
  }
}
