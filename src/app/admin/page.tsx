"use client";

import { useStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { COUNTRIES } from "@/lib/constants";

export default function AdminPage() {
    const router = useRouter();
    const user = useStore((state) => state.user);
    const matches = useStore((state) => state.matches);
    const updateMatchResult = useStore((state) => state.updateMatchResult);
    const settings = useStore((state) => state.settings);
    const setAdminChampion = useStore((state) => state.setAdminChampion);

    // Local state
    const [editScores, setEditScores] = useState<Record<string, { home: string, away: string }>>({});
    const [selectedChampion, setSelectedChampion] = useState(settings.champion || "");

    useEffect(() => {
        if (settings.champion) {
            setSelectedChampion(settings.champion);
        }
    }, [settings.champion]);

    // Security Check
    useEffect(() => {
        // Allow a slight delay for hydration or check loading state if needed
        // For now, strict check. If user is null (not loaded yet), it might redirect prematurely if we don't check isLoading.
        // But store initializes with null.
        // Better: check if we are sure? 
        // Let's assume InitStore has run. If user is null, they aren't logged in, so redirect is correct.
        if (!user || user.email !== 'admin@quinela.com') {
            // Creating a way to override for dev? No.
            // router.push('/dashboard'); 
            // Commented out redirect for now to allow USER to test it without being blocked immediately
            // Un-comment below for production
            if (user?.email !== 'admin@quinela.com') {
                router.push('/dashboard');
            }
        }
    }, [user, router]);

    // If not admin, don't verify strict render yet to avoid hydration mismatch if we want to be safe, 
    // but returning null is fine.
    if (!user || user.email !== 'admin@quinela.com') {
        return <div className="p-8 text-black">Access Denied. Redirecting...</div>;
    }

    const handleScoreChange = (matchId: string, type: 'home' | 'away', value: string) => {
        setEditScores(prev => ({
            ...prev,
            [matchId]: {
                ...prev[matchId],
                [type]: value,
                // preserve other value if exists
                ...(type === 'home' ? { away: prev[matchId]?.away ?? '' } : { home: prev[matchId]?.home ?? '' })
            }
        }));
    };

    const handleUpdate = (matchId: string) => {
        const scores = editScores[matchId];
        if (!scores || scores.home === '' || scores.away === '') return;

        updateMatchResult(matchId, parseInt(scores.home), parseInt(scores.away));
    };

    const handleSetChampion = () => {
        if (selectedChampion) {
            setAdminChampion(selectedChampion);
            alert(`Champion set to ${selectedChampion}. Points recalculated.`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold mb-8 text-black">Admin Panel</h1>

            {/* Champion Section */}
            <Card className="p-6 mb-8 bg-white text-black">
                <h2 className="text-xl font-bold mb-4">Set Tournament Champion (10 pts)</h2>
                <div className="flex gap-4">
                    <select
                        className="border p-2 rounded w-64"
                        value={selectedChampion}
                        onChange={(e) => setSelectedChampion(e.target.value)}
                    >
                        <option value="">Select Country...</option>
                        {COUNTRIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <Button onClick={handleSetChampion} className="bg-yellow-500 text-black hover:bg-yellow-400">
                        Update Champion
                    </Button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    Current Champion in DB: <strong>{settings.champion || 'None'}</strong>
                </p>
            </Card>

            {/* Matches Section */}
            <h2 className="text-xl font-bold mb-4 text-black">Match Control</h2>
            <div className="grid gap-4">
                {matches.map(match => (
                    <Card key={match.id} className="p-4 flex items-center justify-between text-black">
                        <div className="w-1/3">
                            <span className="font-bold">{match.homeTeam}</span> vs <span className="font-bold">{match.awayTeam}</span>
                            <div className="text-xs text-gray-500">
                                {new Date(match.date).toLocaleString()} - <span className={`font-bold ${match.status === 'finished' ? 'text-green-600' : 'text-blue-600'}`}>{match.status}</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-gray-400">Home</span>
                                <Input
                                    type="number"
                                    className="w-16 bg-white border-gray-300 text-black text-center"
                                    placeholder={match.homeScore?.toString() ?? "-"}
                                    value={editScores[match.id]?.home ?? ''}
                                    onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                                />
                            </div>
                            <span className="pt-4">-</span>
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-gray-400">Away</span>
                                <Input
                                    type="number"
                                    className="w-16 bg-white border-gray-300 text-black text-center"
                                    placeholder={match.awayScore?.toString() ?? "-"}
                                    value={editScores[match.id]?.away ?? ''}
                                    onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                                />
                            </div>
                            <div className="pt-4">
                                <Button
                                    onClick={() => handleUpdate(match.id)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Set
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
