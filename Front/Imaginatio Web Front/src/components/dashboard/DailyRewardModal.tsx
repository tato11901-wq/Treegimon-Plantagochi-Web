import { useState, useEffect } from "preact/hooks";
import { createPlant } from "../../store/apiClient";
import { refreshInventory, username } from "../../store/resourceStore";
import SPECIES_JSON from "../../config/species.json";
import panelDescripcionPlanta from "../../assets/Recursos web media/Panel_DescripciónPlanta.png";
import { getSpriteConfig, type SpriteConfig } from "../../config/plantSpriteRegistry";
import { SpriteAnimator } from "./SpriteAnimator";

// ── Sub-componente extraído de Inventory.tsx para consistencia ──────────
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

// ── Tipos ─────────────────────────────────────────────────────────────────────
type DailyRewardState = "available" | "claimed" | "loading" | "error";

// ── Constantes ────────────────────────────────────────────────────────────────
const STORAGE_KEY_PREFIX = "imaginatio_daily_reward_";
const SPECIES_KEYS = Object.keys(SPECIES_JSON) as (keyof typeof SPECIES_JSON)[];

// Clave de localStorage por usuario
function getStorageKey(): string {
  return `${STORAGE_KEY_PREFIX}${username.value || "anon"}`;
}

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// Especie del día — determinista por fecha (misma para todos, cambia a medianoche)
function getTodaySpecies(): { id: string; name: string; scientific: string; classification: string; subid: string } {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const idx = seed % SPECIES_KEYS.length;
  const key = SPECIES_KEYS[idx];
  const sp = SPECIES_JSON[key];
  return {
    id: key,
    name: sp.common_name,
    scientific: sp.scientific_name,
    classification: sp.classification,
    subid: sp.subids[0],
  };
}

export function hasClaimed(): boolean {
  try {
    const stored = localStorage.getItem(getStorageKey());
    if (!stored) return false;
    return JSON.parse(stored).date === getTodayKey();
  } catch { return false; }
}

function markClaimed() {
  localStorage.setItem(getStorageKey(), JSON.stringify({ date: getTodayKey() }));
}

interface Props {
  onClose: () => void;
}

