"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { AppState } from "@/lib/store/types";

export function LoginForm() {
    const router = useRouter();
    const loginUser = useStore((state: AppState) => state.loginUser);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Por favor completa todos los campos");
            return;
        }

        setIsLoading(true);

        try {
            const success = await loginUser(email, password);

            if (!success) {
                setError("Correo o contraseña incorrectos.");
                setIsLoading(false);
                return;
            }

            router.push("/dashboard");
        } catch (err: any) {
            console.error('Login error:', err);
            setError("Error al iniciar sesión. Intenta de nuevo.");
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md p-6 glass backdrop-blur shadow-2xl border-0 animate-fade-in">
            <h2 className="text-2xl font-bold text-center text-white mb-6 uppercase tracking-widest">
                Iniciar Sesión
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1 tracking-tighter">
                        CORREO ELECTRÓNICO
                    </label>
                    <Input
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tucorreo@ejemplo.com"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-accent focus:ring-accent"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1 tracking-tighter">
                        CONTRASEÑA
                    </label>
                    <Input
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="********"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-accent focus:ring-accent"
                    />
                </div>

                {error && <p className="text-red-400 text-sm font-medium animate-pulse">{error}</p>}

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-accent hover:bg-yellow-500 text-primary font-black py-6 text-lg mt-4 disabled:opacity-50 transition-all active:scale-95 shadow-[0_0_20px_rgba(250,204,21,0.3)]"
                >
                    {isLoading ? 'CARGANDO...' : 'ENTRAR'}
                </Button>

                <div className="text-center mt-6 text-sm text-gray-400">
                    ¿No tienes cuenta?{" "}
                    <button
                        type="button"
                        onClick={() => router.push("/register")}
                        className="text-accent font-bold hover:underline"
                    >
                        Regístrate aquí
                    </button>
                </div>
            </form>
        </Card>
    );
}
