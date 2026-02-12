"use client";

import { useStore } from "@/lib/store";
import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { COUNTRIES, COUNTRY_FLAG_MAP, GROUPS } from "@/lib/constants";
import { AppState } from "@/lib/store/types";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import {
    ArrowLeft, Shield, Trophy, Users, Swords, BarChart3,
    Download, Search, LayoutGrid, Flame, Medal, Crown,
    RefreshCw, Lock
} from "lucide-react";

export default function AdminPage() {
    const router = useRouter();
    const user = useStore((state: AppState) => state.user);
    const matches = useStore((state: AppState) => state.matches);
    const users = useStore((state: AppState) => state.users);
    const updateMatchResult = useStore((state: AppState) => state.updateMatchResult);
    const settings = useStore((state: AppState) => state.settings);
    const setAdminChampion = useStore((state: AppState) => state.setAdminChampion);
    const fetchInitialData = useStore((state: AppState) => state.fetchInitialData);

    const [editScores, setEditScores] = useState<Record<string, { home: string; away: string }>>({});
    const [selectedChampion, setSelectedChampion] = useState(settings.champion || "");
    const [activeSection, setActiveSection] = useState<"stats" | "matches" | "users" | "champion">("stats");
    const [matchStageFilter, setMatchStageFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (settings.champion) setSelectedChampion(settings.champion);
    }, [settings.champion]);

    useEffect(() => {
        if (user && user.email !== "admin@quinela.com") {
            router.push("/dashboard");
        }
    }, [user, router]);

    // Stats calculations
    const stats = useMemo(() => {
        const totalUsers = users.length;
        const totalMatches = matches.length;
        const finishedMatches = matches.filter(m => m.status === "finished").length;
        const lockedMatches = matches.filter(m => m.status === "locked").length;
        const openMatches = matches.filter(m => m.status === "open").length;
        const avgPoints = totalUsers > 0 ? Math.round(users.reduce((sum, u) => sum + u.points, 0) / totalUsers) : 0;
        const topUser = users.length > 0 ? [...users].sort((a, b) => b.points - a.points)[0] : null;

        return { totalUsers, totalMatches, finishedMatches, lockedMatches, openMatches, avgPoints, topUser };
    }, [users, matches]);

    // Filtered matches
    const filteredMatches = useMemo(() => {
        let filtered = matches;
        if (matchStageFilter !== "all") {
            filtered = filtered.filter(m => m.stage === matchStageFilter);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(m =>
                m.homeTeam.toLowerCase().includes(q) || m.awayTeam.toLowerCase().includes(q)
            );
        }
        return filtered;
    }, [matches, matchStageFilter, searchQuery]);

    if (!user || user.email !== "admin@quinela.com") {
        return (
            <div className="min-h-screen bg-[#001a3d] flex items-center justify-center text-white">
                <Shield size={48} className="animate-pulse" />
            </div>
        );
    }

    const handleScoreChange = (matchId: string, type: "home" | "away", value: string) => {
        setEditScores(prev => ({
            ...prev,
            [matchId]: {
                ...prev[matchId],
                [type]: value,
                ...(type === "home" ? { away: prev[matchId]?.away ?? "" } : { home: prev[matchId]?.home ?? "" })
            }
        }));
    };

    const handleUpdate = async (matchId: string) => {
        const scores = editScores[matchId];
        if (!scores || scores.home === "" || scores.away === "") return;
        await updateMatchResult(matchId, parseInt(scores.home), parseInt(scores.away));
        toast.success("Resultado actualizado ✅");
        setEditScores(prev => {
            const copy = { ...prev };
            delete copy[matchId];
            return copy;
        });
    };

    const handleSetChampion = async () => {
        if (selectedChampion) {
            await setAdminChampion(selectedChampion);
            toast.success(`Campeón: ${selectedChampion}. Puntos recalculados ✅`);
        }
    };

    const handleResetPassword = async (email: string) => {
        const newPassword = Math.random().toString(36).slice(-6);
        const bcrypt = (await import("bcryptjs")).default;
        const hashed = await bcrypt.hash(newPassword, 10);

        const { error } = await supabase
            .from("users")
            .update({ password: hashed })
            .eq("email", email);

        if (error) {
            toast.error("Error al resetear contraseña");
        } else {
            toast(`Nueva contraseña para ${email}: ${newPassword}`, { duration: 10000, icon: "🔑" });
        }
    };

    const handleExportCSV = async () => {
        const { data: predictions } = await supabase.from("predictions").select("*");
        if (!predictions || predictions.length === 0) {
            toast.error("No hay predicciones para exportar");
            return;
        }

        const headers = ["user_email", "match_id", "home_score", "away_score"];
        const csv = [
            headers.join(","),
            ...predictions.map(p => `${p.user_email},${p.match_id},${p.home_score},${p.away_score}`)
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `predicciones_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("CSV descargado 📊");
    };

    const sections = [
        { id: "stats", label: "Dashboard", icon: BarChart3 },
        { id: "matches", label: "Partidos", icon: Swords },
        { id: "users", label: "Usuarios", icon: Users },
        { id: "champion", label: "Campeón", icon: Trophy },
    ];

    const stageOptions = [
        { id: "all", label: "Todos" },
        { id: "group", label: "Grupos", icon: LayoutGrid },
        { id: "r32", label: "Octavos" },
        { id: "qf", label: "Cuartos", icon: Flame },
        { id: "sf", label: "Semis", icon: Medal },
        { id: "f", label: "Final", icon: Crown },
    ];

    return (
        <div className="min-h-screen bg-[#001a3d] text-white font-sans">
            {/* Header */}
            <div className="bg-[#00377B]/90 backdrop-blur-md py-4 px-6 flex items-center justify-between shadow-lg sticky top-0 z-20 border-b border-white/5">
                <Link href="/dashboard" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group">
                    <div className="bg-white/10 p-2 rounded-full group-hover:bg-white/20 transition-all">
                        <ArrowLeft size={18} />
                    </div>
                </Link>
                <div className="flex items-center gap-3">
                    <Shield size={20} className="text-red-400" />
                    <h1 className="text-lg font-black tracking-widest uppercase">Admin Panel</h1>
                </div>
                <button onClick={() => fetchInitialData()} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all">
                    <RefreshCw size={16} />
                </button>
            </div>

            <div className="max-w-6xl mx-auto p-4 md:p-8">
                {/* Section Tabs */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {sections.map(section => {
                        const Icon = section.icon;
                        const isActive = activeSection === section.id;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id as any)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${isActive
                                    ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                                    : "bg-white/5 text-white/60 hover:bg-white/10"
                                    }`}
                            >
                                <Icon size={16} />
                                {section.label}
                            </button>
                        );
                    })}
                </div>

                {/* Stats Dashboard */}
                {activeSection === "stats" && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="p-5 bg-gradient-to-br from-blue-600 to-blue-800 border-none rounded-2xl text-center">
                                <Users size={24} className="mx-auto mb-2 opacity-60" />
                                <div className="text-3xl font-black">{stats.totalUsers}</div>
                                <div className="text-[10px] uppercase tracking-widest opacity-70 font-bold">Jugadores</div>
                            </Card>
                            <Card className="p-5 bg-gradient-to-br from-green-500 to-emerald-700 border-none rounded-2xl text-center">
                                <Swords size={24} className="mx-auto mb-2 opacity-60" />
                                <div className="text-3xl font-black">{stats.finishedMatches}<span className="text-lg opacity-50">/{stats.totalMatches}</span></div>
                                <div className="text-[10px] uppercase tracking-widest opacity-70 font-bold">Jugados</div>
                            </Card>
                            <Card className="p-5 bg-gradient-to-br from-yellow-500 to-amber-600 border-none rounded-2xl text-center text-[#001a3d]">
                                <Trophy size={24} className="mx-auto mb-2 opacity-60" />
                                <div className="text-3xl font-black">{stats.avgPoints}</div>
                                <div className="text-[10px] uppercase tracking-widest opacity-70 font-bold">Prom. Puntos</div>
                            </Card>
                            <Card className="p-5 bg-gradient-to-br from-purple-500 to-purple-800 border-none rounded-2xl text-center">
                                <Lock size={24} className="mx-auto mb-2 opacity-60" />
                                <div className="text-3xl font-black">{stats.lockedMatches}</div>
                                <div className="text-[10px] uppercase tracking-widest opacity-70 font-bold">Bloqueados</div>
                            </Card>
                        </div>

                        {stats.topUser && (
                            <Card className="p-6 bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/20 rounded-2xl">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white/10 flex items-center justify-center ring-2 ring-yellow-400">
                                        {stats.topUser.avatarUrl ? (
                                            <Image src={stats.topUser.avatarUrl} alt="Top" fill className="object-cover" />
                                        ) : COUNTRY_FLAG_MAP[stats.topUser.country] ? (
                                            <Image src={`https://flagcdn.com/w80/${COUNTRY_FLAG_MAP[stats.topUser.country]}.png`} alt="" fill className="object-cover" />
                                        ) : <Users size={24} />}
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-yellow-400 uppercase tracking-widest font-bold">Líder Actual</div>
                                        <div className="text-xl font-black">{stats.topUser.name}</div>
                                        <div className="text-white/50 text-sm">{stats.topUser.points} pts • {stats.topUser.exactMatches} exactos</div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        <div className="flex gap-4">
                            <Button onClick={handleExportCSV} className="bg-white/10 hover:bg-white/20 text-white border border-white/10 flex items-center gap-2">
                                <Download size={16} />
                                Exportar Predicciones CSV
                            </Button>
                        </div>
                    </div>
                )}

                {/* Matches Section */}
                {activeSection === "matches" && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex flex-wrap gap-2">
                                {stageOptions.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setMatchStageFilter(s.id)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${matchStageFilter === s.id
                                            ? "bg-red-500 text-white"
                                            : "bg-white/5 text-white/50 hover:bg-white/10"
                                            }`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                            <div className="relative flex-1 min-w-[200px]">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                <input
                                    type="text"
                                    placeholder="Buscar equipo..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                                />
                            </div>
                        </div>

                        {/* Match List */}
                        <div className="space-y-3">
                            {filteredMatches.map(match => {
                                const isEditing = !!editScores[match.id];
                                return (
                                    <Card key={match.id} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/[0.07] transition-colors">
                                        <div className="flex items-center justify-between gap-4 flex-wrap">
                                            <div className="flex-1 min-w-[200px]">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-black text-sm">{match.homeTeam}</span>
                                                    <span className="text-white/30 text-xs">vs</span>
                                                    <span className="font-black text-sm">{match.awayTeam}</span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] text-white/40">
                                                        {new Date(match.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                                                    </span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${match.status === "finished" ? "bg-green-500/20 text-green-400"
                                                        : match.status === "locked" ? "bg-red-500/20 text-red-400"
                                                            : "bg-blue-500/20 text-blue-400"
                                                        }`}>
                                                        {match.status === "finished" ? `${match.homeScore}-${match.awayScore}` : match.status.toUpperCase()}
                                                    </span>
                                                    {match.group && <span className="text-[10px] text-white/30">Grupo {match.group}</span>}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    className="w-14 bg-white/5 border-white/10 text-white text-center text-sm rounded-lg"
                                                    placeholder={match.homeScore?.toString() ?? "0"}
                                                    value={editScores[match.id]?.home ?? ""}
                                                    onChange={e => handleScoreChange(match.id, "home", e.target.value)}
                                                />
                                                <span className="text-white/30 font-bold">-</span>
                                                <Input
                                                    type="number"
                                                    className="w-14 bg-white/5 border-white/10 text-white text-center text-sm rounded-lg"
                                                    placeholder={match.awayScore?.toString() ?? "0"}
                                                    value={editScores[match.id]?.away ?? ""}
                                                    onChange={e => handleScoreChange(match.id, "away", e.target.value)}
                                                />
                                                <Button
                                                    onClick={() => handleUpdate(match.id)}
                                                    className="bg-green-600 hover:bg-green-500 text-white text-xs px-4 py-2 rounded-lg font-bold"
                                                >
                                                    OK
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Users Section */}
                {activeSection === "users" && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="text-white/50 text-sm mb-4">{users.length} usuarios registrados</div>
                        <div className="space-y-2">
                            {[...users].sort((a, b) => b.points - a.points).map((u, i) => (
                                <Card key={u.email} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                    <div className="flex items-center justify-between gap-4 flex-wrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black overflow-hidden relative">
                                                {u.avatarUrl ? (
                                                    <Image src={u.avatarUrl} alt="" fill className="object-cover" />
                                                ) : (
                                                    <span>{i + 1}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm">{u.name}</div>
                                                <div className="text-[10px] text-white/40">{u.email}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="font-black text-yellow-400">{u.points} pts</div>
                                                <div className="text-[10px] text-white/40">{u.exactMatches} exactos</div>
                                            </div>
                                            {u.selectedChampion && (
                                                <div className="text-[10px] bg-white/10 px-2 py-1 rounded text-white/60">
                                                    🏆 {u.selectedChampion}
                                                </div>
                                            )}
                                            <Button
                                                onClick={() => handleResetPassword(u.email)}
                                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[10px] px-3 py-1 rounded-lg font-bold"
                                            >
                                                Reset Pass
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Champion Section */}
                {activeSection === "champion" && (
                    <div className="space-y-6 animate-fade-in">
                        <Card className="p-8 bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-yellow-500/20 rounded-2xl">
                            <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                                <Trophy className="text-yellow-400" size={24} />
                                Definir Campeón del Torneo
                            </h2>
                            <div className="flex flex-wrap gap-4 items-end">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-2 block">
                                        Seleccionar País
                                    </label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400/50"
                                        value={selectedChampion}
                                        onChange={e => setSelectedChampion(e.target.value)}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {COUNTRIES.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <Button
                                    onClick={handleSetChampion}
                                    className="bg-yellow-500 hover:bg-yellow-400 text-[#001a3d] font-black px-8 py-3 rounded-xl"
                                >
                                    Confirmar Campeón
                                </Button>
                            </div>
                            <p className="text-sm text-white/40 mt-4">
                                Campeón actual: <strong className="text-yellow-400">{settings.champion || "Sin definir"}</strong>
                            </p>
                            <p className="text-xs text-white/30 mt-2">
                                Al confirmar, se sumarán +10 puntos a los usuarios que lo hayan elegido y se recalculará el ranking.
                            </p>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
