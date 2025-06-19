export function ProductsSkeleton({ columns }: { columns: number }) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center p-4">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4 sm:mb-0 animate-pulse" />
        </div>
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4`}>
          {Array(columns)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg overflow-hidden aspect-square mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
        </div>
      </div>
    )
  }