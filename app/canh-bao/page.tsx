"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, CircleAlert, Clock3, Flame, MoreHorizontal, ShieldAlert, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { initialAlerts, type FireAlert } from "@/lib/firewar-data";

type AlertFilter = "all" | "unread" | FireAlert["type"];

const alertStyle: Record<FireAlert["type"], { tone: string; icon: typeof Flame }> = {
  "Báo cháy": { tone: "border-red-200 bg-red-50 text-red-700", icon: Flame },
  "Cảnh báo": { tone: "border-amber-200 bg-amber-50 text-amber-700", icon: CircleAlert },
  "Ngoại tuyến": { tone: "border-slate-200 bg-slate-100 text-slate-600", icon: WifiOff },
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filter, setFilter] = useState<AlertFilter>("all");
  const visibleAlerts = useMemo(() => alerts.filter((alert) => {
    if (filter === "unread") return !alert.acknowledged;
    return filter === "all" || alert.type === filter;
  }), [alerts, filter]);
  const pending = alerts.filter((alert) => !alert.acknowledged).length;
  const acknowledge = (id: string) => setAlerts((current) => current.map((alert) => alert.id === id ? { ...alert, acknowledged: true } : alert));
  const markAllSeen = () => setAlerts((current) => current.map((alert) => ({ ...alert, acknowledged: true })));
  const filters: { value: AlertFilter; label: string }[] = [
    { value: "all", label: "Tất cả" },
    { value: "unread", label: "Chưa xác nhận" },
    { value: "Báo cháy", label: "Báo cháy" },
    { value: "Cảnh báo", label: "Cảnh báo" },
    { value: "Ngoại tuyến", label: "Ngoại tuyến" },
  ];

  return (
    <div className="min-h-screen flex-1 bg-[#f8fafc] text-slate-800">
      <div className="mx-auto w-full max-w-[1220px] space-y-6 px-4 py-5 md:px-8 md:py-7">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div><div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400"><span>Hệ thống</span><span>/</span><span className="text-slate-600">Cảnh báo</span></div><h1 className="text-2xl font-bold tracking-tight text-slate-900">Trung tâm cảnh báo</h1><p className="mt-1 text-sm text-slate-500">Theo dõi, xác nhận và xử lý sự kiện từ các cảm biến.</p></div>
          <Button type="button" variant="outline" onClick={markAllSeen} disabled={pending === 0} className="h-10 gap-2 border-slate-200 bg-white text-slate-600"><CheckCheck className="h-4 w-4" />Xác nhận tất cả</Button>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="rounded-xl border-red-200 bg-red-50/50 shadow-none"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm font-medium text-red-700">Báo cháy</p><p className="mt-2 text-3xl font-bold text-red-800">{alerts.filter((alert) => alert.type === "Báo cháy").length}</p></div><Flame className="h-6 w-6 text-red-500" /></CardContent></Card>
          <Card className="rounded-xl border-amber-200 bg-amber-50/50 shadow-none"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm font-medium text-amber-700">Chưa xác nhận</p><p className="mt-2 text-3xl font-bold text-amber-800">{pending}</p></div><Bell className="h-6 w-6 text-amber-500" /></CardContent></Card>
          <Card className="rounded-xl border-slate-200 shadow-none"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm font-medium text-slate-500">Tổng sự kiện hôm nay</p><p className="mt-2 text-3xl font-bold text-slate-900">{alerts.length}</p></div><ShieldAlert className="h-6 w-6 text-slate-400" /></CardContent></Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <Card className="overflow-hidden rounded-xl border-slate-200 shadow-none">
            <CardHeader className="border-b border-slate-100 pb-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle className="text-base font-bold text-slate-900">Sự kiện gần đây</CardTitle><p className="mt-1 text-xs text-slate-500">Danh sách cảnh báo từ hệ thống</p></div><Badge variant="secondary" className="border border-slate-200 bg-slate-50 text-slate-600">{visibleAlerts.length} sự kiện</Badge></div>
              <div className="flex gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1">{filters.map((item) => <button key={item.value} type="button" onClick={() => setFilter(item.value)} aria-pressed={filter === item.value} className={`whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold transition ${filter === item.value ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{item.label}{item.value === "unread" && <span className="ml-1 opacity-60">{pending}</span>}</button>)}</div>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100 p-0">
              {visibleAlerts.length ? visibleAlerts.map((alert) => {
                const style = alertStyle[alert.type];
                const Icon = style.icon;
                return <article key={alert.id} className={`flex flex-col gap-4 p-5 transition hover:bg-slate-50/70 sm:flex-row sm:items-start ${alert.acknowledged ? "opacity-75" : ""}`}>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${style.tone}`}><Icon className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-slate-900">{alert.message}</h2><span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${style.tone}`}>{alert.type}</span>{!alert.acknowledged && <span className="h-2 w-2 rounded-full bg-blue-600" aria-label="Chưa xác nhận" />}</div><p className="mt-2 text-sm text-slate-500">{alert.sensorId} <span className="px-1 text-slate-300">·</span> {alert.location}</p><p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400"><Clock3 className="h-3.5 w-3.5" />Hôm nay, {alert.time}</p>
                    <div className="mt-4 flex flex-wrap gap-2"><Link href={`/cam-bien?node=${alert.sensorId}`} className="inline-flex h-8 items-center rounded-lg px-3 text-xs font-semibold text-blue-700 hover:bg-blue-50">Xem cảm biến</Link>{!alert.acknowledged && <Button type="button" size="sm" onClick={() => acknowledge(alert.id)} className="h-8 bg-blue-600 px-3 text-xs text-white hover:bg-blue-700">Xác nhận đã xem</Button>}</div>
                  </div>
                  <button type="button" aria-label={`Tùy chọn ${alert.id}`} className="hidden rounded-md p-2 text-slate-400 hover:bg-slate-100 sm:block"><MoreHorizontal className="h-4 w-4" /></button>
                </article>;
              }) : <div className="p-12 text-center"><CheckCheck className="mx-auto h-8 w-8 text-emerald-500" /><p className="mt-3 font-semibold text-slate-700">Không có sự kiện trong mục này</p><p className="mt-1 text-sm text-slate-400">Các cảnh báo phù hợp sẽ xuất hiện tại đây.</p></div>}
            </CardContent>
          </Card>

          <Card className="h-fit rounded-xl border-slate-200 shadow-none">
            <CardHeader className="border-b border-slate-100 pb-4"><CardTitle className="text-base font-bold text-slate-900">Quy trình xử lý</CardTitle><p className="mt-1 text-xs text-slate-500">Khi nhận cảnh báo cháy</p></CardHeader>
            <CardContent className="space-y-4 p-5">{["Xác nhận cảnh báo và xác định khu vực.", "Kiểm tra thông tin cảm biến và trạng thái thực tế.", "Kích hoạt quy trình ứng phó tại chỗ.", "Ghi nhận kết quả sau khi xử lý."].map((step, index) => <div key={step} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{index + 1}</span><p className="text-sm leading-relaxed text-slate-600">{step}</p></div>)}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
