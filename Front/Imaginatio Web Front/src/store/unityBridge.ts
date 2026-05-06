/**
 * unityBridge.ts
 * ──────────────────────────────────────────────────────────────
 * Capa de intercambio de datos entre la aplicación Astro/Preact y Unity WebGL.
 *
 * RESPONSABILIDADES:
 *  - Mantener un archivo canónico .tree (JSON) en localStorage (imaginatio_tree_data).
 *  - Transformar datos del inventario web al modelo canónico.
 *  - Exportar el .tree con TODAS las plantas del usuario (sin filtro).
 *  - Auto-sincronizar el .tree con cada acción web (agua, sol, evolución, etc.).
 *  - Importar un .tree recibido desde 3D y aplicar solo los campos que 3D administra.
 *  - Permitir agregar semillas creadas en 3D al localStorage del usuario.
 *
 * DIVISIÓN DE RESPONSABILIDADES:
 *  [WEB]  → fase, desbloqueada, visual_estado, recursos_aplicados, recursos inventario
 *  [3D]   → salud, hp_actual, nivel (planta y usuario), xp, uso (seleccionada/en_combate)
 *
 * NO MODIFICA:
 *  - Lógica de decaimiento, evolución ni minijuegos.
 *  - Ningún signal de plantStore ni resourceStore directamente (usa callbacks).
 * ──────────────────────────────────────────────────────────────
 */

import { userId, username, waterInventory, sunInventory, compostInventory } from "./resourceStore";
import { SPECIES_CATALOG, pickSubId, getUserPlants } from "./localDb";

// ═══════════════════════════════════════════════════════
// TIPOS — Modelo canónico .tree v2
// ═══════════════════════════════════════════════════════

/** Datos del usuario — nivel y xp los administra 3D */
export interface TreeUsuario {
  id: string;          // [WEB] Identificador único del usuario
  nombre: string;      // [WEB] Username
  nivel: number;       // [3D]  Nivel global en el juego
  xp: number;          // [3D]  Experiencia global acumulada
}

/** Recursos del inventario web */
export interface TreeRecursos {
  agua:     { cantidad: number }; // [WEB]
  sol:      { cantidad: number }; // [WEB]
  composta: { cantidad: number }; // [WEB]
}

/** Estado de la planta — fase la define Web, salud/hp las define 3D */
export interface TreeEstadoPlanta {
  fase:      string;   // [WEB] semilla | small_bush | large_bush | ent
  salud:     string;   // [3D]  saludable | dañado | critico | muerto
  hp_actual: number;   // [3D]  HP numérico
}

/** Progreso de la planta en 3D — solo se muestra en la UI para ents */
export interface TreeProgreso {
  nivel: number; // [3D]
  xp:    number; // [3D]
}

/** Estado visual — lo gestiona Web */
export interface TreeVisualEstado {
  skin:      string; // [WEB]
  variacion: string; // [WEB]
}

/** Uso en combate — lo gestiona 3D */
export interface TreeUso {
  seleccionada: boolean; // [3D]
  en_combate:   boolean; // [3D]
}

/** Recursos que la Web ha aplicado a la planta */
export interface TreeRecursosAplicados {
  agua:     number; // [WEB]
  sol:      number; // [WEB]
  composta: number; // [WEB]
}

/** Representación completa de una planta en el archivo .tree */
export interface TreePlant {
  id:            string;  // [WEB] ID de especie (ej: "aliso") — coincide con species.json y el prefab en Unity
  instance_id:   string;  // [WEB] ID único de instancia — permite distinguir dos plantas de la misma especie
  subid:         string;  // [WEB] Variante de modelo (ej: "aliso") — clave en PLANT_SPRITE_REGISTRY y prefab en Unity
  desbloqueada:  boolean;
  estado:        TreeEstadoPlanta;
  progreso:      TreeProgreso;
  visual_estado: TreeVisualEstado;
  uso:           TreeUso;
  recursos_aplicados: TreeRecursosAplicados;
}

/** Semilla creada desde 3D y enviada a Web */
export interface TreeSeed {
  seed_id:     string;  // [3D] ID opaco
  species_id:  string;  // [3D] Especie a la que corresponde
  subid?:      string;  // [3D] Autor o variante específica
  categoria:   string;  // [3D] Categoría
  recibida_en: number;  // [3D] Timestamp ms
}

