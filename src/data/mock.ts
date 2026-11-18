/* Dummy data for the Mile Field mockup. Products and price groups match poc/sales-ops-web. */

export type OutletClass = "A" | "B" | "C";
export type CustomerStatus = "Baru" | "Lama – sudah beli" | "Lama – belum beli";

export interface Outlet {
  id: string;
  code: string;
  name: string;
  owner: string;
  phone: string;
  address: string;
  cls: OutletClass;
  /** channel / segment, same list as the Sales Operations module (assortment key with cls). */
  segment: string;
  status: CustomerStatus;
  priceGroup: "Retail" | "Grosir" | "Horeka / Industri";
  creditLimit: number;
  outstanding: number;
  overdue: number;
  overdueDays: number;
  top: number;
  gps?: { lat: number; lng: number };
  /** Distance (m) of the demo device from the outlet pin at check-in time. */
  demoDistance: number;
  lastOrder?: { no: string; date: string; total: number; status: string; items: { productId: string; uom: string; qty: number }[] };
  prospect?: boolean;
}

export interface UomPrice { uom: string; price: number; conv: number }
export interface Product { id: string; sku: string; name: string; category: string; uoms: UomPrice[] }

export const SALESMAN = {
  name: "Budi Santoso",
  email: "budi.santoso@unggulplastik.co.id",
  branch: "Cabang Surabaya",
  route: "Rute Rabu – Kenjeran",
  org: "unggul-plastik",
};

export const AS_OF = "18 Nov 2026 06:00";
export const TODAY = "Rabu, 18 Nov 2026";

export const PRODUCTS: Product[] = [
  { id: "P01", sku: "UP-KHD-2440", name: "Kantong Plastik HD 24x40", category: "Kantong", uoms: [{ uom: "pack", price: 18500, conv: 1 }, { uom: "karton", price: 362000, conv: 20 }] },
  { id: "P02", sku: "UP-KHD-3555", name: "Kantong Plastik HD 35x55", category: "Kantong", uoms: [{ uom: "pack", price: 27500, conv: 1 }, { uom: "karton", price: 540000, conv: 20 }] },
  { id: "P03", sku: "UP-GPP-16", name: "Gelas Plastik PP 16 oz", category: "Food Packaging", uoms: [{ uom: "pack", price: 21000, conv: 1 }, { uom: "karton", price: 1000000, conv: 50 }] },
  { id: "P04", sku: "UP-TW-500", name: "Thinwall 500 ml + Tutup", category: "Food Packaging", uoms: [{ uom: "pack", price: 32000, conv: 1 }, { uom: "karton", price: 780000, conv: 25 }] },
  { id: "P05", sku: "UP-PET-600", name: "Botol PET 600 ml", category: "Botol", uoms: [{ uom: "pcs", price: 850, conv: 1 }, { uom: "karton", price: 196000, conv: 240 }] },
  { id: "P06", sku: "UP-WRP-30", name: "Plastik Wrap 30 cm x 500 m", category: "Film", uoms: [{ uom: "pcs", price: 98000, conv: 1 }, { uom: "karton", price: 1150000, conv: 12 }] },
  { id: "P07", sku: "UP-EMB-15", name: "Ember Plastik 15 L", category: "Rumah Tangga", uoms: [{ uom: "pcs", price: 24500, conv: 1 }, { uom: "karton", price: 285000, conv: 12 }] },
  { id: "P08", sku: "UP-KFG-1000", name: "Kontainer Food Grade 1000 ml", category: "Food Packaging", uoms: [{ uom: "pack", price: 45000, conv: 1 }, { uom: "karton", price: 870000, conv: 20 }] },
  { id: "P09", sku: "UP-SDT-6", name: "Sedotan Steril 6 mm", category: "Food Packaging", uoms: [{ uom: "pack", price: 9500, conv: 1 }, { uom: "karton", price: 460000, conv: 50 }] },
  { id: "P11", sku: "UP-KRG-5090", name: "Karung Plastik 50x90", category: "Karung", uoms: [{ uom: "pcs", price: 2300, conv: 1 }, { uom: "bal", price: 225000, conv: 100 }] },
  { id: "P12", sku: "UP-STR-PE", name: "Stretch Film PE 50 cm", category: "Film", uoms: [{ uom: "pcs", price: 112000, conv: 1 }, { uom: "karton", price: 640000, conv: 6 }] },
];
export const productById = (id: string) => PRODUCTS.find((p) => p.id === id)!;
export const CATEGORIES = Array.from(new Set(PRODUCTS.map((p) => p.category)));

