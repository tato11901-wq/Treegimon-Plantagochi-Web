import { signal, computed } from "@preact/signals";

// ── Tick Global para Tiempo Real ──
export const currentTime = signal(Date.now());
if (typeof window !== "undefined") {
  setInterval(() => {
    currentTime.value = Date.now();
  }, 1000);
}

// ── Identidad del Usuario ──
export const userId = signal<string | null>(null);
export const username = signal<string>("");

// ── Inventarios (Sincronizados desde el Backend) ──
export const waterInventory = signal(0);
export const sunInventory = signal(0);
export const compostInventory = signal(0);
export const fertilizerInventory = signal(0);

// ── Planta Activa ──
export const activePlantId = signal<string | null>(null);
export const plantName = signal("Mi Planta");

// Aliases para compatibilidad con código antiguo mientras se refactoriza
export const waterLevel = waterInventory;
export const compostLevel = compostInventory;

// ── Cooldowns (Timestamps ISO del Backend) ──
export const waterCooldownEnds = signal<string | null>(null);
export const compostCooldownEnds = signal<string | null>(null);
export const sunCooldownEnds = signal<string | null>(null);
export const entActiveSince = signal<number | null>(null);

export const isWaterOnCooldown = computed(() => {
  if (!waterCooldownEnds.value) return false;
  const now = (entActiveSince.value && entActiveSince.value > 0) 
    ? entActiveSince.value 
    : currentTime.value;
  return new Date(waterCooldownEnds.value).getTime() > now;
});

export const isCompostOnCooldown = computed(() => {
  if (!compostCooldownEnds.value) return false;
  const now = (entActiveSince.value && entActiveSince.value > 0) 
    ? entActiveSince.value 
    : currentTime.value;
  return new Date(compostCooldownEnds.value).getTime() > now;
});

export const isSunOnCooldown = computed(() => {
  if (!sunCooldownEnds.value) return false;
  const now = (entActiveSince.value && entActiveSince.value > 0) 
    ? entActiveSince.value 
    : currentTime.value;
  return new Date(sunCooldownEnds.value).getTime() > now;
});

export const waterRemainingTime = computed(() => {
  if (!waterCooldownEnds.value) return "";
  const now = (entActiveSince.value && entActiveSince.value > 0) ? entActiveSince.value : currentTime.value;
  const diff = new Date(waterCooldownEnds.value).getTime() - now;
  if (diff <= 0) return "";
  const s = Math.ceil(diff / 1000);
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
});

export const compostRemainingTime = computed(() => {
  if (!compostCooldownEnds.value) return "";
  const now = (entActiveSince.value && entActiveSince.value > 0) ? entActiveSince.value : currentTime.value;
  const diff = new Date(compostCooldownEnds.value).getTime() - now;
  if (diff <= 0) return "";
  const s = Math.ceil(diff / 1000);
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
});

export const sunRemainingTime = computed(() => {
  if (!sunCooldownEnds.value) return "";
  const now = (entActiveSince.value && entActiveSince.value > 0) ? entActiveSince.value : currentTime.value;
  const diff = new Date(sunCooldownEnds.value).getTime() - now;
  if (diff <= 0) return "";
  const s = Math.ceil(diff / 1000);
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
});

export function fastForwardCooldowns(hours: number) {
  const shiftMs = hours * 60 * 60 * 1000;
  
  if (waterCooldownEnds.value) {
    const d = new Date(waterCooldownEnds.value);
    waterCooldownEnds.value = new Date(d.getTime() - shiftMs).toISOString();
  }
  if (compostCooldownEnds.value) {
    const d = new Date(compostCooldownEnds.value);
    compostCooldownEnds.value = new Date(d.getTime() - shiftMs).toISOString();
  }
  if (sunCooldownEnds.value) {
    const d = new Date(sunCooldownEnds.value);
    sunCooldownEnds.value = new Date(d.getTime() - shiftMs).toISOString();
  }
}

// ── Estado de la UI ──
export const isWaterGameOpen = signal(false);
export const isCompostGameOpen = signal(false);
export const isSunGameOpen = signal(false);
export const isPlantInfoOpen = signal(false);
export const isInventoryOpen = signal(false);
export const isHelpModalOpen = signal(false);
export const isCreditsModalOpen = signal(false);
export const isNamingModalOpen = signal(false);
export const isDeathTutorialOpen = signal(false);
export const isUnityViewerOpen = signal(false);
export const isMuted = signal(false);
export const globalVolume = signal(0.5);

/** Incrementar este signal fuerza al inventario a refrescarse */
export const inventoryVersion = signal(0);
export function refreshInventory() {
  inventoryVersion.value += 1;
}

/**
 * Sincroniza el estado global del cliente con los datos recibidos del servidor.
 * @param backendUser Objeto de usuario retornado por la API de FastAPI.
 */
export function syncUserState(backendUser: any) {
  userId.value = backendUser.id;
  username.value = backendUser.username;
  waterInventory.value = backendUser.water_inventory;
  sunInventory.value = backendUser.sun_inventory;
  compostInventory.value = backendUser.compost_inventory;
  fertilizerInventory.value = backendUser.fertilizer_inventory;

  // Sincronizar planta activa
  if (backendUser.active_plant_id) {
    activePlantId.value = backendUser.active_plant_id;
  }

  // Sincronizar cooldowns si vienen en la respuesta (priorizar el objeto cooldowns de localDb)
  // IMPORTANTE: solo actualizar cada cooldown si el nuevo valor es >= al que ya tenemos,
  // para evitar que un minijuego pise el cooldown activo de otro.
  if (backendUser.cooldowns) {
    const newWater = backendUser.cooldowns.water > 0 ? backendUser.cooldowns.water : 0;
    waterCooldownEnds.value = newWater > 0 ? new Date(newWater).toISOString() : null;

    const newCompost = backendUser.cooldowns.compost > 0 ? backendUser.cooldowns.compost : 0;
    compostCooldownEnds.value = newCompost > 0 ? new Date(newCompost).toISOString() : null;

    const newSun = backendUser.cooldowns.sun > 0 ? backendUser.cooldowns.sun : 0;
    sunCooldownEnds.value = newSun > 0 ? new Date(newSun).toISOString() : null;
  } else {
    // Fallback para compatibilidad con backend real si volviera a usarse
    if (backendUser.last_water_minigame) {
      const lastPlayed = new Date(backendUser.last_water_minigame);
      const ends = new Date(lastPlayed.getTime() + (10 * 60 + 5) * 1000);
      waterCooldownEnds.value = ends.toISOString();
    }
    if (backendUser.last_compost_minigame) {
      const lastPlayed = new Date(backendUser.last_compost_minigame);
      const ends = new Date(lastPlayed.getTime() + (10 * 60 + 5) * 1000);
      compostCooldownEnds.value = ends.toISOString();
    }
    if (backendUser.last_sun_minigame) {
      const lastPlayed = new Date(backendUser.last_sun_minigame);
      const ends = new Date(lastPlayed.getTime() + (10 * 60 + 5) * 1000);
      sunCooldownEnds.value = ends.toISOString();
    }
  }

  // Sincronizar ent_active_since
  entActiveSince.value = backendUser.ent_active_since || null;
}
