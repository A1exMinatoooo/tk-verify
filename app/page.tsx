import { PageHeader } from "@/components/verify/page-header"
import { PhoneSearch } from "@/components/verify/phone-search"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader />
      <main className="container mx-auto px-4 py-4 md:py-8 max-w-2xl">
        <PhoneSearch />
      </main>
    </div>
  )
}
