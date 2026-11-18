import { RefreshCw } from "lucide-react";
import { useStore } from "@/store";

/** Light-blue strip under the app bar while a sync runs ("Menyinkronkan task NN%"). */
export function SyncBanner() {
  const s = useStore();
  if (s.syncProgress === null) return null;
  return (
    <div className="flex h-11 shrink-0 items-center justify-center gap-2 bg-brand-50 text-[15px]">
      <RefreshCw className="mf-spin size-5 text-brand" />
      {s.syncLabel} {s.syncProgress}%
    </div>
  );
}
