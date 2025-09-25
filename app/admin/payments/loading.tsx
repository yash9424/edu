import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-80" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  )
}