/** Price-group factor, same rule as the web POC price lists (Grosir −4%, Horeka −2%). */
export function priceFor(p: Product, uom: string, group: Outlet["priceGroup"]): number {
  const base = p.uoms.find((u) => u.uom === uom)!.price;
  const f = group === "Grosir" ? 0.96 : group === "Horeka / Industri" ? 0.98 : 1;
  return Math.round((base * f) / 100) * 100;
}

export const OUTLETS: Outlet[] = [
  { id: "O1", code: "SBY-0142", name: "Toko Plastik Sumber Rejeki", owner: "Hendra Wijaya", phone: "081231234501", address: "Jl. Kenjeran No. 112, Surabaya", cls: "A", segment: "Grosir Plastik", status: "Lama – sudah beli", priceGroup: "Grosir", creditLimit: 50_000_000, outstanding: 31_400_000, overdue: 0, overdueDays: 0, top: 30, gps: { lat: -7.2489, lng: 112.7795 }, demoDistance: 24,
    lastOrder: { no: "SO-SBY-202611-0009", date: "11 Nov 2026", total: 7_548_000, status: "Dikirim", items: [{ productId: "P01", uom: "karton", qty: 10 }, { productId: "P02", uom: "karton", qty: 4 }, { productId: "P09", uom: "pack", qty: 20 }] } },
  { id: "O2", code: "SBY-0157", name: "UD Makmur Jaya", owner: "Siti Rahayu", phone: "081231234502", address: "Jl. Tambak Wedi Baru 8, Surabaya", cls: "B", segment: "Toko Kemasan", status: "Lama – sudah beli", priceGroup: "Retail", creditLimit: 20_000_000, outstanding: 18_900_000, overdue: 4_250_000, overdueDays: 12, top: 14, gps: { lat: -7.2311, lng: 112.7769 }, demoDistance: 41,
    lastOrder: { no: "SO-SBY-202610-0131", date: "28 Okt 2026", total: 2_310_000, status: "Selesai", items: [{ productId: "P03", uom: "pack", qty: 40 }, { productId: "P04", uom: "pack", qty: 30 }] } },
  { id: "O3", code: "SBY-0163", name: "Kedai Kopi Pantai Ria", owner: "Agus Salim", phone: "081231234503", address: "Jl. Pantai Ria Kenjeran 21, Surabaya", cls: "C", segment: "Horeka", status: "Lama – belum beli", priceGroup: "Horeka / Industri", creditLimit: 5_000_000, outstanding: 0, overdue: 0, overdueDays: 0, top: 7, gps: { lat: -7.2402, lng: 112.7951 }, demoDistance: 168 },
  { id: "O4", code: "SBY-0171", name: "Grosir Plastik Abadi", owner: "Lukas Tanoto", phone: "081231234504", address: "Jl. Sukolilo Lor 45, Surabaya", cls: "A", segment: "Grosir Plastik", status: "Lama – sudah beli", priceGroup: "Grosir", creditLimit: 75_000_000, outstanding: 42_000_000, overdue: 0, overdueDays: 0, top: 30, gps: { lat: -7.2551, lng: 112.7882 }, demoDistance: 12,
    lastOrder: { no: "SO-SBY-202611-0004", date: "4 Nov 2026", total: 14_850_000, status: "Selesai", items: [{ productId: "P06", uom: "karton", qty: 5 }, { productId: "P12", uom: "karton", qty: 8 }, { productId: "P11", uom: "bal", qty: 10 }] } },
  { id: "O5", code: "SBY-0188", name: "Toko Kue Bu Ani", owner: "Ani Lestari", phone: "081231234505", address: "Jl. Bulak Banteng 17, Surabaya", cls: "C", segment: "Toko Kemasan", status: "Lama – sudah beli", priceGroup: "Retail", creditLimit: 3_000_000, outstanding: 640_000, overdue: 0, overdueDays: 0, top: 7, gps: { lat: -7.2265, lng: 112.7612 }, demoDistance: 55,
    lastOrder: { no: "SO-SBY-202610-0145", date: "30 Okt 2026", total: 640_000, status: "Selesai", items: [{ productId: "P08", uom: "pack", qty: 8 }, { productId: "P04", uom: "pack", qty: 9 }] } },
  { id: "O6", code: "SBY-0193", name: "RM Sederhana Kenjeran", owner: "Rudi Hartono", phone: "081231234506", address: "Jl. Kenjeran No. 330, Surabaya", cls: "B", segment: "Horeka", status: "Lama – sudah beli", priceGroup: "Horeka / Industri", creditLimit: 15_000_000, outstanding: 5_120_000, overdue: 0, overdueDays: 0, top: 14, gps: { lat: -7.2447, lng: 112.7705 }, demoDistance: 33,
    lastOrder: { no: "SO-SBY-202611-0002", date: "3 Nov 2026", total: 5_120_000, status: "Dikirim", items: [{ productId: "P04", uom: "karton", qty: 4 }, { productId: "P03", uom: "karton", qty: 2 }] } },
  { id: "O7", code: "SBY-0207", name: "Toko Serba Ada Mulyo", owner: "Wahyu Prasetyo", phone: "081231234507", address: "Jl. Wonosari Lor 3, Surabaya", cls: "B", segment: "Toko Kelontong", status: "Lama – sudah beli", priceGroup: "Retail", creditLimit: 10_000_000, outstanding: 2_400_000, overdue: 0, overdueDays: 0, top: 14, gps: { lat: -7.2350, lng: 112.7550 }, demoDistance: 18,
    lastOrder: { no: "SO-SBY-202610-0120", date: "21 Okt 2026", total: 2_400_000, status: "Selesai", items: [{ productId: "P07", uom: "pcs", qty: 48 }, { productId: "P01", uom: "pack", qty: 66 }] } },
  { id: "O8", code: "PRS-0012", name: "Calon: Toko Plastik Berkah", owner: "Yusuf Hamdani", phone: "081231234508", address: "Jl. Tanah Merah Utara 9, Surabaya", cls: "C", segment: "Toko Kemasan", status: "Baru", priceGroup: "Retail", creditLimit: 0, outstanding: 0, overdue: 0, overdueDays: 0, top: 0, demoDistance: 0, prospect: true },
  // Outside today's route: for Kunjungan Ekstra
  { id: "O9", code: "SBY-0215", name: "Toko Plastik Maju Bersama", owner: "Andreas Gunawan", phone: "081231234509", address: "Jl. Mulyorejo Utara 50, Surabaya", cls: "B", segment: "Toko Kelontong", status: "Lama – sudah beli", priceGroup: "Retail", creditLimit: 12_000_000, outstanding: 3_300_000, overdue: 0, overdueDays: 0, top: 14, gps: { lat: -7.2660, lng: 112.7850 }, demoDistance: 27,
    lastOrder: { no: "SO-SBY-202610-0099", date: "14 Okt 2026", total: 3_300_000, status: "Selesai", items: [{ productId: "P02", uom: "pack", qty: 60 }, { productId: "P09", uom: "pack", qty: 20 }] } },
  { id: "O10", code: "SBY-0222", name: "CV Sentosa Packaging", owner: "Melinda Halim", phone: "081231234510", address: "Jl. Kalijudan 77, Surabaya", cls: "A", segment: "Agen / Sub-distributor", status: "Lama – sudah beli", priceGroup: "Grosir", creditLimit: 60_000_000, outstanding: 12_700_000, overdue: 0, overdueDays: 0, top: 30, gps: { lat: -7.2580, lng: 112.7710 }, demoDistance: 46 },
];
export const outletById = (id: string) => OUTLETS.find((o) => o.id === id)!;

