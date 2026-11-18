import { useState } from "react";
import logo from "@/assets/mileapp_color.svg";
import { useStore } from "@/store";

/**
 * Login as on field.mile.app v1.45.3 (tools/milefield-capture/shots/00-landing.png).
 * Logo: product asset mile-v4-ui/src/assets/mileapp_color.svg. Demo: any input signs in.
 */
export function LoginScreen() {
  const s = useStore();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-canvas px-4">
      <img src={logo} alt="MileApp" className="mx-auto mt-[46px] h-[51px]" />
      <p className="mt-0.5 text-center text-[15px] text-[#212121]">Aplikasi Pengelolaan Pekerja Lapangan</p>

      <label className="mt-[32px] block h-[68px] rounded-[18px] bg-[#f3f3f3] px-[17px] pt-[10px]">
        <span className="block text-[14px] text-[#5b7896]">Email</span>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="username" className="h-7 w-full bg-transparent text-[16px] outline-none" />
      </label>
      <label className="mt-[16px] flex h-[68px] items-center rounded-[18px] bg-[#f3f3f3] pl-[17px] pr-2">
        <span className="flex-1 self-start pt-[10px]">
          <span className="block text-[14px] text-[#5b7896]">Password</span>
          <input value={pw} onChange={(e) => setPw(e.target.value)} type={show ? "text" : "password"} autoComplete="current-password" className="h-7 w-full bg-transparent text-[16px] outline-none" />
        </span>
        <button type="button" aria-label="Tampilkan password" onClick={() => setShow((v) => !v)} className="grid size-11 place-items-center text-[#5b7896]">
          <Visibility off={show} />
        </button>
      </label>

      <button type="button" className="mt-[16px] self-end pr-2 text-[15px] text-[#212121]">Pulihkan password</button>
      <button onClick={s.login} className="mt-[32px] h-[55px] rounded-lg bg-brand text-[17px] font-black text-white shadow-[0_2px_4px_rgba(0,0,0,0.25)] active:bg-brand-dark">
        Masuk
      </button>
      <p className="mt-[8px] text-center text-[13px] text-[#5b7896]">v1.45.3</p>
      <p className="mb-[10px] mt-auto pt-10 text-center text-[13px] text-[#5b7896]">© 2026 • PT. Paket Informasi Digital • Indonesia</p>
    </div>
  );
}

/** Material "visibility" / "visibility_off" (filled), as on the Flutter login. */
function Visibility({ off }: { off: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden>
      {off
        ? <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
        : <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />}
    </svg>
  );
}
