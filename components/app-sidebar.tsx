"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Building2, Cpu, Bell, Settings, Flame, History } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { NavUser } from "./nav-user"

const items = [
  { title: "Tổng quan", url: "/", icon: LayoutDashboard },
  { title: "Tòa nhà", url: "/toa-nha", icon: Building2 },
  { title: "Cảm biến", url: "/cam-bien/danh-sach", icon: Cpu },
  { title: "Cảnh báo", url: "/canh-bao", icon: Bell },
  { title: "Lịch sử", url: "/lich-su", icon: History },
  { title: "Cấu hình", url: "/cau-hinh", icon: Settings },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const user = {
    name: 'Than',
    email: 'abc@gmail',
    avatar: '/share_1790069348835.png'
  }
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem >
            <div className="flex items-center gap-2">
              <div className="bg-red-600 p-1.5 rounded-lg text-white">
                <Flame className="w-5 h-5 fill-white" />
              </div>
              <h1 className="font-bold text-slate-900">FireWar</h1>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {
                items.map((i) => (
                  <SidebarMenuItem key={i.title}>
                    <Link href={i.url} className="w-full">
                      <SidebarMenuButton className={`hover:bg-slate-800 hover:text-white w-full ${pathname === i.url || (i.url !== "/" && pathname.startsWith(`${i.url}/`)) || (i.title === "Cảm biến" && pathname.startsWith("/cam-bien")) ? 'bg-slate-800 text-white hover:bg-slate-800 hover:text-white' : ''}`}>
                        <i.icon className="w-4 h-4" />
                        <span>{i.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))
              }
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