export default function DailyRewardModal({ onClose }: Props) {
  const todaySpecies = getTodaySpecies();
  const [rewardState, setRewardState] = useState<DailyRewardState>(
    hasClaimed() ? "claimed" : "available"
  );

  // Sprite de semilla de la planta del día
  const spriteConfig = getSpriteConfig(todaySpecies.id, todaySpecies.subid, "seed");
  // Si es spritesheet (frameCount > 1), mostrar solo el primer frame via background-position
  const isSheet = spriteConfig.frameCount > 1;

  // Animación de entrada
  const [mounted, setMounted] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  const handleClaim = async () => {
    if (rewardState !== "available") return;
    setRewardState("loading");
    try {
      await createPlant(todaySpecies.id, todaySpecies.subid);
      refreshInventory();
      markClaimed();
      setRewardState("claimed");
    } catch (err) {
      console.error("[DailyReward] Error al reclamar planta:", err);
      setRewardState("error");
    }
  };

  return (
    <div
      class="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 pointer-events-auto"
      id="daily-reward-overlay"
      onClick={(e) => { if ((e.target as HTMLElement).id === "daily-reward-overlay") onClose(); }}
    >
      {/* Panel con la misma imagen de fondo que la descripción de planta */}
      <div
        class={`relative w-[420px] h-[560px] lg:w-[530px] lg:h-[680px]
                flex flex-col items-center justify-start p-10 lg:p-14
                transition-all duration-400 ease-out
                ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
      >
        {/* Fondo del panel */}
        <img
          src={panelDescripcionPlanta.src}
          alt="Panel Recompensa"
          class="absolute inset-0 w-full h-full object-fill -z-10"
        />

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          class="absolute top-6 right-6 w-10 h-10 bg-red-500/80 hover:bg-red-500 text-white
                 font-bold rounded-full border-2 border-red-700 shadow-sm
                 transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
        >
          X
        </button>

        {/* Título */}
        <h2 class="text-[#4e341b] text-2xl lg:text-3xl font-bold mb-1 mt-20 text-center
                   drop-shadow-sm uppercase tracking-wide">
          🎁 Recompensa Diaria
        </h2>

        {/* Subtítulo */}
        <div class="text-[#4e341b]/70 text-sm lg:text-base font-black mb-4 text-center italic">
          Planta del día — cambia a medianoche
        </div>

        {/* Sprite de semilla de la planta */}
        <div class="flex flex-col items-center gap-2 my-2">
          <div
            class="w-28 h-28 lg:w-36 lg:h-36 flex items-center justify-center
                   bg-[#4e341b]/5 rounded-2xl border-2 border-[#4e341b]/15 overflow-hidden"
          >
            {isSheet ? (
              <PlantFirstFrame config={spriteConfig} size={96} />
            ) : (
              // Imagen estática
              <img
                src={spriteConfig.src}
                alt={todaySpecies.name}
                class="w-full h-full object-contain"
                style={{ transform: `scale(${Math.min(spriteConfig.scale, 1.2)})` }}
              />
            )}
          </div>
        </div>

        {/* Nombre */}
        <p class="text-[#4e341b] text-xl lg:text-2xl font-black text-center uppercase tracking-wide mt-1">
          {todaySpecies.name}
        </p>

        {/* Nombre científico */}
        <p class="text-[#4e341b]/55 text-sm italic text-center">
          {todaySpecies.scientific}
        </p>

        {/* Clasificación */}
        <span class="mt-2 px-3 py-1 rounded-full text-sm font-bold
                     bg-[#4e341b]/10 border border-[#4e341b]/25 text-[#4e341b]">
          {todaySpecies.classification}
        </span>

        {/* Spacer */}
        <div class="flex-1" />

        {/* Countdown hasta medianoche */}
        <div class="flex flex-col items-center gap-0.5 mb-3">
          <p class="text-[#4e341b]/40 text-[10px] font-bold uppercase tracking-widest">
            Próxima planta en
          </p>
          <NextRewardCountdown />
        </div>

        {/* Mensaje de estado */}
        {rewardState === "claimed" && (
          <p class="text-[#4e341b]/60 text-sm text-center font-semibold mb-2 px-4">
            ✅ ¡Ya reclamaste tu planta de hoy! Vuelve mañana.
          </p>
        )}
        {rewardState === "error" && (
          <p class="text-red-700 text-sm text-center font-semibold mb-2 px-4">
            ❌ Error al reclamar. ¿Esta planta ya está en tu inventario?
          </p>
        )}

        {/* Botón de acción — mismo estilo que botones de minijuego */}
        <button
          id="btn-claim-daily-reward"
          onClick={rewardState === "error" ? handleClaim : handleClaim}
          disabled={rewardState === "loading" || rewardState === "claimed"}
          class={`mb-8 px-8 py-3 rounded-2xl font-black text-lg
                  border-4 shadow-[0_4px_0_#1b4332]
                  transition-all duration-150 active:scale-95 active:shadow-none active:translate-y-1
                  select-none
                  ${rewardState === "available" || rewardState === "error"
                    ? "bg-[#2d6a4f] border-[#1b4332] text-white hover:bg-[#3a8a66] cursor-pointer"
                    : rewardState === "loading"
                    ? "bg-[#4e341b]/30 border-[#4e341b]/20 text-[#4e341b]/40 cursor-wait"
                    : "bg-[#4e341b]/10 border-[#4e341b]/20 text-[#4e341b]/40 cursor-not-allowed"}`}
        >
          {rewardState === "loading" && (
            <span class="flex items-center gap-2">
              <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Reclamando...
            </span>
          )}
          {(rewardState === "available" || rewardState === "error") && "🎁 ¡Reclamar planta!"}
          {rewardState === "claimed" && "✅ Ya reclamada"}
        </button>
      </div>
    </div>
  );
}

// ── Countdown hasta medianoche ────────────────────────────────────────────────
function NextRewardCountdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight());
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);
  const { h, m, s } = timeLeft;
  return (
    <span class="font-mono text-[#4e341b] font-black text-xl tracking-widest">
      {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = Math.floor((midnight.getTime() - now.getTime()) / 1000);
  return { h: Math.floor(diff / 3600), m: Math.floor((diff % 3600) / 60), s: diff % 60 };
}
