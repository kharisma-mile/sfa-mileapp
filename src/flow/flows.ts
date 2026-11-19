/*
  UP flows expressed as Mile Field flow configuration (standard components only).
  The same JSON shape can be posted to POST /api/v3/flow (see research-flow/flow.json).
*/
import { CHECKLIST, COMPETITOR_BRANDS, FEEDBACK_CATEGORIES, INVOICES, NO_ORDER_REASONS, OUTLETS, PRODUCTS, SEGMENTS, SKIP_REASONS, VISIT_DAYS } from "@/data/mock";
import type { BillItemMaster, Component, Flow, OnSelectRule } from "./types";

const PRODUCT_ITEMS: BillItemMaster[] = PRODUCTS.flatMap((p) => p.uoms.map((u) => ({ name: `${p.name} (${u.uom})`, unit_price: u.price })));

const inp = (id: string, title: string, type: Extract<Component, { component: "input" }>["type"], extra: object = {}): Component =>
  ({ component: "input", id, title, type, visible: true, required: false, showAs: null, routeAs: null, ...extra }) as Component;
const sel = (id: string, title: string, options: string[], extra: { max?: number; onSelect?: OnSelectRule[]; visible?: boolean; showAs?: "title" | "content" | "label"; routeAs?: string } = {}): Component =>
  ({ component: "select", type: "dropdown", id, title, options, min: 0, max: extra.max ?? 1, visible: extra.visible ?? true, required: false, onSelect: extra.onSelect ?? [], showAs: extra.showAs ?? null, routeAs: extra.routeAs ?? null }) as Component;
const view = (id: string, title: string, type: Extract<Component, { component: "view" }>["type"], value: string): Component => ({ component: "view", id, title, type, value, visible: true });
const photo = (id: string, title: string, min: number, max: number, visible = true): Component => ({ component: "photo", id, title, min, max, watermark: true, selectGallery: false, visible, required: min > 0 });
const sign = (id: string, title: string): Component => ({ component: "signature", id, title, visible: true, required: false });

/* ---------- Mulai Call Plan (D-49): one task per salesman per day, created by Sales Operations ---------- */
export const FLOW_MULAI: Flow = {
  name: "Mulai Call Plan",
  prd: "14-milefield-visit (D-49 start of day)",
  pages: [
    { id: "page0", title: "Initial Page", enabled: true, components: [
      inp("ruteHariIni", "Rute", "String", { showAs: "title" }),
      inp("rencanaHariIni", "Rencana Hari Ini", "String", { showAs: "content" }),
      inp("waktuMulai", "Waktu Mulai", "String"),
    ] },
    { id: "page1", title: "Rencana Hari Ini", components: [
      view("infoRute", "Rute", "String", "$ruteHariIni"),
      view("infoRencana", "Rencana hari ini", "String", "$rencanaHariIni"),
      view("infoDaftarOutlet", "Outlet", "String", "$daftarOutlet"),
    ] },
    { id: "page2", title: "Mulai Call Plan", components: [
      inp("lokasiMulai", "Lokasi Mulai", "Geolocation", { required: true }),
      view("infoWaktuMulai", "Waktu Mulai", "String", "$waktuMulai"),
      photo("fotoSelfie", "Foto Selfie", 0, 1),
    ] },
  ],
};

/* ---------- Check-in Outlet = Kunjungan (PRD 14, D-49): call-plan task per outlet, created by Sales Operations from the PJP ---------- */
const VISIT_HIDE_WHEN_SKIPPED = ["lokasiCheckin", "fotoToko", "checklistKunjungan", "fotoDisplay", "infoTransaksi", "hasilKunjungan", "catatanKunjungan", "tanggalFollowup", "lokasiCheckout"];

