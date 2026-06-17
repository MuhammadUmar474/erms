export default function Loading() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar skeleton */}
      <aside className="hidden lg:flex flex-col w-[200px] min-h-screen bg-white border-r border-gray-200">
        <div className="px-5 pt-5 pb-6">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-2 w-16 bg-gray-100 rounded animate-pulse mt-1.5" />
        </div>
        <div className="px-2.5 space-y-1">
          <div className="h-8 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-8 bg-gray-50 rounded-lg animate-pulse" />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar skeleton */}
        <div className="h-12 border-b border-gray-200 bg-white flex items-center px-5">
          <div className="h-3.5 w-20 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Content skeleton */}
        <main className="flex-1 p-4 space-y-4">
          {/* Title */}
          <div>
            <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-64 bg-gray-100 rounded animate-pulse mt-1.5" />
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-md animate-pulse" />
                <div>
                  <div className="h-5 w-10 bg-gray-200 rounded animate-pulse" />
                  <div className="h-2 w-16 bg-gray-100 rounded animate-pulse mt-1" />
                </div>
              </div>
            ))}
          </div>

          {/* Filters skeleton */}
          <div className="bg-white border border-gray-200 rounded-lg px-5 py-4">
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="h-2 w-14 bg-gray-100 rounded animate-pulse mb-1.5" />
                  <div className="h-9 bg-gray-100 rounded-lg animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Table skeleton */}
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="h-9 bg-black" />
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`h-9 border-b border-gray-100 ${i % 2 === 0 ? "bg-gray-50/50" : "bg-white"}`}
              >
                <div className="flex items-center h-full px-3 gap-8">
                  <div className="h-2.5 w-12 bg-gray-200 rounded animate-pulse" />
                  <div className="h-2.5 w-24 bg-gray-100 rounded animate-pulse" />
                  <div className="h-2.5 w-16 bg-gray-100 rounded animate-pulse" />
                  <div className="h-2.5 w-10 bg-gray-100 rounded animate-pulse" />
                  <div className="h-2.5 w-20 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
