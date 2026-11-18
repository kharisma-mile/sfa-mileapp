import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { INVOICES, TODAY_PLAN, assortmentOf, outletById, priceFor, productById } from "@/data/mock";
import type { BillItemMaster, BillValue, Values } from "@/flow/types";

export interface Task {
  id: string;
  flow: string;
  values: Values;
  status: "ONGOING" | "DONE";
  /** done task reached the server (green) or is still on the device (grey) */
  synced: boolean;
  time: string; // "08:00 AM"
  orderIndex: number;
}

export type Tab = "tasks" | "create" | "settings";
export type Route =
  | { name: "detail"; taskId: string }
  | { name: "create"; flow: string };

const DATE_LABEL = "Rabu, 18 Nov 2026";
export const dateLabel = () => DATE_LABEL;
export const clock = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

/* Today's visits: tasks created by the Sales Operations module from the PJP (one task per outlet). */
function seedTasks(): Task[] {
  return TODAY_PLAN.map((p, i) => {
    const o = outletById(p.outletId);
    const last = o.lastOrder;
    // Catalog = outlet assortment (Data Source published by the module); price from the outlet's price list.
    const assort = assortmentOf(o);
    const katalog: BillItemMaster[] = assort.flatMap((a) => { const pr = productById(a.productId); return pr.uoms.map((u) => ({ name: `${pr.name} (${u.uom})`, unit_price: priceFor(pr, u.uom, o.priceGroup) })); });
    // Bill prefill: last order (repeat order) + must-sell items not in it, qty 0.
    const lastItems = (last?.items ?? []).map((it) => { const pr = productById(it.productId); return { name: `${pr.name} (${it.uom})`, unitPrice: priceFor(pr, it.uom, o.priceGroup), qty: it.qty }; });
    const mustSell = assort.filter((a) => a.mustSell && !lastItems.some((l) => l.name.startsWith(productById(a.productId).name))).map((a) => { const pr = productById(a.productId); const u = pr.uoms[0].uom; return { name: `${pr.name} (${u})`, unitPrice: priceFor(pr, u, o.priceGroup), qty: 0 }; });
    const pesanan: BillValue | undefined = o.prospect ? undefined : { items: [...lastItems, ...mustSell], costs: [] };
    return {
      id: p.id,
      flow: "Kunjungan",
      status: "ONGOING",
      synced: true,
      time: `0${8 + Math.floor(i / 2)}:${i % 2 ? "30" : "00"} AM`.replace(/^0(\d\d)/, "$1"),
      orderIndex: p.seq,
      values: {
        namaOutlet: o.name,
        alamatOutlet: o.address,
        lokasiOutlet: o.gps ? `${o.gps.lat},${o.gps.lng}` : "",
        kelasOutlet: [o.cls],
        kodeOutlet: o.code,
        teleponOutlet: o.phone,
        limitKredit: o.creditLimit,
        outstanding: o.outstanding,
        overdue: o.overdue,
        sisaLimit: Math.max(0, o.creditLimit - o.outstanding),
        pesananTerakhir: last ? `${last.no} · ${last.date}` : "-",
        pesanan,
        katalogPesanan: katalog,
      },
    };
  });
}

interface Toast { id: number; text: string }

interface Store {
  loggedIn: boolean;
  login: () => void;
  logout: () => void;
  tab: Tab;
  setTab: (t: Tab) => void;
  stack: Route[];
  push: (r: Route) => void;
  pop: () => void;
  tasks: Task[];
  createTask: (flow: string, values: Values) => string;
  setValues: (taskId: string, values: Values) => void;
  finishTask: (taskId: string) => void;
  offline: boolean;
  syncProgress: number | null;
  syncNow: (label?: string) => void;
  syncLabel: string;
  toasts: Toast[];
  toast: (text: string) => void;
  invoices: typeof INVOICES;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTabState] = useState<Tab>("tasks");
  const [stack, setStack] = useState<Route[]>([]);
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [offline, setOffline] = useState(() => typeof navigator !== "undefined" && !navigator.onLine);
  const [syncProgress, setSyncProgress] = useState<number | null>(null);
  const [syncLabel, setSyncLabel] = useState("Menyinkronkan task");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const offlineRef = useRef(offline);
  offlineRef.current = offline;

  const toast = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  /** Upload queued data (done tasks) with the "Menyinkronkan task NN%" banner. */
  const syncNow = useCallback((label = "Menyinkronkan task") => {
    if (offlineRef.current) return;
    setSyncLabel(label);
    let p = 0;
    setSyncProgress(0);
    const t = setInterval(() => {
      p += 25;
      setSyncProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(t);
        setTimeout(() => { setSyncProgress(null); setTasks((ts) => ts.map((x) => (x.status === "DONE" ? { ...x, synced: true } : x))); }, 300);
      }
    }, 250);
  }, []);

  // Offline-first: the app keeps working without a network; queued data syncs automatically when back online.
  useEffect(() => {
    const off = () => { offlineRef.current = true; setOffline(true); };
    const on = () => { offlineRef.current = false; setOffline(false); setTimeout(() => syncNow(), 300); };
    window.addEventListener("offline", off);
    window.addEventListener("online", on);
    return () => { window.removeEventListener("offline", off); window.removeEventListener("online", on); };
  }, [syncNow]);

  const store: Store = {
    loggedIn,
    login: () => { setLoggedIn(true); setTimeout(() => syncNow(), 200); },
    logout: () => { setLoggedIn(false); setStack([]); setTabState("tasks"); },
    tab,
    setTab: (t) => { setStack([]); setTabState(t); },
    stack,
    push: (r) => setStack((s) => [...s, r]),
    pop: () => setStack((s) => s.slice(0, -1)),
    tasks,
    createTask: (flow, values) => {
      const id = `T${Date.now()}`;
      setTasks((ts) => [...ts, { id, flow, values, status: "ONGOING", synced: !offlineRef.current, time: clock(), orderIndex: ts.length + 1 }]);
      return id;
    },
    setValues: (taskId, values) => setTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, values: { ...t.values, ...values } } : t))),
    finishTask: (taskId) => {
      setTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, status: "DONE", synced: false } : t)));
      setTimeout(() => syncNow(), 400);
    },
    offline, syncProgress, syncNow, syncLabel,
    toasts, toast,
    invoices: INVOICES,
  };
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("StoreProvider missing");
  return s;
}