export type VisitSource = "PJP" | "Follow-up" | "Carry-over" | "Ekstra";
export type VisitStatus = "Belum" | "Berjalan" | "Selesai" | "Dilewati";

export interface PlannedVisit { id: string; outletId: string; seq: number; source: VisitSource }
export const TODAY_PLAN: PlannedVisit[] = [
  { id: "V1", outletId: "O1", seq: 1, source: "PJP" },
  { id: "V2", outletId: "O2", seq: 2, source: "PJP" },
  { id: "V3", outletId: "O3", seq: 3, source: "PJP" },
  { id: "V4", outletId: "O4", seq: 4, source: "PJP" },
  { id: "V5", outletId: "O8", seq: 5, source: "Follow-up" },
  { id: "V6", outletId: "O5", seq: 6, source: "PJP" },
  { id: "V7", outletId: "O6", seq: 7, source: "PJP" },
  { id: "V8", outletId: "O7", seq: 8, source: "Carry-over" },
];

export const SKIP_REASONS = ["Toko tutup", "Pemilik tidak ada", "Di luar jam kerja", "Dijadwalkan ulang", "Lainnya"];
export const NO_ORDER_REASONS = ["Stok masih cukup", "Harga kompetitor lebih murah", "Menunggu pembayaran", "Pemilik tidak ada", "Lainnya"];
export const COMPETITOR_BRANDS = ["Tiga Kelinci", "Lion Star", "Claris", "Maspion", "Lainnya"];
export const FEEDBACK_CATEGORIES = ["Harga", "Kualitas", "Pengiriman", "Promo kompetitor", "Produk baru"];
export const RETURN_REASONS = ["Rusak / cacat", "Salah kirim", "Kedaluwarsa / berubah warna", "Kelebihan kirim"];
export const PIPELINE_STAGES = ["Prospek", "Dijadwalkan", "Kunjungan & Negosiasi", "Menang", "Batal"];