/** Estructura raíz del archivo .tree */
export interface ImaginatioTreeData {
  version:  number;         // Versionado para migraciones (actual: 2)
  usuario:  TreeUsuario;
  recursos: TreeRecursos;
  plantas:  TreePlant[];    // TODAS las plantas del usuario, sin filtro
  semillas: TreeSeed[];     // Semillas recibidas desde 3D
}

// Tipo compatible con los datos que llegan del inventario web/backend
export interface BackendPlant {
  id: string;
  owner_id?: string | null;
  name: string;
  species_id: string;
  stage: string;
  water: number;
  sun: number;
  fertilizer: number;
  health: number;
  is_dead: boolean;
  // Campos opcionales escritos por 3D (guardados en localStorage)
  unity_salud?:        string;
  unity_hp?:           number;
  unity_nivel?:        number;
  unity_xp?:           number;
  unity_en_combate?:   boolean;
  unity_seleccionada?: boolean;
  unity_subid?:        string;
  species_data?: {
    classification?: string;
    scientific_name?: string;
    [key: string]: any;
  } | null;
}

// ═══════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════

const STORAGE_KEY      = "imaginatio_tree_data";
const CURRENT_VERSION  = 2;

const DEFAULT_TREE: ImaginatioTreeData = {
  version:  CURRENT_VERSION,
  usuario:  { id: "", nombre: "", nivel: 1, xp: 0 },
  recursos: {
    agua:     { cantidad: 0 },
    sol:      { cantidad: 0 },
    composta: { cantidad: 0 },
  },
  plantas:  [],
  semillas: [],
};

// ═══════════════════════════════════════════════════════
// PERSISTENCIA EN localStorage
// ═══════════════════════════════════════════════════════

/** Carga el .tree desde localStorage. Migra automáticamente si es v1. */
export function loadTreeData(): ImaginatioTreeData {
  if (typeof window === "undefined") return { ...DEFAULT_TREE };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_TREE };

    const parsed = JSON.parse(raw);

    // Migración v1 → v2: convertir ents/seeds al nuevo modelo
    if (!parsed.version || parsed.version < 2) {
      return migrateV1toV2(parsed);
    }

    return {
      version:  parsed.version ?? CURRENT_VERSION,
      usuario:  parsed.usuario  ?? DEFAULT_TREE.usuario,
      recursos: parsed.recursos ?? DEFAULT_TREE.recursos,
      plantas:  Array.isArray(parsed.plantas)  ? parsed.plantas  : [],
      semillas: Array.isArray(parsed.semillas) ? parsed.semillas : [],
    };
  } catch (e) {
    console.warn("[UnityBridge] Error cargando .tree, usando estructura vacía.", e);
    return { ...DEFAULT_TREE };
  }
}

/** Guarda el .tree en localStorage. */
export function saveTreeData(data: ImaginatioTreeData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("[UnityBridge] Error guardando .tree.", e);
  }
}

/** Migración básica del formato v1 (ents/seeds) al formato v2 (plantas/semillas). */
function migrateV1toV2(old: any): ImaginatioTreeData {
  const plantas: TreePlant[] = (old.ents ?? []).map((ent: any) => ({
    id:           ent.ent_id ?? ent.id ?? "",
    subid:        `${(ent.name ?? "").toLowerCase().replace(/\s+/g, "_")}_${ent.model ?? ""}`,
    desbloqueada: true,
    estado: {
      fase:      ent.phase ?? "seed",
      salud:     ent.state === "dead" ? "muerto" : ent.state === "critical" ? "critico" : "saludable",
      hp_actual: 100,
    },
    progreso:      { nivel: 1, xp: 0 },
    visual_estado: { skin: "default", variacion: "normal" },
    uso:           { seleccionada: false, en_combate: false },
    recursos_aplicados: { agua: 0, sol: 0, composta: 0 },
  }));

  const semillas: TreeSeed[] = (old.seeds ?? []).map((s: any) => ({
    seed_id:     s.seed_id ?? "",
    species_id:  s.model ?? s.species_id ?? "",
    categoria:   s.category ?? "Base",
    recibida_en: Date.now(),
  }));

  return {
    version: CURRENT_VERSION,
    usuario: {
      id:     old.user?.user_id  ?? "",
      nombre: old.user?.user_name ?? "",
      nivel:  1,
      xp:     0,
    },
    recursos: DEFAULT_TREE.recursos,
    plantas,
    semillas,
  };
}

