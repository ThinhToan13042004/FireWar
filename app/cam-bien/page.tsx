"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    Thermometer,
    Wind,
    Activity,
    Flame,
    AlertTriangle,
    RotateCw,
} from "lucide-react";
import { sensors, type SensorStatus } from "@/lib/firewar-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";


const baseSensorDetail = {
    nodeId: "NODE_03",
    location: "Tầng 3 — Phòng 305",
    lastUpdate: "07:31:15",
    status: "CRITICAL", // CRITICAL | WARNING | NORMAL
    statusText: "TRẠNG THÁI: BÁO CHÁY (CRITICAL)",
    metrics: {
        temperature: {
            value: 72.5,
            unit: "°C",
            note: "Ngưỡng nguy hiểm (>60°C)",
            level: "danger",
        },
        smoke: {
            value: 850,
            unit: "ppm",
            note: "Nồng độ cực cao",
            level: "danger",
        },
        co: {
            value: 120,
            unit: "ppm",
            note: "Ngưỡng cảnh báo",
            level: "warning",
        },
        fri: {
            score: 96,
            maxScore: 100,
            note: "Mức cực kỳ khẩn cấp",
            level: "danger",
        },
    },
    chartData: [
        { time: "07:25", temp: 28 },
        { time: "07:26", temp: 30 },
        { time: "07:27", temp: 35 },
        { time: "07:28", temp: 42 },
        { time: "07:29", temp: 53 },
        { time: "07:30", temp: 60 },
        { time: "07:31", temp: 72.5 },
    ],
    hardwareDiagnostics: [
        { label: "Cảm biến lửa", value: "PHÁT HIỆN LỬA", status: "danger" },
        { label: "Nhiệt độ tức thời (ΔT/Δt)", value: "TĂNG ĐỘT NGỘT", status: "danger" },
        { label: "Dòng điện cung cấp", value: "12.4 mA (Ổn định)", status: "normal" },
        { label: "Dung lượng pin dự phòng", value: "94% (Bình thường)", status: "normal" },
    ],
};

const sensorStatusText: Record<SensorStatus, string> = {
    normal: "TRẠNG THÁI: HOẠT ĐỘNG ỔN ĐỊNH",
    warning: "TRẠNG THÁI: CẢNH BÁO",
    fire: "TRẠNG THÁI: BÁO CHÁY (CRITICAL)",
    offline: "TRẠNG THÁI: NGOẠI TUYẾN",
};

