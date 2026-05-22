import { Skeleton } from "@/components/ui/skeleton";

export default function CaseDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-3 w-28 bg-white/6" />
        <Skeleton className="h-10 w-72 bg-white/8" />
        <Skeleton className="h-4 w-full max-w-2xl bg-white/6" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-44 rounded-2xl bg-white/6" />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-[28rem] rounded-2xl bg-white/6" />
        <Skeleton className="h-[28rem] rounded-2xl bg-white/6" />
      </div>

      <Skeleton className="h-[22rem] rounded-2xl bg-white/6" />
    </div>
  );
}
