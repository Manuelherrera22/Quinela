"use client";

import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { COUNTRY_FLAG_MAP } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, Target, CheckCircle2, XCircle, Flame, CalendarClock, User, ArrowLeft } from "lucide-react";
import { AppState } from "@/lib/store/types";

export default function StatsPage() {
    const router = useRouter();
    const user = useStore((state: AppState) => state.user);
    const matches = useStore((state: AppState) => state.matches);
    const predictions = useStore((state: AppState) => state.predictions);

    useEffect(() => {
        if (!user) {
            // Let auth handling in layout resolve or redirect
        }
    }, [user, router]);

    const stats = useMemo(() => {
        if (!user) return null;

        const finishedMatches = matches.filter(m => m.status === 'finished');
        const totalFinished = finishedMatches.length;
        const predictedMatches = predictions.filter(p =>
            finishedMatches.some(m => m.id === p.matchId)
        );
        const totalPredicted = predictedMatches.length;

        let exact = 0;
        let correct = 0;
        let missed = 0;

        predictedMatches.forEach(pred => {
            const match = finishedMatches.find(m => m.id === pred.matchId);
            if (!match || match.homeScore === undefined || match.awayScore === undefined) return;

            if (pred.homeScore === match.homeScore && pred.awayScore === match.awayScore) {
                exact++;
            } else {
                const predWinner = pred.homeScore > pred.awayScore ? 'home' : (pred.homeScore < pred.awayScore ? 'away' : 'draw');
                const realWinner = match.homeScore > match.awayScore ? 'home' : (match.homeScore < match.awayScore ? 'away' : 'draw');
                if (predWinner === realWinner) {
                    correct++;
                } else {
                    missed++;
                }
            }
        });

        const accuracy = totalPredicted > 0 ? Math.round(((exact + correct) / totalPredicted) * 100) : 0;
        const exactPct = totalPredicted > 0 ? Math.round((exact / totalPredicted) * 100) : 0;

        // Calculate streak
        let currentStreak = 0;
        const sortedPredictions = [...predictedMatches].sort((a, b) => {
            const matchA = finishedMatches.find(m => m.id === a.matchId);
            const matchB = finishedMatches.find(m => m.id === b.matchId);
            return new Date(matchB?.date || 0).getTime() - new Date(matchA?.date || 0).getTime();
        });

        for (const pred of sortedPredictions) {
            const match = finishedMatches.find(m => m.id === pred.matchId);
            if (!match || match.homeScore === undefined || match.awayScore === undefined) break;

            const predWinner = pred.homeScore > pred.awayScore ? 'home' : (pred.homeScore < pred.awayScore ? 'away' : 'draw');
            const realWinner = match.homeScore > match.awayScore ? 'home' : (match.homeScore < match.awayScore ? 'away' : 'draw');

            if (pred.homeScore === match.homeScore && pred.awayScore === match.awayScore) {
                currentStreak++;
            } else if (predWinner === realWinner) {
                currentStreak++;
            } else {
                break;
            }
        }

        // Upcoming matches without predictions
        const openMatches = matches.filter(m => m.status === 'open');
        const unpredicted = openMatches.filter(m => !predictions.some(p => p.matchId === m.id));

        return {
            totalFinished,
            totalPredicted,
            exact,
            correct,
            missed,
            accuracy,
            exactPct,
            currentStreak,
            points: user.points,
            exactMatches: user.exactMatches,
            unpredictedCount: unpredicted.length,
            openCount: openMatches.length,
        };
    }, [user, matches, predictions]);

    if (!user || !stats) return null;

    const statCards = [
        { label: "Puntos Totales", value: stats.points, color: "from-yellow-400 to-amber-500", icon: Trophy },
        { label: "Exactos", value: stats.exact, color: "from-green-400 to-emerald-600", icon: Target },
        { label: "Aciertos", value: stats.correct, color: "from-blue-400 to-blue-600", icon: CheckCircle2 },
        { label: "Fallos", value: stats.missed, color: "from-red-400 to-red-600", icon: XCircle },
    ];

    return (
        <main className="min-h-screen bg-[#001a3d] p-4 pb-28 md:pb-10">
            {/* Header Desktop - could be integrated/shared but keeping simple for now */}
            <div className="bg-[#00377B]/90 backdrop-blur-md py-4 px-6 flex items-center justify-between text-white shadow-lg sticky top-0 z-20 border-b border-white/5 -mx-4 -mt-4 mb-8 md:rounded-b-2xl md:mx-auto md:max-w-5xl md:mt-4 md:rounded-2xl">
                <Link href="/dashboard" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group">
                    <div className="bg-white/10 p-2 rounded-full group-hover:bg-white/20 transition-all">
                        <ArrowLeft size={18} />
                    </div>
                    <span className="font-bold text-sm hidden md:inline">Volver al Dashboard</span>
                </Link>
                <h1 className="text-lg font-black tracking-widest uppercase">Estadísticas</h1>
                <div className="w-8"></div>
            </div>


            <div className="max-w-lg md:max-w-5xl mx-auto animate-fade-in">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column - User Badge & Small Stats */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <Card className="p-6 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-3xl shadow-xl">
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="relative w-20 h-20 bg-white/20 rounded-full flex items-center justify-center overflow-hidden ring-4 ring-white/10 shadow-2xl">
                                        {COUNTRY_FLAG_MAP[user.country] ? (
                                            <Image
                                                src={`https://flagcdn.com/w80/${COUNTRY_FLAG_MAP[user.country]}.png`}
                                                alt={user.country}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : <User size={32} />}
                                    </div>
                                    <div>
                                        <h2 className="font-black text-2xl">{user.name}</h2>
                                        <p className="text-white/50 text-sm font-medium uppercase tracking-wide">{user.country}</p>
                                    </div>
                                    {stats.currentStreak > 0 && (
                                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg flex items-center gap-1.5 animate-pulse">
                                            <Flame size={14} fill="currentColor" />
                                            {stats.currentStreak} RACHA
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>

                        <div className="grid grid-cols-2 gap-3">
                            {statCards.map((stat, i) => {
                                const Icon = stat.icon;
                                return (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4, delay: i * 0.1 }}
                                    >
                                        <Card className={`p-4 bg-gradient-to-br ${stat.color} border-none text-white text-center shadow-lg rounded-2xl relative overflow-hidden group h-full flex flex-col justify-center`}>
                                            <Icon
                                                size={60}
                                                strokeWidth={1.5}
                                                className="absolute -right-2 -bottom-2 text-white/20 rotate-[-15deg] group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="relative z-10">
                                                <div className="text-2xl font-black tracking-tight">{stat.value}</div>
                                                <div className="text-[9px] uppercase tracking-wider opacity-90 font-bold">{stat.label}</div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Middle & Right Column - Accuracy & Actions */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Accuracy Ring */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <Card className="p-6 md:p-8 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-3xl shadow-xl">
                                <div className="flex flex-col md:flex-row items-center justify-around gap-8">
                                    {/* Accuracy Circle */}
                                    <div className="relative w-40 h-40 md:w-48 md:h-48 shrink-0">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                                            <circle
                                                cx="50" cy="50" r="40" fill="none"
                                                stroke="url(#gradient)"
                                                strokeWidth="6"
                                                strokeLinecap="round"
                                                strokeDasharray={`${stats.accuracy * 2.51} 251`}
                                                className="drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]"
                                            />
                                            <defs>
                                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#facc15" />
                                                    <stop offset="100%" stopColor="#22c55e" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl md:text-5xl font-black tracking-tighter loading-none">{stats.accuracy}%</span>
                                            <span className="text-[10px] md:text-xs text-white/50 uppercase font-bold tracking-widest mt-1">Aciertos</span>
                                        </div>
                                    </div>

                                    {/* Breakdown */}
                                    <div className="flex-1 w-full space-y-4">
                                        <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-white/60 uppercase font-bold">Exactos</span>
                                                </div>
                                            </div>
                                            <span className="font-black text-xl">{stats.exactPct}%</span>
                                        </div>

                                        <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-white/60 uppercase font-bold">Predichos</span>
                                                </div>
                                            </div>
                                            <span className="font-black text-xl">{stats.totalPredicted}<span className="text-white/30 text-sm font-medium">/{stats.totalFinished}</span></span>
                                        </div>

                                        <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-white/60 uppercase font-bold">Pendientes</span>
                                                </div>
                                            </div>
                                            <span className="font-black text-xl">{stats.unpredictedCount}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            <Link href="/dashboard" className="block group">
                                <Card className="p-6 bg-white/5 border border-white/10 text-white text-center hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer rounded-2xl group-active:scale-95 duration-200">
                                    <div className="bg-blue-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-300 group-hover:text-blue-200 group-hover:bg-blue-500/30 transition-colors">
                                        <CalendarClock size={24} />
                                    </div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-white/80 group-hover:text-white">
                                        {stats.unpredictedCount > 0 ? `${stats.unpredictedCount} Sin Predecir` : 'Ver Partidos'}
                                    </div>
                                </Card>
                            </Link>
                            <Link href="/profile" className="block group">
                                <Card className="p-6 bg-white/5 border border-white/10 text-white text-center hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer rounded-2xl group-active:scale-95 duration-200">
                                    <div className="bg-purple-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-purple-300 group-hover:text-purple-200 group-hover:bg-purple-500/30 transition-colors">
                                        <User size={24} />
                                    </div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-white/80 group-hover:text-white">ir a Mi Perfil</div>
                                </Card>
                            </Link>
                        </motion.div>
                    </div>

                </div>
            </div>
        </main>
    );
}
