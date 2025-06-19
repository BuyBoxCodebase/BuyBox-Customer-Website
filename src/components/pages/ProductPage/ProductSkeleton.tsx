import { CardContent } from "../../ui/card";
import { Card } from "../../ui/card-hover-effect";

export default function ProductSkeleton() {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              <div className="lg:w-1/2">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse">
                  <div className="absolute inset-0 flex items-center justify-center"></div>
                </div>
              </div>
              <div className="lg:w-1/2 space-y-5 md:space-y-6">
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md w-3/4 animate-pulse" />
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md w-1/2 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md animate-pulse" />
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md animate-pulse" />
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md w-5/6 animate-pulse" />
                </div>
                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md w-1/4 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md w-1/6 animate-pulse" />
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="h-10 w-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md animate-pulse"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md w-1/6 animate-pulse" />
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md animate-pulse" />
                    <div className="h-10 w-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md animate-pulse" />
                    <div className="h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md animate-pulse" />
                  </div>
                </div>
                <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }