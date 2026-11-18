/*
  Mile Field component renderers. Each one reproduces what was observed on field.mile.app v1.45.3
  (.planning/research/mile-field/UI-SPEC-OBSERVED.md). Do not add elements that are not in that spec.
*/
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, Camera, Check, ChevronDown, ChevronsUpDown, Crosshair, ImagePlus, MapPin, MessageCircle, Phone, Search, Trash2, X } from "lucide-react";
import { billTotals, num, type BillC, type BillValue, type PhotoValue } from "@/flow/types";
import { clock } from "@/store";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/* ---------- frame ---------- */
export function AppBar({ title, onBack, right, children }: { title?: string; onBack?: () => void; right?: ReactNode; children?: ReactNode }) {
  return (
    <header className="relative z-10 flex h-14 shrink-0 items-center bg-bar text-white shadow-md">
      <div className="w-14">
        {onBack && <button aria-label="Kembali" onClick={onBack} className="grid size-14 place-items-center active:bg-white/15"><ArrowLeft className="size-6" /></button>}
      </div>
      {children ?? <h1 className="flex-1 truncate text-center text-[19px] font-extrabold">{title}</h1>}
      <div className="flex w-14 items-center justify-end">{right}</div>
    </header>
  );
}

export function BottomButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className="h-[62px] w-full shrink-0 bg-brand text-[17px] font-extrabold text-white active:bg-brand-dark disabled:opacity-60">
      {label}
    </button>
  );
}

/** Page title (from flow config) + progress bar, as in task detail. */
export function PageTitle({ title, step, total }: { title: string; step: number; total: number }) {
  return (
    <div className="shrink-0">
      <div className="px-4 pb-3 pt-4 text-[19px] font-extrabold">{title}</div>
      <div className="h-1 bg-[#eeeeee]"><div className="h-1 bg-brand" style={{ width: `${(step / total) * 100}%` }} /></div>
    </div>
  );
}

export function Spinner() {
  return <div className="grid flex-1 place-items-center"><span className="mf-spin size-6 rounded-full border-[3px] border-brand border-t-transparent" /></div>;
}

const Label = ({ text }: { text: string }) => <div className="text-[13px] text-sub">{text}</div>;

