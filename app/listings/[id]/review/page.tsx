export default async function CreateReviewPage({ params, }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <div className="min-h-screen p-10">
        <h1 className="text-3xl font-semibold">Write a Review</h1>
        <p className="mt-2 text-zinc-600">For listing #{id} (dummy form).</p>

        <div className="mt-8 max-w-xl rounded-2xl border bg-white p-6">
            <p className="text-sm text-zinc-600">Form will go here.</p>
        </div>
        </div>
    );
}