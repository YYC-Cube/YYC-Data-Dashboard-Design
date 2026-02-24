/**
 * BottomNav 组件
 * ==============
 * 移动端底部固定导航栏
 * 最小触控目标 44x44px，拇指友好操作
 */

import React from "react";
import { useNavigate, useLocation } from "react-router";
import { Activity, FileSearch, Users, Settings } from "lucide-react";

const navItems = [
  { label: "监控", path: "/", icon: Activity },
  { label: "审计", path: "/audit", icon: FileSearch },
  { label: "用户", path: "/users", icon: Users },
  { label: "设置", path: "/settings", icon: Settings },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[rgba(6,14,31,0.95)] backdrop-blur-2xl border-t border-[rgba(0,180,255,0.12)] safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                flex flex-col items-center justify-center gap-1
                min-w-[56px] min-h-[50px] rounded-xl px-3 py-1.5
                transition-all duration-200
                ${isActive
                  ? "text-[#00d4ff]"
                  : "text-[rgba(0,212,255,0.35)] active:text-[#00d4ff]"
                }
              `}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-all ${isActive ? "drop-shadow-[0_0_6px_rgba(0,212,255,0.5)]" : ""}`} />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#00d4ff] shadow-[0_0_6px_rgba(0,212,255,0.5)]" />
                )}
              </div>
              <span style={{ fontSize: "0.62rem" }}>{item.label}</span>
            </button>
          );
        })}
      </div>
      {/* Safe area spacer for iOS notch */}
      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </div>
  );
}