// ═══════════════════════════════════════════════════════
// MAPEO — Store → .tree
// ═══════════════════════════════════════════════════════

/** Construye el subid de una planta usando el catálogo de especies.
 * Si la planta ya tiene uno asignado se preserva; si no, se elige aleatoriamente
 * entre los subids disponibles para la especie.
 */
function buildSubId(existingSubId: string | undefined, speciesId: string): string {
  const validSubids = SPECIES_CATALOG[speciesId]?.subids || [];
  if (existingSubId && validSubids.includes(existingSubId)) {
    return existingSubId;
  }
  return pickSubId(speciesId);
}

/** Mapea fase interna del backend al formato del .tree. */
function mapStageToFase(stage: string): string {
  const map: Record<string, string> = {
    seed:        "semilla",
    small_bush:  "arbusto",
    large_bush:  "planta",
    ent:         "ent",
  };
  return map[stage] ?? stage;
}

/**
 * Transforma un array de plantas del backend al modelo TreePlant[].
 * Preserva los campos que 3D ha escrito (unity_*) si existen en la versión guardada.
 */
function mapBackendPlantsToTree(
  plants: BackendPlant[],
  existingPlants: TreePlant[]
): TreePlant[] {
  return plants.map((plant) => {
    // Buscar planta existente por instance_id (inequívoco) o por id como fallback
    const existing = existingPlants.find((p) => p.instance_id === plant.id)
                  ?? existingPlants.find((p) => p.id === plant.species_id);

    return {
      id:          plant.species_id,          // [WEB] especie → clave en species.json y prefab Unity
      instance_id: plant.id,                  // [WEB] ID único de instancia en localStorage
      subid:       buildSubId(plant.unity_subid ?? existing?.subid, plant.species_id),
      desbloqueada: !plant.is_dead,

      estado: {
        fase:      mapStageToFase(plant.stage),
        // Preservar salud y hp de 3D si existen, sino valores por defecto
        salud:     plant.unity_salud   ?? existing?.estado.salud     ?? "saludable",
        hp_actual: plant.unity_hp      ?? existing?.estado.hp_actual  ?? 100,
      },

      progreso: {
        // Preservar nivel/xp de 3D
        nivel: plant.unity_nivel ?? existing?.progreso.nivel ?? 1,
        xp:    plant.unity_xp    ?? existing?.progreso.xp    ?? 0,
      },

      visual_estado: existing?.visual_estado ?? { skin: "default", variacion: "normal" },

      uso: {
        seleccionada: plant.unity_seleccionada ?? existing?.uso.seleccionada ?? false,
        en_combate:   plant.unity_en_combate   ?? existing?.uso.en_combate   ?? false,
      },

      recursos_aplicados: {
        agua:     Math.ceil(plant.water),
        sol:      Math.ceil(plant.sun),
        composta: Math.ceil(plant.fertilizer),
      },
    };
  });
}

// ═══════════════════════════════════════════════════════
// SINCRONIZACIÓN — Web → .tree (auto-sync con cada acción)
// ═══════════════════════════════════════════════════════

/**
 * Sincroniza el inventario actual de la web con el .tree en localStorage.
 * Debe llamarse con cada acción del usuario (regar, sol, evolución, cambio de planta, etc.)
 * Preserva los campos que 3D ha escrito.
 */
export function syncInventoryToTree(
  plants: BackendPlant[],
  options?: {
    waterInventory?: number;
    sunInventory?:   number;
    compostInventory?: number;
  }
): void {
  const data = loadTreeData();

  // Actualizar usuario desde el store
  data.usuario.id     = userId.value    ?? data.usuario.id;
  data.usuario.nombre = username.value  || data.usuario.nombre;
  // nivel y xp NO se tocan — los administra 3D

  // Actualizar recursos si se proporcionan
  if (options?.waterInventory   !== undefined) data.recursos.agua.cantidad     = options.waterInventory;
  if (options?.sunInventory     !== undefined) data.recursos.sol.cantidad      = options.sunInventory;
  if (options?.compostInventory !== undefined) data.recursos.composta.cantidad = options.compostInventory;

  // Mapear y reemplazar plantas preservando datos de 3D
  data.plantas = mapBackendPlantsToTree(plants, data.plantas);

  saveTreeData(data);
}

