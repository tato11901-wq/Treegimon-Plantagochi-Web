import speciesDataRaw from "../config/species.json";

// ── Tipo del catálogo de especies ──
export interface SpeciesEntry {
  /** Identificador de especie (coincide con la clave del objeto) */
  id:          string;
  /** Variantes de modelo disponibles para esta especie.
   *  Cada valor coincide con:
   *    - La clave en PLANT_SPRITE_REGISTRY (Web, spritesheets)
   *    - El nombre del prefab/carpeta en Unity (3D, mismo modelo)
   *  Ejemplo: ["cajeto", "cajeto_dorado"] → dos variantes visuales del cajeto */
  subids:      string[];
  common_name:      string;
  scientific_name:  string;
  classification:   string;
  evolution_requirements: Record<string, { water: number; sun: number; fertilizer: number }>;
}

export const SPECIES_CATALOG = speciesDataRaw as Record<string, SpeciesEntry>;

/** Devuelve un subid aleatorio de los disponibles para la especie.
 *  Si la especie no existe o no tiene subids definidos, retorna el speciesId. */
export function pickSubId(speciesId: string): string {
  const species = SPECIES_CATALOG[speciesId];
  const available = species?.subids;
  if (!available || available.length === 0) return speciesId;
  return available[Math.floor(Math.random() * available.length)];
}


// ── Tipos ──
export interface LocalUser {
  id: string;
  username: string;
  water_inventory: number;
  sun_inventory: number;
  fertilizer_inventory: number;
  compost_inventory: number;
  active_plant_id: string | null;
  cooldowns: {
    water: number; // timestamp in ms when available again
    sun: number;
    compost: number;
  };
  /** Timestamp (ms) desde el que el Ent se convirtio en planta activa.
   *  Se usa para congelar los cooldowns mientras el Ent esta activo:
   *  al cambiar a otra planta, todos los cooldowns activos se extienden
   *  por el tiempo que el Ent estuvo seleccionado. */
  ent_active_since: number | null;
}

export interface LocalPlant {
  id: string;
  owner_id: string;
  name: string;
  species_id: string;
  stage: "seed" | "small_bush" | "large_bush" | "ent";
  water: number;
  sun: number;
  fertilizer: number;
  health: number;
  is_dead: boolean;
  last_update: number; // timestamp in ms
  last_interaction: number; // timestamp in ms

  // ── Campos administrados por 3D (solo lectura en lógica web) ──
  /** Identificador del modelo/variante visual asignado a esta planta.
   *  Coincide con la clave en PLANT_SPRITE_REGISTRY (Web) y el nombre del prefab en Unity (3D).
   *  Se asigna al crear la planta eligiendo entre los subids disponibles en species.json. */
  unity_subid?:        string;
  /** Estado cualitativo recibido de 3D: saludable | dañado | critico | muerto */
  unity_salud?:        "saludable" | "dañado" | "critico" | "muerto";
  /** HP numérico administrado por 3D */
  unity_hp?:           number;
  /** Nivel de la planta en 3D (solo se muestra en Ents) */
  unity_nivel?:        number;
  /** XP de la planta en 3D (solo se muestra en Ents) */
  unity_xp?:           number;
  /** Si la planta está en combate activo (administrado por 3D) */
  unity_en_combate?:   boolean;
  /** Si esta planta es la seleccionada en 3D (administrado por 3D) */
  unity_seleccionada?: boolean;
}

export interface LocalDbState {
  users: Record<string, LocalUser>; // key: username
  plants: Record<string, LocalPlant>; // key: plant_id
}

const STORAGE_KEY = "imaginatio_save";

// ── Core DB Logic ──

export function loadDb(): LocalDbState {
  if (typeof window === "undefined") {
    return { users: {}, plants: {} };
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error("Error parsing local DB", e);
    }
  }
  return { users: {}, plants: {} };
}

export function saveDb(state: LocalDbState) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

// ── Plant Logic (Replicada del Backend) ──

const DEATH_HOURS_THRESHOLD = 72.0;
const FIXED_LOSS_PER_HOUR = 6.0;

function getRequirements(speciesId: string, stage: string) {
  const species = SPECIES_CATALOG[speciesId];
  if (!species) return { water: 10, sun: 10, fertilizer: 10 };
  const reqs = species.evolution_requirements?.[stage.toUpperCase()];
  if (!reqs) return { water: 10, sun: 10, fertilizer: 10 };
  return {
    water: Number(reqs.water || 1),
    sun: Number(reqs.sun || 1),
    fertilizer: Number(reqs.fertilizer || 1),
  };
}

