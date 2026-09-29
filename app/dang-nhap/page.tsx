"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff, Flame, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("Giao diện đã sẵn sàng. Vui lòng kết nối dịch vụ xác thực để đăng nhập.");
  };

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-slate-950 px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/20 lg:min-h-[620px] lg:grid-cols-2">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 p-10 text-white lg:flex">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full border border-white/10" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <span className="rounded-xl bg-red-600 p-2.5"><Flame className="h-6 w-6 fill-white" /></span>
            <div><p className="text-lg font-bold">FireWar</p><p className="text-xs text-slate-400">Hệ thống giám sát an toàn</p></div>
          </div>
          <div className="relative max-w-md">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400" />Bảo vệ an toàn, 24/7</div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight">An toàn bắt đầu từ sự chủ động.</h1>
            <p className="mt-4 text-sm leading-6 text-slate-300">Theo dõi cảm biến, nhận cảnh báo theo thời gian thực và quản lý an toàn tòa nhà trong một giao diện duy nhất.</p>
            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="rounded-xl bg-blue-400/10 p-3 text-blue-300"><ShieldCheck className="h-6 w-6" /></div>
              <div><p className="text-sm font-semibold">Giám sát tập trung</p><p className="mt-1 text-xs text-slate-400">Nhiệt độ · Khói · Khí CO · Nguy cơ cháy</p></div>
            </div>
          </div>
          <p className="relative text-xs text-slate-500">© 2026 FireWar Safety Platform</p>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex items-center gap-3 lg:hidden"><span className="rounded-lg bg-red-600 p-2 text-white"><Flame className="h-5 w-5 fill-white" /></span><span className="text-lg font-bold text-slate-900">FireWar</span></div>
            <div className="mb-8"><p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Chào mừng trở lại</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Đăng nhập</h2><p className="mt-2 text-sm text-slate-500">Đăng nhập để tiếp tục quản lý hệ thống.</p></div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2"><label htmlFor="login-email" className="text-sm font-medium text-slate-700">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input id="login-email" name="email" type="email" autoComplete="username" required placeholder="admin@firesystem.vn" className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div></div>
              <div className="space-y-2"><label htmlFor="login-password" className="text-sm font-medium text-slate-700">Mật khẩu</label><div className="relative"><LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input id="login-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required placeholder="Nhập mật khẩu" className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /><button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
              <div className="flex items-center justify-between gap-3"><label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" className="h-4 w-4 rounded accent-blue-600" />Ghi nhớ đăng nhập</label><button type="button" onClick={() => setMessage("Vui lòng liên hệ quản trị viên để đặt lại mật khẩu.")} className="text-sm font-semibold text-blue-600 hover:text-blue-700">Quên mật khẩu?</button></div>
              <button type="submit" className="h-11 w-full rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">Đăng nhập</button>
              {message && <p role="status" className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm leading-relaxed text-blue-800">{message}</p>}
            </form>

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">Bằng việc đăng nhập, bạn đồng ý với các chính sách bảo mật và quy định sử dụng hệ thống.</p>
            <Link href="/" className="mt-6 block text-center text-sm font-medium text-slate-500 hover:text-blue-600">Quay lại trang tổng quan</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
