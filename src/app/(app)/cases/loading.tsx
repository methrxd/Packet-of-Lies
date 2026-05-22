import { Skeleton } from "@/components/ui/skeleton";

export default function CasesLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-3 w-24 bg-white/6" />
        <Skeleton className="h-10 w-64 bg-white/8" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-2xl bg-white/6" />
        ))}
      </div>
    </div>
  );
}
