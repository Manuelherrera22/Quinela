"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, vibrate } from "@/lib/utils";
import { Trophy, ChartNoAxesCombined, UserCircle } from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Partidos", icon: Trophy },
    { href: "/stats", label: "Stats", icon: ChartNoAxesCombined },
    { href: "/profile", label: "Perfil", icon: UserCircle },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#001d40]/90 backdrop-blur-xl border-t border-white/10 safe-area-bottom shadow-2xl">
            <div className="max-w-md mx-auto flex justify-around items-center py-3">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => vibrate(5)}
                            className={cn(
                                "flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all relative",
                                isActive
                                    ? "text-yellow-400"
                                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                            )}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-yellow-400/10 blur-lg rounded-full" />
                            )}
                            <Icon
                                size={24}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={cn("transition-transform duration-300", isActive && "scale-110")}
                            />
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider transition-all",
                                isActive ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
