import { Skeleton } from "@/components/ui/skeleton";

export default function LessonsLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-48" />
      </div>
      {[...Array(3)].map((_, m) => (
        <div key={m} className="space-y-3">
          <Skeleton className="h-6 w-56" />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(5)].map((_, l) => (
              <Skeleton key={l} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
