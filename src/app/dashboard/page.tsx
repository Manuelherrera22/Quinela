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
import { RulesModal } from "@/components/features/RulesModal";
import { CountdownTimer } from "@/components/features/CountdownTimer";
import { BookOpen } from "lucide-react";
import { Match } from "@/types";
import { GROUPS } from "@/lib/constants";
import { BottomNav } from "@/components/BottomNav";
import { vibrate } from "@/lib/utils";
import { Filter } from "lucide-react";
import { LayoutGrid, Swords, Flame, Medal, Crown, LogOut, User, BarChart } from "lucide-react";
import { AppState } from "@/lib/store/types";

export default function DashboardPage() {
    const router = useRouter();
    const user = useStore((state: AppState) => state.user);
    const matches = useStore((state: AppState) => state.matches);
    const users = useStore((state: AppState) => state.users);

    // Tipado explícito para evitar errores de 'any'
    const logoutUser = useStore((state: AppState) => state.logoutUser);

    const [activeTab, setActiveTab] = useState("matches");
    const [showRules, setShowRules] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<string>("all");
    const [selectedStage, setSelectedStage] = useState<string>("group");
    const [showPendingOnly, setShowPendingOnly] = useState(false);
    const predictions = useStore((state: AppState) => state.predictions);

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
        if (showPendingOnly) {
            filtered = filtered.filter(m => m.status === 'open' && !predictions.some(p => p.matchId === m.id));
        }
        return filtered;
    }, [matches, selectedGroup, selectedStage, showPendingOnly, predictions]);

    const pendingCount = useMemo(() => {
        return matches.filter(m => m.status === 'open' && !predictions.some(p => p.matchId === m.id)).length;
    }, [matches, predictions]);

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
        <main className="min-h-screen bg-[#001a3d] pb-24 md:pb-10">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-[#00377B]/90 backdrop-blur-md shadow-lg border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">

                    {/* Logo & Desktop Nav */}
                    <div className="flex items-center gap-8">
                        <div className="relative w-28 h-8 md:w-32 md:h-10">
                            <Image
                                src="/tigo-logo-1.png"
                                alt="Tigo Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>

                        {/* Desktop Navigation Links */}
                        <nav className="hidden md:flex items-center gap-6">
                            <Link href="/dashboard" className={`text-sm font-bold uppercase tracking-wider hover:text-yellow-400 transition-colors ${activeTab === 'matches' ? 'text-yellow-400' : 'text-white/70'}`} onClick={() => setActiveTab('matches')}>
                                Partidos
                            </Link>
                            <Link href="/stats" className="text-sm font-bold uppercase tracking-wider text-white/70 hover:text-yellow-400 transition-colors">
                                Estadísticas
                            </Link>
                        </nav>
                    </div>


                    {/* Desktop User Menu & Stats */}
                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex gap-4 text-white text-xs md:text-sm">
                            <div className="text-center">
                                <span className="block opacity-60 text-[10px] md:text-xs">JUGADORES</span>
                                <span className="font-bold">{users.length}</span>
                            </div>
                            <div className="text-center">
                                <span className="block opacity-60 text-[10px] md:text-xs">POSICIÓN</span>
                                <span className="font-bold">{rankingPosition}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link href="/profile" className="flex items-center gap-3 group">
                                <div className="text-right hidden md:block">
                                    <div className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors">{user.name}</div>
                                    <div className="text-[10px] text-yellow-400 font-bold">{user.points} PTS</div>
                                </div>
                                <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-yellow-400/50 group-hover:border-yellow-400 transition-all overflow-hidden bg-[#002a5e]">
                                    {user.avatarUrl ? (
                                        <Image src={user.avatarUrl} alt="Avatar" fill className="object-cover" />
                                    ) : (
                                        <User className="w-full h-full p-1.5 text-white/50" />
                                    )}
                                </div>
                            </Link>

                            <button
                                onClick={() => logoutUser()}
                                className="p-2 text-white/50 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors"
                                title="Cerrar Sesión"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Tabs Wrapper */}
                <div className="md:hidden pb-4 mt-2">

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

            <RulesModal
                isOpen={showRules}
                onClose={() => setShowRules(false)}
            />

            {/* Main Content */}
            <div className="px-4 pt-6 max-w-md md:max-w-7xl mx-auto transition-all">

                {/* Desktop Tabs/Filter Bar */}
                <div className="hidden md:flex justify-center mb-8 gap-4 items-center relative">
                    <Tabs
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        tabs={[
                            { id: "ranking", label: "Ranking Global" },
                            { id: "matches", label: "Mis Predicciones" },
                            { id: "positions", label: "Tablas de Posiciones" },
                        ]}
                        className="bg-black/20"
                    />

                    <button
                        onClick={() => setShowRules(true)}
                        className="absolute right-0 flex items-center gap-2 text-xs font-bold text-white/50 hover:text-yellow-400 transition-colors uppercase tracking-wider"
                    >
                        <BookOpen size={14} />
                        Reglamento
                    </button>
                </div>

                {activeTab === "matches" && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Countdown Timer */}
                        <CountdownTimer />

                        {/* Stages Filter */}
                        <div className="flex flex-wrap gap-2 justify-center pb-2">
                            {stages.map(stage => {
                                const Icon = stage.icon;
                                const isSelected = selectedStage === stage.id;
                                return (
                                    <button
                                        key={stage.id}
                                        onClick={() => { setSelectedStage(stage.id); vibrate(5); }}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all ${isSelected
                                            ? 'bg-yellow-400 text-[#00377B] shadow-lg shadow-yellow-400/20 scale-105'
                                            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        <Icon size={16} />
                                        {stage.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Pending Filter */}
                        {pendingCount > 0 && (
                            <div className="flex justify-center">
                                <button
                                    onClick={() => { setShowPendingOnly(!showPendingOnly); vibrate(5); }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${showPendingOnly
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                        : 'bg-white/5 text-orange-400 hover:bg-white/10 border border-orange-500/30'
                                        }`}
                                >
                                    <Filter size={14} />
                                    Sin Predecir ({pendingCount})
                                </button>
                            </div>
                        )}

                        {/* Groups Filter */}
                        {selectedStage === 'group' && (
                            <div className="flex flex-wrap gap-2 justify-center pb-4">
                                <button
                                    onClick={() => setSelectedGroup("all")}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedGroup === "all"
                                        ? "bg-white text-[#00377B]"
                                        : "bg-white/5 text-white/50 hover:bg-white/10"
                                        }`}
                                >
                                    TODOS
                                </button>
                                {GROUPS.map(group => (
                                    <button
                                        key={group}
                                        onClick={() => setSelectedGroup(group)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedGroup === group
                                            ? "bg-white text-[#00377B]"
                                            : "bg-white/5 text-white/50 hover:bg-white/10"
                                            }`}
                                    >
                                        {group}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Matches Grid */}
                        <div className="space-y-8">
                            {Object.entries(groupedMatches).map(([date, groupMatches]) => (
                                <div key={date}>
                                    <div className="flex items-center gap-4 mb-4">
                                        <h3 className="text-white/80 text-lg font-black uppercase tracking-widest">
                                            {date}
                                        </h3>
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-white/20 to-transparent"></div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {groupMatches.map(match => (
                                            <div key={match.id} className="transform transition-all hover:scale-[1.02]">
                                                <MatchCard match={match} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {Object.keys(groupedMatches).length === 0 && (
                                <div className="text-center text-white/40 py-20 flex flex-col items-center">
                                    <Swords size={48} className="mb-4 opacity-50" />
                                    <span className="text-lg font-medium">No hay partidos en esta selección</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "ranking" && (
                    <div className="max-w-4xl mx-auto">
                        <Leaderboard />
                    </div>
                )}

                {activeTab === "positions" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            <BottomNav />
        </main >
    );
}