/* ---------- view ---------- */
export function ViewField({ title, type, value }: { title: string; type: string; value: string }) {
  return (
    <div className="px-4 py-2">
      <Label text={title} />
      <div className="flex min-h-7 items-center gap-2">
        <div className="flex-1 text-[17px] leading-snug">{value || "-"}</div>
        {type === "Geolocation" && value && <MapPin className="size-6 shrink-0 text-ink" strokeWidth={1.6} />}
        {type === "PhoneNumber" && value && (
          <>
            <span className="grid size-10 place-items-center text-brand" aria-label="Telepon"><Phone className="size-5" /></span>
            <span className="grid size-10 place-items-center text-ok" aria-label="WhatsApp"><MessageCircle className="size-5" /></span>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- input (initial page) ---------- */
export function InputField({ title, type, value, onChange }: { title: string; type: string; value: string; onChange: (v: string) => void }) {
  const [focus, setFocus] = useState(false);
  const [busy, setBusy] = useState(false);
  if (type === "Geolocation") {
    return (
      <div className="px-4 py-2">
        <Label text={title} />
        <div className={cx("flex items-center border-b", value ? "border-under" : "border-err")}>
          <span className="flex-1 py-2 text-[17px] font-bold">{busy ? "" : value}</span>
          <button aria-label="Ambil lokasi" onClick={() => { setBusy(true); setTimeout(() => { setBusy(false); onChange("-7.2312,112.777"); }, 700); }} className="grid size-12 place-items-center rounded-full active:bg-[#e0e0e0]">
            <Crosshair className={cx("size-6", busy && "mf-spin")} />
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="px-4 py-2">
      <Label text={title} />
      <input
        value={value}
        onChange={(e) => onChange(type === "Numeric" ? e.target.value.replace(/\D/g, "") : e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        type={type === "Date" ? "date" : type === "PhoneNumber" ? "tel" : "text"}
        inputMode={type === "Numeric" ? "numeric" : undefined}
        className={cx("h-11 w-full border-b bg-transparent text-[17px] font-bold outline-none", focus ? "border-b-2 border-brand" : "border-under")}
      />
    </div>
  );
}

/* ---------- select dropdown ---------- */
export function SelectField({ title, options, max, value, onChange, readOnly }: { title: string; options: string[]; max: number; value: string[]; onChange: (v: string[]) => void; readOnly?: boolean }) {
  return max > 1
    ? <SelectMulti title={title} options={options} value={value} onChange={onChange} readOnly={readOnly} />
    : <SelectSingle title={title} options={options} value={value} onChange={onChange} readOnly={readOnly} />;
}

/** max = 1: in-place pop-up menu "Silahkan pilih opsi". */
function SelectSingle({ title, options, value, onChange, readOnly }: { title: string; options: string[]; value: string[]; onChange: (v: string[]) => void; readOnly?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative px-4 py-2">
      <Label text={title} />
      <button disabled={readOnly} onClick={() => setOpen(true)} className="flex h-12 w-full items-center border-b border-under text-left">
        <span className="flex-1 text-[14px] font-semibold">{value[0] ?? "Silahkan pilih opsi"}</span>
        {!readOnly && <span className="text-sub">▾</span>}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <ul role="menu" className="mf-fade absolute inset-x-0 top-6 z-40 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
            {["Silahkan pilih opsi", ...options].map((o, i) => (
              <li key={o}>
                <button onClick={() => { onChange(i === 0 ? [] : [o]); setOpen(false); }} className={cx("flex h-12 w-full items-center px-4 text-left text-[14px] font-semibold", (i === 0 ? !value.length : value[0] === o) && "bg-[#e0e0e0]")}>
                  {o}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/** max > 1: bottom sheet "Pilih" with search, checkboxes, Batal / Ok; result as chips. */
function SelectMulti({ title, options, value, onChange, readOnly }: { title: string; options: string[]; value: string[]; onChange: (v: string[]) => void; readOnly?: boolean }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(value);
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  useEffect(() => { if (open) { setDraft(value); setQ(""); setSearching(false); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className={cx("px-4 py-2", value.length > 0 && "bg-[#e0e0e0]/70")}>
      <Label text={title} />
      <button disabled={readOnly} onClick={() => setOpen(true)} className="flex min-h-12 w-full items-center gap-2 border-b border-under py-1.5 text-left">
        <span className="flex flex-1 flex-wrap gap-1.5">
          {value.length ? value.map((v) => <span key={v} className="rounded-full bg-[#b3e5fc] px-3 py-1 text-[13px]">{v}</span>) : <span className="text-[19px] text-faint">Pilih</span>}
        </span>
        {!readOnly && <span className="text-sub">▾</span>}
      </button>
      {open && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end">
          <div className="mf-fade absolute inset-0 bg-black/45" onClick={() => setOpen(false)} />
          <div className="mf-sheet relative flex max-h-[60%] flex-col bg-white">
            <div className="flex h-16 items-center px-4">
              {searching
                ? <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari" className="h-10 flex-1 text-[17px] outline-none" />
                : <span className="flex-1 text-[19px]">Pilih</span>}
              <button aria-label="Cari" onClick={() => setSearching((v) => !v)} className="grid size-11 place-items-center"><Search className="size-6" /></button>
            </div>
            <ul className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
              {options.filter((o) => o.toLowerCase().includes(q.toLowerCase())).map((o) => {
                const on = draft.includes(o);
                return (
                  <li key={o}>
                    <button onClick={() => setDraft((d) => (on ? d.filter((x) => x !== o) : [...d, o]))} className={cx("flex h-12 w-full items-center gap-4 px-4 text-left text-[15px]", on && "bg-[#e0e0e0]/60")}>
                      <span className={cx("grid size-5 place-items-center rounded-[3px] border-2", on ? "border-brand bg-brand text-white" : "border-[#757575]")}>{on && <Check className="size-4" strokeWidth={3} />}</span>
                      {o}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="flex h-14">
              <button onClick={() => setOpen(false)} className="flex-1 text-[15px] text-brand">Batal</button>
              <button onClick={() => { onChange(draft); setOpen(false); }} className="flex-1 text-[15px] text-brand">Ok</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- photo + Galeri ---------- */
const HUES = [200, 30, 160, 280, 340];
const newPhoto = (n: number): PhotoValue => ({ id: String(Date.now() + n), at: clock(), hue: HUES[n % HUES.length] });

function Thumb({ p, big }: { p: PhotoValue; big?: boolean }) {
  return (
    <div className={cx("relative overflow-hidden", big ? "aspect-[4/3] w-full" : "size-[121px] shrink-0")} style={{ background: `linear-gradient(140deg, hsl(${p.hue} 35% 70%), hsl(${p.hue + 30} 30% 45%))` }}>
      <div className="absolute inset-[22%] rounded-sm bg-white/75" />
    </div>
  );
}

export function PhotoField({ title, max, value, onChange, readOnly }: { title: string; max: number; value: PhotoValue[]; onChange: (v: PhotoValue[]) => void; readOnly?: boolean }) {
  const [gallery, setGallery] = useState<number | null>(null);
  const add = () => { const next = [...value, newPhoto(value.length)]; onChange(next); setGallery(next.length - 1); };
  return (
    <div className="px-4 py-2">
      <div className="flex justify-between text-[14px]"><span>{title}</span><span>{value.length} / {max}</span></div>
      <div className="mt-2 flex flex-wrap gap-2">
        {value.map((p, i) => <button key={p.id} onClick={() => setGallery(i)}><Thumb p={p} /></button>)}
        {!readOnly && value.length < max && (
          <button aria-label="Add photo" onClick={add} className="grid size-[121px] place-items-center bg-[#9e9e9e] text-white shadow active:opacity-80">
            <span className="text-[44px] font-extralight leading-none">+</span>
          </button>
        )}
      </div>
      {gallery !== null && value[gallery] && (
        <div className="absolute inset-0 z-50 flex flex-col bg-black">
          <AppBar title="Galeri" right={<button aria-label="Done" onClick={() => setGallery(null)} className="grid size-14 place-items-center"><Check className="size-7" /></button>} />
          <div className="relative flex flex-1 items-center">
            <span className="absolute right-4 top-4 rounded-md bg-black/60 px-3 py-1 text-[15px] text-white">{gallery + 1} / {max}</span>
            <Thumb p={value[gallery]} big />
          </div>
          {!readOnly && (
            <div className="flex h-28 items-center justify-around bg-canvas text-[15px]">
              <button disabled={value.length >= max} onClick={add} className="flex flex-col items-center gap-1 disabled:opacity-40"><ImagePlus className="size-7" strokeWidth={1.6} />Ambil Berikut</button>
              <button onClick={() => onChange(value.map((p, i) => (i === gallery ? newPhoto(i + 7) : p)))} className="flex flex-col items-center gap-1"><Camera className="size-7" strokeWidth={1.6} />Ambil Ulang</button>
              <button onClick={() => { const next = value.filter((_, i) => i !== gallery); onChange(next); setGallery(next.length ? Math.min(gallery, next.length - 1) : null); }} className="flex flex-col items-center gap-1"><Trash2 className="size-7 text-err" strokeWidth={1.6} />Hapus</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- signature ---------- */
export function SignatureField({ title, value, onChange, readOnly }: { title: string; value: string | null; onChange: (v: string | null) => void; readOnly?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  useEffect(() => {
    const c = ref.current; if (!c || !value) return;
    const img = new Image(); img.onload = () => c.getContext("2d")!.drawImage(img, 0, 0); img.src = value;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const pt = (e: React.PointerEvent) => { const r = ref.current!.getBoundingClientRect(); const s = ref.current!.width / r.width; return [(e.clientX - r.left) * s, (e.clientY - r.top) * s]; };
  return (
    <div className="px-4 py-2">
      <div className="text-[13px]">{title}</div>
      <canvas
        ref={ref}
        width={380}
        height={298}
        className="mt-1 w-full touch-none rounded-lg border border-[#78909c] bg-white"
        onPointerDown={(e) => { if (readOnly) return; drawing.current = true; const g = ref.current!.getContext("2d")!; const [x, y] = pt(e); g.lineWidth = 3; g.lineCap = "round"; g.strokeStyle = "#000"; g.beginPath(); g.moveTo(x, y); }}
        onPointerMove={(e) => { if (!drawing.current) return; const g = ref.current!.getContext("2d")!; const [x, y] = pt(e); g.lineTo(x, y); g.stroke(); }}
        onPointerUp={() => { if (!drawing.current) return; drawing.current = false; onChange(ref.current!.toDataURL()); }}
        onPointerLeave={() => { drawing.current = false; }}
      />
      {!readOnly && <button onClick={() => { const c = ref.current!; c.getContext("2d")!.clearRect(0, 0, c.width, c.height); onChange(null); }} className="mx-auto mt-2 block h-8 px-3 text-[14px] text-brand">Ambil Ulang</button>}
    </div>
  );
}

/* ---------- bill ---------- */
/** Summary card shown where the bill sits on the initial page (Ubah opens the editor). */
export function BillSummary({ title, value, onEdit }: { title: string; value?: BillValue; onEdit?: () => void }) {
  const t = billTotals(value);
  return (
    <div className="mx-4 my-3 border-y-8 border-[#f2f2f2] py-3">
      <div className="flex items-center justify-between"><span className="text-[18px] font-semibold">{title}</span>{onEdit && <button onClick={onEdit} className="text-[14px] text-brand">Ubah</button>}</div>
      {[["Total Barang Diproses", t.count], ["Total QTY yang Diproses", t.qty], ["Sub Total Harga Barang", num(t.sub)], ["Sub Total Biaya", num(t.subCost)]].map(([k, v]) => (
        <div key={k} className="mt-2.5 flex justify-between text-[14px]"><span>{k}</span><span>{v}</span></div>
      ))}
      <div className="mt-2.5 flex justify-between border-t border-line pt-2.5 text-[16px] font-semibold"><span>Total Bill</span><span>{num(t.total)}</span></div>
    </div>
  );
}

export type BillTab = "Barang" | "Biaya" | "Ringkasan";

/** Bill editor body: chip tabs, item / cost lists with stepper, FAB + picker sheet, Ringkasan table. */
export function BillEditor({ c, value, onChange, tab, setTab, readOnly }: { c: BillC; value: BillValue; onChange: (v: BillValue) => void; tab: BillTab; setTab: (t: BillTab) => void; readOnly?: boolean }) {
  const [picker, setPicker] = useState(false);
  const [q, setQ] = useState("");
  const t = billTotals(value);
  const setQty = (i: number, qty: number) => onChange({ ...value, items: value.items.map((it, j) => (j === i ? { ...it, qty: Math.max(0, qty) } : it)) });
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 gap-2 px-4 py-2">
        {(["Barang", "Biaya", "Ringkasan"] as BillTab[]).map((x) => (
          <button key={x} onClick={() => setTab(x)} className={cx("h-[42px] rounded-full px-5 text-[16px]", tab === x ? "bg-[#0288d1] text-white" : "bg-[#e1f5fe] text-[#039be5]")}>{x}</button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pb-20 no-scrollbar">
        {tab === "Barang" && (
          <>
            <div className="flex items-center justify-between px-4 py-2"><span className="text-[20px] font-semibold">Barang</span><span className="text-[16px] font-semibold">{value.items.length} Item</span></div>
            {!value.items.length && <Empty text="Tidak ada Data Bill yang ditemukan" />}
            {value.items.map((it, i) => (
              <div key={it.name} className="flex items-center gap-3 border-b border-white bg-[#eeeeee] px-4 py-3">
                {!readOnly && <button aria-label="Hapus" onClick={() => onChange({ ...value, items: value.items.filter((_, j) => j !== i) })}><Trash2 className="size-5 text-sub" strokeWidth={1.6} /></button>}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[17px] text-[#424242]">{it.name}</div>
                  <div className="text-[12px] text-[#424242]">Harga Satuan : {num(it.unitPrice)}</div>
                </div>
                {readOnly ? <span className="text-[16px]">{it.qty}</span> : (
                  <div className="flex items-center">
                    <button aria-label="Kurangi" onClick={() => setQty(i, it.qty - 1)} className="grid size-10 place-items-center text-[26px] font-light text-[#424242]">−</button>
                    <input value={it.qty} inputMode="numeric" onChange={(e) => setQty(i, Number(e.target.value.replace(/\D/g, "")) || 0)} className="h-10 w-12 border-b border-[#9e9e9e] bg-transparent text-center text-[16px] outline-none" />
                    <button aria-label="Tambah" onClick={() => setQty(i, it.qty + 1)} className="grid size-10 place-items-center text-[26px] font-light text-[#424242]">+</button>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
        {tab === "Biaya" && (
          <>
            <div className="flex items-center justify-between px-4 py-2"><span className="text-[20px] font-semibold">Biaya / Diskon</span><span className="text-[16px] font-semibold">{value.costs.length} Item</span></div>
            {!value.costs.length && <Empty text="Tidak ada Data Biaya yang ditemukan" />}
            {value.costs.map((co, i) => (
              <div key={co.name} className="flex items-center gap-3 border-b border-white bg-[#eeeeee] px-4 py-3">
                {!readOnly && <button aria-label="Hapus" onClick={() => onChange({ ...value, costs: value.costs.filter((_, j) => j !== i) })}><Trash2 className="size-5 text-sub" strokeWidth={1.6} /></button>}
                <div className="flex-1 text-[17px] text-[#424242]">{co.name}</div>
                <div className="text-[15px]">{co.type === "discount" ? "-" : ""}{num(co.amount)}</div>
              </div>
            ))}
          </>
        )}
        {tab === "Ringkasan" && (
          <div className="flex min-h-full flex-col">
            <div className="px-4 py-2 text-[20px] font-semibold">Barang</div>
            <div className="grid grid-cols-[1fr_48px_80px_80px] px-4 text-[13px] font-semibold"><span>Nama</span><span className="text-right">Qty</span><span className="text-right">Harga</span><span className="text-right">Total</span></div>
            {value.items.map((it) => (
              <div key={it.name} className="grid grid-cols-[1fr_48px_80px_80px] px-4 pt-2 text-[13px] text-[#616161]"><span className="truncate">{it.name}</span><span className="text-right">{it.qty}</span><span className="text-right">{num(it.unitPrice)}</span><span className="text-right">{num(it.qty * it.unitPrice)}</span></div>
            ))}
            <div className="mx-4 mt-3 flex justify-between border-t border-line pt-3 text-[15px] font-semibold"><span>Subtotal Barang</span><span>{num(t.sub)}</span></div>
            <div className="mt-4 h-2 bg-[#f2f2f2]" />
            <div className="flex items-center justify-between px-4 py-3"><span className="text-[18px] font-semibold">Biaya</span>{!value.costs.length && <span className="text-[13px]">Tidak ada Data Biaya</span>}</div>
            {value.costs.map((co) => <div key={co.name} className="flex justify-between px-4 pb-1 text-[13px] text-[#616161]"><span>{co.name}</span><span>{co.type === "discount" ? "-" : ""}{num(co.amount)}</span></div>)}
            <div className="mt-auto h-2 bg-[#f2f2f2]" />
            <div className="flex justify-between px-4 py-3 text-[16px] font-semibold"><span>Total Bill</span><span>{num(t.total)}</span></div>
          </div>
        )}
      </div>
      {!readOnly && c.addNew && tab !== "Ringkasan" && (
        <button aria-label="Tambah item" onClick={() => { setQ(""); setPicker(true); }} className="absolute bottom-3 right-4 grid size-[52px] place-items-center rounded-full bg-bar text-white shadow-lg">
          <span className="text-[30px] font-light leading-none">+</span>
        </button>
      )}
      {picker && (
        <div className="absolute inset-0 z-40 flex flex-col">
          <div className="mf-fade h-6 bg-black/45" onClick={() => setPicker(false)} />
          <div className="mf-sheet flex min-h-0 flex-1 flex-col rounded-t-[22px] bg-white">
            <div className="flex h-14 items-center gap-3 px-4">
              <button aria-label="Tutup" onClick={() => setPicker(false)}><X className="size-6" /></button>
              <span className="text-[19px] font-semibold">{tab === "Biaya" ? "Item Biaya" : "Item Tagihan"}</span>
            </div>
            <div className="mx-4 flex h-12 items-center gap-2 rounded border border-[#9e9e9e] px-3">
              <Search className="size-5 text-sub" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === "Biaya" ? "Cari biaya" : "Cari barang"} className="flex-1 bg-transparent text-[16px] outline-none" />
            </div>
            <ul className="mt-2 min-h-0 flex-1 overflow-y-auto px-4 no-scrollbar">
              {tab === "Biaya"
                ? c.masterCosts.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()) && !value.costs.some((x) => x.name === m.name)).map((m) => (
                    <li key={m.name}><button onClick={() => { onChange({ ...value, costs: [...value.costs, { ...m }] }); setPicker(false); }} className="w-full border-b border-line py-3 text-left">
                      <div className="text-[15px] font-semibold">{m.name}</div><div className="text-[13px] text-sub">{m.type === "discount" ? "Diskon" : "Biaya"} {num(m.amount)}</div>
                    </button></li>
                  ))
                : c.masterItems.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()) && !value.items.some((x) => x.name === m.name)).map((m) => (
                    <li key={m.name}><button onClick={() => { onChange({ ...value, items: [...value.items, { name: m.name, unitPrice: m.unit_price, qty: 0 }] }); setPicker(false); }} className="w-full border-b border-line py-3 text-left">
                      <div className="text-[15px] font-semibold">{m.name}</div><div className="text-[13px] text-sub">Harga satuan {num(m.unit_price)}</div>
                    </button></li>
                  ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center pt-24 text-[14px]">
      <div className="relative mb-4 size-16">
        <Search className="size-16 text-[#90caf9]" strokeWidth={1.4} />
        <span className="absolute left-[22px] top-[14px] text-[18px] font-bold text-brand">?</span>
      </div>
      {text}
    </div>
  );
}

/* ---------- hub selector on the initial page ---------- */
export function HubSelect({ value }: { value: string }) {
  return (
    <div className="flex h-[66px] shrink-0 items-center justify-end border-b-8 border-[#f2f2f2] px-2">
      <div className="flex h-[45px] w-[185px] items-center justify-between rounded border border-[#9e9e9e] px-3 text-[15px]">{value}<ChevronsUpDown className="size-4" /></div>
    </div>
  );
}

export { ChevronDown };