/** Visit checklist per outlet class (PRD 14 FR-012, default proposal). */
export const CHECKLIST: Record<OutletClass, { item: string; required: boolean }[]> = {
  A: [
    { item: "Cek stok produk utama", required: true },
    { item: "Tawarkan produk baru / program", required: true },
    { item: "Ingatkan piutang jatuh tempo", required: false },
    { item: "Foto display", required: false },
  ],
  B: [
    { item: "Cek stok produk utama", required: true },
    { item: "Tawarkan program", required: false },
    { item: "Ingatkan piutang jatuh tempo", required: false },
  ],
  C: [
    { item: "Cek stok produk utama", required: true },
    { item: "Tawarkan program", required: false },
    { item: "Ingatkan piutang jatuh tempo", required: false },
  ],
};

/** Discount above this needs SPV approval in the module (PRD 06 LOA tier 1). */
export const SALES_DISCOUNT_LIMIT = 5;

export interface Invoice { no: string; outletId: string; date: string; due: string; total: number; open: number; items: { productId: string; uom: string; qty: number; price: number }[] }
export const INVOICES: Invoice[] = [
  { no: "INV-SBY-202611-0041", outletId: "O1", date: "12 Nov 2026", due: "12 Des 2026", total: 7_548_000, open: 7_548_000, items: [{ productId: "P01", uom: "karton", qty: 10, price: 347_500 }, { productId: "P02", uom: "karton", qty: 4, price: 518_400 }, { productId: "P09", uom: "pack", qty: 20, price: 9_100 }] },
  { no: "INV-SBY-202610-0188", outletId: "O1", date: "20 Okt 2026", due: "19 Nov 2026", total: 9_870_000, open: 4_870_000, items: [{ productId: "P03", uom: "karton", qty: 6, price: 960_000 }, { productId: "P08", uom: "karton", qty: 4, price: 835_200 }] },
  { no: "INV-SBY-202610-0151", outletId: "O2", date: "28 Okt 2026", due: "11 Nov 2026", total: 2_310_000, open: 2_310_000, items: [{ productId: "P03", uom: "pack", qty: 40, price: 21_000 }, { productId: "P04", uom: "pack", qty: 30, price: 32_000 }] },
  { no: "INV-SBY-202610-0097", outletId: "O2", date: "14 Okt 2026", due: "28 Okt 2026", total: 1_940_000, open: 1_940_000, items: [{ productId: "P01", uom: "pack", qty: 60, price: 18_500 }, { productId: "P09", uom: "pack", qty: 87, price: 9_500 }] },
  { no: "INV-SBY-202611-0018", outletId: "O4", date: "5 Nov 2026", due: "5 Des 2026", total: 14_850_000, open: 14_850_000, items: [{ productId: "P06", uom: "karton", qty: 5, price: 1_104_000 }, { productId: "P12", uom: "karton", qty: 8, price: 614_400 }, { productId: "P11", uom: "bal", qty: 10, price: 216_000 }] },
  { no: "INV-SBY-202611-0007", outletId: "O6", date: "3 Nov 2026", due: "17 Nov 2026", total: 5_120_000, open: 5_120_000, items: [{ productId: "P04", uom: "karton", qty: 4, price: 764_400 }, { productId: "P03", uom: "karton", qty: 2, price: 980_000 }] },
  { no: "INV-SBY-202610-0166", outletId: "O5", date: "30 Okt 2026", due: "6 Nov 2026", total: 640_000, open: 640_000, items: [{ productId: "P08", uom: "pack", qty: 8, price: 45_000 }, { productId: "P04", uom: "pack", qty: 9, price: 32_000 }] },
];

