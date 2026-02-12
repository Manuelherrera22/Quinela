"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Tabs } from "@/components/ui/Tabs";
import { MatchCard } from "@/components/features/MatchCard";
import { Leaderboard } from "@/components/features/Leaderboard";
import { StandingsTable } from "@/components/features/StandingsTable";
import { Match } from "@/types";
import { GROUPS } from "@/lib/constants";
import { BottomNav } from "@/components/BottomNav";
import { vibrate } from "@/lib/utils";
import { LayoutGrid, Swords, Flame, Medal, Crown } from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();
    const user = useStore((state) => state.user);
    const matches = useStore((state) => state.matches);
    const users = useStore((state) => state.users);

    const [activeTab, setActiveTab] = useState("matches");
    const [selectedGroup, setSelectedGroup] = useState<string>("all");
    const [selectedStage, setSelectedStage] = useState<string>("group");

    const filteredMatches = useMemo(() => {
        let filtered = matches.filter((m: Match) => {
            if (selectedStage === 'group') return m.stage === 'group';
            if (selectedStage === 'r32') return m.stage === 'r32';
            if (selectedStage === 'qf') return m.stage === 'qf';
            if (selectedStage === 'sf') return m.stage === 'sf';
            if (selectedStage === 'f') return m.stage === 'f';
            return true;
        });
        if (selectedStage === 'group' && selectedGroup !== 'all') {
            filtered = filtered.filter((m: any) => m.group === selectedGroup);
        }
        return filtered;
    }, [matches, selectedGroup, selectedStage]);

    // Group filtered matches by Date
    const groupedMatches = useMemo(() => {
        const groups: Record<string, Match[]> = {};
        filteredMatches.forEach(match => {
            const dateKey = new Date(match.date).toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
            });
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(match);
        });
        return groups;
    }, [filteredMatches]);

    // Calculate dynamic ranking position
    const rankingPosition = useMemo(() => {
        if (!user) return '-';
        const sortedUsers = [...users].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            return (b.exactMatches || 0) - (a.exactMatches || 0);
        });
        const pos = sortedUsers.findIndex(u => u.email === user.email);
        return pos >= 0 ? pos + 1 : '-';
    }, [users, user]);

    // Auth check
    useEffect(() => {
        if (!user) {
            router.push("/");
        }
    }, [user, router]);

    if (!user) return null;

    const stages = [
        { id: 'group', label: 'Grupos', icon: LayoutGrid },
        { id: 'r32', label: 'Octavos', icon: Swords },
        { id: 'qf', label: 'Cuartos', icon: Flame },
        { id: 'sf', label: 'Semis', icon: Medal },
        { id: 'f', label: 'Final', icon: Crown },
    ];

    return (
        <main className="min-h-screen bg-[#00377B] pb-20">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-[#00377B]/95 backdrop-blur shadow-md">
                <div className="px-4 py-4 text-center text-white">
                    <div className="relative w-32 h-10 mx-auto mb-1">
                        <Image
                            src="/tigo-logo-1.png"
                            alt="Tigo Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div className="flex justify-between items-end text-xs opacity-90 px-4 mt-4 relative">
                        <div className="absolute top-[-3.5rem] right-0 flex items-center space-x-3">
                            <Link
                                href="/profile"
                                className="text-white/60 hover:text-white p-2"
                                title="Mi Perfil"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </Link>
                            <button
                                onClick={() => useStore.getState().logoutUser()}
                                className="text-white/60 hover:text-white p-2"
                                title="Cerrar Sesión"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                            </button>
                        </div>
                        <div className="text-left">
                            <div className="opacity-70">JUGADORES</div>
                            <div className="font-bold text-lg">{users.length}</div>
                        </div>
                        <Link href="/profile" className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95">
                            <div className="bg-yellow-400 text-[#00377B] px-4 py-1 rounded-full font-bold shadow-lg transform translate-y-2 z-10 border-2 border-[#00377B]">
                                {user?.points || 0} PTS
                            </div>
                            {user?.exactMatches !== undefined && (
                                <div className="text-[10px] bg-blue-800 px-2 py-0.5 mt-2 rounded-b-md">
                                    {user.exactMatches} M.E.
                                </div>
                            )}
                        </Link>
                        <div className="text-right">
                            <div className="opacity-70">POSICIONES</div>
                            <div className="font-bold text-lg">{rankingPosition}</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex justify-center pb-4 mt-6">
                    <Tabs
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        tabs={[
                            { id: "ranking", label: "Ranking" },
                            { id: "matches", label: "Partidos" },
                            { id: "positions", label: "Posiciones" },
                        ]}
                    />
                </div>
            </header>

            {/* Content */}
            <div className="px-4 pt-6 max-w-md mx-auto">
                {activeTab === "matches" && (
                    <div className="space-y-4">
                        {/* Stage Filter */}
                        <div className="flex gap-2 justify-center pb-1 overflow-x-auto scrollbar-hide py-2">
                            {stages.map(stage => {
                                const Icon = stage.icon;
                                const isSelected = selectedStage === stage.id;
                                return (
                                    <button
                                        key={stage.id}
                                        onClick={() => {
                                            setSelectedStage(stage.id);
                                            vibrate(5);
                                        }}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${isSelected
                                            ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-[#00377B] shadow-lg scale-105 ring-2 ring-yellow-400/50'
                                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                                            }`}
                                    >
                                        <Icon size={14} strokeWidth={2.5} />
                                        {stage.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Group Filter Pills - only for group stage */}
                        {selectedStage === 'group' && (
                            <div className="flex flex-wrap gap-2 justify-center pb-2">
                                <button
                                    onClick={() => setSelectedGroup("all")}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${selectedGroup === "all"
                                        ? "bg-yellow-400 text-[#00377B] shadow-md"
                                        : "bg-white/10 text-white/70 hover:bg-white/20"
                                        }`}
                                >
                                    TODOS
                                </button>
                                {GROUPS.map(group => (
                                    <button
                                        key={group}
                                        onClick={() => setSelectedGroup(group)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${selectedGroup === group
                                            ? "bg-yellow-400 text-[#00377B] shadow-md"
                                            : "bg-white/10 text-white/70 hover:bg-white/20"
                                            }`}
                                    >
                                        {group}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Match Cards grouped by date */}
                        <div className="space-y-6">
                            {Object.entries(groupedMatches).map(([date, groupMatches]) => (
                                <div key={date}>
                                    <h3 className="text-white/70 text-sm font-bold uppercase mb-2 pl-2 border-l-4 border-yellow-400">
                                        {date}
                                    </h3>
                                    <div className="space-y-2">
                                        {groupMatches.map(match => (
                                            <MatchCard key={match.id} match={match} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {Object.keys(groupedMatches).length === 0 && (
                                <div className="text-center text-white/50 py-10">
                                    No hay partidos en este grupo
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "ranking" && (
                    <Leaderboard />
                )}

                {activeTab === "positions" && (
                    <div className="space-y-6">
                        {GROUPS.map(group => (
                            <StandingsTable
                                key={group}
                                group={group}
                                matches={matches}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <BottomNav />
        </main>
    );
}
