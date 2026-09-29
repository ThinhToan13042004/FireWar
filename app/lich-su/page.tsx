"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Download, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { initialAlerts } from "@/lib/firewar-data";

type EventType = "Báo cháy" | "Cảnh báo" | "Ngoại tuyến" | "Đã khôi phục";
type HistoryType = "Tất cả" | EventType;

const history = [
  ...initialAlerts.map((alert) => ({
    id: alert.id,
    sensor: alert.sensorId,
    place: alert.location,
    type: alert.type as EventType,
    message: alert.message,
    time: alert.time,
    date: "27/09/2026",
  })),
  { id: "EVT-005", sensor: "NODE_02", place: "Tầng 3 · Phòng 302", type: "Đã khôi phục" as const, message: "Nồng độ khói đã trở về mức an toàn.", time: "07:18:26", date: "27/09/2026" },
  { id: "EVT-006", sensor: "NODE_07", place: "Tầng 7 · Phòng 704", type: "Ngoại tuyến" as const, message: "Mất kết nối với nút cảm biến.", time: "07:20:03", date: "27/09/2026" },
  { id: "EVT-007", sensor: "NODE_04", place: "Tầng 3 · Phòng 304", type: "Đã khôi phục" as const, message: "Kết nối cảm biến được khôi phục.", time: "06:54:09", date: "27/09/2026" },
];

const eventTone: Record<Exclude<HistoryType, "Tất cả">, string> = {
  "Báo cháy": "bg-red-50 text-red-700",
  "Cảnh báo": "bg-amber-50 text-amber-700",
  "Ngoại tuyến": "bg-slate-100 text-slate-600",
  "Đã khôi phục": "bg-emerald-50 text-emerald-700",
};

export default function HistoryPage() {
  const [filter, setFilter] = useState<HistoryType>("Tất cả");
  const [query, setQuery] = useState("");
  const filteredHistory = useMemo(() => history.filter((event) => {
    const matchesType = filter === "Tất cả" || event.type === filter;
    const matchesQuery = `${event.sensor} ${event.place} ${event.message}`.toLowerCase().includes(query.toLowerCase());
    return matchesType && matchesQuery;
  }), [filter, query]);

  const exportHistory = () => {
    const rows = [
      ["Thời gian", "Mã sự kiện", "Cảm biến", "Vị trí", "Loại sự kiện", "Nội dung"],
      ...filteredHistory.map((event) => [`${event.date} ${event.time}`, event.id, event.sensor, event.place, event.type, event.message]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "firewar-event-history.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex-1 bg-[#f8fafc] text-slate-800">
      <div className="mx-auto w-full max-w-[1220px] space-y-6 px-4 py-5 md:px-8 md:py-7">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div><div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400"><span>Hệ thống</span><span>/</span><span className="text-slate-600">Lịch sử</span></div><h1 className="text-2xl font-bold tracking-tight text-slate-900">Lịch sử sự kiện</h1><p className="mt-1 text-sm text-slate-500">Tra cứu các cảnh báo và thay đổi trạng thái cảm biến.</p></div>
          <button type="button" onClick={exportHistory} className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"><Download className="h-4 w-4" />Xuất CSV</button>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Sự kiện hôm nay", value: history.length, tone: "text-slate-900" },
            { label: "Báo cháy", value: history.filter((event) => event.type === "Báo cháy").length, tone: "text-red-600" },
            { label: "Cảnh báo", value: history.filter((event) => event.type === "Cảnh báo").length, tone: "text-amber-600" },
            { label: "Đã khôi phục", value: history.filter((event) => event.type === "Đã khôi phục").length, tone: "text-emerald-600" },
          ].map((stat) => <Card key={stat.label} className="rounded-xl border-slate-200 shadow-none"><CardContent className="p-5"><p className="text-sm text-slate-500">{stat.label}</p><p className={`mt-2 text-3xl font-bold ${stat.tone}`}>{stat.value}</p></CardContent></Card>)}
        </div>

        <Card className="overflow-hidden rounded-xl border-slate-200 shadow-none">
          <CardHeader className="gap-4 border-b border-slate-100 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle className="text-base font-bold text-slate-900">Nhật ký hệ thống</CardTitle><p className="mt-1 text-xs text-slate-500">{filteredHistory.length} sự kiện được tìm thấy</p></div><div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600"><CalendarDays className="h-4 w-4 text-slate-400" />27/09/2026 <span className="text-slate-300">–</span> 27/09/2026</div></div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm cảm biến, vị trí, nội dung..." className="h-10 rounded-lg border-slate-200 pl-9 shadow-none" /></div>
              <label className="relative"><span className="sr-only">Lọc theo loại sự kiện</span><select value={filter} onChange={(event) => setFilter(event.target.value as HistoryType)} className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm font-medium text-slate-600 outline-none focus:border-blue-500 sm:w-52">{["Tất cả", "Báo cháy", "Cảnh báo", "Ngoại tuyến", "Đã khôi phục"].map((type) => <option key={type}>{type}</option>)}</select><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">⌄</span></label>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Thời gian</th><th className="px-5 py-3">Sự kiện</th><th className="px-5 py-3">Cảm biến / Vị trí</th><th className="px-5 py-3">Nội dung</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredHistory.map((event) => <tr key={event.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><p className="font-semibold text-slate-700">{event.time}</p><p className="mt-1 text-xs text-slate-400">{event.date}</p></td><td className="px-5 py-4"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${eventTone[event.type]}`}>{event.type}</span></td><td className="px-5 py-4"><p className="font-semibold text-slate-700">{event.sensor}</p><p className="mt-1 text-xs text-slate-400">{event.place}</p></td><td className="max-w-lg px-5 py-4 leading-relaxed text-slate-600">{event.message}</td></tr>)}</tbody></table></div>
            {filteredHistory.length === 0 && <div className="p-12 text-center"><p className="font-semibold text-slate-700">Không tìm thấy sự kiện</p><p className="mt-1 text-sm text-slate-400">Hãy thử thay đổi từ khóa hoặc bộ lọc.</p></div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