export const DEPOSIT_TARGETS = ["Kasir Cabang Surabaya", "Transfer ke rekening BCA UP 0881234567"];

/** Assortment per segment x class, published by the Sales Operations module (same seed as poc/sales-ops-web). [productId, mustSell] */
export const ASSORTMENT: Record<string, [string, boolean][]> = {
  "Grosir Plastik|A": [["P01", true], ["P02", true], ["P06", true], ["P11", false], ["P12", false], ["P07", false], ["P03", false]],
  "Grosir Plastik|B": [["P01", true], ["P02", true], ["P11", false], ["P07", false]],
  "Toko Kemasan|B": [["P03", true], ["P04", true], ["P09", false], ["P08", false]],
  "Toko Kemasan|C": [["P03", true], ["P04", false], ["P09", false]],
  "Horeka|B": [["P04", true], ["P03", false], ["P09", false]],
  "Toko Kelontong|B": [["P01", true], ["P07", false], ["P09", false]],
  "Agen / Sub-distributor|A": [["P01", true], ["P02", true], ["P03", true], ["P04", false], ["P11", false], ["P12", false]],
};
/** Products offered to an outlet; no assortment for its segment x class → all products (module setting "fallback = all"). */
export function assortmentOf(o: Outlet): { productId: string; mustSell: boolean }[] {
  const a = ASSORTMENT[`${o.segment}|${o.cls}`];
  return a ? a.map(([productId, mustSell]) => ({ productId, mustSell })) : PRODUCTS.map((p) => ({ productId: p.id, mustSell: false }));
}
