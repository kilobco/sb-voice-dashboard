import { getCalls } from '@/lib/queries/calls'
import { CallsTable } from '@/components/calls/calls-table'

export default async function CallsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(0, parseInt(pageParam ?? '0', 10))
  const { calls, total } = await getCalls(page)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calls</h1>
        <p className="text-muted-foreground">{total} total calls</p>
      </div>
      <CallsTable calls={calls} total={total} page={page} />
    </div>
  )
}
