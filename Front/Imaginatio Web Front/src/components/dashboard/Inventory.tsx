import { useState, useEffect } from "preact/hooks";
import { batch } from "@preact/signals";
import { isInventoryOpen, activePlantId, inventoryVersion, plantName, refreshInventory, syncUserState, isNamingModalOpen } from "../../store/resourceStore";
import { syncPlantState, setEvolutionRequirementsFromSpecies, plantSpeciesId } from "../../store/plantStore";
import { fetchMyInventory, setActivePlant, deletePlant, createPlant, fetchMyState } from "../../store/apiClient";
import { PLANT_SPRITE_REGISTRY, FALLBACK_SPECIES, type SpriteConfig } from "../../config/plantSpriteRegistry";
import type { PlantPhase } from "../../store/plantStore";
import { syncInventoryToTree } from "../../store/unityBridge";
import SPECIES_JSON from "../../config/species.json";

import fondoInventario from "../../assets/Recursos inventario/Fondo_Inventario.png";
import panelHudInventario from "../../assets/Recursos inventario/Panel_HUDInventario.png";
import panelPlantaEspacio from "../../assets/Recursos inventario/Panel_PlantaEspacio.png";

// Botones de filtro – Estado (fases de crecimiento)
import btnEstado01 from "../../assets/Recursos inventario/btn_Estado_01.png";
import btnEstado02 from "../../assets/Recursos inventario/btn_Estado_02.png";
import btnEstado03 from "../../assets/Recursos inventario/btn_Estado_03.png";
import btnEstado04 from "../../assets/Recursos inventario/btn_Estado_04.png";
import btnAyuda from "../../assets/Recursos web media/btn_ayuda.png";

// Botones de filtro – Urgencia (campanas)
import btnUrgencia01 from "../../assets/Recursos inventario/btn_Urgencia_01.png";
import btnUrgencia02 from "../../assets/Recursos inventario/btn_Urgencia_02.png";
import btnUrgencia03 from "../../assets/Recursos inventario/btn_Urgencia_03.png";

// Botones de filtro – Categoría (biomas)
import btnCategoria01 from "../../assets/Recursos inventario/btn_Categoría_01.png";
import btnCategoria02 from "../../assets/Recursos inventario/btn_Categoría_02.png";
import btnCategoria03 from "../../assets/Recursos inventario/btn_Categoría_03.png";
import btnCategoria04 from "../../assets/Recursos inventario/btn_Categoría_04.png";
import btnCategoria05 from "../../assets/Recursos inventario/btn_Categoría_05.png";

