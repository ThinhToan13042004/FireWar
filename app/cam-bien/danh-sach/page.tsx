"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Activity, ChevronDown, CircleAlert, Flame, Search, SlidersHorizontal, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { sensors, sensorStatusClass, sensorStatusLabel, type SensorStatus } from "@/lib/firewar-data";

type StatusFilter = "all" | SensorStatus;

export default function SensorListPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [floor, setFloor] = useState("all");
  const visibleSensors = useMemo(() => sensors.filter((sensor) => {
    const matchesQuery = `${sensor.id} ${sensor.name} ${sensor.room}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (status === "all" || sensor.status === status) && (floor === "all" || sensor.floor === Number(floor));
  }), [floor, query, status]);
  const countByStatus = (currentStatus: StatusFilter) => currentStatus === "all" ? sensors.length : sensors.filter((sensor) => sensor.status === currentStatus).length;
  const filters: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "Tất cả" },
    { value: "normal", label: "Ổn định" },
    { value: "warning", label: "Cảnh báo" },
    { value: "fire", label: "Báo cháy" },
    { value: "offline", label: "Ngoại tuyến" },
  ];

  return (
    <div className="min-h-screen flex-1 bg-[#f8fafc] text-slate-800">
      <div className="mx-auto w-full max-w-[1220px] space-y-6 px-4 py-5 md:px-8 md:py-7">
        <header>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400"><span>Hệ thống</span><span>/</span><span className="text-slate-600">Cảm biến</span></div>
          <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-bold tracking-tight text-slate-900">Danh sách cảm biến</h1><p className="mt-1 text-sm text-slate-500">Theo dõi trạng thái và thông số của các nút cảm biến.</p></div><Badge variant="secondary" className="border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"><Activity className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />Cập nhật lúc 07:31</Badge></div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { title: "Tổng cảm biến", value: sensors.length, note: "Trên toàn hệ thống", icon: Activity, tone: "bg-blue-50 text-blue-600" },
            { title: "Ổn định", value: countByStatus("normal"), note: "Đang hoạt động tốt", icon: Activity, tone: "bg-emerald-50 text-emerald-600" },
            { title: "Cảnh báo", value: countByStatus("warning"), note: "Cần kiểm tra", icon: CircleAlert, tone: "bg-amber-50 text-amber-600" },
            { title: "Ngoại tuyến / Báo cháy", value: countByStatus("offline") + countByStatus("fire"), note: `${countByStatus("fire")} báo cháy · ${countByStatus("offline")} ngoại tuyến`, icon: WifiOff, tone: "bg-red-50 text-red-600" },
          ].map(({ title, value, note, icon: Icon, tone }) => <Card key={title} className="rounded-xl border-slate-200 shadow-none"><CardContent className="flex items-start justify-between p-5"><div><p className="text-sm font-medium text-slate-500">{title}</p><p className="mt-2 text-3xl font-bold text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-400">{note}</p></div><span className={`rounded-lg p-2.5 ${tone}`}><Icon className="h-5 w-5" /></span></CardContent></Card>)}
        </div>

        <Card className="overflow-hidden rounded-xl border-slate-200 shadow-none">
          <CardHeader className="gap-4 border-b border-slate-100 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle className="text-base font-bold text-slate-900">Các nút cảm biến</CardTitle><p className="mt-1 text-xs text-slate-500">{visibleSensors.length} kết quả</p></div><Link href="/toa-nha" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Xem sơ đồ tòa nhà →</Link></div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo mã cảm biến hoặc phòng..." className="h-10 rounded-lg border-slate-200 pl-9 shadow-none" /></div>
              <div className="flex flex-wrap items-center gap-2"><div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1">{filters.map((filter) => <button key={filter.value} type="button" onClick={() => setStatus(filter.value)} aria-pressed={status === filter.value} className={`whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold ${status === filter.value ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{filter.label} <span className="ml-1 opacity-60">{countByStatus(filter.value)}</span></button>)}</div>
                <label className="relative"><span className="sr-only">Lọc theo tầng</span><select value={floor} onChange={(event) => setFloor(event.target.value)} className="h-10 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm font-medium text-slate-600 outline-none focus:border-blue-500"><option value="all">Tất cả tầng</option>{[1,2,3,4,5,6,7].map((item) => <option key={item} value={item}>Tầng {item}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /></label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Cảm biến</th><th className="px-5 py-3">Vị trí</th><th className="px-5 py-3">Nhiệt độ</th><th className="px-5 py-3">Khói</th><th className="px-5 py-3">CO</th><th className="px-5 py-3">Trạng thái</th><th className="px-5 py-3">Cập nhật</th><th className="px-5 py-3"><span className="sr-only">Thao tác</span></th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleSensors.map((sensor) => <tr key={sensor.id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><span className={`rounded-lg p-2 ${sensor.status === "fire" ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"}`}>{sensor.status === "fire" ? <Flame className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}</span><div><p className="font-semibold text-slate-800">{sensor.id}</p><p className="mt-0.5 text-xs text-slate-400">{sensor.name}</p></div></div></td>
                    <td className="px-5 py-4 text-slate-600">{sensor.room}<p className="mt-0.5 text-xs text-slate-400">Tầng {sensor.floor}</p></td>
                    <td className={`px-5 py-4 font-semibold ${sensor.temperature >= 60 ? "text-red-600" : "text-slate-700"}`}>{sensor.status === "offline" ? "—" : `${sensor.temperature.toFixed(1)} °C`}</td>
                    <td className="px-5 py-4 text-slate-600">{sensor.status === "offline" ? "—" : `${sensor.smoke} ppm`}</td>
                    <td className="px-5 py-4 text-slate-600">{sensor.status === "offline" ? "—" : `${sensor.co} ppm`}</td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${sensorStatusClass(sensor.status)}`}>{sensorStatusLabel(sensor.status)}</span></td>
                    <td className="px-5 py-4 text-xs text-slate-500">{sensor.lastSeen}</td>
                    <td className="px-5 py-4"><Link href={`/cam-bien?node=${sensor.id}`} className="rounded-md px-2 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50">Chi tiết</Link></td>
                  </tr>)}
                </tbody>
              </table>
            </div>
            {visibleSensors.length === 0 && <div className="p-12 text-center"><Search className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 font-semibold text-slate-700">Không tìm thấy cảm biến phù hợp</p><p className="mt-1 text-sm text-slate-400">Thử thay đổi từ khóa hoặc bộ lọc.</p></div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
