import { useState } from "react";
import { CREATABLE_FLOWS, flowByName } from "@/flow/flows";
import { visibility } from "@/flow/engine";
import type { BillC, BillValue, Values } from "@/flow/types";
import { useStore } from "@/store";
import { AppBar, BillEditor, BillSummary, BottomButton, HubSelect, type BillTab } from "@/ui/mf";
import { SyncBanner } from "@/ui/shell";
import { Field } from "./task-detail";

/** "Buat Task" tab: plain list of flows the role may create. */
export function CreateTaskTab() {
  const s = useStore();
  return (
    <>
      <AppBar title="Buat Task" />
      <SyncBanner />
      <ul className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
        {CREATABLE_FLOWS.map((f) => (
          <li key={f.name}>
            <button onClick={() => s.push({ name: "create", flow: f.name })} className="flex h-16 w-full items-center border-b border-line px-4 text-left text-[18px] font-semibold active:bg-[#eeeeee]">{f.name}</button>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Initial page of a flow: hub selector, page-0 components, "Buat Task" → opens the task at its first page. */
export function CreateTaskScreen({ flow: flowName }: { flow: string }) {
  const s = useStore();
  const flow = flowByName(flowName);
  const [values, setValues] = useState<Values>({});
  const [bill, setBill] = useState<BillC | null>(null);
  const [billTab, setBillTab] = useState<BillTab>("Barang");
  const set = (v: Values) => setValues((x) => ({ ...x, ...v }));
  const vis = visibility(flow, values);
  const comps = flow.pages[0].components.filter((c) => vis[c.id]);

  if (bill) {
    return (
      <>
        <AppBar title={flow.name} onBack={() => setBill(null)} />
        <BillEditor c={bill} value={(values[bill.id] as BillValue) ?? { items: [], costs: [] }} onChange={(v) => set({ [bill.id]: v })} tab={billTab} setTab={setBillTab} />
        <BottomButton label={billTab === "Ringkasan" ? "Simpan" : "Lanjut"} onClick={() => (billTab === "Barang" ? setBillTab("Biaya") : billTab === "Biaya" ? setBillTab("Ringkasan") : (setBill(null), setBillTab("Barang")))} />
      </>
    );
  }

  return (
    <>
      <AppBar title={flow.name} onBack={s.pop} />
      <HubSelect value="Surabaya" />
      <div className="min-h-0 flex-1 overflow-y-auto pb-4 pt-2 no-scrollbar">
        {comps.map((c) => (c.component === "bill"
          ? <BillSummary key={c.id} title={c.title} value={values[c.id] as BillValue} onEdit={() => setBill(c)} />
          : <Field key={c.id} c={c} values={values} set={set} />))}
      </div>
      <BottomButton label="Buat Task" onClick={() => { const id = s.createTask(flow.name, values); s.pop(); s.push({ name: "detail", taskId: id }); }} />
    </>
  );
}
