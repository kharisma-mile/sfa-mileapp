import { ClipboardList, Plus, Settings as Gear } from "lucide-react";
import { StoreProvider, useStore, type Route, type Tab } from "@/store";
import { cx } from "@/ui/mf";
import { LoginScreen } from "@/screens/login";
import { TaskListTab } from "@/screens/task-list";
import { CreateTaskScreen, CreateTaskTab } from "@/screens/create-task";
import { TaskDetail } from "@/screens/task-detail";
import { SettingsTab } from "@/screens/settings";

export default function App() {
  return (
    <StoreProvider>
      <PhoneFrame>
        <Root />
      </PhoneFrame>
    </StoreProvider>
  );
}

/** Phone-sized frame on desktop. */
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full items-center justify-center gap-10 sm:p-6">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-canvas sm:h-[860px] sm:max-h-[calc(100dvh-48px)] sm:w-[412px] sm:rounded-[28px] sm:border-[10px] sm:border-[#1f2933] sm:shadow-2xl">
        {children}
      </div>
      <aside className="hidden max-w-xs text-[14px] leading-relaxed text-[#37474f] lg:block">
        <p className="text-[12px] font-bold uppercase tracking-wider text-[#78909c]">Demo · Mile Field untuk Unggul Plastik</p>
        <h2 className="mt-1 text-[22px] font-extrabold text-[#263238]">Aplikasi sales lapangan</h2>
        <p className="mt-2">Mockup mengikuti UI/UX Mile Field. Setiap layar task adalah flow berisi komponen standar Mile Field (view, input, select, photo, signature, bill). Data dummy, tanpa backend; muat ulang untuk reset.</p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Tugas: kunjungan hari ini dari PJP</li>
          <li>Flow Kunjungan: Info Outlet, Check-in, Pesanan, Checklist & Survey, Hasil</li>
          <li>Buat Task: Kunjungan (ekstra), Pelanggan Baru, Retur, Penagihan, Setoran</li>
          <li>Tetap bisa transaksi tanpa sinyal; data tersinkron saat online</li>
        </ul>
      </aside>
    </div>
  );
}

function Root() {
  const s = useStore();
  if (!s.loggedIn) return <LoginScreen />;
  const top = s.stack[s.stack.length - 1];
  return (
    <>
      <div className={cx("flex min-h-0 flex-1 flex-col", top && "hidden")}>
        <div className="flex min-h-0 flex-1 flex-col">
          {s.tab === "tasks" && <TaskListTab />}
          {s.tab === "create" && <CreateTaskTab />}
          {s.tab === "settings" && <SettingsTab />}
        </div>
        <BottomNav />
      </div>
      {top && <div className="flex min-h-0 flex-1 flex-col">{renderRoute(top)}</div>}
      <Toasts />
    </>
  );
}

function renderRoute(r: Route) {
  switch (r.name) {
    case "detail": return <TaskDetail key={r.taskId} taskId={r.taskId} />;
    case "create": return <CreateTaskScreen key={r.flow} flow={r.flow} />;
  }
}

function BottomNav() {
  const s = useStore();
  const items: { key: Tab; icon: typeof ClipboardList; label: string }[] = [
    { key: "tasks", icon: ClipboardList, label: "Task List" },
    { key: "create", icon: Plus, label: "Create Task" },
    { key: "settings", icon: Gear, label: "Settings" },
  ];
  return (
    <nav className="flex h-[60px] shrink-0 border-t border-line bg-canvas">
      {items.map(({ key, icon: Icon, label }) => {
        const on = s.tab === key;
        return (
          <button key={key} aria-label={label} onClick={() => s.setTab(key)} className={cx("flex flex-1 flex-col items-center justify-center", on && key !== "tasks" && "bg-[#eeeeee]")}>
            <Icon className={cx("size-7", on ? "text-brand" : "text-[#757575]")} strokeWidth={1.5} />
            <span className={cx("mt-1 h-0.5 w-7 rounded-full", on ? "bg-brand" : "bg-transparent")} />
          </button>
        );
      })}
    </nav>
  );
}

function Toasts() {
  const s = useStore();
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-20 z-[60] flex flex-col items-end gap-2 px-4">
      {s.toasts.map((t) => (
        <div key={t.id} className="mf-toast mf-fade max-w-[240px] rounded px-5 py-3 font-serif text-[15px] leading-snug text-white shadow-lg">{t.text}</div>
      ))}
    </div>
  );
}
