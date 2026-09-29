export type SensorStatus = "normal" | "warning" | "fire" | "offline";

export type Sensor = {
  id: string;
  name: string;
  building: string;
  floor: number;
  room: string;
  status: SensorStatus;
  temperature: number;
  smoke: number;
  co: number;
  lastSeen: string;
};

export type FireAlert = {
  id: string;
  sensorId: string;
  location: string;
  type: "Báo cháy" | "Cảnh báo" | "Ngoại tuyến";
  message: string;
  time: string;
  acknowledged: boolean;
};

export const sensors: Sensor[] = [
  { id: "NODE_01", name: "Cảm biến NODE_01", building: "Tòa nhà FireWar", floor: 3, room: "Phòng 301", status: "normal", temperature: 26.5, smoke: 120, co: 18, lastSeen: "07:31:15" },
  { id: "NODE_02", name: "Cảm biến NODE_02", building: "Tòa nhà FireWar", floor: 3, room: "Phòng 302", status: "warning", temperature: 42, smoke: 410, co: 38, lastSeen: "07:31:14" },
  { id: "NODE_03", name: "Cảm biến NODE_03", building: "Tòa nhà FireWar", floor: 3, room: "Phòng 305", status: "fire", temperature: 72.5, smoke: 850, co: 120, lastSeen: "07:31:15" },
  { id: "NODE_04", name: "Cảm biến NODE_04", building: "Tòa nhà FireWar", floor: 3, room: "Phòng 304", status: "normal", temperature: 24.8, smoke: 90, co: 16, lastSeen: "07:31:12" },
  { id: "NODE_05", name: "Cảm biến NODE_05", building: "Tòa nhà FireWar", floor: 5, room: "Phòng 502", status: "warning", temperature: 48.2, smoke: 520, co: 88, lastSeen: "07:28:11" },
  { id: "NODE_06", name: "Cảm biến NODE_06", building: "Tòa nhà FireWar", floor: 3, room: "Phòng 306", status: "normal", temperature: 27, smoke: 110, co: 20, lastSeen: "07:31:09" },
  { id: "NODE_07", name: "Cảm biến NODE_07", building: "Tòa nhà FireWar", floor: 7, room: "Phòng 704", status: "offline", temperature: 0, smoke: 0, co: 0, lastSeen: "07:20:03" },
  { id: "NODE_08", name: "Cảm biến NODE_08", building: "Tòa nhà FireWar", floor: 3, room: "Phòng 303", status: "normal", temperature: 25, smoke: 105, co: 17, lastSeen: "07:31:10" },
];

export const initialAlerts: FireAlert[] = [
  { id: "ALT-001", sensorId: "NODE_03", location: "Tầng 3 · Phòng 305", type: "Báo cháy", message: "Phát hiện nhiệt độ và nồng độ khói vượt ngưỡng nguy hiểm.", time: "07:31:15", acknowledged: false },
  { id: "ALT-002", sensorId: "NODE_05", location: "Tầng 5 · Phòng 502", type: "Cảnh báo", message: "Nhiệt độ tăng cao, cần kiểm tra khu vực.", time: "07:28:11", acknowledged: false },
  { id: "ALT-003", sensorId: "NODE_07", location: "Tầng 7 · Phòng 704", type: "Ngoại tuyến", message: "Không nhận được tín hiệu từ nút cảm biến.", time: "07:20:03", acknowledged: true },
  { id: "ALT-004", sensorId: "NODE_02", location: "Tầng 3 · Phòng 302", type: "Cảnh báo", message: "Nồng độ khói đã vượt ngưỡng cảnh báo.", time: "07:12:48", acknowledged: true },
];

export function sensorStatusLabel(status: SensorStatus) {
  switch (status) {
    case "normal": return "Ổn định";
    case "warning": return "Cảnh báo";
    case "fire": return "Báo cháy";
    case "offline": return "Ngoại tuyến";
  }
}

export function sensorStatusClass(status: SensorStatus) {
  switch (status) {
    case "normal": return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "warning": return "border-amber-200 bg-amber-50 text-amber-700";
    case "fire": return "border-red-200 bg-red-50 text-red-700";
    case "offline": return "border-slate-200 bg-slate-100 text-slate-600";
  }
}
