import { NextRequest, NextResponse } from "next/server"
import { verifyAdminPassword } from "@/lib/auth"
import { getSettings, updateSettings } from "@/lib/db"
import type { ApiResponse, AppSettings } from "@/lib/types"

async function verifyAuth(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false
  }
  const password = authHeader.substring(7)
  return verifyAdminPassword(password)
}

export async function GET(request: NextRequest) {
  try {
    if (!(await verifyAuth(request))) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "未授权" },
        { status: 401 }
      )
    }

    const settings = await getSettings()
    return NextResponse.json<ApiResponse<AppSettings>>({
      success: true,
      data: settings,
    })
  } catch (error) {
    console.error("获取设置失败:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "获取设置失败" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!(await verifyAuth(request))) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "未授权" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const settings = await updateSettings(body)

    return NextResponse.json<ApiResponse<AppSettings>>({
      success: true,
      data: settings,
      message: "设置已更新",
    })
  } catch (error) {
    console.error("更新设置失败:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "更新设置失败" },
      { status: 500 }
    )
  }
}
