/*
  UP flows expressed as Mile Field flow configuration (standard components only).
  The same JSON shape can be posted to POST /api/v3/flow (see research-flow/flow.json).
*/
import { INVOICES, OUTLETS, PRODUCTS } from "@/data/mock";
import type { BillItemMaster, Component, Flow, OnSelectRule } from "./types";

const PRODUCT_ITEMS: BillItemMaster[] = PRODUCTS.flatMap((p) => p.uoms.map((u) => ({ name: `${p.name} (${u.uom})`, unit_price: u.price })));

const inp = (id: string, title: string, type: Extract<Component, { component: "input" }>["type"], extra: object = {}): Component =>
  ({ component: "input", id, title, type, visible: true, required: false, showAs: null, routeAs: null, ...extra }) as Component;
const sel = (id: string, title: string, options: string[], extra: { max?: number; onSelect?: OnSelectRule[]; visible?: boolean; showAs?: "title" | "content" | "label"; routeAs?: string } = {}): Component =>
  ({ component: "select", type: "dropdown", id, title, options, min: 0, max: extra.max ?? 1, visible: extra.visible ?? true, required: false, onSelect: extra.onSelect ?? [], showAs: extra.showAs ?? null, routeAs: extra.routeAs ?? null }) as Component;
const view = (id: string, title: string, type: Extract<Component, { component: "view" }>["type"], value: string): Component => ({ component: "view", id, title, type, value, visible: true });
const photo = (id: string, title: string, min: number, max: number, visible = true): Component => ({ component: "photo", id, title, min, max, watermark: true, selectGallery: false, visible, required: min > 0 });
const sign = (id: string, title: string): Component => ({ component: "signature", id, title, visible: true, required: false });

/* ---------- Kunjungan (PRD 14 + 15): task created by Sales Operations from the PJP ---------- */
const VISIT_HIDE_WHEN_SKIPPED = ["lokasiCheckin", "fotoToko", "pesanan", "checklistKunjungan", "merekKompetitor", "produkKompetitor", "hargaKompetitor", "fotoKompetitor", "hasilKunjungan", "catatanKunjungan", "tanggalFollowup", "tandaTanganPelanggan"];

