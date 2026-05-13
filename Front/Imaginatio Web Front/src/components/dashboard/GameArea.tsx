import { useState, useEffect, useRef } from "preact/hooks";
import {
   isWaterGameOpen,
   isCompostGameOpen,
   isPlantInfoOpen,
   isSunGameOpen,
   isWaterOnCooldown,
   isCompostOnCooldown,
   isSunOnCooldown,
   waterRemainingTime,
   compostRemainingTime,
   sunRemainingTime,
   plantName,
   username,
   isMuted,
   globalVolume,
   isUnityViewerOpen
} from "../../store/resourceStore";
import { 
   isDebugOpen, 
   isEntActive, 
   plantSpeciesId, 
   plantPhase, 
   plantUnitySubid, 
   isSunning, 
   isEvolving 
} from "../../store/plantStore";
import SPECIES_DESCRIPTION_JSON from "../../config/speciesDescription.json";
import SPECIES_JSON from "../../config/species.json";
import { loadTreeFile, applyTreeDataFrom3D, consumeSeeds } from "../../store/unityBridge";
import { createPlant } from "../../store/apiClient";
import { refreshInventory } from "../../store/resourceStore";

import btnMinijuegoComposta from '../../assets/Recursos web media/btn_MinijuegoComposta.png';
import btnMinijuegoAgua from '../../assets/Recursos web media/btn_MinijuegoAgua.png';
import panelDescripcionPlanta from '../../assets/Recursos web media/Panel_DescripciónPlanta.png';
import solEscenario from '../../assets/Recursos web media/SolEscenario.png';
import Plant from './Plant';
import DebugPanel from './DebugPanel';
import bgMusicSrc from '../../assets/Sonidos Interacciones/Music Background.mp3';


