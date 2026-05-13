/**
 * Cliente de API simulado.
 * Originalmente interactuaba con FastAPI, ahora redirige todas las llamadas a localDb.ts
 * manteniendo las firmas asíncronas para no romper los componentes UI.
 */

import {
  getOrCreateUser,
  getUser,
  saveUser,
  createPlantForUser,
  getPlant,
  getUserPlants,
  applyAction,
  evolvePlantLocal,
  deletePlantLocal,
  setActivePlantLocal,
  renamePlantLocal,
  addDebugResources,
  fastForwardTimeLocal,
  loadDb,
  saveDb,
  thawCooldowns
} from "./localDb";

import { plantPhase } from "./plantStore";

let _token: string | null = null;

if (typeof window !== "undefined") {
  _token = localStorage.getItem("imaginatio_token");
}

export function setToken(token: string) {
  _token = token;
  if (typeof window !== "undefined") {
    localStorage.setItem("imaginatio_token", token);
  }
}

export function getToken(): string | null {
  return _token;
}

export function clearToken() {
  _token = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("imaginatio_token");
  }
}

/** Cierra la sesión del usuario actual limpiando el token de autenticación.
 *  Los datos del usuario (plantas, inventario) se mantienen en localStorage
 *  para poder retomar la sesión ingresando el mismo nombre de usuario. */
export function logout() {
  clearToken();
}

const requireUser = () => {
  if (!_token) throw new Error("No autenticado");
  return _token;
};

// ── Auth ──
export async function login(username: string) {
  const user = getOrCreateUser(username);
  setToken(username);
  const state = await fetchMyState();
  return { token: username, user: state };
}

// ── Minigames ──
export async function startMinigame(gameType: string) {
  const username = requireUser();
  const user = getUser(username);
  if (!user) throw new Error("Usuario no encontrado");

  // Bloquear minijuegos cuando la planta activa es un Ent
  if (plantPhase.value === "ent") {
    throw new Error("🌳 ¡Tu Ent ya es inmortal! No necesita recursos extra.");
  }

  const now = Date.now();
  const refTime = (user.ent_active_since && user.ent_active_since > 0) ? user.ent_active_since : now;
  const cooldown = user.cooldowns[gameType as keyof typeof user.cooldowns];
  
  if (cooldown && cooldown > refTime) {
    const remaining = Math.ceil((cooldown - refTime) / 1000);
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    const timeStr = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    throw new Error(`Debes esperar ${timeStr}`);
  }

  let result: any = { session_token: gameType };

  if (gameType === "water") {
    result.duration_seconds = 5;
  } else if (gameType === "sun") {
    (user as any)._temp_sun_clicks = 0;
    (user as any)._temp_sun_tier = 1;
    saveUser(user);
  } else if (gameType === "compost") {
    result.duration_seconds = 3;
    // Provide a mocked list of items
    result.items = [
      { id: 1, name: "Cáscara de plátano", emoji: "🍌", is_organic: true },
      { id: 2, name: "Corazón de manzana", emoji: "🍎", is_organic: true },
      { id: 3, name: "Cáscara de huevo", emoji: "🥚", is_organic: true },
      { id: 4, name: "Vaso de plástico", emoji: "🥤", is_organic: false },
      { id: 5, name: "Pila", emoji: "🔋", is_organic: false },
      { id: 6, name: "Clip metálico", emoji: "📎", is_organic: false },
      { id: 7, name: "Bolsa de plástico", emoji: "🛍️", is_organic: false },
      { id: 8, name: "Lata", emoji: "🥫", is_organic: false },
    ].sort(() => Math.random() - 0.5); // shuffle
  }

  return result;
}

export async function endMinigame(sessionToken: string, payload: Record<string, any>) {
  const username = requireUser();
  const user = getUser(username);
  if (!user) throw new Error("Usuario no encontrado");

  let reward = 0;
  
  if (sessionToken === "water") {
    const clicks = payload.clicks || 0;
    // Logica simple: 1 agua por cada 10 clicks, max 6
    reward = Math.min(6, Math.floor(clicks / 10));
    user.water_inventory += reward;
    user.cooldowns.water = Date.now() + 10 * 60 * 1000; // 10 min
  } 
  else if (sessionToken === "compost") {
    const selected = payload.selected_items || [];
    // IDs de los orgánicos: 1, 2, 3
    const correct = selected.filter((id: number) => [1, 2, 3].includes(id)).length;
    const incorrect = selected.filter((id: number) => ![1, 2, 3].includes(id)).length;
    // 1 composta por orgánico correcto, -1 por inorgánico seleccionado
    reward = Math.max(0, correct - incorrect);

    // Conversión: solo el reward de ESTA sesión + sobrante previo (máx 1),
    // para evitar que compost acumulado de sesiones anteriores explote de golpe.
    const prevLeftover = Math.min(user.compost_inventory || 0, 1); // máx 1 de sobrante anterior
    const totalToConvert = prevLeftover + reward;
    const fertilizerEarned = Math.floor(totalToConvert / 2);
    const newLeftover = totalToConvert % 2;

    user.compost_inventory = newLeftover;
    user.fertilizer_inventory = (user.fertilizer_inventory || 0) + fertilizerEarned;

    user.cooldowns.compost = Date.now() + 3 * 60 * 1000; // 3 min
  }


  saveUser(user);

  return { 
    message: `Minijuego completado. Ganaste ${reward} recursos.`,
    reward,
    user
  };
}