/**
 * Actualiza el estado de la planta basado en el tiempo transcurrido.
 * Muta el objeto plant.
 */
function updatePlantState(plant: LocalPlant, isActive: boolean) {
  if (plant.is_dead || plant.stage === "ent") {
    plant.last_update = Date.now();
    return;
  }

  const now = Date.now();

  if (!isActive) {
    // Planta inactiva se "congela" en el tiempo
    plant.last_update = now;
    plant.last_interaction = now;
    return;
  }

  // 1. Muerte por inactividad
  const hoursSinceInteraction = (now - plant.last_interaction) / (1000 * 60 * 60);
  if (hoursSinceInteraction >= DEATH_HOURS_THRESHOLD) {
    plant.is_dead = true;
    plant.health = 0;
    plant.last_update = now;
    return;
  }

  // 2. Pérdida pasiva de recursos
  const hoursPassed = (now - plant.last_update) / (1000 * 60 * 60);
  if (hoursPassed > 0) {
    plant.water = Math.max(0, plant.water - FIXED_LOSS_PER_HOUR * hoursPassed);
    plant.sun = Math.max(0, plant.sun - FIXED_LOSS_PER_HOUR * hoursPassed);

    const reqs = getRequirements(plant.species_id, plant.stage);
    const displayW = Math.ceil(plant.water);
    const displayS = Math.ceil(plant.sun);

    const wPct = reqs.water > 0 ? (displayW / reqs.water) * 100 : 100;
    const sPct = reqs.sun > 0 ? (displayS / reqs.sun) * 100 : 100;

    plant.health = Math.min(100, Math.min(wPct, sPct));

    if (plant.water <= 0 || plant.sun <= 0) {
      plant.is_dead = true;
      plant.health = 0;
    }
  }

  plant.last_update = now;
}

export function checkGrowth(plant: LocalPlant): boolean {
  if (plant.is_dead || plant.stage === "ent") return false;

  const reqs = getRequirements(plant.species_id, plant.stage);
  
  if (
    Math.ceil(plant.water) >= reqs.water &&
    Math.ceil(plant.sun) >= reqs.sun &&
    Math.ceil(plant.fertilizer) >= reqs.fertilizer
  ) {
    const stageMap: Record<string, LocalPlant["stage"]> = {
      "seed": "small_bush",
      "small_bush": "large_bush",
      "large_bush": "ent"
    };

    const nextStage = stageMap[plant.stage];
    if (nextStage) {
      plant.stage = nextStage;
      if (nextStage === "ent") {
        plant.water = 10;
        plant.sun = 10;
        plant.fertilizer = 10;
        plant.health = 100;
      } else {
        // Maxear agua y sol a los nuevos requisitos de la fase superior
        const nextReqs = getRequirements(plant.species_id, nextStage);
        plant.water = nextReqs.water;
        plant.sun = nextReqs.sun;
        plant.health = 100;
      }
      plant.fertilizer = 0;
      return true;
    }
  }
  return false;
}

// ── API Functions ──

export function getOrCreateUser(username: string): LocalUser {
  const db = loadDb();
  if (db.users[username]) {
    return db.users[username];
  }
  
  const newUser: LocalUser = {
    id: username, // Usamos el username como ID para simplificar
    username,
    water_inventory: 0,
    sun_inventory: 0,
    fertilizer_inventory: 0,
    compost_inventory: 0,
    active_plant_id: null,
    cooldowns: { water: 0, sun: 0, compost: 0 },
    ent_active_since: null
  };
  
  db.users[username] = newUser;
  saveDb(db);
  
  // Crear una planta inicial para el nuevo usuario (con -1 de recursos para tutorial)
  createPlantForUser(username, "pasto", undefined, true);
  
  // Recargar el usuario actualizado con su active_plant_id
  return loadDb().users[username];
}

export function getUser(username: string): LocalUser | null {
  return loadDb().users[username] || null;
}

export function saveUser(user: LocalUser) {
  const db = loadDb();
  db.users[user.username] = user;
  saveDb(db);
}

export function createPlantForUser(username: string, speciesId: string, customSubid?: string, isTutorial: boolean = false): LocalPlant {
  const db = loadDb();
  const user = db.users[username];
  if (!user) throw new Error("User not found");

  const reqs = getRequirements(speciesId, "seed");

  // Si se pasa un subid personalizado se usa, sino se elige uno aleatorio.
  const subid = customSubid || pickSubId(speciesId);

  const plant: LocalPlant = {
    id: generateId(),
    owner_id: username,
    name: "Nueva Planta",
    species_id: speciesId,
    stage: "seed",
    water: isTutorial ? Math.max(0, reqs.water - 1) : reqs.water,
    sun: isTutorial ? Math.max(0, reqs.sun - 1) : reqs.sun,
    fertilizer: 0,
    health: 100,
    is_dead: false,
    last_update: Date.now(),
    last_interaction: Date.now(),
    unity_subid: subid,
  };

  db.plants[plant.id] = plant;

  if (!user.active_plant_id) {
    user.active_plant_id = plant.id;
  }

  saveDb(db);
  return plant;
}

