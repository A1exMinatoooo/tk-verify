import { NextRequest, NextResponse } from "next/server"
import { verifyAdminPassword } from "@/lib/auth"
import type { ApiResponse } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password || typeof password !== "string") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "请输入密码" },
        { status: 400 }
      )
    }

    const isValid = verifyAdminPassword(password)

    if (!isValid) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "密码错误" },
        { status: 401 }
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "验证成功",
    })
  } catch (error) {
    console.error("认证失败:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "认证失败" },
      { status: 500 }
    )
  }
}
