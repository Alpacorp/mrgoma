/**
 * What a buyer sees the instant they open a tire from the catalog.
 *
 * The detail page renders on the server on every request so price and stock
 * are exact. Without this file the click gave no sign it had registered until
 * that render finished — on 2026-09-25 that was 30 s while crawler traffic held
 * every database connection.
 *
 * It also has to exist for a second reason: `/tires/loading.tsx` would
 * otherwise be the nearest boundary, and a buyer opening one tire would be
 * shown a placeholder for a list of them.
 *
 * The shape follows `DetailView`: the dark hero, then the photo beside the
 * facts.
 */
export default function Loading() {
  return (
    <div role="status" aria-label="Loading tire details">
      <div className="bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-4 pt-5 pb-7 sm:px-6 sm:pb-10 lg:px-8">
          <div aria-hidden="true" className="animate-pulse space-y-4">
            <div className="h-4 w-48 rounded bg-white/10" />
            <div className="h-8 w-3/4 max-w-xl rounded bg-white/10" />
            <div className="h-5 w-40 rounded bg-white/10" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div aria-hidden="true" className="grid animate-pulse gap-8 lg:grid-cols-2">
          <div className="aspect-square rounded-xl bg-gray-200" />
          <div className="space-y-4">
            <div className="h-10 w-32 rounded bg-gray-200" />
            <div className="h-5 w-full rounded bg-gray-200" />
            <div className="h-5 w-5/6 rounded bg-gray-200" />
            <div className="h-5 w-2/3 rounded bg-gray-200" />
            <div className="h-12 w-full rounded-full bg-gray-200" />
          </div>
        </div>
      </div>

      <span className="sr-only">Loading...</span>
    </div>
  );
}
