import { ChampionSelector } from "@/components/features/ChampionSelector";

export default function ChampionPage() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#00377B] to-[#005bb5]">
            <div className="mb-6 text-center text-white">
                <h1 className="text-2xl font-bold tracking-wider">QUINIELA TIGO</h1>
                <div className="mt-2 text-4xl">🏆</div>
            </div>
            <ChampionSelector />
        </main>
    );
}