function SensorDetailContent() {
    const searchParams = useSearchParams();
    const selectedSensor = sensors.find((sensor) => sensor.id === searchParams.get("node")) ?? sensors.find((sensor) => sensor.id === "NODE_03") ?? sensors[0];
    const isFire = selectedSensor.status === "fire";
    const isWarning = selectedSensor.status === "warning";
    const isOffline = selectedSensor.status === "offline";
    const severityNote = isFire ? "Ngưỡng nguy hiểm" : isWarning ? "Vượt ngưỡng cảnh báo" : "Trong giới hạn an toàn";
    const sensorDetail = {
        ...baseSensorDetail,
        nodeId: selectedSensor.id,
        location: `Tầng ${selectedSensor.floor} — ${selectedSensor.room}`,
        status: selectedSensor.status,
        statusText: sensorStatusText[selectedSensor.status],
        metrics: {
            temperature: { value: selectedSensor.temperature, unit: "°C", note: severityNote, level: isFire ? "danger" : isWarning ? "warning" : "normal" },
            smoke: { value: selectedSensor.smoke, unit: "ppm", note: isFire ? "Nồng độ cực cao" : isWarning ? "Nồng độ khói cao" : "Nồng độ an toàn", level: isFire ? "danger" : isWarning ? "warning" : "normal" },
            co: { value: selectedSensor.co, unit: "ppm", note: isFire || isWarning ? "Cần theo dõi" : "Trong giới hạn an toàn", level: isFire ? "danger" : isWarning ? "warning" : "normal" },
            fri: { score: isFire ? 96 : isWarning ? 58 : isOffline ? 0 : 12, maxScore: 100, note: isFire ? "Mức cực kỳ khẩn cấp" : isWarning ? "Cần kiểm tra" : isOffline ? "Không nhận được dữ liệu" : "Mức nguy cơ thấp", level: isFire ? "danger" : isWarning ? "warning" : "normal" },
        },
        chartData: baseSensorDetail.chartData.map((point) => ({
            ...point,
            temp: selectedSensor.temperature === 0 ? 0 : Math.round(point.temp * selectedSensor.temperature / 72.5 * 10) / 10,
        })),
        hardwareDiagnostics: [
            { label: "Cảm biến lửa", value: isFire ? "PHÁT HIỆN LỬA" : "KHÔNG PHÁT HIỆN LỬA", status: isFire ? "danger" : "normal" },
            { label: "Nhiệt độ tức thời (ΔT/Δt)", value: isFire ? "TĂNG ĐỘT NGỘT" : isWarning ? "CẦN THEO DÕI" : "ỔN ĐỊNH", status: isFire ? "danger" : isWarning ? "warning" : "normal" },
            { label: "Dòng điện cung cấp", value: isOffline ? "MẤT KẾT NỐI" : "12.4 mA (Ổn định)", status: isOffline ? "warning" : "normal" },
            { label: "Dung lượng pin dự phòng", value: isOffline ? "Không có dữ liệu" : "94% (Bình thường)", status: isOffline ? "warning" : "normal" },
        ],
    };

    const handleResetNode = () => {
        alert(`Đã gửi lệnh khởi động lại ${sensorDetail.nodeId}`);
    };

    return (
        <div className="flex-1 space-y-6 p-8 bg-[#f8fafc] min-h-screen text-slate-800">
            {/* Breadcrumb & Top Status Bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <span>Cảm biến</span>
                    <span>/</span>
                    <span className="text-slate-900 font-bold">
                        {sensorDetail.nodeId}
                    </span>
                </div>

                {/* Global Danger Badge */}
                <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-bold text-xs ${isFire ? "bg-red-50 border-red-300 text-red-600" : isWarning ? "bg-amber-50 border-amber-300 text-amber-700" : isOffline ? "bg-slate-100 border-slate-300 text-slate-600" : "bg-emerald-50 border-emerald-300 text-emerald-700"}`}>
                    <Flame className={`w-4 h-4 ${isFire ? "fill-red-600" : ""}`} />
                    <span>{sensorDetail.statusText}</span>
                </div>
            </div>

            {/* Node Header Info Card */}
            <Card className="shadow-none border-slate-200/80 rounded-xl">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Cảm biến {sensorDetail.nodeId}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Vị trí: {sensorDetail.location} — Cập nhật cuối:{" "}
                            {sensorDetail.lastUpdate}
                        </p>
                    </div>
                    <Button
                        onClick={handleResetNode}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium gap-2 px-4 py-2 text-sm rounded-lg"
                    >
                        <RotateCw className="w-4 h-4" />
                        Khởi động lại nút
                    </Button>
                </CardContent>
            </Card>

            {/* 4 Cards Chỉ Số (Metrics) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* 1. Nhiệt độ */}
                <Card className="shadow-none border-slate-200/80 rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-600">
                            Nhiệt độ
                        </CardTitle>
                        <div className="p-2 bg-red-100/60 rounded-lg text-red-600">
                            <Thermometer className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-slate-900">
                            {sensorDetail.metrics.temperature.value}{" "}
                            <span className="text-2xl">
                                {sensorDetail.metrics.temperature.unit}
                            </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-500 mt-2 flex items-center gap-1.5">
                            <span className="w-2.5 h-[2px] bg-red-500 inline-block"></span>
                            {sensorDetail.metrics.temperature.note}
                        </p>
                    </CardContent>
                </Card>

                {/* 2. Nồng độ khói */}
                <Card className="shadow-none border-slate-200/80 rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-600">
                            Nồng độ khói
                        </CardTitle>
                        <div className="p-2 bg-red-100/60 rounded-lg text-red-600">
                            <Wind className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-slate-900">
                            {sensorDetail.metrics.smoke.value}{" "}
                            <span className="text-2xl">
                                {sensorDetail.metrics.smoke.unit}
                            </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-500 mt-2 flex items-center gap-1.5">
                            <span className="w-2.5 h-[2px] bg-red-500 inline-block"></span>
                            {sensorDetail.metrics.smoke.note}
                        </p>
                    </CardContent>
                </Card>

                {/* 3. Khí CO */}
                <Card className="shadow-none border-slate-200/80 rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-600">
                            Khí CO
                        </CardTitle>
                        <div className="p-2 bg-amber-100/60 rounded-lg text-amber-600">
                            <Activity className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-slate-900">
                            {sensorDetail.metrics.co.value}{" "}
                            <span className="text-2xl">
                                {sensorDetail.metrics.co.unit}
                            </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-500 mt-2 flex items-center gap-1.5">
                            <span className="w-2.5 h-[2px] bg-amber-500 inline-block"></span>
                            {sensorDetail.metrics.co.note}
                        </p>
                    </CardContent>
                </Card>

                {/* 4. Chỉ số Nguy cơ FRI (Chỉ số màu đỏ cảnh báo) */}
                <Card className={`shadow-none border-2 rounded-xl ${isFire ? "border-red-500 bg-red-50/20" : isWarning ? "border-amber-400 bg-amber-50/30" : "border-slate-200 bg-white"}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className={`text-sm font-bold ${isFire ? "text-red-600" : isWarning ? "text-amber-700" : "text-slate-700"}`}>
                            Chỉ số Nguy cơ FRI
                        </CardTitle>
                        <AlertTriangle className={`h-5 w-5 ${isFire ? "text-red-600" : isWarning ? "text-amber-600" : "text-slate-400"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-black ${isFire ? "text-red-600" : isWarning ? "text-amber-700" : "text-slate-800"}`}>
                            {sensorDetail.metrics.fri.score} /{" "}
                            {sensorDetail.metrics.fri.maxScore}
                        </div>
                        <p className={`text-xs font-bold mt-2 ${isFire ? "text-red-600" : isWarning ? "text-amber-700" : "text-slate-500"}`}>
                            {sensorDetail.metrics.fri.note}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Grid: Biểu đồ & Chẩn đoán phần cứng */}
            <div className="grid gap-6 md:grid-cols-12">
                {/* Cột Trái: Biểu đồ (7 cols) */}
                <Card className="md:col-span-7 shadow-none border-slate-200/80 rounded-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-bold text-slate-900">
                            Biểu đồ gia tăng nhiệt độ thực tế
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={sensorDetail.chartData}>
                                    <XAxis dataKey="time" hide />
                                    <YAxis hide domain={["auto", "auto"]} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#ffffff",
                                            borderRadius: "8px",
                                            border: "1px solid #e2e8f0",
                                            fontSize: "12px",
                                        }}
                                        formatter={(value) => [`${value} °C`, "Nhiệt độ"]}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="temp"
                                        stroke="#dc2626"
                                        strokeWidth={3}
                                        dot={{
                                            r: 0,
                                        }}
                                        activeDot={{
                                            r: 6,
                                            fill: "#dc2626",
                                            stroke: "#ffffff",
                                            strokeWidth: 2,
                                        }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Cột Phải: Chẩn đoán phần cứng (5 cols) */}
                <Card className="md:col-span-5 shadow-none border-slate-200/80 rounded-xl">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-bold text-slate-900">
                            Chẩn đoán phần cứng
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                        {sensorDetail.hardwareDiagnostics.map((item, idx) => {
                            const statusClass = item.status === "danger" ? "text-red-600" : item.status === "warning" ? "text-amber-600" : "text-emerald-600";

                            return (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-xl border border-slate-100"
                                >
                                    <span className="text-xs font-medium text-slate-600">
                                        {item.label}
                                    </span>
                                    <span
                                        className={`text-xs font-bold ${statusClass}`}
                                    >
                                        {item.value}
                                    </span>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function SensorDetailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex-1 bg-[#f8fafc]" />}>
            <SensorDetailContent />
        </Suspense>
    );
}