/**
 * @deprecated Alias de compatibilidad con el nombre anterior.
 * Usar syncInventoryToTree() en código nuevo.
 */
export function syncInventoryToUnityData(plants: BackendPlant[]): void {
  syncInventoryToTree(plants);
}

// ═══════════════════════════════════════════════════════
// IMPORTACIÓN — .tree desde 3D → Web
// ═══════════════════════════════════════════════════════

/**
 * Lee un archivo .tree seleccionado por el usuario y retorna los datos parseados.
 * El archivo tiene extensión .tree pero contenido JSON.
 */
export function loadTreeFile(file: File): Promise<ImaginatioTreeData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = e.target?.result as string;
        const parsed = JSON.parse(raw) as ImaginatioTreeData;
        resolve(parsed);
      } catch (err) {
        reject(new Error("El archivo .tree no es un JSON válido."));
      }
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsText(file);
  });
}

/**
 * Aplica al .tree local solo los campos que 3D administra, sin pisar datos web.
 * También agrega las semillas nuevas que 3D haya creado.
 *
 * Campos que se actualizan desde el .tree de 3D:
 *  - usuario.nivel, usuario.xp
 *  - por planta: estado.salud, estado.hp_actual, progreso.nivel, progreso.xp, uso.*
 *  - semillas: se agregan las nuevas (sin duplicar por seed_id)
 *
 * @returns Objeto con las semillas nuevas detectadas (para agregarlas al inventario)
 */
export function applyTreeDataFrom3D(incoming: ImaginatioTreeData): {
  nuevasSemillas: TreeSeed[];
  plantasActualizadas: number;
} {
  const current = loadTreeData();

  // Actualizar nivel/xp del usuario (solo 3D los modifica)
  if (typeof incoming.usuario?.nivel === "number") current.usuario.nivel = incoming.usuario.nivel;
  if (typeof incoming.usuario?.xp    === "number") current.usuario.xp    = incoming.usuario.xp;

  // Actualizar campos 3D de cada planta existente
  // Matching prioritario por instance_id (único), fallback por id (especie) si hay una sola de esa especie
  let plantasActualizadas = 0;
  for (const incomingPlant of incoming.plantas ?? []) {
    let idx = -1;
    if (incomingPlant.instance_id) {
      idx = current.plantas.findIndex((p) => p.instance_id === incomingPlant.instance_id);
    }
    if (idx < 0) {
      // Fallback: buscar por id de especie (solo si hay exactamente una de esa especie)
      const matches = current.plantas.reduce<number[]>((acc, p, i) => p.id === incomingPlant.id ? [...acc, i] : acc, []);
      if (matches.length === 1) idx = matches[0];
    }
    if (idx >= 0) {
      const target = current.plantas[idx];
      // Solo aplicar campos que 3D administra:
      target.estado.salud      = incomingPlant.estado?.salud      ?? target.estado.salud;
      target.estado.hp_actual  = incomingPlant.estado?.hp_actual  ?? target.estado.hp_actual;
      target.progreso.nivel    = incomingPlant.progreso?.nivel     ?? target.progreso.nivel;
      target.progreso.xp       = incomingPlant.progreso?.xp       ?? target.progreso.xp;
      target.uso.seleccionada  = incomingPlant.uso?.seleccionada  ?? target.uso.seleccionada;
      target.uso.en_combate    = incomingPlant.uso?.en_combate    ?? target.uso.en_combate;
      plantasActualizadas++;
    }
  }

  // Agregar semillas nuevas (evitar duplicados por seed_id)
  const existingSeedIds = new Set(current.semillas.map((s) => s.seed_id));
  const nuevasSemillas: TreeSeed[] = (incoming.semillas ?? []).filter(
    (s) => !existingSeedIds.has(s.seed_id)
  );
  current.semillas.push(...nuevasSemillas);

  saveTreeData(current);
  return { nuevasSemillas, plantasActualizadas };
}

/**
 * Limpia la lista de semillas del .tree local. 
 * Se debe llamar después de que las semillas hayan sido procesadas (instanciadas)
 * para evitar que se vuelvan a cargar si se re-importa el mismo archivo.
 */
export function consumeSeeds(): void {
  const current = loadTreeData();
  current.semillas = [];
  saveTreeData(current);
}

