"use client";

import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { COUNTRY_FLAG_MAP, CHAMPION_LOCK_DATE } from "@/lib/constants";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Match, Prediction } from "@/types";
import { AppState } from "@/lib/store/types";
import { ArrowLeft, Camera, Trophy, Target } from "lucide-react";

export default function ProfilePage() {
    const router = useRouter();
    const user = useStore((state: AppState) => state.user);
    const predictions = useStore((state: AppState) => state.predictions);
    const matches = useStore((state: AppState) => state.matches);
    const settings = useStore((state: AppState) => state.settings);
    const updateAvatar = useStore((state: AppState) => state.updateAvatar);
    const [isUploading, setIsUploading] = useState(false);

    const isLocked = new Date() >= CHAMPION_LOCK_DATE;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert("La imagen es muy grande. Máximo 2MB.");
            return;
        }

        setIsUploading(true);
        await updateAvatar(file);
        setIsUploading(false);
    };

    useEffect(() => {
        if (!user) {
        }
    }, [user, router]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#001a3d] text-white">
                <Link href="/login" className="underline hover:text-yellow-400">Inicia Sesión</Link>
            </div>
        );
    }

    const myPredictions = predictions
        .map(p => {
            const match = matches.find(m => m.id === p.matchId);
            return { ...p, match };
        })
        .filter((item): item is Prediction & { match: Match } => !!item.match)
        .sort((a, b) => new Date(a.match.date).getTime() - new Date(b.match.date).getTime());

    return (
        <div className="min-h-screen bg-[#001a3d] pb-20 font-sans">
            {/* Header */}
            <div className="bg-[#00377B]/90 backdrop-blur-md py-4 px-6 flex items-center justify-between text-white shadow-lg sticky top-0 z-20 border-b border-white/5">
                <Link href="/dashboard" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group">
                    <div className="bg-white/10 p-2 rounded-full group-hover:bg-white/20 transition-all">
                        <ArrowLeft size={18} />
                    </div>
                    <span className="font-bold text-sm hidden md:inline">Volver al Dashboard</span>
                </Link>
                <h1 className="text-lg font-black tracking-widest uppercase">Mi Perfil</h1>
                <div className="w-8"></div>
            </div>

            <div className="max-w-md md:max-w-5xl mx-auto p-4 space-y-6 md:space-y-8 mt-4 animate-fade-in">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: User Info & Stats */}
                    <div className="space-y-6">
                        {/* User Info Card */}
                        <Card className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center shadow-2xl relative overflow-visible mt-8 md:mt-0">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-[#002a5e] rounded-full flex items-center justify-center shadow-xl border-4 border-yellow-400 mx-auto -mt-16 md:-mt-16 relative group cursor-pointer overflow-hidden transition-transform hover:scale-105" onClick={() => document.getElementById('avatar-input')?.click()}>
                                {user.avatarUrl ? (
                                    <Image src={user.avatarUrl} alt="Avatar" fill className="object-cover" />
                                ) : COUNTRY_FLAG_MAP[user.country] ? (
                                    <Image
                                        src={`https://flagcdn.com/w160/${COUNTRY_FLAG_MAP[user.country]}.png`}
                                        alt={user.country}
                                        fill
                                        className="object-cover"
                                    />
                                ) : <span className="text-5xl">👤</span>}

                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white" size={24} />
                                </div>

                                {isUploading && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                    </div>
                                )}
                            </div>
                            <input type="file" id="avatar-input" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploading} />

                            <div className="mt-4">
                                <h2 className="text-2xl font-black text-white">{user.name}</h2>
                                <p className="text-white/50 text-sm font-medium">{user.email}</p>
                                <div className="inline-block mt-2 px-3 py-1 bg-white/10 rounded-full text-[10px] text-yellow-400 font-bold uppercase tracking-wider border border-white/5">
                                    {user.country}
                                </div>
                            </div>
                        </Card>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="p-4 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl text-white text-center shadow-lg border-none relative overflow-hidden">
                                <Trophy className="absolute -right-2 -bottom-2 text-white/10 w-16 h-16 rotate-[-15deg]" />
                                <div className="relative z-10">
                                    <div className="text-3xl md:text-4xl font-black">{user.points}</div>
                                    <div className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest opacity-80 mt-1">Puntos Totales</div>
                                </div>
                            </Card>
                            <Card className="p-4 bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl text-white text-center shadow-lg border-none relative overflow-hidden">
                                <Target className="absolute -right-2 -bottom-2 text-white/10 w-16 h-16 rotate-[-15deg]" />
                                <div className="relative z-10">
                                    <div className="text-3xl md:text-4xl font-black">{user.exactMatches}</div>
                                    <div className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest opacity-80 mt-1">Exactos</div>
                                </div>
                            </Card>
                        </div>

                        {/* Champion Pick */}
                        <Card className="p-6 bg-gradient-to-r from-[#00377B] to-[#001a3d] border border-white/10 rounded-2xl text-white shadow-xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xs font-bold text-blue-200 uppercase tracking-wider">Tu Campeón</h3>
                                    {!isLocked && (
                                        <Link
                                            href="/champion"
                                            className="text-[10px] font-bold bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors"
                                        >
                                            CAMBIAR
                                        </Link>
                                    )}
                                </div>
                                {user.selectedChampion ? (
                                    <div className="flex items-center space-x-4">
                                        <div className="relative w-16 h-10 shrink-0 shadow-lg transform group-hover:scale-105 transition-transform">
                                            {COUNTRY_FLAG_MAP[user.selectedChampion] ? (
                                                <Image
                                                    src={`https://flagcdn.com/w160/${COUNTRY_FLAG_MAP[user.selectedChampion]}.png`}
                                                    alt={user.selectedChampion}
                                                    fill
                                                    className="object-cover rounded-[2px]"
                                                />
                                            ) : <span className="text-5xl">🏳️</span>}
                                        </div>
                                        <div>
                                            <div className="font-black text-xl md:text-2xl tracking-tight leading-none">{user.selectedChampion}</div>
                                            {settings.champion === user.selectedChampion ? (
                                                <div className="inline-block bg-yellow-400 text-[#00377B] text-[10px] px-2 py-0.5 rounded-full font-black mt-1 shadow-sm animate-pulse">
                                                    +10 PUNTOS 🏆
                                                </div>
                                            ) : (
                                                <div className="text-white/40 text-[10px] mt-1 font-medium">
                                                    {settings.champion ? `Ganador: ${settings.champion}` : 'En juego'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-white/40 italic text-sm">No has seleccionado campeón.</div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Prediction History */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-8 w-1 bg-yellow-400 rounded-full"></div>
                            <h3 className="text-white font-black text-lg tracking-wide uppercase">Historial de Predicciones</h3>
                        </div>

                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 md:p-6 min-h-[400px] overflow-y-auto max-h-[800px] backdrop-blur-sm">
                            {myPredictions.length === 0 && (
                                <div className="text-center py-20">
                                    <p className="text-white/40 text-sm font-medium mb-4">No tienes predicciones registradas.</p>
                                    <Link href="/dashboard" className="px-6 py-3 bg-yellow-400 text-[#00377B] font-black rounded-lg hover:bg-yellow-300 transition-colors">
                                        IR A PREDECIR
                                    </Link>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {myPredictions.map(item => {
                                    const match = item.match;
                                    const isFinished = match.status === 'finished';

                                    let statusClass = "bg-white/5 border-white/5 text-white/60";
                                    let pointsBadge = null;

                                    if (isFinished && match.homeScore !== undefined && match.awayScore !== undefined) {
                                        const predHome = item.homeScore;
                                        const predAway = item.awayScore;
                                        const realHome = match.homeScore;
                                        const realAway = match.awayScore;

                                        if (predHome === realHome && predAway === realAway) {
                                            statusClass = "bg-green-500/10 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]";
                                            pointsBadge = <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">+5 pts</span>;
                                        } else {
                                            const predWinner = predHome > predAway ? 'home' : (predHome < predAway ? 'away' : 'draw');
                                            const realWinner = realHome > realAway ? 'home' : (realHome < realAway ? 'away' : 'draw');
                                            if (predWinner === realWinner) {
                                                statusClass = "bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]";
                                                pointsBadge = <span className="bg-yellow-500 text-[#00377B] text-[10px] font-bold px-2 py-0.5 rounded-full">+3 pts</span>;
                                            } else {
                                                statusClass = "bg-red-500/10 border-red-500/30";
                                                pointsBadge = <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full">0 pts</span>;
                                            }
                                        }
                                    }

                                    return (
                                        <div key={item.matchId} className={`p-4 rounded-xl border ${statusClass} flex flex-col gap-3 hover:bg-white/10 transition-colors`}>
                                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider opacity-70">
                                                <span>{match.group ? `Grupo ${match.group}` : match.stage}</span>
                                                {pointsBadge || <span>{new Date(match.date).toLocaleDateString()}</span>}
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col items-center w-1/3 gap-1">
                                                    <span className="text-2xl">{match.homeFlag}</span>
                                                    <span className="text-[10px] font-bold leading-tight text-center text-white/90">{match.homeTeam}</span>
                                                </div>

                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="text-xl font-black tracking-widest bg-black/20 px-3 py-1 rounded-lg text-white">
                                                        {item.homeScore}-{item.awayScore}
                                                    </div>
                                                    {isFinished && (
                                                        <div className="text-[9px] text-white/40 font-mono">
                                                            ({match.homeScore}-{match.awayScore})
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col items-center w-1/3 gap-1">
                                                    <span className="text-2xl">{match.awayFlag}</span>
                                                    <span className="text-[10px] font-bold leading-tight text-center text-white/90">{match.awayTeam}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
