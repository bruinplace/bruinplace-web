export default function SubletPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Sublet</h1>

      <p className="mt-4 text-muted-foreground">
        Sublet ID: <span className="font-mono">{params.id}</span>
      </p>

      <div className="mt-8 rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
        Sublet details coming soon 🚧
      </div>
    </div>
  )
}