export const FLOW_KUNJUNGAN: Flow = {
  name: "Kunjungan",
  prd: "14-milefield-visit, 15-milefield-order",
  pages: [
    { id: "page0", title: "Initial Page", enabled: true, components: [
      inp("namaOutlet", "Nama Outlet", "String", { showAs: "title", routeAs: "VisitName" }),
      inp("alamatOutlet", "Alamat Outlet", "Address", { showAs: "content", routeAs: "Address" }),
      inp("lokasiOutlet", "Lokasi Outlet", "Geolocation", { routeAs: "Coordinate" }),
      sel("kelasOutlet", "Kelas Outlet", ["A", "B", "C"], { showAs: "label", routeAs: "Tag" }),
      inp("kodeOutlet", "Kode Outlet", "String"),
      inp("teleponOutlet", "Telepon", "PhoneNumber"),
      inp("limitKredit", "Limit Kredit", "Numeric", { min: 0, max: 999999999 }),
      inp("outstanding", "Outstanding", "Numeric", { min: 0, max: 999999999 }),
      inp("overdue", "Overdue", "Numeric", { min: 0, max: 999999999 }),
      inp("sisaLimit", "Sisa Limit", "Numeric", { min: 0, max: 999999999 }),
      inp("pesananTerakhir", "Pesanan Terakhir", "String"),
    ] },
    { id: "page1", title: "Info Outlet", components: [
      view("infoNama", "Nama Outlet", "String", "$namaOutlet"),
      view("infoKode", "Kode Outlet", "String", "$kodeOutlet"),
      view("infoAlamat", "Alamat", "Address", "$alamatOutlet"),
      view("infoLokasi", "Lokasi Outlet", "Geolocation", "$lokasiOutlet"),
      view("infoTelepon", "Telepon", "PhoneNumber", "$teleponOutlet"),
      view("infoLimit", "Limit Kredit", "Numeric", "$limitKredit"),
      view("infoOutstanding", "Outstanding", "Numeric", "$outstanding"),
      view("infoOverdue", "Overdue", "Numeric", "$overdue"),
      view("infoSisa", "Sisa Limit", "Numeric", "$sisaLimit"),
      view("infoPesanan", "Pesanan Terakhir", "String", "$pesananTerakhir"),
      sel("statusKunjungan", "Status Kunjungan", ["Dikunjungi", "Dilewati"], {
        onSelect: [
          { options: ["Dilewati"], action: "show", componentAffected: ["alasanLewati"] },
          { options: ["Dilewati"], action: "hide", componentAffected: VISIT_HIDE_WHEN_SKIPPED },
          { options: ["Dikunjungi"], action: "hide", componentAffected: ["alasanLewati"] },
          { options: ["Dikunjungi"], action: "show", componentAffected: VISIT_HIDE_WHEN_SKIPPED },
        ],
      }),
      sel("alasanLewati", "Alasan Dilewati", ["Toko tutup", "Pemilik tidak ada", "Di luar jam kerja", "Dijadwalkan ulang", "Lainnya"], { visible: false }),
    ] },
    { id: "page2", title: "Check-in", components: [
      inp("lokasiCheckin", "Lokasi Check-in", "Geolocation", { required: true, useGeoLock: true, radius: 100, geoLockTrigger: "onTaskStart" }),
      photo("fotoToko", "Foto Toko", 1, 3),
    ] },
    { id: "page3", title: "Pesanan", components: [
      { component: "bill", id: "pesanan", title: "Pesanan", addNew: true, value: null, visible: true, required: false, editable: ["qty"],
        masterItems: PRODUCT_ITEMS,
        masterCosts: [{ type: "discount", name: "Diskon Program", amount: 50000 }, { type: "cost", name: "Ongkos Kirim", amount: 25000 }] },
    ] },
    { id: "page4", title: "Checklist & Survey", components: [
      sel("checklistKunjungan", "Checklist Kunjungan", ["Cek stok produk utama", "Tawarkan produk baru / program", "Ingatkan piutang jatuh tempo", "Foto display"], { max: 4 }),
      sel("merekKompetitor", "Merek Kompetitor", ["Tiga Kelinci", "Lion Star", "Claris", "Maspion", "Lainnya"]),
      inp("produkKompetitor", "Produk Kompetitor", "String"),
      inp("hargaKompetitor", "Harga Kompetitor", "Numeric", { min: 0, max: 99999999 }),
      photo("fotoKompetitor", "Foto Kompetitor", 0, 3),
    ] },
    { id: "page5", title: "Hasil Kunjungan", components: [
      sel("hasilKunjungan", "Hasil Kunjungan", ["Order", "Tidak Order"], {
        onSelect: [
          { options: ["Tidak Order"], action: "show", componentAffected: ["alasanTidakOrder"] },
          { options: ["Order"], action: "hide", componentAffected: ["alasanTidakOrder"] },
        ],
      }),
      sel("alasanTidakOrder", "Alasan Tidak Order", ["Stok masih cukup", "Harga kompetitor lebih murah", "Menunggu pembayaran", "Pemilik tidak ada", "Lainnya"], { visible: false }),
      inp("catatanKunjungan", "Catatan", "String"),
      inp("tanggalFollowup", "Tanggal Follow-up", "Date"),
      sign("tandaTanganPelanggan", "Tanda Tangan Pelanggan"),
    ] },
  ],
};

/* ---------- Pelanggan Baru / NOO (PRD 16) ---------- */
export const FLOW_NOO: Flow = {
  name: "Pelanggan Baru",
  prd: "16-milefield-noo",
  pages: [
    { id: "page0", title: "Initial Page", enabled: true, components: [
      inp("namaToko", "Nama Toko", "String", { showAs: "title", routeAs: "VisitName", required: true }),
      inp("alamatToko", "Alamat Toko", "Address", { showAs: "content", routeAs: "Address", required: true }),
      inp("lokasiToko", "Lokasi Toko", "Geolocation", { routeAs: "Coordinate", required: true }),
      sel("jenisUsaha", "Jenis Usaha", ["Toko plastik / kemasan", "Grosir", "Horeka", "Industri", "Toko kelontong"], { showAs: "label" }),
      inp("namaPemilik", "Nama Pemilik", "String", { required: true }),
      inp("teleponPemilik", "Telepon Pemilik", "PhoneNumber", { required: true }),
    ] },
    { id: "page1", title: "Dokumen", components: [
      photo("fotoTokoNoo", "Foto Toko", 1, 2),
      photo("fotoKtp", "Foto KTP", 1, 1),
      sel("statusPkp", "Pengusaha Kena Pajak (PKP)", ["Ya", "Tidak"], {
        onSelect: [
          { options: ["Ya"], action: "show", componentAffected: ["fotoNpwp"] },
          { options: ["Tidak"], action: "hide", componentAffected: ["fotoNpwp"] },
        ],
      }),
      photo("fotoNpwp", "Foto NPWP", 0, 1, false),
    ] },
    { id: "page2", title: "Usulan Kredit", components: [
      inp("usulanLimit", "Usulan Limit Kredit", "Numeric", { min: 0, max: 999999999 }),
      sel("usulanTop", "Usulan TOP", ["Tunai", "7 hari", "14 hari", "30 hari"]),
      inp("catatanNoo", "Catatan", "String"),
    ] },
  ],
};

