import { NextRequest, NextResponse } from "next/server"
import { verifyAdminPassword } from "@/lib/auth"
import { getAllPhones } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "未授权" },
        { status: 401 }
      )
    }

    const password = authHeader.substring(7)
    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { success: false, error: "未授权" },
        { status: 401 }
      )
    }

    const phones = await getAllPhones()

    const csvHeader = "手机号,后四位,状态,录入时间,核销时间\n"
    const csvRows = phones
      .map((p) => {
        const createdAt = new Date(p.createdAt).toLocaleString("zh-CN")
        const verifiedAt = p.verifiedAt
          ? new Date(p.verifiedAt).toLocaleString("zh-CN")
          : ""
        const status = p.status === "verified" ? "已核销" : "待核销"
        return `${p.phone},${p.last4},${status},${createdAt},${verifiedAt}`
      })
      .join("\n")

    const csv = csvHeader + csvRows

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=phones-${Date.now()}.csv`,
      },
    })
  } catch (error) {
    console.error("导出失败:", error)
    return NextResponse.json(
      { success: false, error: "导出失败" },
      { status: 500 }
    )
  }
}