// ── Tipos ──────────────────────────────────────────────────────────────────
interface BackendPlant {
  id: string;
  name: string;
  species_id: string;
  stage: string;
  health: number;
  water: number;
  sun: number;
  fertilizer: number;
  is_dead: boolean;
  species_data?: any;
  // Campos escritos por 3D (solo lectura en Web)
  unity_subid?:        string;
  unity_salud?:        string;
  unity_hp?:           number;
  unity_nivel?:        number;
  unity_xp?:           number;
  unity_en_combate?:   boolean;
  unity_seleccionada?: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────
const PHASE_LABELS: Record<string, string> = {
  seed: "Semilla",
  small_bush: "Arbusto",
  large_bush: "Planta",
  ent: "Ent",
};

const SPECIES_LABELS: Record<string, string> = {
  pasto: "Pasto",
  nogal: "Nogal",
  cedro: "Cedro",
};

const getFertilizerReward = (stage: string) => {
  if (stage === "seed") return 1;
  if (stage === "small_bush") return 2;
  if (stage === "large_bush") return 3;
  if (stage === "ent") return 4;
  return 1;
};

function getConfig(speciesId: string, subid: string | undefined, stage: string): SpriteConfig {
  const key = (subid && PLANT_SPRITE_REGISTRY[subid]) ? subid : (PLANT_SPRITE_REGISTRY[speciesId] ? speciesId : FALLBACK_SPECIES);
  const phase: PlantPhase = (stage as PlantPhase) in PLANT_SPRITE_REGISTRY[key]
    ? (stage as PlantPhase)
    : "seed";
  return PLANT_SPRITE_REGISTRY[key][phase];
}

function getPlantReqs(plant: BackendPlant) {
  const defaultReqs = { water: 10, sun: 10 };
  if (!plant.species_data) return defaultReqs;
  const reqs = plant.species_data.evolution_requirements?.[plant.stage.toUpperCase()];
  if (!reqs) return defaultReqs; // Ent o sin requerimientos
  return {
    water: reqs.water ?? 10,
    sun: reqs.sun ?? 10,
  };
}

function getPlantUrgency(plant: BackendPlant): "estable" | "alerta" | "critico" {
  if (plant.is_dead) return "critico";
  
  const reqs = getPlantReqs(plant);
  
  // Usar porcentajes en lugar de valores absolutos para alerta/estable
  const waterPct = (plant.water / reqs.water) * 100;
  const sunPct = (plant.sun / reqs.sun) * 100;
  const minPct = Math.min(waterPct, sunPct);

  // Crítico si cualquiera de sus recursos está en 1 o menos (0 es muerta)
  if (plant.water <= 1 || plant.sun <= 1) return "critico"; 
  
  // Alerta si es menor o igual a 50%, Estable si es mayor a 50%
  if (minPct <= 50) return "alerta";
  return "estable";
}

function getPlantCategory(plant: BackendPlant): string {
  const sp = (SPECIES_JSON as Record<string, any>)[plant.species_id];
  return sp?.classification || "Base";
}


// ── Sub-componente: Preview estático del primer frame ─────────────────────
// Usa SpriteAnimator (probado y funcional) dentro de un wrapper que controla
// el tamaño y aplica overflow:hidden para cortar a exactamente 1 frame.
// El scale=1 evita que aplique la escala del juego (diseñada para w-80).
import { SpriteAnimator } from "./SpriteAnimator";

function PlantFirstFrame({ config, size = 56 }: { config: SpriteConfig; size?: number }) {
  const aspect = config.frameWidth / config.frameHeight;
  const w = Math.round(size * aspect);

  return (
    <div style={{ width: w, height: size, overflow: "hidden", flexShrink: 0 }}>
      <SpriteAnimator
        src={config.src}
        frameWidth={config.frameWidth}
        frameHeight={config.frameHeight}
        frameCount={config.frameCount}
        scale={1}
        fps={10}
        className="w-full h-full"
      />
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────
export default function Inventory() {
  const [plants, setPlants] = useState<BackendPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<BackendPlant | null>(null);
  const [filterState, setFilterState] = useState<string | null>(null);
  const [filterUrgency, setFilterUrgency] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [confirmingDeleteLive, setConfirmingDeleteLive] = useState<BackendPlant | null>(null);
  const [confirmingDeleteDead, setConfirmingDeleteDead] = useState<BackendPlant | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (isInventoryOpen.value) {
      const shown = localStorage.getItem("inventory_tutorial_shown");
      if (!shown) {
        setShowTutorial(true);
        localStorage.setItem("inventory_tutorial_shown", "true");
      }
    }
  }, [isInventoryOpen.value]);

  if (!isInventoryOpen.value) return null;

  const loadInventory = () => {
    setLoading(true);
    fetchMyInventory()
      .then((data: BackendPlant[]) => {
        setPlants(data ?? []);
        // Sincronizar el .tree con el inventario actualizado
        syncInventoryToTree(data ?? []);
      })
      .catch(() => setPlants([]))
      .finally(() => setLoading(false));
  };

  // Cargar cuando el modal se abre y refrescar periódicamente
  useEffect(() => {
    if (isInventoryOpen.value) {
      loadInventory();
      setSelectedPlant(null); // Siempre limpiar el panel al abrir

      // Refresco en segundo plano para ver el decaimiento de recursos sin cerrar el modal
      const interval = setInterval(() => {
        fetchMyInventory()
          .then((data: BackendPlant[]) => {
            setPlants(data ?? []);
            // Actualizar la planta seleccionada si está abierta
            setSelectedPlant(prev => {
              if (!prev) return null;
              return data.find(p => p.id === prev.id) || null;
            });
          })
          .catch(() => { });
      }, 5000); // Cada 5 segundos para ver los cambios rápidamente si los hay
      return () => clearInterval(interval);
    }
  }, [isInventoryOpen.value]);

  // Refrescar cuando otra parte de la app incremente inventoryVersion
  useEffect(() => {
    if (isInventoryOpen.value) loadInventory();
  }, [inventoryVersion.value]);

  const handleSelectActive = async (plant: BackendPlant) => {
    if (plant.id === activePlantId.value || plant.is_dead) return;
    setSwitching(plant.id);
    try {
      // setActivePlant retorna fetchMyState() que incluye:
      //   - cooldowns descongelados (si se salió de un Ent)
      //   - ent_active_since actualizado (si se entró a un Ent)
      const updatedUser = await setActivePlant(plant.id);

      batch(() => {
        // Sincronizar el estado completo del usuario para actualizar
        // entActiveSince y los cooldowns en el store reactivo
        syncUserState(updatedUser);

        activePlantId.value = plant.id;
        plantName.value = plant.name;          // ← actualizar nombre en HUD
        if (plant.name === "Nueva Planta") {
          isNamingModalOpen.value = true;
        }
        syncPlantState(plant);
        if (plant.species_data) setEvolutionRequirementsFromSpecies(plant.species_data);
        plantSpeciesId.value = plant.species_id;
        setSelectedPlant(null);               // ← cerrar subpanel antes de cerrar modal
        isInventoryOpen.value = false;
      });
    } catch (e: any) {
      alert(e.message ?? "Error al cambiar la planta activa.");
    } finally {
      setSwitching(null);
    }
  };

  const handleDeletePlant = async (plantId: string, isConfirmed: boolean = false) => {
    const plant = plants.find(p => p.id === plantId);
    if (!plant) return;

    if (!isConfirmed) {
      if (plant.is_dead) setConfirmingDeleteDead(plant);
      else setConfirmingDeleteLive(plant);
      return;
    }

    try {
      const wasActive = activePlantId.value === plantId;
      await deletePlant(plantId);
      
      const newState = await fetchMyState();
      syncUserState(newState);

      // Si borramos la planta que estaba seleccionada, sincronizamos visualmente la nueva que el backend asignó
      if (wasActive && newState.active_plant) {
        batch(() => {
          const next = newState.active_plant;
          plantName.value = next.name;
          if (next.name === "Nueva Planta") {
            isNamingModalOpen.value = true;
          }
          syncPlantState(next);
          if (next.species_data) setEvolutionRequirementsFromSpecies(next.species_data);
          plantSpeciesId.value = next.species_id;
        });
      }

      setSelectedPlant(null);
      refreshInventory();
    } catch (e: any) {
      alert(e.message ?? "Error al eliminar la planta.");
    }
  };

  const filteredPlants = plants.filter(plant => {
    if (filterState && plant.stage !== filterState) return false;
    if (filterUrgency && getPlantUrgency(plant) !== filterUrgency) return false;
    if (filterCategory && getPlantCategory(plant) !== filterCategory) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 pointer-events-auto backdrop-blur-sm">
      <div className="relative w-[95%] max-w-6xl h-[85%] flex flex-col items-center justify-start rounded-lg shadow-2xl overflow-hidden border-8 border-[#6b4226]">

        {/* Fondo */}
        <div className="absolute inset-0 z-0">
          <img src={fondoInventario.src} alt="Fondo Inventario" className="w-full h-full object-fill opacity-90" />
        </div>

        {/* Header con filtros integrados */}
        <div className="relative z-10 w-full mb-2 flex flex-col items-center px-8 py-1">
          {/* Fondo del HUD */}
          <div className="absolute inset-x-0 top-0 bottom-0 z-0">
            <img src={panelHudInventario.src} alt="HUD Inventario" className="w-full h-full object-fill" />
          </div>

          {/* Fila superior: Título + contador */}
          <div className="relative z-10 w-full flex items-center justify-between h-10 lg:h-12 px-4">
            <span className="text-white font-black text-lg drop-shadow-md">🌿 Mis Plantas</span>
            <div className="flex items-center gap-3">
              <span className="text-white/70 text-sm font-medium">{plants.length} planta{plants.length !== 1 ? "s" : ""}</span>
              <button
                onClick={() => setShowTutorial(true)}
                className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center cursor-pointer transition-all duration-150 ease-in-out hover:opacity-60 active:scale-90"
                title="Ayuda del inventario"
              >
                <img src={btnAyuda.src} alt="Ayuda" className="w-full h-full object-contain" />
              </button>
              <button
                onClick={loadInventory}
                className="text-white/60 hover:text-white text-lg transition-colors"
                title="Actualizar inventario"
              >
                🔄
              </button>
            </div>
          </div>

          {/* Fila inferior: Botones de filtro */}
          <div className="relative z-10 w-full flex items-center justify-center pb-3 pt-1 gap-6">
            {/* Grupo: Estado (fases de crecimiento) */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-white/80 text-xs font-bold uppercase tracking-wider drop-shadow-sm">Estado</span>
              <div className="flex items-start gap-2">
                {[
                  { img: btnEstado01, label: "Semilla", value: "seed" },
                  { img: btnEstado02, label: "Brote", value: "small_bush" },
                  { img: btnEstado03, label: "Arbusto", value: "large_bush" },
                  { img: btnEstado04, label: "Ent", value: "ent" },
                ].map((btn, i) => {
                  const isSelected = filterState === btn.value;
                  const isFaded = filterState !== null && filterState !== btn.value;
                  return (
                    <button
                      key={`estado-${i}`}
                      onClick={() => setFilterState(prev => prev === btn.value ? null : btn.value)}
                      className={`flex flex-col items-center gap-1 group transition-all duration-200 ${isFaded ? "opacity-40 grayscale" : "opacity-100"}`}
                      title={btn.label}
                    >
                      <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-md overflow-hidden transition-all duration-150 group-active:scale-95 ${isSelected ? "ring-2 ring-yellow-400 scale-110 brightness-125" : "group-hover:scale-110 group-hover:brightness-125"}`}>
                        <img src={btn.img.src} alt={btn.label} className="w-full h-full object-contain" draggable={false} />
                      </div>
                      <span className={`text-[10px] font-semibold leading-none drop-shadow-sm ${isSelected ? "text-yellow-400" : "text-white/70"}`}>{btn.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Separador */}
            <div className="w-px h-16 bg-white/20" />

            {/* Grupo: Urgencia (campanas) */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-white/80 text-xs font-bold uppercase tracking-wider drop-shadow-sm">Urgencia</span>
              <div className="flex items-start gap-2">
                {[
                  { img: btnUrgencia01, label: "Estable", value: "estable" },
                  { img: btnUrgencia02, label: "Alerta", value: "alerta" },
                  { img: btnUrgencia03, label: "Crítico", value: "critico" },
                ].map((btn, i) => {
                  const isSelected = filterUrgency === btn.value;
                  const isFaded = filterUrgency !== null && filterUrgency !== btn.value;
                  return (
                    <button
                      key={`urgencia-${i}`}
                      onClick={() => setFilterUrgency(prev => prev === btn.value ? null : btn.value)}
                      className={`flex flex-col items-center gap-1 group transition-all duration-200 ${isFaded ? "opacity-40 grayscale" : "opacity-100"}`}
                      title={btn.label}
                    >
                      <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-md overflow-hidden transition-all duration-150 group-active:scale-95 ${isSelected ? "ring-2 ring-yellow-400 scale-110 brightness-125" : "group-hover:scale-110 group-hover:brightness-125"}`}>
                        <img src={btn.img.src} alt={btn.label} className="w-full h-full object-contain" draggable={false} />
                      </div>
                      <span className={`text-[10px] font-semibold leading-none drop-shadow-sm ${isSelected ? "text-yellow-400" : "text-white/70"}`}>{btn.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Separador */}
            <div className="w-px h-16 bg-white/20" />

            {/* Grupo: Categoría (biomas) */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-white/80 text-xs font-bold uppercase tracking-wider drop-shadow-sm">Categoría</span>
              <div className="flex items-start gap-2">
                {[
                  { img: btnCategoria01, label: "Solar", value: "Solar" },
                  { img: btnCategoria02, label: "Xerofito", value: "Xerofito" },
                  { img: btnCategoria03, label: "Templado", value: "Templado" },
                  { img: btnCategoria04, label: "Montaña", value: "Montaña" },
                  { img: btnCategoria05, label: "Hidro", value: "Hidro" },
                ].map((btn, i) => {
                  const isSelected = filterCategory === btn.value;
                  const isFaded = filterCategory !== null && filterCategory !== btn.value;
                  return (
                    <button
                      key={`categoria-${i}`}
                      onClick={() => setFilterCategory(prev => prev === btn.value ? null : btn.value)}
                      className={`flex flex-col items-center gap-1 group transition-all duration-200 ${isFaded ? "opacity-40 grayscale" : "opacity-100"}`}
                      title={btn.label}
                    >
                      <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-md overflow-hidden transition-all duration-150 group-active:scale-95 ${isSelected ? "ring-2 ring-yellow-400 scale-110 brightness-125" : "group-hover:scale-110 group-hover:brightness-125"}`}>
                        <img src={btn.img.src} alt={btn.label} className="w-full h-full object-contain" draggable={false} />
                      </div>
                      <span className={`text-[10px] font-semibold leading-none drop-shadow-sm ${isSelected ? "text-yellow-400" : "text-white/70"}`}>{btn.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Grid de plantas */}
        <div className="relative z-10 w-full flex-1 overflow-y-auto px-6 pb-10 mt-1 scrollbar-thin scrollbar-thumb-[#6b4226] scrollbar-track-[#8d6e63]">
          {loading ? (
            <div className="flex items-center justify-center h-full text-white/70 text-lg font-bold animate-pulse">
              Cargando plantas...
            </div>
          ) : plants.length === 0 ? (
            <div className="flex items-center justify-center h-full text-white/60 text-base font-medium">
              No tienes plantas todavía.
            </div>
          ) : filteredPlants.length === 0 ? (
            <div className="flex items-center justify-center h-full text-white/60 text-base font-medium">
              No se encontraron plantas con estos filtros.
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-5 p-2">
              {filteredPlants.map((plant) => {
                const isActive = plant.id === activePlantId.value;
                const isSwitchingThis = switching === plant.id;
                const spriteConfig = getConfig(plant.species_id, plant.unity_subid, plant.stage);

                return (
                  <div
                    key={plant.id}
                    onClick={() => !isSwitchingThis && setSelectedPlant(plant)}
                    className={`relative aspect-square flex flex-col items-center justify-center overflow-hidden transition-all duration-200 cursor-pointer rounded-sm
                      ${isActive ? "ring-4 ring-yellow-400 scale-[1.03]" : "hover:scale-105"}
                      ${plant.is_dead ? "grayscale opacity-60" : ""}
                      ${isSwitchingThis ? "opacity-50 pointer-events-none" : ""}
                    `}
                  >
                    {/* Fondo de slot */}
                    <div className="absolute inset-0 z-0">
                      <img src={panelPlantaEspacio.src} alt="Slot" className="w-full h-full object-fill" />
                    </div>

                    {/* Contenido */}
                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-2 pt-5">
                      {/* Nombre */}
                      <span className="text-white text-[13px] font-black drop-shadow-md text-center leading-tight truncate w-full">
                        {plant.name}
                      </span>

                      {/* Sprite de la fase actual */}
                      <div className={`relative flex items-center justify-center overflow-hidden w-16 h-16 ${plant.is_dead ? "grayscale opacity-40 brightness-50" : ""}`}>
                        <PlantFirstFrame config={spriteConfig} size={56} />
                        {plant.is_dead && (
                          <div className="absolute inset-0 flex items-center justify-center text-3xl drop-shadow-lg">
                            ☠️
                          </div>
                        )}
                      </div>

                      {/* Info inferior */}
                      <div className="w-full space-y-1 mt-1">
                        <div className="flex justify-between text-[10px] text-white/80 font-medium px-1 leading-none">
                          <span>{SPECIES_LABELS[plant.species_id] ?? plant.species_id}</span>
                          <span>{PHASE_LABELS[plant.stage] ?? plant.stage}</span>
                        </div>

                        {/* Barras de progreso Agua y Sol */}
                        <div className="w-full flex flex-col gap-[2px] mt-1">
                          <div className="flex gap-1 w-full">
                            {/* Barra de agua */}
                            <div className="w-1/2 h-2.5 bg-black/40 rounded-full overflow-hidden border border-black/20" title="Agua">
                              <div
                                className={`h-full rounded-full bg-blue-500 transition-all duration-500 ${plant.is_dead ? "grayscale opacity-50" : ""}`}
                                style={{ width: `${Math.min(100, (plant.water / getPlantReqs(plant).water) * 100)}%` }}
                              />
                            </div>
                            {/* Barra de sol */}
                            <div className="w-1/2 h-2.5 bg-black/40 rounded-full overflow-hidden border border-black/20" title="Sol">
                              <div
                                className={`h-full rounded-full bg-yellow-400 transition-all duration-500 ${plant.is_dead ? "grayscale opacity-50" : ""}`}
                                style={{ width: `${Math.min(100, (plant.sun / getPlantReqs(plant).sun) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Badge ACTIVA */}
                    {isActive && (
                      <div className="absolute top-1 right-1 bg-yellow-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full shadow z-20">
                        ACTIVA
                      </div>
                    )}
                    {/* Badge MUERTA */}
                    {plant.is_dead && (
                      <div className="absolute top-1 left-1 bg-red-700 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow z-20">
                        MUERTA
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Botón cerrar */}
        <button
          onClick={() => isInventoryOpen.value = false}
          className="absolute top-2 right-2 w-10 h-10 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full border-4 border-[#4e342e] shadow-lg transition-transform active:scale-95 z-20"
        >
          X
        </button>
      </div>

      {/* Modal de detalle / selección */}
      {selectedPlant && !confirmingDeleteLive && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
          onClick={() => setSelectedPlant(null)}
        >
          <div
            className="bg-[#2d1f0e] border-4 border-[#6b4226] rounded-2xl p-6 w-72 flex flex-col items-center gap-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sprite grande en el modal */}
            <div className={`relative w-28 h-28 flex items-center justify-center overflow-hidden ${selectedPlant.is_dead ? "grayscale opacity-40 brightness-50" : ""}`}>
              <PlantFirstFrame config={getConfig(selectedPlant.species_id, selectedPlant.unity_subid, selectedPlant.stage)} size={96} />
              {selectedPlant.is_dead && (
                <div className="absolute inset-0 flex items-center justify-center text-6xl drop-shadow-xl">
                  ☠️
                </div>
              )}
            </div>
            <div className="text-center">
              <h2 className="text-white font-black text-xl">{selectedPlant.name}</h2>
              <p className="text-white/60 text-sm">
                {SPECIES_LABELS[selectedPlant.species_id] ?? selectedPlant.species_id} · {PHASE_LABELS[selectedPlant.stage] ?? selectedPlant.stage}
              </p>
            </div>

            {/* Mini stats — recursos web */}
            <div className="w-full grid grid-cols-3 gap-2 text-xs text-center">
              <div className="bg-blue-900/50 rounded-lg p-2">
                <div className="text-blue-300 font-black text-base">{Math.ceil(selectedPlant.water)}</div>
                <div className="text-white/60">Agua</div>
              </div>
              <div className="bg-yellow-900/50 rounded-lg p-2">
                <div className="text-yellow-300 font-black text-base">{Math.ceil(selectedPlant.sun)}</div>
                <div className="text-white/60">Sol</div>
              </div>
              <div className="bg-green-900/50 rounded-lg p-2">
                <div className="text-green-300 font-black text-base">{Math.ceil(selectedPlant.fertilizer)}</div>
                <div className="text-white/60">Abono</div>
              </div>
            </div>

            {/* Datos de 3D — salud/HP (siempre si existen) */}
            {(selectedPlant.unity_salud || selectedPlant.unity_hp !== undefined) && (
              <div className="w-full flex gap-2 text-xs">
                {selectedPlant.unity_salud && (
                  <div className={`flex-1 rounded-lg p-2 text-center font-bold
                    ${
                      selectedPlant.unity_salud === "muerto"  ? "bg-red-900/60 text-red-300" :
                      selectedPlant.unity_salud === "critico" ? "bg-orange-900/60 text-orange-300" :
                      selectedPlant.unity_salud === "dañado"  ? "bg-yellow-900/60 text-yellow-300" :
                                                                 "bg-emerald-900/60 text-emerald-300"
                    }`}
                  >
                    <div className="text-base capitalize">
                      {selectedPlant.unity_salud === "saludable" ? "🌿" :
                       selectedPlant.unity_salud === "dañado"    ? "⚠️" :
                       selectedPlant.unity_salud === "critico"   ? "🔥" : "💀"}
                    </div>
                    <div>{selectedPlant.unity_salud}</div>
                    <div className="text-white/40 font-normal">Estado 3D</div>
                  </div>
                )}
                {selectedPlant.unity_hp !== undefined && (
                  <div className="flex-1 bg-red-900/40 rounded-lg p-2 text-center">
                    <div className="text-red-300 font-black text-base">{selectedPlant.unity_hp}</div>
                    <div className="text-white/60">HP</div>
                  </div>
                )}
              </div>
            )}

            {/* Nivel / XP — SOLO se muestra para Ents (administrado por 3D) */}
            {selectedPlant.stage === "ent" && (
              <div className="w-full rounded-xl bg-purple-900/40 border border-purple-500/30 p-3">
                <div className="text-purple-300 text-[10px] font-bold uppercase tracking-wider mb-2 text-center">⚔️ Datos del Ent</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-center">
                  <div className="bg-purple-900/50 rounded-lg p-2">
                    <div className="text-purple-200 font-black text-base">
                      {selectedPlant.unity_nivel ?? "—"}
                    </div>
                    <div className="text-white/60">Nivel</div>
                  </div>
                  <div className="bg-indigo-900/50 rounded-lg p-2">
                    <div className="text-indigo-200 font-black text-base">
                      {selectedPlant.unity_xp ?? "—"}
                    </div>
                    <div className="text-white/60">XP</div>
                  </div>
                </div>
                {(selectedPlant.unity_en_combate || selectedPlant.unity_seleccionada) && (
                  <div className="flex gap-1 mt-2 justify-center">
                    {selectedPlant.unity_seleccionada && (
                      <span className="bg-yellow-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full">ACTIVO 3D</span>
                    )}
                    {selectedPlant.unity_en_combate && (
                      <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">EN COMBATE</span>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 w-full mt-1">
              <button
                onClick={() => setSelectedPlant(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-xl transition-colors"
              >
                Cancelar
              </button>

              {/* Botón de eliminar, visible si hay más de una planta O si la única que queda está muerta */}
              {(plants.length > 1 || selectedPlant.is_dead) && (
                <button
                  onClick={() => handleDeletePlant(selectedPlant.id)}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-xl transition-colors shadow-lg"
                >
                  Eliminar
                </button>
              )}

              {/* Botón de seleccionar si NO está muerta y no es la activa */}
              {!selectedPlant.is_dead && selectedPlant.id !== activePlantId.value && (
                <button
                  onClick={() => handleSelectActive(selectedPlant)}
                  disabled={!!switching}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-black py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  {switching ? "..." : "Seleccionar"}
                </button>
              )}
              {selectedPlant.id === activePlantId.value && (
                <div className="flex-1 bg-yellow-400/20 text-yellow-300 font-bold py-2 rounded-xl text-center text-sm">
                  Planta activa ✓
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar planta viva */}
      {confirmingDeleteLive && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md"
          onClick={() => setConfirmingDeleteLive(null)}
        >
          <div
            className="bg-[#2d1f0e] border-4 border-red-900 rounded-2xl p-6 w-80 flex flex-col items-center gap-4 shadow-[0_0_40px_rgba(220,38,38,0.4)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl mb-2 animate-bounce">⚠️</div>
            <h2 className="text-white font-black text-xl text-center uppercase tracking-wide">
              ¡Cuidado!
            </h2>
            <p className="text-white/80 text-sm text-center leading-relaxed">
              Estás a punto de eliminar tu <span className="font-bold text-green-400">planta viva</span>.
              <br /><br />
              Recibirás <span className="font-black text-amber-400 text-lg">{getFertilizerReward(confirmingDeleteLive.stage)} unidades</span> de abono.
              <br /><br />
              Esta acción es <span className="text-red-400 font-bold underline">irreversible</span>.
            </p>

            <div className="flex gap-3 w-full mt-4">
              <button
                onClick={() => setConfirmingDeleteLive(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  handleDeletePlant(confirmingDeleteLive.id, true);
                  setConfirmingDeleteLive(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-xl transition-colors shadow-lg"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar planta muerta */}
      {confirmingDeleteDead && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md"
          onClick={() => setConfirmingDeleteDead(null)}
        >
          <div
            className="bg-[#2d1f0e] border-4 border-amber-900 rounded-2xl p-6 w-80 flex flex-col items-center gap-4 shadow-[0_0_40px_rgba(146,64,14,0.4)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl mb-2">♻️</div>
            <h2 className="text-white font-black text-xl text-center uppercase tracking-wide">
              Reciclar Planta
            </h2>
            <p className="text-white/80 text-sm text-center leading-relaxed">
              ¿Quieres reciclar los restos de esta planta?
              <br /><br />
              A cambio, recibirás <span className="font-black text-amber-400 text-lg">1 unidad</span> de composta para tu inventario.
            </p>

            <div className="flex gap-3 w-full mt-4">
              <button
                onClick={() => setConfirmingDeleteDead(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  handleDeletePlant(confirmingDeleteDead.id, true);
                  setConfirmingDeleteDead(null);
                }}
                className="flex-1 bg-amber-700 hover:bg-amber-600 text-white font-bold py-2 rounded-xl transition-colors shadow-lg"
              >
                Reciclar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Tutorial / Ayuda */}
      {showTutorial && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md"
          onClick={() => setShowTutorial(false)}
        >
          <div
            className="bg-[#1a2e12] border-4 border-[#3d5a2d] rounded-2xl p-8 w-[450px] max-w-[90%] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTutorial(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white text-2xl transition-colors"
            >
              ✕
            </button>

            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-[#3d5a2d] rounded-full flex items-center justify-center text-4xl shadow-inner border-2 border-white/10">
                🌿
              </div>
              
              <h2 className="text-2xl font-black text-white text-center uppercase tracking-wider">
                Gestión de Plantas
              </h2>

              <div className="space-y-4 w-full">
                <div className="flex gap-4 items-start">
                  <div className="bg-[#4d6a3d] p-2 rounded-lg text-xl">🔍</div>
                  <div>
                    <h4 className="text-yellow-400 font-bold text-sm">Filtros Avanzados</h4>
                    <p className="text-white/70 text-xs leading-relaxed">Usa los iconos superiores para filtrar por fase de crecimiento, categoría o estado de salud.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="bg-[#4d6a3d] p-2 rounded-lg text-xl">📦</div>
                  <div>
                    <h4 className="text-yellow-400 font-bold text-sm">Detalles y Acciones</h4>
                    <p className="text-white/70 text-xs leading-relaxed">Haz clic en cualquier planta para ver su progreso y cambiar la planta activa en el escenario.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="bg-[#4d6a3d] p-2 rounded-lg text-xl">♻️</div>
                  <div>
                    <h4 className="text-yellow-400 font-bold text-sm">Reciclaje por Abono</h4>
                    <p className="text-white/70 text-xs leading-relaxed">¿Tienes plantas muertas o repetidas? Elimínalas para recuperar <span className="text-amber-400 font-bold">abono</span> para tus otras plantas.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="bg-[#4d6a3d] p-2 rounded-lg text-xl">🎮</div>
                  <div>
                    <h4 className="text-yellow-400 font-bold text-sm">Sincronización</h4>
                    <p className="text-white/70 text-xs leading-relaxed">Los niveles y XP se sincronizan automáticamente con el servidor del juego.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowTutorial(false)}
                className="mt-4 w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 rounded-xl shadow-lg transition-transform active:scale-95"
              >
                ¡ENTENDIDO!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