/* ---------- Retur (PRD 17) ---------- */
export const FLOW_RETUR: Flow = {
  name: "Retur",
  prd: "17-retur",
  pages: [
    { id: "page0", title: "Initial Page", enabled: true, components: [
      sel("outletRetur", "Nama Outlet", OUTLETS.filter((o) => !o.prospect).map((o) => o.name), { showAs: "title" }),
      sel("fakturAsal", "Faktur Asal", INVOICES.map((i) => i.no), { showAs: "content" }),
    ] },
    { id: "page1", title: "Barang Retur", components: [
      { component: "bill", id: "barangRetur", title: "Barang Retur", addNew: true, value: null, visible: true, required: false, editable: ["qty"],
        masterItems: PRODUCT_ITEMS, masterCosts: [{ type: "discount", name: "Potongan Retur", amount: 0 }] },
    ] },
    { id: "page2", title: "Alasan & Bukti", components: [
      sel("alasanRetur", "Alasan Retur", ["Rusak / cacat", "Salah kirim", "Kedaluwarsa / berubah warna", "Kelebihan kirim"]),
      photo("fotoBarangRetur", "Foto Barang", 1, 3),
      inp("catatanRetur", "Catatan", "String"),
    ] },
  ],
};

/* ---------- Penagihan (PRD 18) ---------- */
export const FLOW_PENAGIHAN: Flow = {
  name: "Penagihan",
  prd: "18-collection",
  pages: [
    { id: "page0", title: "Initial Page", enabled: true, components: [
      sel("outletTagih", "Nama Outlet", OUTLETS.filter((o) => !o.prospect).map((o) => o.name), { showAs: "title" }),
      sel("fakturDitagih", "Faktur Ditagih", INVOICES.map((i) => i.no), { max: 5 }),
    ] },
    { id: "page1", title: "Pembayaran", components: [
      inp("nilaiDibayar", "Nilai Dibayar", "Numeric", { min: 0, max: 999999999, required: true }),
      sel("metodeBayar", "Metode Pembayaran", ["Tunai", "Transfer", "Giro"], {
        onSelect: [
          { options: ["Giro"], action: "show", componentAffected: ["nomorGiro", "bankGiro", "jatuhTempoGiro"] },
          { options: ["Tunai", "Transfer"], action: "hide", componentAffected: ["nomorGiro", "bankGiro", "jatuhTempoGiro"] },
        ],
      }),
      { ...(inp("nomorGiro", "Nomor Giro", "String") as object), visible: false } as Component,
      { ...(inp("bankGiro", "Bank", "String") as object), visible: false } as Component,
      { ...(inp("jatuhTempoGiro", "Jatuh Tempo Giro", "Date") as object), visible: false } as Component,
      photo("buktiBayar", "Bukti Pembayaran", 0, 2),
    ] },
    { id: "page2", title: "Konfirmasi", components: [
      view("ringkasOutlet", "Nama Outlet", "String", "$outletTagih"),
      view("ringkasNilai", "Nilai Dibayar", "Numeric", "$nilaiDibayar"),
      sign("tandaTanganPembayar", "Tanda Tangan Pelanggan"),
    ] },
  ],
};

/* ---------- Setoran (PRD 18) ---------- */
export const FLOW_SETORAN: Flow = {
  name: "Setoran",
  prd: "18-collection",
  pages: [
    { id: "page0", title: "Initial Page", enabled: true, components: [
      sel("tujuanSetor", "Tujuan Setoran", ["Kasir Cabang Surabaya", "Transfer BCA UP 0881234567"], { showAs: "title" }),
      inp("nilaiSetor", "Nilai Setoran", "Numeric", { min: 0, max: 999999999, required: true }),
    ] },
    { id: "page1", title: "Bukti Setor", components: [
      photo("buktiSetor", "Bukti Setor", 1, 2),
      inp("catatanSetor", "Catatan", "String"),
    ] },
  ],
};

/** Flows the salesman can create from the Buat Task tab (Kunjungan = kunjungan ekstra). */
export const CREATABLE_FLOWS: Flow[] = [FLOW_KUNJUNGAN, FLOW_NOO, FLOW_RETUR, FLOW_PENAGIHAN, FLOW_SETORAN];
export const flowByName = (n: string) => CREATABLE_FLOWS.find((f) => f.name === n)!;
