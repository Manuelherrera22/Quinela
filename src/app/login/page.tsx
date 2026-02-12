import { LoginForm } from "@/components/features/LoginForm";
import Image from "next/image";

export default function LoginPage() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#00377B] to-[#005bb5]">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-extrabold text-white tracking-widest drop-shadow-md">
                    QUINIELA TIGO
                </h1>
                <div className="relative w-48 h-24 mx-auto my-6">
                    <Image
                        src="/tigo-logo-1.png"
                        alt="Tigo Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
                <p className="text-white/80 font-medium">COPA MUNDIAL DE LA FIFA 2026</p>
            </div>

            <LoginForm />
        </main>
    );
}