export function getPlant(plantId: string, isActive: boolean = false): any {
  const db = loadDb();
  const plant = db.plants[plantId];
  if (plant) {
    updatePlantState(plant, isActive);
    saveDb(db); // Guardar estado actualizado
    return {
      ...plant,
      species_data: SPECIES_CATALOG[plant.species_id]
    };
  }
  return null;
}

export function getUserPlants(username: string): any[] {
  const db = loadDb();
  const user = db.users[username];
  if (!user) return [];
  
  const userPlants = Object.values(db.plants).filter(p => p.owner_id === username);
  userPlants.forEach(p => {
    updatePlantState(p, p.id === user.active_plant_id);
  });
  
  saveDb(db);
  return userPlants.map(p => ({
    ...p,
    species_data: SPECIES_CATALOG[p.species_id]
  }));
}

export function applyAction(plantId: string, username: string, action: "water" | "sun" | "prune") {
  const db = loadDb();
  const user = db.users[username];
  const plant = db.plants[plantId];
  
  if (!user || !plant) throw new Error("User or Plant not found");

  // FIX: Actualizar estado pasivo ANTES de verificar is_dead, para tener el estado real.
  // Si la planta murió por recursos (no por la interacción del usuario), la marcamos muerta.
  // Pero si el usuario está cuidándola AHORA, le damos una segunda oportunidad.
  updatePlantState(plant, plant.id === user.active_plant_id);

  // FIX: Si updatePlantState recién mató la planta (is_dead fue seteado por decay pasivo),
  // pero el usuario está aplicando un cuidado en este momento, revertimos la muerte
  // y registramos la interacción. Esto evita que la planta muera en el DB justo cuando
  // el frontend la está cuidando activamente.
  if (plant.is_dead) {
    plant.is_dead = false;
    plant.health = 1; // Salud mínima; updatePlantState la recalcula abajo
  }

  if (action === "water") {
    // La DB debe ser la fuente de la verdad. El frontend descuenta de manera optimista,
    // pero si aquí no descontamos, los recursos reaparecen al recargar la página.
    if (user.water_inventory > 0) user.water_inventory -= 1;
    const reqs = getRequirements(plant.species_id, plant.stage);
    plant.water = Math.min(reqs.water, plant.water + 1);
  } else if (action === "sun") {
    if (user.sun_inventory > 0) user.sun_inventory -= 1;
    const reqs = getRequirements(plant.species_id, plant.stage);
    plant.sun = Math.min(reqs.sun, plant.sun + 1);
  } else if (action === "prune") {
    if ((user.fertilizer_inventory || 0) > 0) user.fertilizer_inventory -= 1;
    plant.fertilizer += 1;
  }

  // Registrar la interacción ahora que el cuidado fue exitoso
  plant.last_interaction = Date.now();

  // Recalcular salud con los nuevos recursos
  updatePlantState(plant, plant.id === user.active_plant_id);
  
  saveDb(db);
  return { 
    user, 
    plant: {
      ...plant,
      species_data: SPECIES_CATALOG[plant.species_id]
    } 
  };
}

export function evolvePlantLocal(plantId: string, username: string) {
  const db = loadDb();
  const plant = db.plants[plantId];
  const user = db.users[username];
  
  if (!plant || !user) throw new Error("Not found");
  
  updatePlantState(plant, plant.id === user.active_plant_id);
  
  if (checkGrowth(plant)) {
    plant.last_interaction = Date.now();
    
    // Si la planta que acaba de evolucionar a Ent es la activa, iniciar congelamiento
    if (plant.stage === "ent" && plant.id === user.active_plant_id && !user.ent_active_since) {
      user.ent_active_since = Date.now();
    }
    
    saveDb(db);
    return plant;
  }
  
  throw new Error("Requirements not met");
}