// ═══════════════════════════════════════════════════════
// EXPORTACIÓN — Generar archivo .tree descargable
// ═══════════════════════════════════════════════════════

/**
 * Actualiza el .tree con los datos más recientes del usuario y lo retorna.
 * Asegura que al consultarlo o descargarlo tenga el estado completo más reciente.
 */
export function getFreshTreeData(): ImaginatioTreeData {
  if (typeof window !== "undefined" && username.value) {
    // Obtiene las plantas actualizadas directo de la BD local
    const freshPlants = getUserPlants(username.value);
    
    // Fuerza una sincronización usando el inventario actual
    syncInventoryToTree(freshPlants, {
      waterInventory: waterInventory.value,
      sunInventory: sunInventory.value,
      compostInventory: compostInventory.value
    });
  }
  return loadTreeData();
}

/**
 * Descarga el .tree actual como archivo con extensión .tree.
 * El contenido es JSON válido — Unity lo lee parseándolo como JSON.
 */
export function downloadTreeFile(filename?: string): void {
  const data = getFreshTreeData();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url  = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href     = url;
  a.download = filename ?? `${data.usuario.nombre || "imaginatio"}_save.tree`;
  a.click();
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════
// CICLO DE VIDA
// ═══════════════════════════════════════════════════════

/**
 * Inicializa el .tree con los datos del usuario tras el login.
 * Llamar una vez al completarse la autenticación.
 */
export function initUnityBridge(): void {
  const data = loadTreeData();
  data.usuario.id     = userId.value    ?? data.usuario.id;
  data.usuario.nombre = username.value  || data.usuario.nombre;
  saveTreeData(data);
}

// ═══════════════════════════════════════════════════════
// COMPATIBILIDAD — Tipos y funciones del esquema anterior
// ═══════════════════════════════════════════════════════

/** @deprecated Usar TreePlant en código nuevo. */
export interface UnityEnt {
  ent_id: string;
  user_id: string;
  name: string;
  category: string;
  model: string;
  scientific_name: string;
  state: "healthy" | "critical" | "dead";
  phase: string;
}

/** @deprecated Usar TreeSeed en código nuevo. */
export interface UnitySeed {
  seed_id: string;
  user_id: string;
  category: string;
  model: string;
}

/** @deprecated Usar ImaginatioTreeData en código nuevo. */
export interface ImaginatioUnityData {
  version: number;
  user: { user_id: string; user_name: string };
  ents: UnityEnt[];
  seeds: UnitySeed[];
}

/** @deprecated Usar loadTreeData() en código nuevo. */
export function loadUnityData(): ImaginatioUnityData {
  const tree = loadTreeData();
  return {
    version: 1,
    user: { user_id: tree.usuario.id, user_name: tree.usuario.nombre },
    ents: tree.plantas
      .filter((p) => p.estado.fase === "ent")
      .map((p) => ({
        ent_id:          p.instance_id ?? p.id,
        user_id:         tree.usuario.id,
        name:            p.subid,
        category:        "unknown",
        model:           p.id,
        scientific_name: "",
        state:           p.estado.salud === "muerto"
                           ? "dead"
                           : p.estado.salud === "critico"
                             ? "critical"
                             : "healthy",
        phase: p.estado.fase,
      })),
    seeds: tree.semillas.map((s) => ({
      seed_id:  s.seed_id,
      user_id:  tree.usuario.id,
      category: s.categoria,
      model:    s.species_id,
    })),
  };
}

/** @deprecated Usar saveTreeData() en código nuevo. */
export function saveUnityData(_data: ImaginatioUnityData): void {
  // No-op: la persistencia ahora es exclusiva de saveTreeData
}

/** @deprecated Usar syncInventoryToTree() en código nuevo. */
export function mapStoreToCanonical(_plants: BackendPlant[]): UnityEnt[] {
  return [];
}

/** @deprecated */
export function mapCanonicalToStore(_data: ImaginatioUnityData): UnityEnt[] {
  return [];
}

/** @deprecated */
export function buildUnityPayload(_data: ImaginatioUnityData): any {
  return {};
}

/** @deprecated */
export function onUnityResult(json: string): void {
  console.warn("[UnityBridge] onUnityResult: usar el botón de sincronización .tree en su lugar.", json);
}
