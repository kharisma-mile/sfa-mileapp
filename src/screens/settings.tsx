import { QrCode } from "lucide-react";
import { SALESMAN } from "@/data/mock";
import { useStore } from "@/store";
import { AppBar, cx } from "@/ui/mf";
import { SyncBanner } from "@/ui/shell";

/** Pengaturan as on field.mile.app: profile, Versi, Data, Sinkronisasi Data, Ubah Organisasi, Troubleshooting, Riwayat, Keluar. */
export function SettingsTab() {
  const s = useStore();
  const Row = ({ label, value, onClick, blue }: { label: string; value?: string; onClick?: () => void; blue?: boolean }) => (
    <button onClick={onClick} className="flex h-[53px] w-full items-center border-b border-line px-4 text-left active:bg-[#eeeeee]">
      <span className={cx("flex-1 text-[17px] font-semibold", blue && "text-bar")}>{label}</span>
      {value && <span className="text-[14px]">{value}</span>}
    </button>
  );
  return (
    <>
      <AppBar title="Pengaturan" />
      <SyncBanner />
      <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-3 border-b border-line px-4 py-4">
          <span className="grid size-10 place-items-center rounded-full bg-[#bbdefb] text-[16px]">B</span>
          <div className="flex-1"><div className="text-[17px] font-extrabold">{SALESMAN.name}</div><div className="text-[14px]">{SALESMAN.email}</div></div>
          <QrCode className="size-6" />
        </div>
        <Row label="Versi" value="1.45.3" />
        <Row label="Data" />
        <Row label="Sinkronisasi Data" value={s.syncProgress !== null ? "Mohon tunggu" : undefined} onClick={() => s.syncNow("Menyinkronkan data")} />
        <Row label="Ubah Organisasi" value={SALESMAN.org} />
        <Row label="Troubleshooting" />
        <Row label="Riwayat" />
        <Row label="Keluar" blue onClick={s.logout} />
      </div>
    </>
  );
}