export const FLOW_CHECKIN: Flow = {
  name: "Check-in Outlet",
  prd: "14-milefield-visit",
  pages: [
    { id: "page0", title: "Initial Page", enabled: true, components: [
      inp("namaOutlet", "Nama Outlet", "String", { showAs: "title", routeAs: "VisitName" }),
      inp("alamatOutlet", "Alamat Outlet", "Address", { showAs: "content", routeAs: "Address" }),
      inp("lokasiOutlet", "Lokasi Outlet", "Geolocation", { routeAs: "Coordinate" }),
      sel("segmenOutlet", "Segmen", SEGMENTS, { showAs: "label", routeAs: "Tag" }),
      inp("kodeOutlet", "Kode Outlet", "String"),
      inp("teleponOutlet", "Telepon", "PhoneNumber"),
      inp("hariKunjungan", "Hari Kunjungan", "String"),
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
      view("infoHariKunjungan", "Hari Kunjungan", "String", "$hariKunjungan"),
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
      sel("alasanLewati", "Alasan Dilewati", SKIP_REASONS, { visible: false }),
    ] },
    { id: "page2", title: "Check-in", components: [
      inp("lokasiCheckin", "Lokasi Check-in", "Geolocation", { required: true, useGeoLock: true, radius: 100, geoLockTrigger: "onTaskStart" }),
      photo("fotoToko", "Foto Toko", 1, 3),
    ] },
    { id: "page3", title: "Aktivitas di Toko", components: [
      sel("checklistKunjungan", "Checklist Kunjungan", CHECKLIST, { max: CHECKLIST.length }),
      photo("fotoDisplay", "Foto Display", 0, 3),
      view("infoTransaksi", "Transaksi di outlet ini", "String", "Penjualan, Retur, Penagihan, Survey: Buat Task sebelum check-out"),
    ] },
    { id: "page4", title: "Hasil Kunjungan", components: [
      sel("hasilKunjungan", "Hasil Kunjungan", ["Order", "Tidak Order"], {
        onSelect: [
          { options: ["Tidak Order"], action: "show", componentAffected: ["alasanTidakOrder"] },
          { options: ["Order"], action: "hide", componentAffected: ["alasanTidakOrder"] },
        ],
      }),
      sel("alasanTidakOrder", "Alasan Tidak Order", NO_ORDER_REASONS, { visible: false }),
      inp("catatanKunjungan", "Catatan", "String"),
      inp("tanggalFollowup", "Tanggal Follow-up", "Date"),
    ] },
    { id: "page5", title: "Check-out", components: [
      inp("lokasiCheckout", "Lokasi Check-out", "Geolocation", { required: true }),
    ] },
  ],
};

/* ---------- Penjualan (PRD 15, D-49): order taken while checked in; catalog = outlet assortment, prefill = repeat order ---------- */
export const FLOW_PENJUALAN: Flow = {
  name: "Penjualan",
  prd: "15-milefield-order",
  pages: [
    { id: "page0", title: "Initial Page", enabled: true, components: [
      sel("outletJual", "Nama Outlet", OUTLETS.filter((o) => !o.prospect).map((o) => o.name), { showAs: "title" }),
    ] },
    { id: "page1", title: "Info Kredit", components: [
      view("jualOutlet", "Nama Outlet", "String", "$outletJual"),
      view("jualLimit", "Limit Kredit", "Numeric", "$limitKredit"),
      view("jualOutstanding", "Outstanding", "Numeric", "$outstanding"),
      view("jualOverdue", "Overdue", "Numeric", "$overdue"),
      view("jualSisa", "Sisa Limit", "Numeric", "$sisaLimit"),
      view("jualTerakhir", "Pesanan Terakhir", "String", "$pesananTerakhir"),
    ] },
    { id: "page2", title: "Pesanan", components: [
      { component: "bill", id: "pesanan", title: "Pesanan", addNew: true, value: null, visible: true, required: false, editable: ["qty"],
        masterItems: PRODUCT_ITEMS,
        masterCosts: [{ type: "discount", name: "Diskon Program", amount: 50000 }, { type: "cost", name: "Ongkos Kirim", amount: 25000 }] },
    ] },
    { id: "page3", title: "Konfirmasi", components: [
      inp("catatanPesanan", "Catatan", "String"),
      sign("tandaTanganPelanggan", "Tanda Tangan Pelanggan"),
    ] },
  ],
};

