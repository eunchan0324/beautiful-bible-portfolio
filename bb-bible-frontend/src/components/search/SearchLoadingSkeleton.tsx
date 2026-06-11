export default function SearchLoadingSkeleton() {
  return (
    <div className="space-y-3 px-5 py-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-xl bg-white px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-[30px] w-[30px] animate-pulse rounded-full bg-[#EEEAE1]" />
            <div className="h-3 w-24 animate-pulse rounded-full bg-[#EEEAE1]" />
          </div>
          <div className="mt-4 space-y-2 pl-10">
            <div className="h-3 w-full animate-pulse rounded-full bg-[#F1EDE3]" />
            <div className="h-3 w-10/12 animate-pulse rounded-full bg-[#F1EDE3]" />
            <div className="h-3 w-7/12 animate-pulse rounded-full bg-[#F1EDE3]" />
          </div>
        </div>
      ))}
    </div>
  );
}
