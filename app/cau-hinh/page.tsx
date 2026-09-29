"use client";

import {
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  Bell,
  Check,
  ChevronDown,
  Clock3,
  Gauge,
  RotateCcw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Settings = {
  thresholds: {
    temperatureWarning: string;
    temperatureFire: string;
    smokeWarning: string;
    smokeFire: string;
    coWarning: string;
    friWarning: string;
  };
  updateInterval: string;
  nodeTimeout: string;
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  notificationEmail: string;
  accountName: string;
  accountEmail: string;
  passwordReminder: boolean;
};

type Feedback = {
  type: "success" | "error";
  text: string;
};

type SettingsSnapshot = {
  settings: Settings;
  error: boolean;
};

const STORAGE_KEY = "firewar-system-settings";

const defaultSettings: Settings = {
  thresholds: {
    temperatureWarning: "60",
    temperatureFire: "80",
    smokeWarning: "400",
    smokeFire: "700",
    coWarning: "100",
    friWarning: "50",
  },
  updateInterval: "5",
  nodeTimeout: "30",
  channels: {
    email: true,
    sms: false,
    push: true,
  },
  notificationEmail: "admin@firesystem.vn",
  accountName: "Quản trị viên",
  accountEmail: "admin@firesystem.vn",
  passwordReminder: true,
};

const defaultSnapshot: SettingsSnapshot = {
  settings: defaultSettings,
  error: false,
};
const invalidSnapshot: SettingsSnapshot = {
  settings: defaultSettings,
  error: true,
};

let cachedStorageValue: string | null | undefined;
let hasCachedStorageValue = false;
let cachedSnapshot = defaultSnapshot;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSettings(value: unknown): value is Settings {
  if (!isRecord(value)) return false;
  const thresholds = value.thresholds;
  const channels = value.channels;

  return (
    isRecord(thresholds) &&
    typeof thresholds.temperatureWarning === "string" &&
    typeof thresholds.temperatureFire === "string" &&
    typeof thresholds.smokeWarning === "string" &&
    typeof thresholds.smokeFire === "string" &&
    typeof thresholds.coWarning === "string" &&
    typeof thresholds.friWarning === "string" &&
    (value.updateInterval === "5" ||
      value.updateInterval === "10" ||
      value.updateInterval === "30") &&
    typeof value.nodeTimeout === "string" &&
    isRecord(channels) &&
    typeof channels.email === "boolean" &&
    typeof channels.sms === "boolean" &&
    typeof channels.push === "boolean" &&
    typeof value.notificationEmail === "string" &&
    typeof value.accountName === "string" &&
    typeof value.accountEmail === "string" &&
    typeof value.passwordReminder === "boolean"
  );
}

function getValidationMessage(settings: Settings): string | null {
  const temperatureWarning = Number(settings.thresholds.temperatureWarning);
  const temperatureFire = Number(settings.thresholds.temperatureFire);
  const smokeWarning = Number(settings.thresholds.smokeWarning);
  const smokeFire = Number(settings.thresholds.smokeFire);
  const coWarning = Number(settings.thresholds.coWarning);
  const friWarning = Number(settings.thresholds.friWarning);
  const nodeTimeout = Number(settings.nodeTimeout);

  if (
    ![
      temperatureWarning,
      temperatureFire,
      smokeWarning,
      smokeFire,
      coWarning,
      friWarning,
      nodeTimeout,
    ].every(Number.isFinite)
  ) {
    return "Vui lòng nhập đầy đủ các thông số dạng số.";
  }
  if (temperatureWarning >= temperatureFire) {
    return "Ngưỡng cảnh báo nhiệt độ phải thấp hơn ngưỡng báo cháy.";
  }
  if (smokeWarning >= smokeFire) {
    return "Ngưỡng cảnh báo khói phải thấp hơn ngưỡng báo cháy.";
  }
  if (
    temperatureWarning <= 0 ||
    temperatureFire <= 0 ||
    smokeWarning <= 0 ||
    smokeFire <= 0 ||
    coWarning <= 0 ||
    nodeTimeout <= 0
  ) {
    return "Các ngưỡng cảm biến và thời gian timeout phải lớn hơn 0.";
  }
  if (friWarning < 0 || friWarning > 100) {
    return "Ngưỡng FRI phải nằm trong khoảng từ 0 đến 100.";
  }
  if (!settings.accountName.trim()) {
    return "Vui lòng nhập tên hiển thị.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.accountEmail)) {
    return "Email tài khoản không hợp lệ.";
  }
  if (
    settings.channels.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.notificationEmail)
  ) {
    return "Hãy nhập email nhận cảnh báo hợp lệ hoặc tắt kênh Email.";
  }

  return null;
}

