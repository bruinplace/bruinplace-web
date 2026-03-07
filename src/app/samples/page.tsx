"use client";

import { useGetSampleData } from "@/hooks/use-get-sample-data";
import { getApiRoot } from "@/lib/api";

export default function ApiTestPage() {
  const { data, error, isPending, refetch } = useGetSampleData();

  return (
    <div className="min-h-screen p-6 font-sans">
      <h1 className="mb-4 text-xl font-semibold">API test</h1>
      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        Root: {getApiRoot()}
      </p>
      <button
        type="button"
        onClick={() => refetch()}
        disabled={isPending}
        className="rounded bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {isPending ? "Loading…" : "Fetch"}
      </button>
      {error && (
        <pre className="mt-4 overflow-auto rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error.message}
        </pre>
      )}
      {data !== undefined && (
        <pre className="mt-4 overflow-auto rounded border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-900">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
