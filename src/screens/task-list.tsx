import { useState } from "react";
import { MapPin, Route as RouteIcon, Search, Check, X } from "lucide-react";
import { cardText } from "@/flow/engine";
import { flowByName } from "@/flow/flows";
import { dateLabel, useStore, type Task } from "@/store";
import { AppBar, cx } from "@/ui/mf";
import { SyncBanner } from "@/ui/shell";

/** Tugas tab as on Mile Field: sheet with Berjalan (n) / Selesai (n), cards from showAs title/content/label. */
export function TaskListTab() {
  const s = useStore();
  const [tab, setTab] = useState<"run" | "done">("run");
  const [q, setQ] = useState<string | null>(null);
  const match = (t: Task) => !q || cardText(flowByName(t.flow), t.values).title.toLowerCase().includes(q.toLowerCase());
  const running = s.tasks.filter((t) => t.status === "ONGOING" && match(t)).sort((a, b) => a.orderIndex - b.orderIndex);
  const done = s.tasks.filter((t) => t.status === "DONE" && match(t));
  const list = tab === "run" ? running : done;
  return (
    <>
      <AppBar
        title="Tugas"
        right={q === null ? undefined : <button aria-label="Tutup" onClick={() => setQ(null)} className="grid size-14 place-items-center"><X className="size-6" /></button>}
      >
        {q !== null ? (
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="mx-2 h-10 flex-1 rounded bg-white px-3 text-[16px] text-ink outline-none" />
        ) : (
          <div className="flex flex-1 items-center justify-end gap-1 pr-1">
            <span className="mr-auto pl-[88px] text-[19px] font-extrabold">Tugas</span>
            <button aria-label="Cari" onClick={() => setQ("")} className="grid size-12 place-items-center"><Search className="size-6" /></button>
            <button aria-label="Peta" onClick={() => s.toast("Peta tugas tidak disimulasikan di mockup")} className="grid size-12 place-items-center"><MapPin className="size-6" /></button>
            <button aria-label="Rute" onClick={() => s.toast("Optimasi rute tidak disimulasikan di mockup")} className="grid size-12 place-items-center"><RouteIcon className="size-6" /></button>
          </div>
        )}
      </AppBar>
      <SyncBanner />
      <div className="-mt-px flex min-h-0 flex-1 flex-col rounded-t-[22px] bg-canvas shadow-[0_-2px_6px_rgba(0,0,0,0.12)]">
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line" />
        <div className="flex shadow-[0_2px_3px_rgba(0,0,0,0.08)]">
          {([["run", `Berjalan (${running.length})`], ["done", `Selesai (${done.length})`]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} className={cx("relative h-[57px] flex-1 text-[18px] font-extrabold", tab === k ? "text-brand" : "text-faint")}>
              {label}
              {tab === k && <span className="absolute inset-x-0 bottom-0 h-[3px] bg-brand" />}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
          {list.map((t) => <Card key={t.id} t={t} onOpen={() => s.push({ name: "detail", taskId: t.id })} />)}
          {!list.length && (
            <div className="flex flex-col items-center pt-40 text-center">
              <div className="relative mb-4 size-16"><Search className="size-16 text-[#90caf9]" strokeWidth={1.4} /><span className="absolute left-[22px] top-[14px] text-[18px] font-bold text-brand">?</span></div>
              <div className="text-[20px] font-extrabold">Tidak Ada Tugas Ditemukan</div>
              <div className="mt-2 text-[14px]">Daftar tugas Anda kosong</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Card({ t, onOpen }: { t: Task; onOpen: () => void }) {
  const flow = flowByName(t.flow);
  const { title, content, label } = cardText(flow, t.values);
  return (
    <button onClick={onOpen} className="flex w-full items-center border-b border-[#cfd8dc] px-8 py-4 text-left active:bg-[#eeeeee]">
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12px] font-semibold text-[#546e7a]">{flow.name.toUpperCase()} | {t.time} | {dateLabel()}</div>
        <div className="text-[18px] font-extrabold leading-tight text-[#455a64]">{title}</div>
        {content && <div className="text-[14px] text-[#546e7a]">{content}</div>}
        {label && <span className="mt-2.5 inline-block rounded-md bg-[#d4e6ea] px-2.5 py-1.5 text-[12px] text-[#455a64]">{label}</span>}
      </div>
      {t.status === "DONE" && (
        <span className="ml-2 grid size-5 place-items-center rounded-[3px] bg-[#9e9e9e] text-white">
          <Check className="size-4" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