function getSettingsSnapshot(): SettingsSnapshot {
  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (hasCachedStorageValue && storedValue === cachedStorageValue) {
      return cachedSnapshot;
    }

    hasCachedStorageValue = true;
    cachedStorageValue = storedValue;

    if (!storedValue) {
      cachedSnapshot = defaultSnapshot;
      return cachedSnapshot;
    }

    const parsedSettings: unknown = JSON.parse(storedValue);
    if (
      !isSettings(parsedSettings) ||
      getValidationMessage(parsedSettings) !== null
    ) {
      cachedSnapshot = invalidSnapshot;
      return cachedSnapshot;
    }

    cachedSnapshot = { settings: parsedSettings, error: false };
    return cachedSnapshot;
  } catch {
    hasCachedStorageValue = true;
    cachedStorageValue = null;
    cachedSnapshot = invalidSnapshot;
    return cachedSnapshot;
  }
}

function subscribeToSettings(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("firewar-settings-updated", onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("firewar-settings-updated", onChange);
  };
}

function getServerSettingsSnapshot() {
  return defaultSnapshot;
}

function SettingField({
  id,
  label,
  value,
  onChange,
  unit,
  type = "number",
  min,
  max,
  required = true,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  unit?: string;
  type?: "number" | "email" | "text";
  min?: number;
  max?: number;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          min={min}
          max={max}
          required={required}
          value={value}
          onChange={onChange}
          className={`h-11 rounded-lg border-slate-200 bg-white text-sm shadow-none focus-visible:border-blue-500 focus-visible:ring-blue-500/20 ${unit ? "pr-14" : ""}`}
        />
        {unit && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-400">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function ChannelToggle({
  label,
  enabled,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`Bật hoặc tắt thông báo ${label}`}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
          enabled ? "bg-blue-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const storedSnapshot = useSyncExternalStore(
    subscribeToSettings,
    getSettingsSnapshot,
    getServerSettingsSnapshot,
  );
  const [draftSettings, setDraftSettings] = useState<Settings | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const settings = draftSettings ?? storedSnapshot.settings;

  const updateThreshold = (
    key: keyof Settings["thresholds"],
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setDraftSettings((current) => ({
      ...(current ?? storedSnapshot.settings),
      thresholds: {
        ...(current ?? storedSnapshot.settings).thresholds,
        [key]: event.target.value,
      },
    }));
    setFeedback(null);
  };

  const updateSetting = <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => {
    setDraftSettings((current) => ({
      ...(current ?? storedSnapshot.settings),
      [key]: value,
    }));
    setFeedback(null);
  };

  const toggleChannel = (channel: keyof Settings["channels"]) => {
    setDraftSettings((current) => {
      const currentSettings = current ?? storedSnapshot.settings;
      return {
        ...currentSettings,
      channels: {
          ...currentSettings.channels,
          [channel]: !currentSettings.channels[channel],
      },
      };
    });
    setFeedback(null);
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationMessage = getValidationMessage(settings);
    if (validationMessage) {
      setFeedback({ type: "error", text: validationMessage });
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      window.dispatchEvent(new Event("firewar-settings-updated"));
      setDraftSettings(null);
      setFeedback({
        type: "success",
        text: "Các thay đổi đã được lưu trên thiết bị này.",
      });
    } catch {
      setFeedback({
        type: "error",
        text: "Không thể lưu cấu hình trên thiết bị này. Vui lòng thử lại.",
      });
    }
  };

  const handleCancel = () => {
    setDraftSettings(null);
    setFeedback(null);
  };

  const visibleFeedback =
    feedback ??
    (storedSnapshot.error
      ? {
          type: "error" as const,
          text: "Không thể tải cấu hình đã lưu. Các giá trị mặc định đang được sử dụng.",
        }
      : null);

  return (
    <div className="min-h-screen flex-1 bg-[#f8fafc] text-slate-800">
      <div className="mx-auto w-full max-w-[1220px] space-y-6 px-4 py-5 md:px-8 md:py-7">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <label className="relative">
              <span className="sr-only">Chọn tòa nhà</span>
              <select
                defaultValue="Tòa nhà FireWar"
                className="h-10 appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option>Tòa nhà FireWar</option>
                <option>Tòa nhà A</option>
                <option>Tòa nhà B</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </label>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Clock3 className="h-4 w-4" />
              <span>Cập nhật cuối: 07:31:15</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Hệ thống đang hoạt động
            </div>
            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <UserRound className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                Quản trị viên
              </span>
            </div>
          </div>
        </header>

        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg bg-blue-100 p-2 text-blue-700">
            <SlidersHorizontal className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Thiết lập hệ thống
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Cấu hình thông số và quản lý hệ thống báo cháy.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <Card className="rounded-xl border-slate-200/80 shadow-none">
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
                  <TriangleAlert className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Ngưỡng cảnh báo
                  </CardTitle>
                  <p className="mt-1 text-xs text-slate-500">
                    Thiết lập mức cảnh báo và báo cháy cho các cảm biến.
                  </p>
                </div>
              </div>
              <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 sm:inline-flex">
                Áp dụng toàn hệ thống
              </span>
            </CardHeader>
            <CardContent className="grid gap-x-6 gap-y-5 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-3">
              <SettingField
                id="temperature-warning"
                label="Nhiệt độ cảnh báo"
                value={settings.thresholds.temperatureWarning}
                unit="°C"
                min={1}
                onChange={(event) => updateThreshold("temperatureWarning", event)}
              />
              <SettingField
                id="temperature-fire"
                label="Nhiệt độ báo cháy"
                value={settings.thresholds.temperatureFire}
                unit="°C"
                min={1}
                onChange={(event) => updateThreshold("temperatureFire", event)}
              />
              <SettingField
                id="smoke-warning"
                label="Nồng độ khói cảnh báo"
                value={settings.thresholds.smokeWarning}
                unit="ppm"
                min={1}
                onChange={(event) => updateThreshold("smokeWarning", event)}
              />
              <SettingField
                id="smoke-fire"
                label="Nồng độ khói báo cháy"
                value={settings.thresholds.smokeFire}
                unit="ppm"
                min={1}
                onChange={(event) => updateThreshold("smokeFire", event)}
              />
              <SettingField
                id="co-warning"
                label="Nồng độ CO cảnh báo"
                value={settings.thresholds.coWarning}
                unit="ppm"
                min={1}
                onChange={(event) => updateThreshold("coWarning", event)}
              />
              <SettingField
                id="fri-warning"
                label="FRI ngưỡng cảnh báo"
                value={settings.thresholds.friWarning}
                min={0}
                max={100}
                onChange={(event) => updateThreshold("friWarning", event)}
              />
            </CardContent>
          </Card>

          <Card className="rounded-xl border-slate-200/80 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                  <Gauge className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Cấu hình hệ thống
                  </CardTitle>
                  <p className="mt-1 text-xs text-slate-500">
                    Quản lý kết nối cảm biến và cách nhận thông báo.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 border-t border-slate-100 pt-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="update-interval"
                    className="text-sm font-medium text-slate-700"
                  >
                    Tần suất cập nhật dữ liệu
                  </label>
                  <div className="relative">
                    <select
                      id="update-interval"
                      value={settings.updateInterval}
                      onChange={(event) =>
                        updateSetting("updateInterval", event.target.value)
                      }
                      className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="5">5 giây</option>
                      <option value="10">10 giây</option>
                      <option value="30">30 giây</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
                <SettingField
                  id="node-timeout"
                  label="Thời gian timeout Node"
                  value={settings.nodeTimeout}
                  unit="giây"
                  min={1}
                  onChange={(event) =>
                    updateSetting("nodeTimeout", event.target.value)
                  }
                />
              </div>

              <div className="grid gap-5 border-t border-slate-100 pt-5 lg:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-800">
                      Chế độ gửi cảnh báo
                    </h3>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                    <ChannelToggle
                      label="Email"
                      enabled={settings.channels.email}
                      onToggle={() => toggleChannel("email")}
                    />
                    <ChannelToggle
                      label="SMS"
                      enabled={settings.channels.sms}
                      onToggle={() => toggleChannel("sms")}
                    />
                    <ChannelToggle
                      label="Push notification"
                      enabled={settings.channels.push}
                      onToggle={() => toggleChannel("push")}
                    />
                  </div>
                </div>
                <SettingField
                  id="notification-email"
                  label="Email nhận cảnh báo"
                  type="email"
                  value={settings.notificationEmail}
                  required={settings.channels.email}
                  onChange={(event) =>
                    updateSetting("notificationEmail", event.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-slate-200/80 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-violet-100 p-2 text-violet-700">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Quản lý tài khoản
                  </CardTitle>
                  <p className="mt-1 text-xs text-slate-500">
                    Cập nhật thông tin tài khoản quản trị hệ thống.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 border-t border-slate-100 pt-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <SettingField
                  id="account-name"
                  label="Tên hiển thị"
                  type="text"
                  value={settings.accountName}
                  onChange={(event) =>
                    updateSetting("accountName", event.target.value)
                  }
                />
                <SettingField
                  id="account-email"
                  label="Email"
                  type="email"
                  value={settings.accountEmail}
                  onChange={(event) =>
                    updateSetting("accountEmail", event.target.value)
                  }
                />
              </div>
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3">
                <span className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <span>
                    <span className="block text-sm font-medium text-slate-700">
                      Đổi mật khẩu định kỳ để an toàn
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      Nhắc quản trị viên cập nhật mật khẩu thường xuyên.
                    </span>
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={settings.passwordReminder}
                  onChange={(event) =>
                    updateSetting("passwordReminder", event.target.checked)
                  }
                  className="h-4 w-4 accent-blue-600"
                />
              </label>
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div aria-live="polite" className="min-h-5 text-sm">
              {visibleFeedback && (
                <p
                  role={visibleFeedback.type === "error" ? "alert" : "status"}
                  className={
                    visibleFeedback.type === "error"
                      ? "text-red-600"
                      : "flex items-center gap-2 text-emerald-700"
                  }
                >
                  {visibleFeedback.type === "success" && (
                    <Check className="h-4 w-4" />
                  )}
                  {visibleFeedback.text}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="h-10 gap-2 border-slate-200 bg-white px-4 text-slate-600"
              >
                <RotateCcw className="h-4 w-4" />
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                className="h-10 gap-2 bg-blue-600 px-4 text-white hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
