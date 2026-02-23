"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, vibrate } from "@/lib/utils";
import { Trophy, ChartNoAxesCombined, UserCircle, Shield } from "lucide-react";
import Image from "next/image";
import { useStore } from "@/lib/store";

export function BottomNav() {
    const pathname = usePathname();
    const user = useStore((state) => state.user);

    const navItems = [
        { href: "/dashboard", label: "Partidos", icon: Trophy },
        { href: "/stats", label: "Stats", icon: ChartNoAxesCombined },
        ...(user?.email === 'admin@quinela.com' ? [{ href: "/admin", label: "Admin", icon: Shield }] : []),
        { href: "/profile", label: "Perfil", icon: UserCircle },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#001d40]/95 backdrop-blur-xl border-t border-white/10 shadow-2xl md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            <div className="max-w-md mx-auto flex justify-around items-center py-1.5">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    const isProfile = item.href === "/profile";

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => vibrate(5)}
                            className={cn(
                                "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all relative",
                                isActive
                                    ? "text-yellow-400"
                                    : "text-white/50 hover:text-white/80"
                            )}
                        >
                            {isProfile && user?.avatarUrl ? (
                                <div className={cn("relative w-5 h-5 rounded-full overflow-hidden border-2 transition-all duration-300", isActive ? "border-yellow-400" : "border-white/50")}>
                                    <Image
                                        src={user.avatarUrl}
                                        alt="Avatar"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <Icon
                                    size={20}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                            )}

                            <span className={cn(
                                "text-[9px] font-bold uppercase tracking-wider transition-all",
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
