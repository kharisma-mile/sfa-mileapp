# Mile Field untuk Unggul Plastik: Mobile Mockup (POC)

Mockup interaktif **frontend-only** aplikasi lapangan sales UP. Tampilannya mengikuti UI/UX Mile Field, tapi aplikasinya **bukan** Mile Field asli. Mockup ini pasangan dari `poc/sales-ops-web/`. Tanpa backend; muat ulang halaman untuk reset.

## Prinsip

- **Setiap layar task adalah flow Mile Field** berisi komponen standar dari KB (`Knowledge-base/flow/flow-base-structure.md`). Daftar flow ada di `src/flow/flows.ts` dengan bentuk JSON yang sama dengan `POST /api/v3/flow`.
- **Renderer komponen** (`src/ui/mf.tsx`) meniru tampilan yang teramati langsung di field.mile.app v1.45.3. Acuannya `.planning/research/mile-field/UI-SPEC-OBSERVED.md`, dan flow Home Cleaning serta Field Sales sudah dikerjakan sampai selesai sebagai pembanding.
- Komponen yang **belum teramati** (list, subpage, select checkbox/button, capture, timer, voice, perilaku geolock) **tidak dipakai** sampai tampilannya sudah ditangkap.

- Logo: aset produk `mile-v4/mile-v4-ui/src/assets/mileapp_color.svg` (disalin ke `src/assets/`). Login disamakan dengan layar login field.mile.app.

## Flow UP

| Flow | Asal | Halaman |
|---|---|---|
| Kunjungan | Task dibuat modul dari PJP (tab Tugas); juga bisa dibuat dari Buat Task (kunjungan ekstra) | Info Outlet (view: kode, alamat, lokasi, telepon, limit, outstanding, overdue, sisa limit, pesanan terakhir; select Status Kunjungan → Dilewati menampilkan alasan dan menyembunyikan halaman lain) → Check-in (geolocation, foto toko) → Pesanan (bill, terisi dari pesanan terakhir = repeat order) → Checklist & Survey (select multi, select, input, foto) → Hasil Kunjungan (select + alasan via onSelect, catatan, tanggal follow-up, tanda tangan) |
| Pelanggan Baru | Buat Task | Initial page (toko, alamat, lokasi, jenis usaha, pemilik, telepon) → Dokumen (foto toko, KTP, PKP → foto NPWP via onSelect) → Usulan Kredit |
| Retur | Buat Task | Initial page (outlet, faktur asal) → Barang Retur (bill) → Alasan & Bukti |
| Penagihan | Buat Task | Initial page (outlet, faktur multi) → Pembayaran (nilai, metode → data giro via onSelect, bukti) → Konfirmasi (view + tanda tangan) |
| Setoran | Buat Task | Initial page (tujuan, nilai) → Bukti Setor |

Katalog Bill Pesanan per outlet = **assortment** segmen × kelas dari Modul Sales Operations (Data Source); produk wajib (must-sell) sudah terisi qty 0, harga dari price list outlet.

Cek kredit, LOA dan approval tidak ada di aplikasi lapangan. Semuanya dijalankan Modul Sales Operations saat data task masuk (PRD 06/07).

## Run

```bash
npm install
npm run dev       # http://localhost:5180
npm run build
```

Tur otomatis (screenshot `tools/milefield-capture/shots/p3-*.png`): `node tools/milefield-capture/poc-tour3.mjs` saat dev server berjalan.
