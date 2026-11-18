import { useState } from "react";
import { flowByName } from "@/flow/flows";
import { resolveText, visibility, workPages } from "@/flow/engine";
import type { BillC, BillItemMaster, BillValue, Component, PhotoValue, Values } from "@/flow/types";
import { useStore } from "@/store";
import { AppBar, BillEditor, BottomButton, PageTitle, PhotoField, SelectField, SignatureField, Spinner, ViewField, InputField, type BillTab } from "@/ui/mf";

/**
 * Task detail as on Mile Field: app bar = flow name, page title + progress, "Lanjut" per page,
 * "Selesaikan Tugas" on the last page (no confirm dialog; spinner, then back). A page that only holds a
 * bill is shown full-page (app bar = bill title) and "Lanjut" walks Barang → Biaya → Ringkasan first.
 */
export function TaskDetail({ taskId }: { taskId: string }) {
  const s = useStore();
  const task = s.tasks.find((t) => t.id === taskId)!;
  const flow = flowByName(task.flow);
  const readOnly = task.status === "DONE";
  const [idx, setIdx] = useState(0);
  const [billTab, setBillTab] = useState<BillTab>("Barang");
  const [finishing, setFinishing] = useState(false);

  const values = task.values;
  const vis = visibility(flow, values);
  const pages = workPages(flow, values);
  const page = pages[Math.min(idx, pages.length - 1)];
  const isLast = idx >= pages.length - 1;
  const comps = page.components.filter((c) => vis[c.id]);
  const billComp = comps.length === 1 && comps[0].component === "bill" ? (comps[0] as BillC) : null;
  // Per-outlet catalog (Data Source filtered by assortment) replaces the flow's master items when present.
  const katalog = billComp ? (values[`katalog${billComp.id[0].toUpperCase()}${billComp.id.slice(1)}`] as BillItemMaster[] | undefined) : undefined;
  const billOnly = billComp ? { ...billComp, masterItems: katalog ?? billComp.masterItems } : null;
  const set = (v: Values) => s.setValues(task.id, v);

  const next = () => {
    if (billOnly && billTab !== "Ringkasan") { setBillTab(billTab === "Barang" ? "Biaya" : "Ringkasan"); return; }
    if (!isLast) { setIdx(idx + 1); setBillTab("Barang"); return; }
    if (readOnly) { s.pop(); return; }
    setFinishing(true);
    setTimeout(() => { s.finishTask(task.id); s.pop(); }, 900);
  };
  const back = () => (idx > 0 ? (setIdx(idx - 1), setBillTab("Barang")) : s.pop());

  if (finishing) return (<><AppBar title={flow.name} onBack={() => {}} /><Spinner /></>);

  return (
    <>
      <AppBar title={billOnly ? billOnly.title : flow.name} onBack={back} />
      <PageTitle title={page.title} step={idx + 1} total={pages.length} />
      {billOnly ? (
        <BillEditor c={billOnly} value={(values[billOnly.id] as BillValue) ?? { items: [], costs: [] }} onChange={(v) => set({ [billOnly.id]: v })} tab={billTab} setTab={setBillTab} readOnly={readOnly} />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto pb-4 pt-2 no-scrollbar">
          {comps.map((c) => <Field key={c.id} c={c} values={values} set={set} readOnly={readOnly} />)}
        </div>
      )}
      {!(readOnly && isLast && !(billOnly && billTab !== "Ringkasan")) && (
        <BottomButton label={isLast && !(billOnly && billTab !== "Ringkasan") ? "Selesaikan Tugas" : "Lanjut"} onClick={next} />
      )}
    </>
  );
}

export function Field({ c, values, set, readOnly }: { c: Component; values: Values; set: (v: Values) => void; readOnly?: boolean }) {
  switch (c.component) {
    case "view": return <ViewField title={c.title} type={c.type} value={resolveText(c, values)} />;
    case "input": return readOnly
      ? <ViewField title={c.title} type={c.type} value={String(values[c.id] ?? "")} />
      : <InputField title={c.title} type={c.type} value={String(values[c.id] ?? "")} onChange={(v) => set({ [c.id]: v })} />;
    case "select": return <SelectField title={c.title} options={c.options} max={c.max} value={(values[c.id] as string[]) ?? []} onChange={(v) => set({ [c.id]: v })} readOnly={readOnly} />;
    case "photo": return <PhotoField title={c.title} max={c.max} value={(values[c.id] as PhotoValue[]) ?? []} onChange={(v) => set({ [c.id]: v })} readOnly={readOnly} />;
    case "signature": return <SignatureField title={c.title} value={(values[c.id] as string) ?? null} onChange={(v) => set({ [c.id]: v })} readOnly={readOnly} />;
    case "bill": return null; // bills are full-page (page N) or summary + editor (initial page)
  }
}
