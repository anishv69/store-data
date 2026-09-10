export function LoadingScreen({ label = "Loading your workspace" }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f7f6]">
      <div className="flex items-center gap-3 text-sm font-medium text-[#68746f]">
        <span className="size-5 animate-spin rounded-full border-2 border-[#d2d2d7] border-t-[#0071e3]" />
        {label}
      </div>
    </div>
  );
}
