import { NextRequest, NextResponse } from "next/server"
import { getPhonesByLast4, verifyPhone, formatPhone } from "@/lib/db"
import type { ApiResponse, VerifyResult } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const last4 = searchParams.get("last4")

    if (!last4 || !/^\d{4}$/.test(last4)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "请输入4位数字" },
        { status: 400 }
      )
    }

    const phones = await getPhonesByLast4(last4)
    const results: VerifyResult[] = await Promise.all(
      phones.map(async (p) => ({
        ...p,
        phone: await formatPhone(p.phone),
      }))
    )

    return NextResponse.json<ApiResponse<VerifyResult[]>>({
      success: true,
      data: results,
    })
  } catch (error) {
    console.error("查询失败:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "查询失败" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = body

    if (!phone || typeof phone !== "string") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "缺少手机号" },
        { status: 400 }
      )
    }

    const result = await verifyPhone(phone)
    return NextResponse.json<ApiResponse>(result)
  } catch (error) {
    console.error("核销失败:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "核销失败" },
      { status: 500 }
    )
  }
}
