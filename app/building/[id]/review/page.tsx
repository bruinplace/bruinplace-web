export default async function CreateBuildingReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="min-h-screen p-10">
      <h1 className="text-3xl font-semibold">Write a Review</h1>
      <p className="mt-2 text-zinc-600">
        For building #{id} (dummy form).
      </p>

      <div className="mt-8 max-w-xl rounded-2xl border bg-white p-6">
        <p className="text-sm text-zinc-600">
          Building review form will go here.
        </p>
      </div>
    </div>
  )
}