export default function GameArea() {
   const entLocked = isEntActive.value;
   const audioRef = useRef<HTMLAudioElement>(null);
   const fadeIntervalRef = useRef<number | null>(null);
   const BASE_BGM_VOLUME = 0.15;

   // ── Estado del botón Sync 3D ──
   type SyncStatus = "idle" | "loading" | "ok" | "error";
   const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
   const fileInputRef = useRef<HTMLInputElement>(null);

   const handleSyncClick = () => fileInputRef.current?.click();

   const handleTreeFileChange = async (e: Event) => {
      const input = e.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;
      setSyncStatus("loading");
      try {
         const treeData = await loadTreeFile(file);
         const { nuevasSemillas, plantasActualizadas } = applyTreeDataFrom3D(treeData);
         if (nuevasSemillas.length > 0) {
            for (const seed of nuevasSemillas) {
               try { await createPlant(seed.species_id, seed.subid); }
               catch (err) { console.error(`Error creando planta para semilla ${seed.seed_id}:`, err); }
            }
            consumeSeeds();
            refreshInventory();
         }
         console.info(`[Sync 3D] ✓ Plantas actualizadas: ${plantasActualizadas} | Semillas: ${nuevasSemillas.length}`);
         setSyncStatus("ok");
         setTimeout(() => setSyncStatus("idle"), 2500);
      } catch (err) {
         console.error("[Sync 3D] Error al importar .tree:", err);
         setSyncStatus("error");
         setTimeout(() => setSyncStatus("idle"), 3000);
      } finally {
         input.value = "";
      }
   };

   // ── Pausar audio cuando Unity está abierto ──────────────────────────────
   useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;
      if (isUnityViewerOpen.value) {
         // Silenciar la web al abrir Unity
         audio.pause();
         if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      } else if (!isMuted.value) {
         // Reanudar cuando se cierra Unity (solo si no está muteado manualmente)
         const target = globalVolume.value * BASE_BGM_VOLUME;
         audio.volume = (isSunning.value || isEvolving.value) ? target * 0.2 : target;
         audio.play().catch(() => {});
      }
   }, [isUnityViewerOpen.value]);

   // Manejo del audio de fondo
   useEffect(() => {
      if (audioRef.current) {
         if (isMuted.value) {
            audioRef.current.pause();
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
         } else if (!isUnityViewerOpen.value) {
            // Solo reproducir si Unity no está abierto
            const target = globalVolume.value * BASE_BGM_VOLUME;
            audioRef.current.volume = (isSunning.value || isEvolving.value) ? target * 0.2 : target;
            audioRef.current.play().catch(() => {
               console.warn("Autoplay bloqueado por el navegador.");
            });
         }
      }
      return () => {
         if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      }
   }, [isMuted.value, globalVolume.value]);

   const handleAudioEnded = () => {
      if (!audioRef.current || isMuted.value) return;
      
      const audio = audioRef.current;
      audio.currentTime = 0;
      audio.volume = 0;
      audio.play().catch(() => {});
      
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      
      let vol = 0;
      const targetMax = globalVolume.value * BASE_BGM_VOLUME;
      const targetVol = (isSunning.value || isEvolving.value) ? targetMax * 0.2 : targetMax;
      const step = targetVol / 20; 
      
      fadeIntervalRef.current = window.setInterval(() => {
         vol += step;
         if (vol >= targetVol) {
            audio.volume = targetVol;
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
         } else {
            audio.volume = Math.min(vol, targetVol);
         }
      }, 100);
   };

   // Ducking (Bajar volumen) cuando hay interacción de Sol o Evolución
   useEffect(() => {
      if (audioRef.current && !isMuted.value) {
         const targetMax = globalVolume.value * BASE_BGM_VOLUME;
         if (isSunning.value || isEvolving.value) {
            audioRef.current.volume = targetMax * 0.2; // Reducir al 20% del volumen actual
         } else {
            audioRef.current.volume = targetMax;
         }
      }
   }, [isSunning.value, isEvolving.value, isMuted.value, globalVolume.value]);

   // Determinar la descripción según la especie o el subid (si es Ent)
   const getDescription = () => {
      const isEnt = plantPhase.value === "ent";
      const subid = plantUnitySubid.value;
      const speciesId = plantSpeciesId.value;

      // Si es Ent y tiene subid, priorizamos el subid (autor)
      if (isEnt && subid && (SPECIES_DESCRIPTION_JSON as any)[subid]) {
         return (SPECIES_DESCRIPTION_JSON as any)[subid];
      }

      // De lo contrario, usamos la descripción por especie
      return (SPECIES_DESCRIPTION_JSON as any)[speciesId] || "Descripción no disponible para esta especie.";
   };

   // Obtener el subtítulo (Especie + Autor si es Ent)
   const getSubheader = () => {
      const speciesId = plantSpeciesId.value;
      const subid = plantUnitySubid.value;
      const isEnt = plantPhase.value === "ent";
      
      const speciesData = (SPECIES_JSON as any)[speciesId];
      const commonName = speciesData?.common_name || speciesId;
      
      if (isEnt && subid && subid !== speciesId) {
         return `${commonName} - Diseñado por: ${subid}`;
      }
      return commonName;
   };

   const handleOpenWater = () => {
      if (entLocked || isWaterOnCooldown.value) return;
      isWaterGameOpen.value = true;
   };


   const handleOpenCompost = (e: MouseEvent) => {
      // Botón oculto (modo admin): Activación por combinación de teclas restringida por usuario
      const ALLOWED_ADMINS = ["Tato", "Andrs", "Olivares", "Willy"];
      if ((e.altKey || e.shiftKey) && ALLOWED_ADMINS.includes(username.value || "")) {
         isDebugOpen.value = true;
         return;
      }

      if (entLocked || isCompostOnCooldown.value) return;
      isCompostGameOpen.value = true;
   };

   const handleOpenSun = () => {
      if (entLocked || isSunOnCooldown.value) return; 
      isSunGameOpen.value = true;
   };


   return (
      <>
         {/* Audio de fondo */}
         <audio ref={audioRef} src={bgMusicSrc} onEnded={handleAudioEnded} />

         <div className="absolute inset-0 z-10 flex flex-col justify-end items-center pointer-events-none p-8">

            {/* Sol - bloqueado visualmente cuando hay Ent o Cooldown */}
            <div
               onClick={handleOpenSun}
               title={entLocked ? "🌳 Ent activo — minijuego bloqueado" : isSunOnCooldown.value ? `Esperando sol: ${sunRemainingTime.value}` : "Minijuego del Sol"}
               className={`absolute top-16 right-1/2 mr-35 w-48 h-48 flex items-center justify-center
                           drop-shadow-[0_0_15px_rgba(255,255,150,0.5)] pointer-events-auto
                           transition-all duration-200
                           ${(entLocked || isSunOnCooldown.value)
                              ? "opacity-40 grayscale cursor-not-allowed"
                              : "cursor-pointer hover:scale-110 active:scale-95"
                           }`}
            >
               <img src={solEscenario.src} alt="Sol - Minijuego de Soles" className="w-full h-full object-contain" />
               {entLocked ? (
                  <span className="absolute inset-0 flex items-center justify-center text-4xl select-none pointer-events-none">
                     🔒
                  </span>
               ) : isSunOnCooldown.value && (
                  <div className="absolute bottom-4 bg-black/70 text-white text-xs font-black px-2 py-1 rounded-md border border-white/20">
                    {sunRemainingTime.value}
                  </div>
               )}
            </div>

            {/* Main Center Plant Container */}
            <Plant />

            {/* Interactable Items (Compost & Watering can) */}
            <div className="absolute bottom-32 left-1/2 ml-56 flex items-end gap-6 pointer-events-auto">

               {/* Compost Bag */}
               <button
                  onClick={handleOpenCompost}
                  title={entLocked ? "🌳 Ent activo — minijuego bloqueado" : isCompostOnCooldown.value ? `Esperando residuos: ${compostRemainingTime.value}` : "Minijuego de Composta"}
                  className={`relative w-20 h-auto flex items-center justify-center transition-all duration-150 ease-in-out
                              ${(entLocked || isCompostOnCooldown.value)
                                 ? "opacity-40 grayscale cursor-not-allowed"
                                 : "cursor-pointer hover:opacity-80 active:scale-90"
                              }`}
               >
                  <img src={btnMinijuegoComposta.src} alt="Bolsa Composta" className="w-full h-full object-contain" />
                  {entLocked ? (
                     <span className="absolute inset-0 flex items-center justify-center text-3xl select-none pointer-events-none">
                        🔒
                     </span>
                  ) : isCompostOnCooldown.value && (
                    <div className="absolute -bottom-2 bg-black/80 text-white text-[10px] font-black px-1.5 py-0.5 rounded border border-white/20 whitespace-nowrap">
                      {compostRemainingTime.value}
                    </div>
                  )}
               </button>

               {/* Watering Can */}
               <button
                  onClick={handleOpenWater}
                  title={entLocked ? "🌳 Ent activo — minijuego bloqueado" : isWaterOnCooldown.value ? `Recuperando agua: ${waterRemainingTime.value}` : "Minijuego del Agua"}
                  className={`relative w-25 h-auto flex items-center justify-center transition-all duration-150 ease-in-out
                              ${(entLocked || isWaterOnCooldown.value)
                                 ? "opacity-40 grayscale cursor-not-allowed"
                                 : "cursor-pointer hover:opacity-80 active:scale-90"
                              }`}
               >
                  <img src={btnMinijuegoAgua.src} alt="Regadera" className="w-full h-full object-contain" />
                  {entLocked ? (
                     <span className="absolute inset-0 flex items-center justify-center text-3xl select-none pointer-events-none">
                        🔒
                     </span>
                  ) : isWaterOnCooldown.value && (
                    <div className="absolute -bottom-2 bg-black/80 text-white text-[10px] font-black px-1.5 py-0.5 rounded border border-white/20 whitespace-nowrap">
                      {waterRemainingTime.value}
                    </div>
                  )}
               </button>

            </div>
         </div>

         {/* Plant Info Popup */}
         {isPlantInfoOpen.value && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 pointer-events-auto">
               <div className="relative w-[450px] h-[600px] lg:w-[650px] lg:h-[800px] flex flex-col items-center justify-start p-10 lg:p-14">
                  {/* Background Panel */}
                  <img src={panelDescripcionPlanta.src} alt="Panel Descripcion" className="absolute inset-0 w-full h-full object-fill -z-10" />

                  {/* Close button */}
                  <button
                     onClick={() => isPlantInfoOpen.value = false}
                     className="absolute top-6 right-6 w-10 h-10 bg-red-500/80 hover:bg-red-500 text-white font-bold rounded-full border-2 border-red-700 shadow-sm transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
                  >
                     X
                  </button>

                  {/* Content */}
                  <h2 className="text-[#4e341b] text-2xl lg:text-4xl font-bold mb-1 mt-20 text-center drop-shadow-sm uppercase tracking-wide">
                     {plantPhase.value === "ent" ? "Información del Ent" : "Información de la Planta"}
                  </h2>
                  
                  {/* Nombre de la especie / Autor */}
                  <div className="text-[#4e341b]/80 text-xl lg:text-2xl font-black mb-4 text-center drop-shadow-sm italic">
                     {getSubheader()}
                  </div>

                  <div className="flex-1 w-full overflow-y-auto px-6 mt-4 text-[#4e341b] text-lg lg:text-2xl font-semibold leading-relaxed
                                  scrollbar-thin scrollbar-thumb-[#8B4513] scrollbar-track-[#f5e6c8]">
                     <p className="whitespace-pre-wrap text-center">
                        {getDescription()}
                     </p>
                  </div>
               </div>
            </div>
         )}

         <DebugPanel />

         {/* ── Input oculto para selección de archivo .tree ── */}
         <input
            ref={fileInputRef}
            type="file"
            accept=".tree"
            onChange={handleTreeFileChange}
            className="hidden"
            id="tree-file-input"
         />

         {/* ── Botón pastilla flotante: Sync desde 3D ── */}
         <button
            id="btn-sync-3d"
            onClick={handleSyncClick}
            disabled={syncStatus === "loading"}
            title="Importar archivo .tree desde 3D para actualizar plantas y semillas"
            className={`
               fixed bottom-6 right-6 z-30
               flex items-center gap-2
               px-4 py-2 rounded-full
               font-bold text-sm
               shadow-lg shadow-black/40
               border border-white/10
               pointer-events-auto
               transition-all duration-200
               active:scale-95 select-none
               ${syncStatus === "loading" ? "bg-emerald-800/80 cursor-wait" :
                 syncStatus === "ok"      ? "bg-emerald-500 text-white cursor-default" :
                 syncStatus === "error"   ? "bg-red-700/90 text-white" :
                                            "bg-emerald-700/90 hover:bg-emerald-600 text-white hover:scale-105"}
            `}
         >
            {syncStatus === "loading" && (
               <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
               </svg>
            )}
            {syncStatus === "ok"    && <span>✓</span>}
            {syncStatus === "error" && <span>✗</span>}
            {syncStatus === "idle"  && (
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                     d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 8l-3-3m3 3l3-3" />
               </svg>
            )}
            <span>
               {syncStatus === "loading" ? "Cargando..." :
                syncStatus === "ok"      ? "Sincronizado" :
                syncStatus === "error"   ? "Error en .tree" :
                                           "Sync desde 3D"}
            </span>
         </button>
      </>
   );
}