export async function sunClick(sessionToken: string) {
  const username = requireUser();
  const user = getUser(username);
  if (!user) throw new Error("Usuario no encontrado");

  const clicksDone = (user as any)._temp_sun_clicks || 0;
  let currentTier = (user as any)._temp_sun_tier || 1;
  
  if (clicksDone === 0) {
    currentTier = 1;
  }

  const newClicks = clicksDone + 1;
  const finished = newClicks >= 4;
  
  let tierUp = false;
  if (currentTier < 5) {
    let probability = 0;
    if (currentTier === 1) probability = 0.85;
    else if (currentTier === 2) probability = 0.50;
    else if (currentTier === 3) probability = 0.25;
    else if (currentTier === 4) probability = 0.10;

    if (Math.random() < probability) {
      currentTier++;
      tierUp = true;
    }
  }

  (user as any)._temp_sun_clicks = finished ? 0 : newClicks;
  (user as any)._temp_sun_tier = finished ? 1 : currentTier;

  const reward = finished ? currentTier : null;

  if (finished) {
    user.sun_inventory += currentTier;
    user.cooldowns.sun = Date.now() + 10 * 60 * 1000;
  }
  
  saveUser(user);

  return {
    tier_after: currentTier,
    clicks_remaining: 4 - newClicks,
    click_number: newClicks,
    tier_up: tierUp,
    finished,
    reward,
    user: finished ? user : undefined,
    cooldown_ends_at: finished ? new Date(user.cooldowns.sun).toISOString() : undefined
  };
}

// ── User State ──
export async function fetchMyState() {
  const username = requireUser();
  const user = getUser(username);
  if (!user) throw new Error("Usuario no encontrado");

  // ── Reconciliar estado ENT al cargar sesión ──
  const db = loadDb();
  const activePlantStage = user.active_plant_id ? db.plants[user.active_plant_id]?.stage : null;
  let userDirty = false;

  if (activePlantStage === "ent") {
    // Planta activa es Ent → asegurar que ent_active_since esté registrado
    if (!user.ent_active_since) {
      user.ent_active_since = Date.now();
      userDirty = true;
    }
  } else if (user.ent_active_since) {
    // Planta activa no es Ent pero ent_active_since está seteado → descongelar
    thawCooldowns(user);
    userDirty = true;
  }

  if (userDirty) saveUser(user);

  let active_plant = null;
  if (user.active_plant_id) {
    active_plant = getPlant(user.active_plant_id, true);
  }

  // Devolver el formato esperado por syncUserState
  return { ...user, active_plant };
}

export async function fetchMyInventory() {
  const username = requireUser();
  return getUserPlants(username);
}

export async function fetchMyActivePlant() {
  const username = requireUser();
  const user = getUser(username);
  if (!user?.active_plant_id) throw new Error("No hay planta activa");
  return getPlant(user.active_plant_id, true);
}

export async function fastForwardBackendTime(hours: number) {
  const username = requireUser();
  fastForwardTimeLocal(username, hours);
  return fetchMyState();
}

export async function addDebugResourcesBackend(water: number, sun: number, fertilizer: number) {
  const username = requireUser();
  addDebugResources(username, water, sun, fertilizer);
  return fetchMyState();
}

export async function renamePlant(plantId: string, name: string) {
  const username = requireUser();
  return renamePlantLocal(plantId, username, name);
}

export async function createPlant(speciesId: string, subid?: string) {
  const username = requireUser();
  return createPlantForUser(username, speciesId, subid);
}

export async function setActivePlant(plantId: string) {
  const username = requireUser();
  setActivePlantLocal(plantId, username);
  return fetchMyState();
}

export async function deletePlant(plantId: string) {
  const username = requireUser();
  deletePlantLocal(plantId, username);
  return { success: true };
}

export async function applyPlantAction(plantId: string, action: "water" | "sun" | "prune") {
  const username = requireUser();
  const result = applyAction(plantId, username, action);
  return result.plant;
}

export async function evolvePlantApi(plantId: string) {
  const username = requireUser();
  return evolvePlantLocal(plantId, username);
}
