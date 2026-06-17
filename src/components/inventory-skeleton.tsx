export default function InventorySkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-5 w-36 bg-gray-200 rounded" />
          <div className="h-3 w-64 bg-gray-100 rounded mt-1.5" />
        </div>
        <div className="h-8 w-[220px] bg-gray-100 rounded-lg" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-100 rounded-md" />
            <div>
              <div className="h-5 w-10 bg-gray-200 rounded" />
              <div className="h-2 w-16 bg-gray-100 rounded mt-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg px-5 py-4">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-2 w-14 bg-gray-100 rounded mb-1.5" />
              <div className="h-9 bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="h-3 w-28 bg-gray-200 rounded" />
          <div className="h-7 w-[160px] bg-gray-100 rounded-lg" />
        </div>
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="h-9 bg-gray-900" />
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className={`h-9 border-b border-gray-100 ${i % 2 === 0 ? "bg-gray-50/50" : "bg-white"}`}
            >
              <div className="flex items-center h-full px-3 gap-8">
                <div className="h-2.5 w-12 bg-gray-200 rounded" />
                <div className="h-2.5 w-24 bg-gray-100 rounded" />
                <div className="h-2.5 w-16 bg-gray-100 rounded" />
                <div className="h-2.5 w-10 bg-gray-100 rounded" />
                <div className="h-2.5 w-20 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
