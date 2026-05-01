import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PhoneSearch } from "@/components/verify/phone-search"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">手机号核销系统</h1>
          <Link href="/admin">
            <Button variant="outline">管理后台</Button>
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <PhoneSearch />
      </main>
    </div>
  )
}
