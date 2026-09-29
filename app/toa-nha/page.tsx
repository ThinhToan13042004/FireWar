"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Building2, ChevronDown, CircleAlert, Flame, MapPin, Thermometer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sensors, sensorStatusClass, sensorStatusLabel } from "@/lib/firewar-data";

const floors = [1, 2, 3, 4, 5, 6, 7];

export default function BuildingMapPage() {
  const [floor, setFloor] = useState(3);
  const floorSensors = useMemo(() => sensors.filter((sensor) => sensor.floor === floor), [floor]);
  const floorRooms = floor === 3
    ? ["Phòng 301", "Phòng 302", "Phòng 303", "Phòng 304", "Phòng 305", "Phòng 306"]
    : floorSensors.map((sensor) => sensor.room);
  const openAlerts = floorSensors.filter((sensor) => sensor.status === "warning" || sensor.status === "fire").length;

  return (
    <div className="min-h-screen flex-1 bg-[#f8fafc] text-slate-800">
      <div className="mx-auto w-full max-w-[1220px] space-y-6 px-4 py-5 md:px-8 md:py-7">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400"><span>Tòa nhà</span><span>/</span><span className="text-slate-600">Sơ đồ mặt bằng</span></div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sơ đồ tòa nhà</h1>
            <p className="mt-1 text-sm text-slate-500">Theo dõi trạng thái cảm biến theo từng tầng.</p>
          </div>
          <label className="relative">
            <span className="sr-only">Chọn tòa nhà</span>
            <select className="h-10 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
              <option>Tòa nhà FireWar</option><option>Tòa nhà A</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </label>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="rounded-xl border-slate-200 shadow-none"><CardContent className="flex items-center gap-4 p-5"><span className="rounded-lg bg-blue-50 p-3 text-blue-600"><Building2 className="h-5 w-5" /></span><div><p className="text-sm text-slate-500">Tổng số tầng</p><p className="mt-1 text-2xl font-bold text-slate-900">7</p></div></CardContent></Card>
          <Card className="rounded-xl border-slate-200 shadow-none"><CardContent className="flex items-center gap-4 p-5"><span className="rounded-lg bg-emerald-50 p-3 text-emerald-600"><Thermometer className="h-5 w-5" /></span><div><p className="text-sm text-slate-500">Cảm biến hoạt động</p><p className="mt-1 text-2xl font-bold text-slate-900">{sensors.filter((sensor) => sensor.status !== "offline").length}<span className="ml-1 text-sm font-medium text-slate-400">/ {sensors.length}</span></p></div></CardContent></Card>
          <Card className="rounded-xl border-slate-200 shadow-none"><CardContent className="flex items-center gap-4 p-5"><span className="rounded-lg bg-amber-50 p-3 text-amber-600"><CircleAlert className="h-5 w-5" /></span><div><p className="text-sm text-slate-500">Khu vực cần chú ý</p><p className="mt-1 text-2xl font-bold text-slate-900">{sensors.filter((sensor) => sensor.status === "warning" || sensor.status === "fire").length}</p></div></CardContent></Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <Card className="rounded-xl border-slate-200 shadow-none">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div><CardTitle className="text-base font-bold text-slate-900">Bản đồ mặt bằng</CardTitle><p className="mt-1 text-xs text-slate-500">Tòa nhà FireWar · {floorRooms.length} khu vực</p></div>
              <div className="flex flex-wrap gap-1.5" aria-label="Chọn tầng">
                {floors.map((item) => <button key={item} type="button" onClick={() => setFloor(item)} aria-pressed={floor === item} className={`rounded-md px-3 py-2 text-xs font-semibold transition ${floor === item ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Tầng {item}</button>)}
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                {[
                  ["bg-emerald-500", "Ổn định"],
                  ["bg-amber-500", "Cảnh báo"],
                  ["bg-red-500", "Báo cháy"],
                  ["bg-slate-400", "Chưa có dữ liệu"],
                ].map(([dot, label]) => <span key={label} className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${dot}`} />{label}</span>)}
              </div>
              {floorRooms.length ? (
                <div className="grid min-h-72 grid-cols-2 gap-3 sm:grid-cols-3">
                  {floorRooms.map((room) => {
                    const sensor = floorSensors.find((item) => item.room === room);
                    const status = sensor?.status ?? "offline";
                    return (
                      <Link key={room} href={sensor ? `/cam-bien?node=${sensor.id}` : "/cam-bien"} className={`group flex min-h-32 flex-col justify-between rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${sensorStatusClass(status)}`}>
                        <div className="flex items-start justify-between gap-2"><div><p className="font-semibold">{room}</p><p className="mt-1 text-xs opacity-75">{sensor?.id ?? "Chưa lắp cảm biến"}</p></div>{status === "fire" ? <Flame className="h-5 w-5 fill-red-500 text-red-500" /> : <span className={`mt-1 h-2.5 w-2.5 rounded-full ${status === "normal" ? "bg-emerald-500" : status === "warning" ? "bg-amber-500" : "bg-slate-400"}`} />}</div>
                        <div className="flex items-end justify-between gap-2"><span className="text-xs font-medium">{sensorStatusLabel(status)}</span>{sensor && <span className="text-sm font-bold">{sensor.temperature.toFixed(1)}°C</span>}</div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center"><MapPin className="mb-3 h-8 w-8 text-slate-300" /><p className="font-semibold text-slate-700">Chưa có dữ liệu tầng {floor}</p><p className="mt-1 text-sm text-slate-400">Chưa ghi nhận phòng hoặc cảm biến ở tầng này.</p></div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl border-slate-200 shadow-none">
            <CardHeader className="border-b border-slate-100 pb-4"><CardTitle className="text-base font-bold text-slate-900">Sự cố theo tầng</CardTitle><p className="mt-1 text-xs text-slate-500">Cập nhật trực tiếp · Tầng {floor}</p></CardHeader>
            <CardContent className="space-y-3 p-4">
              {floorSensors.filter((sensor) => sensor.status === "warning" || sensor.status === "fire" || sensor.status === "offline").length === 0 ? <p className="py-6 text-center text-sm text-slate-500">Không có sự cố trên tầng này.</p> : floorSensors.filter((sensor) => sensor.status === "warning" || sensor.status === "fire" || sensor.status === "offline").map((sensor) => <Link key={sensor.id} href={`/cam-bien?node=${sensor.id}`} className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50"><div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold text-slate-800">{sensor.room}</p><span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${sensorStatusClass(sensor.status)}`}>{sensorStatusLabel(sensor.status)}</span></div><p className="mt-1 text-xs text-slate-500">{sensor.id} · Cập nhật {sensor.lastSeen}</p></Link>)}
              <div className="rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">{openAlerts ? `${openAlerts} khu vực trên tầng này đang có cảnh báo.` : "Tất cả cảm biến trên tầng đang hoạt động bình thường."}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
