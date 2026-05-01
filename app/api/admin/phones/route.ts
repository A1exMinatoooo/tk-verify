import { NextRequest, NextResponse } from "next/server"
import { verifyAdminPassword } from "@/lib/auth"
import { addPhones, getAllPhones, deletePhone } from "@/lib/db"
import type { ApiResponse, PhoneRecord } from "@/lib/types"

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

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || undefined
    const status = searchParams.get("status") as "active" | "verified" | undefined

    const phones = await getAllPhones(search, status)
    return NextResponse.json<ApiResponse<PhoneRecord[]>>({
      success: true,
      data: phones,
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
    if (!(await verifyAuth(request))) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "未授权" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { phones } = body

    if (!phones || typeof phones !== "string") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "请输入手机号" },
        { status: 400 }
      )
    }

    const phoneList = phones
      .split(/[\n,，\s]+/)
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 0)

    const result = await addPhones(phoneList)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result,
      message: `成功录入 ${result.success} 个，失败 ${result.failed} 个`,
    })
  } catch (error) {
    console.error("录入失败:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "录入失败" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await verifyAuth(request))) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "未授权" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { phone } = body

    if (!phone || typeof phone !== "string") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "缺少手机号" },
        { status: 400 }
      )
    }

    const result = await deletePhone(phone)
    return NextResponse.json<ApiResponse>(result)
  } catch (error) {
    console.error("删除失败:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "删除失败" },
      { status: 500 }
    )
  }
}