/* ---------- Survey (D-49): competitor / market survey, during a visit or ad hoc ---------- */
export const FLOW_SURVEY: Flow = {
  name: "Survey",
  prd: "14-milefield-visit (survey, D-49)",
  pages: [
    { id: "page0", title: "Initial Page", enabled: true, components: [
      sel("outletSurvey", "Nama Outlet", OUTLETS.map((o) => o.name), { showAs: "title" }),
    ] },
    { id: "page1", title: "Kompetitor", components: [
      sel("merekKompetitor", "Merek Kompetitor", COMPETITOR_BRANDS),
      inp("produkKompetitor", "Produk Kompetitor", "String"),
      inp("hargaKompetitor", "Harga Kompetitor", "Numeric", { min: 0, max: 99999999 }),
      photo("fotoKompetitor", "Foto Kompetitor", 0, 3),
    ] },
    { id: "page2", title: "Masukan Pasar", components: [
      sel("kategoriMasukan", "Kategori Masukan", FEEDBACK_CATEGORIES, { max: FEEDBACK_CATEGORIES.length }),
      inp("catatanSurvey", "Catatan", "String"),
    ] },
  ],
};

/* ---------- Akhiri Call Plan (D-49): closes the day; summary values derived from today's tasks ---------- */
export const FLOW_AKHIRI: Flow = {
  name: "Akhiri Call Plan",
  prd: "14-milefield-visit (D-49 end of day)",
  pages: [
    { id: "page0", title: "Initial Page", enabled: true, components: [
      inp("ruteHariIni", "Rute", "String", { showAs: "title" }),
      inp("judulAkhir", "Keterangan", "String", { showAs: "content" }),
    ] },
    { id: "page1", title: "Ringkasan Hari Ini", components: [
      view("akhirRencana", "Rencana", "String", "$ringkasRencana"),
      view("akhirRealisasi", "Realisasi", "String", "$ringkasRealisasi"),
      view("akhirOrder", "Total Order", "String", "$ringkasOrder"),
      view("akhirTagih", "Total Penagihan", "String", "$ringkasTagih"),
      view("akhirSync", "Data Belum Tersinkron", "String", "$ringkasSync"),
    ] },
    { id: "page2", title: "Outlet Belum Dikunjungi", components: [
      view("akhirBelum", "Outlet belum dikunjungi", "String", "$ringkasBelum"),
      sel("alasanBelumDikunjungi", "Alasan Tidak Dikunjungi", SKIP_REASONS),
      inp("catatanAkhir", "Catatan", "String"),
    ] },
    { id: "page3", title: "Akhiri Call Plan", components: [
      inp("lokasiAkhir", "Lokasi Akhir", "Geolocation", { required: true }),
      view("infoWaktuAkhir", "Waktu Selesai", "String", "$waktuAkhir"),
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
      sel("hariKunjunganNoo", "Hari Kunjungan", [...VISIT_DAYS], { max: VISIT_DAYS.length }),
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

/** Flows the salesman can create from the Buat Task tab (Check-in Outlet = kunjungan ekstra di luar PJP). */
export const CREATABLE_FLOWS: Flow[] = [FLOW_PENJUALAN, FLOW_RETUR, FLOW_PENAGIHAN, FLOW_SURVEY, FLOW_SETORAN, FLOW_NOO, FLOW_CHECKIN];
/** Mulai / Akhiri Call Plan are created once per day by Sales Operations, not from Buat Task. */
export const ALL_FLOWS: Flow[] = [FLOW_MULAI, FLOW_AKHIRI, ...CREATABLE_FLOWS];
export const flowByName = (n: string) => ALL_FLOWS.find((f) => f.name === n)!;
