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

export default function StatsPage() {
    const router = useRouter();
    const user = useStore((state) => state.user);
    const matches = useStore((state) => state.matches);
    const predictions = useStore((state) => state.predictions);

    useEffect(() => {
        if (!user) router.push("/");
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
        <main className="min-h-screen bg-gradient-to-br from-[#00377B] to-[#005bb5] p-4 pb-28">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/dashboard" className="text-white/70 hover:text-white transition-colors text-sm flex items-center gap-1 group">
                        <div className="bg-white/10 p-1.5 rounded-full group-hover:bg-white/20 transition-colors">
                            <ArrowLeft size={16} />
                        </div>
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <h1 className="text-white font-bold text-lg tracking-wide">Estadísticas</h1>
                    <div className="w-20" />
                </div>

                {/* User Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Card className="p-4 bg-white/10 backdrop-blur-md border-white/5 text-white mb-6 rounded-3xl shadow-xl">
                        <div className="flex items-center gap-4">
                            <div className="relative w-14 h-14 bg-white/20 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white/20 shadow-lg">
                                {COUNTRY_FLAG_MAP[user.country] ? (
                                    <Image
                                        src={`https://flagcdn.com/w80/${COUNTRY_FLAG_MAP[user.country]}.png`}
                                        alt={user.country}
                                        fill
                                        className="object-cover"
                                    />
                                ) : <User size={24} />}
                            </div>
                            <div>
                                <h2 className="font-bold text-xl">{user.name}</h2>
                                <p className="text-white/60 text-sm font-medium">{user.country}</p>
                            </div>
                            {stats.currentStreak > 0 && (
                                <div className="ml-auto bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                                    <Flame size={14} fill="currentColor" />
                                    {stats.currentStreak} racha
                                </div>
                            )}
                        </div>
                    </Card>
                </motion.div>

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {statCards.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                            >
                                <Card className={`p-5 bg-gradient-to-br ${stat.color} border-none text-white text-center shadow-lg rounded-[28px] relative overflow-hidden group`}>
                                    {/* Watermark Icon */}
                                    <Icon
                                        size={80}
                                        strokeWidth={1.5}
                                        className="absolute -right-4 -bottom-4 text-white/20 rotate-[-15deg] group-hover:scale-110 group-hover:rotate-0 transition-transform duration-500"
                                    />

                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="bg-white/20 p-2 rounded-full mb-2 backdrop-blur-sm shadow-inner">
                                            <Icon size={24} strokeWidth={2.5} />
                                        </div>
                                        <div className="text-4xl font-black tracking-tight mb-1">{stat.value}</div>
                                        <div className="text-[10px] uppercase tracking-wider opacity-90 font-bold">{stat.label}</div>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Accuracy Ring */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Card className="p-6 bg-white/10 backdrop-blur-md border-white/5 text-white mb-6 rounded-3xl shadow-xl settings-card">
                        <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-6 flex items-center gap-2">
                            <Target size={14} />
                            Rendimiento Global
                        </h3>
                        <div className="flex items-center justify-around">
                            {/* Accuracy Circle */}
                            <div className="relative w-32 h-32">
                                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                    <circle
                                        cx="50" cy="50" r="40" fill="none"
                                        stroke="url(#gradient)"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={`${stats.accuracy * 2.51} 251`}
                                        className="drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#facc15" />
                                            <stop offset="100%" stopColor="#22c55e" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black tracking-tighter">{stats.accuracy}%</span>
                                    <span className="text-[9px] text-white/50 uppercase font-bold tracking-widest">Aciertos</span>
                                </div>
                            </div>

                            {/* Breakdown */}
                            <div className="space-y-4 pl-4 border-l border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-white/60 uppercase font-bold text-[9px]">Exactos</span>
                                        <span className="font-bold text-lg leading-none">{stats.exactPct}%</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-white/60 uppercase font-bold text-[9px]">Predichos</span>
                                        <span className="font-bold text-lg leading-none">{stats.totalPredicted}<span className="text-white/40 text-sm">/{stats.totalFinished}</span></span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-white/60 uppercase font-bold text-[9px]">Pendientes</span>
                                        <span className="font-bold text-lg leading-none">{stats.unpredictedCount}</span>
                                    </div>
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
                        <Card className="p-4 bg-white/5 border border-white/10 text-white text-center hover:bg-white/10 transition-colors cursor-pointer rounded-2xl group-active:scale-95 transition-transform duration-200">
                            <div className="bg-blue-500/20 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-300 group-hover:text-blue-200 transition-colors">
                                <CalendarClock size={20} />
                            </div>
                            <div className="text-xs font-bold uppercase tracking-wider">
                                {stats.unpredictedCount > 0 ? `${stats.unpredictedCount} Sin Predecir` : 'Ver Partidos'}
                            </div>
                        </Card>
                    </Link>
                    <Link href="/profile" className="block group">
                        <Card className="p-4 bg-white/5 border border-white/10 text-white text-center hover:bg-white/10 transition-colors cursor-pointer rounded-2xl group-active:scale-95 transition-transform duration-200">
                            <div className="bg-purple-500/20 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 text-purple-300 group-hover:text-purple-200 transition-colors">
                                <User size={20} />
                            </div>
                            <div className="text-xs font-bold uppercase tracking-wider">Mi Perfil</div>
                        </Card>
                    </Link>
                </motion.div>
            </div>
        </main>
    );
}
