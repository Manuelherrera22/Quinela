"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { AppState } from "@/lib/store/types";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";

export function LoginForm() {
    const router = useRouter();
    const loginUser = useStore((state: AppState) => state.loginUser);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showForgot, setShowForgot] = useState(false);

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
        <>
            <Card className="w-full max-w-md p-8 glass backdrop-blur shadow-2xl border-0 animate-fade-in">
                <h2 className="text-2xl font-bold text-center text-white mb-8 uppercase tracking-widest">
                    Iniciar Sesión
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-bold text-white/60 mb-2 tracking-widest uppercase">
                            CORREO ELECTRÓNICO
                        </label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                            <Input
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tucorreo@ejemplo.com"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-yellow-400/50 focus:ring-yellow-400/20 pl-10"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-white/60 mb-2 tracking-widest uppercase">
                            CONTRASEÑA
                        </label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                            <Input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-yellow-400/50 focus:ring-yellow-400/20 pl-10 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                            <AlertCircle size={16} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-accent hover:bg-yellow-500 text-primary font-black py-6 text-lg mt-2 disabled:opacity-50 transition-all active:scale-95 shadow-[0_0_20px_rgba(250,204,21,0.3)]"
                    >
                        {isLoading ? 'CARGANDO...' : 'ENTRAR'}
                    </Button>

                    <div className="flex items-center justify-between mt-4">
                        <button
                            type="button"
                            onClick={() => setShowForgot(true)}
                            className="text-xs text-white/40 hover:text-yellow-400 transition-colors"
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/register")}
                            className="text-xs text-accent font-bold hover:underline"
                        >
                            Crear Cuenta
                        </button>
                    </div>
                </form>
            </Card>

            {/* Forgot Password Modal */}
            {showForgot && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForgot(false)}>
                    <div className="bg-[#001a3d] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock size={28} className="text-yellow-400" />
                            </div>
                            <h3 className="text-xl font-black text-white mb-2">¿Olvidaste tu contraseña?</h3>
                            <p className="text-sm text-white/50 mb-6 leading-relaxed">
                                Contacta al administrador de la quiniela para que restablezca tu contraseña desde el panel de administración.
                            </p>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">Contacto Admin</p>
                                <p className="text-sm text-yellow-400 font-bold">admin@quinela.com</p>
                            </div>
                            <Button
                                onClick={() => setShowForgot(false)}
                                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl"
                            >
                                Entendido
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

