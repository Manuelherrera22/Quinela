"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Trophy, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";

interface RulesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept?: () => void;
    mode?: 'info' | 'accept';
}

export function RulesModal({ isOpen, onClose, onAccept, mode = 'info' }: RulesModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-[#001a3d] border border-white/10 text-white p-0 overflow-hidden">
                <DialogHeader className="p-6 bg-[#002a5e]">
                    <DialogTitle className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                        <Trophy className="text-yellow-400" />
                        Reglamento Oficial
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                        Por favor lee atentamente las reglas antes de participar.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[400px] p-6">
                    <div className="space-y-6 text-sm text-gray-300 leading-relaxed">

                        <section>
                            <h3 className="text-white font-bold flex items-center gap-2 mb-2">
                                <Shield className="text-blue-400 w-4 h-4" />
                                1. Sistema de Puntuación
                            </h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>5 Puntos:</strong> Acertar el marcador exacto del partido.</li>
                                <li><strong>3 Puntos:</strong> Acertar el ganador o el empate (sin marcador exacto).</li>
                                <li><strong>0 Puntos:</strong> No acertar ni ganador ni marcador.</li>
                                <li><strong>10 Puntos Extra:</strong> Acertar el Campeón del torneo (se selecciona una sola vez).</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-white font-bold flex items-center gap-2 mb-2">
                                <AlertTriangle className="text-yellow-400 w-4 h-4" />
                                2. Cierres y Bloqueos
                            </h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Las predicciones para cada partido se cierran exactamente a la hora de inicio del mismo.</li>
                                <li>La selección del <strong>Campeón</strong> se bloqueará permanentemente al iniciar el primer partido del torneo.</li>
                                <li>Una vez iniciado un partido, no se podrán modificar las predicciones.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-white font-bold flex items-center gap-2 mb-2">
                                <CheckCircle2 className="text-green-400 w-4 h-4" />
                                3. Criterios de Desempate
                            </h3>
                            <p>En caso de empate en puntos en la tabla de posiciones, se utilizarán los siguientes criterios en orden:</p>
                            <ol className="list-decimal pl-5 space-y-1 mt-2">
                                <li>Mayor cantidad de <strong>Marcadores Exactos</strong>.</li>
                                <li>Mayor cantidad de aciertos de ganador.</li>
                                <li>Sorteo aleatorio por el sistema.</li>
                            </ol>
                        </section>

                        <section className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h3 className="text-yellow-400 font-bold mb-2 uppercase text-xs tracking-widest">Nota Importante</h3>
                            <p className="text-xs">
                                La participación implica la aceptación total de estas reglas. Cualquier intento de manipulación del sistema resultará en la descalificación inmediata.
                            </p>
                        </section>

                    </div>
                </ScrollArea>

                <DialogFooter className="p-6 bg-[#001530] border-t border-white/5">
                    {mode === 'accept' ? (
                        <Button
                            onClick={onAccept}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-6"
                        >
                            ACEPTAR Y CONTINUAR
                        </Button>
                    ) : (
                        <Button
                            onClick={onClose}
                            className="w-full bg-white/10 hover:bg-white/20 text-white font-bold"
                        >
                            CERRAR
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