export function deletePlantLocal(plantId: string, username: string) {
  const db = loadDb();
  const plant = db.plants[plantId];
  const user = db.users[username];
  
  if (plant && plant.owner_id === username) {
    const userPlants = Object.values(db.plants).filter(p => p.owner_id === username);
    const isLastPlant = userPlants.length <= 1;

    if (isLastPlant && !plant.is_dead) {
      throw new Error("No puedes eliminar tu única planta si aún está viva.");
    }

    if (user && user.active_plant_id === plantId) {
      user.active_plant_id = null;
    }

    if (user) {
      if (plant.is_dead) {
        // Las plantas muertas dan 1 de composta
        user.compost_inventory = (user.compost_inventory || 0) + 1;
        
        // Conversión automática: 2 de composta = 1 de abono
        while (user.compost_inventory >= 2) {
          user.compost_inventory -= 2;
          user.fertilizer_inventory = (user.fertilizer_inventory || 0) + 1;
        }
      } else {
        // Las plantas vivas dan abono según su fase
        let fertilizerReward = 1;
        if (plant.stage === "seed") fertilizerReward = 1;
        else if (plant.stage === "small_bush") fertilizerReward = 2;
        else if (plant.stage === "large_bush") fertilizerReward = 3;
        else if (plant.stage === "ent") fertilizerReward = 4;
        user.fertilizer_inventory += fertilizerReward;
      }
    }

    delete db.plants[plantId];
    saveDb(db);

    // Si era la última planta (estaba muerta por la validación anterior),
    // le otorgamos una nueva semilla aleatoria para que pueda seguir jugando.
    if (isLastPlant) {
      const speciesKeys = Object.keys(SPECIES_CATALOG);
      const randomSpecies = speciesKeys[Math.floor(Math.random() * speciesKeys.length)] || "pasto";
      createPlantForUser(username, randomSpecies);
    }
  } else {
    throw new Error("Plant not found");
  }
}

/**
 * Descongela los cooldowns extendiendo su duracion por el tiempo
 * que el Ent estuvo activo como planta seleccionada.
 * Solo afecta cooldowns que estaban corriendo cuando el Ent se activo.
 */
export function thawCooldowns(user: LocalUser) {
  if (!user.ent_active_since) return;
  const frozenMs = Date.now() - user.ent_active_since;
  if (frozenMs > 0) {
    const since = user.ent_active_since;
    if (user.cooldowns.water  > since) user.cooldowns.water  += frozenMs;
    if (user.cooldowns.sun    > since) user.cooldowns.sun    += frozenMs;
    if (user.cooldowns.compost > since) user.cooldowns.compost += frozenMs;
  }
  user.ent_active_since = null;
}

export function setActivePlantLocal(plantId: string, username: string) {
  const db = loadDb();
  const user = db.users[username];
  if (user && db.plants[plantId] && db.plants[plantId].owner_id === username) {
    const prevPlant = user.active_plant_id ? db.plants[user.active_plant_id] : null;
    const nextPlant = db.plants[plantId];

    // Salir de un Ent → descongelar cooldowns
    if (prevPlant?.stage === "ent" && nextPlant.stage !== "ent") {
      thawCooldowns(user);
    }

    // Entrar a un Ent → iniciar congelamiento
    if (nextPlant.stage === "ent" && !user.ent_active_since) {
      user.ent_active_since = Date.now();
    }

    // Si cambia de un Ent a otro Ent (raro pero posible) → sin cambio

    user.active_plant_id = plantId;
    saveDb(db);
    return user;
  }
  throw new Error("Invalid plant or user");
}

export function renamePlantLocal(plantId: string, username: string, name: string) {
  const db = loadDb();
  const plant = db.plants[plantId];
  if (plant && plant.owner_id === username) {
    plant.name = name.slice(0, 12);
    saveDb(db);
    return plant;
  }
  throw new Error("Plant not found");
}

export function addDebugResources(username: string, w: number, s: number, f: number) {
  const db = loadDb();
  const user = db.users[username];
  if (user) {
    user.water_inventory += w;
    user.sun_inventory += s;
    user.fertilizer_inventory += f;
    saveDb(db);
    return user;
  }
  throw new Error("User not found");
}

export function fastForwardTimeLocal(username: string, hours: number) {
  const db = loadDb();
  const user = db.users[username];
  if (!user) return;

  const msToAdvance = hours * 60 * 60 * 1000;
  
  // Acelerar cooldowns
  if (user.cooldowns.water > Date.now()) user.cooldowns.water -= msToAdvance;
  if (user.cooldowns.sun > Date.now()) user.cooldowns.sun -= msToAdvance;
  if (user.cooldowns.compost > Date.now()) user.cooldowns.compost -= msToAdvance;

  // Envejecer plantas en el pasado para que updatePlantState las desgaste más
  Object.values(db.plants).filter(p => p.owner_id === username).forEach(p => {
    p.last_update -= msToAdvance;
    p.last_interaction -= msToAdvance;
    updatePlantState(p, p.id === user.active_plant_id);
  });

  saveDb(db);
  return user;
}
