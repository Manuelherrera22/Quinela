"use client";

import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { COUNTRY_FLAG_MAP } from "@/lib/constants";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Match, Prediction } from "@/types";

export default function ProfilePage() {
    const router = useRouter();
    const user = useStore((state) => state.user);
    const predictions = useStore((state) => state.predictions);
    const matches = useStore((state) => state.matches);
    const settings = useStore((state) => state.settings);

    useEffect(() => {
        // Simple auth check
        if (!user) {
            // Let InitStore finish, but if still null after a delay, redirect
            // Actually, simplest is just to show loading or empty state until user is populated
        }
    }, [user, router]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#00377B] text-white">
                <Link href="/login" className="underline">Inicia Sesión</Link>
            </div>
        );
    }

    // Sort predictions by match date
    const myPredictions = predictions
        .map(p => {
            const match = matches.find(m => m.id === p.matchId);
            return { ...p, match };
        })
        .filter((item): item is Prediction & { match: Match } => !!item.match)
        .sort((a, b) => new Date(a.match.date).getTime() - new Date(b.match.date).getTime());

    return (
        <div className="min-h-screen bg-[#00377B] pb-20 font-sans">
            {/* Header */}
            <div className="bg-[#002855] py-4 px-6 flex items-center justify-between text-white shadow-md">
                <Link href="/dashboard" className="text-yellow-400 font-bold hover:text-yellow-300 transition-colors">
                    ← Volver
                </Link>
                <h1 className="text-xl font-bold tracking-wider">MI PERFIL</h1>
                <div className="w-8"></div> {/* Spacer */}
            </div>

            <div className="max-w-md mx-auto p-4 space-y-6">

                {/* User Info Card */}
                <Card className="p-6 bg-white rounded-xl text-black text-center shadow-lg border-t-8 border-yellow-500 relative overflow-visible mt-8">
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-yellow-500 overflow-hidden">
                        {COUNTRY_FLAG_MAP[user.country] ? (
                            <Image
                                src={`https://flagcdn.com/w160/${COUNTRY_FLAG_MAP[user.country]}.png`}
                                alt={user.country}
                                fill
                                className="object-cover"
                            />
                        ) : <span className="text-5xl">👤</span>}
                    </div>
                    <div className="mt-10">
                        <h2 className="text-2xl font-bold text-[#00377B]">{user.name}</h2>
                        <p className="text-gray-500 text-sm font-medium">{user.email}</p>
                        <p className="text-gray-400 text-xs mt-1 uppercase tracking-wide">{user.country}</p>
                    </div>
                </Card>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 bg-white rounded-xl text-black text-center shadow border-b-4 border-blue-500">
                        <div className="text-4xl font-black text-[#00377B]">{user.points}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">Puntos Totales</div>
                    </Card>
                    <Card className="p-4 bg-white rounded-xl text-black text-center shadow border-b-4 border-green-500">
                        <div className="text-4xl font-black text-green-600">{user.exactMatches}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">Marcadores Exactos</div>
                    </Card>
                </div>

                {/* Champion Pick */}
                <Card className="p-6 bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xs font-bold text-blue-200 uppercase mb-2">Tu Campeón</h3>
                        {user.selectedChampion ? (
                            <div className="flex items-center space-x-4">
                                <div className="relative w-16 h-10 shrink-0 drop-shadow-lg">
                                    {COUNTRY_FLAG_MAP[user.selectedChampion] ? (
                                        <Image
                                            src={`https://flagcdn.com/w160/${COUNTRY_FLAG_MAP[user.selectedChampion]}.png`}
                                            alt={user.selectedChampion}
                                            fill
                                            className="object-cover rounded"
                                        />
                                    ) : <span className="text-5xl">🏳️</span>}
                                </div>
                                <div>
                                    <div className="font-bold text-2xl tracking-tight">{user.selectedChampion}</div>
                                    {settings.champion === user.selectedChampion ? (
                                        <div className="inline-block bg-yellow-400 text-[#00377B] text-xs px-2 py-1 rounded-full font-bold mt-1 shadow-sm animate-pulse">
                                            +10 PUNTOS 🏆
                                        </div>
                                    ) : (
                                        <div className="text-blue-300 text-xs mt-1">
                                            {settings.champion ? `Ganador real: ${settings.champion}` : 'Torneo en curso...'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-blue-300 italic text-sm">No has seleccionado campeón.</div>
                        )}
                    </div>
                    {/* Change Champion Button */}
                    <div className="relative z-10 mt-4">
                        <Link
                            href="/champion"
                            className="inline-block text-xs text-blue-200 hover:text-yellow-400 transition-colors underline underline-offset-2"
                        >
                            Cambiar selección →
                        </Link>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                        <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    </div>
                </Card>

                {/* Prediction History */}
                <div className="space-y-4 pt-4">
                    <h3 className="text-white font-bold text-lg px-2 border-l-4 border-yellow-500">Historial de Predicciones</h3>

                    {myPredictions.length === 0 && (
                        <div className="bg-white/10 rounded-lg p-8 text-center backdrop-blur-sm">
                            <p className="text-white/70 text-sm">No has hecho predicciones aún.</p>
                            <Link href="/dashboard" className="inline-block mt-4 text-yellow-400 text-sm hover:underline">Ir a predecir matches →</Link>
                        </div>
                    )}

                    {myPredictions.map(item => {
                        const match = item.match;
                        const isFinished = match.status === 'finished';

                        let statusColor = "bg-white border-l-4 border-gray-300";
                        let pointsEarned: number | null = null;
                        let resultText = "Pendiente";

                        if (isFinished && match.homeScore !== undefined && match.awayScore !== undefined) {
                            const predHome = item.homeScore;
                            const predAway = item.awayScore;
                            const realHome = match.homeScore;
                            const realAway = match.awayScore;

                            if (predHome === realHome && predAway === realAway) {
                                statusColor = "bg-green-50 border-l-4 border-green-500";
                                pointsEarned = 5;
                                resultText = "Exacto";
                            } else {
                                const predWinner = predHome > predAway ? 'home' : (predHome < predAway ? 'away' : 'draw');
                                const realWinner = realHome > realAway ? 'home' : (realHome < realAway ? 'away' : 'draw');
                                if (predWinner === realWinner) {
                                    statusColor = "bg-yellow-50 border-l-4 border-yellow-400";
                                    pointsEarned = 3;
                                    resultText = "Acierto";
                                } else {
                                    statusColor = "bg-red-50 border-l-4 border-red-400";
                                    pointsEarned = 0;
                                    resultText = "Fallo";
                                }
                            }
                        }

                        return (
                            <div key={item.matchId} className={`p-4 rounded-lg shadow-sm ${statusColor} items-stretch relative overflow-hidden transition-all hover:shadow-md`}>
                                <div className="flex justify-between items-center mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    <span>{match.group ? `Grupo ${match.group}` : match.stage}</span>
                                    {pointsEarned !== null ? (
                                        <span className={`px-2 py-0.5 rounded ${pointsEarned > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            +{pointsEarned} pts
                                        </span>
                                    ) : (
                                        <span>{new Date(match.date).toLocaleDateString()}</span>
                                    )}
                                </div>

                                <div className="flex justify-between items-center text-black">
                                    {/* Home */}
                                    <div className="flex flex-col items-center w-1/3 text-center">
                                        <div className="text-2xl mb-1 filter drop-shadow-sm">{match.homeFlag}</div>
                                        <span className="text-xs font-bold leading-tight line-clamp-2">{match.homeTeam}</span>
                                    </div>

                                    {/* Score */}
                                    <div className="flex flex-col items-center w-1/3">
                                        <div className="text-2xl font-black font-mono tracking-widest bg-gray-100 px-3 py-1 rounded-lg">
                                            {item.homeScore}-{item.awayScore}
                                        </div>
                                        {isFinished && (
                                            <div className="text-[10px] text-gray-500 mt-1 font-medium bg-gray-200 px-1.5 py-0.5 rounded">
                                                Real: {match.homeScore}-{match.awayScore}
                                            </div>
                                        )}
                                    </div>

                                    {/* Away */}
                                    <div className="flex flex-col items-center w-1/3 text-center">
                                        <div className="text-2xl mb-1 filter drop-shadow-sm">{match.awayFlag}</div>
                                        <span className="text-xs font-bold leading-tight line-clamp-2">{match.awayTeam}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}
