import { NextResponse } from "next/server"
import { getSettings } from "@/lib/db"
import type { ApiResponse, AppSettings } from "@/lib/types"

export async function GET() {
  try {
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
