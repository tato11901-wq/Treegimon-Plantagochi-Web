import { useEffect, useRef, useState } from "preact/hooks";
import { isUnityViewerOpen } from "../../store/resourceStore";
import { getFreshTreeData, loadTreeFile, applyTreeDataFrom3D, consumeSeeds } from "../../store/unityBridge";
import { createPlant } from "../../store/apiClient";
import { refreshInventory } from "../../store/resourceStore";

// ── Ruta del WebGL de Unity ──────────────────────────────────────────────────
// El middleware de Vite sirve WEBGL/TreegimonWeb/ bajo /unity-webgl/ en dev.
// El plugin copia esos archivos a dist/unity-webgl/ en producción.
const UNITY_URL = "/unity-webgl/index.html";

export default function UnityViewer() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [treeExported, setTreeExported] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  // ── Reset estado al abrir/cerrar ───────────────────────────────────────────
  // IMPORTANT: useEffect MUST be before any early return (rules of hooks)
  useEffect(() => {
    if (isUnityViewerOpen.value) {
      setTreeExported(false);
      setSyncStatus("idle");
    }
  }, [isUnityViewerOpen.value]);

  // Early return AFTER all hooks
  if (!isUnityViewerOpen.value) return null;

  // ── Descarga el .tree para que el usuario lo importe en Unity ─────────────
  const handleExportTree = () => {
    const data = getFreshTreeData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${data.usuario.nombre || "imaginatio"}_save.tree`;
    a.click();
    URL.revokeObjectURL(url);
    setTreeExported(true);
  };

  // ── Importa un .tree desde Unity para sincronizar datos 3D → Web ──────────
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

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
          try {
            await createPlant(seed.species_id, seed.subid);
          } catch (e) {
            console.error(`[UnityViewer] Error creando planta para semilla ${seed.seed_id}:`, e);
          }
        }
        consumeSeeds();
        refreshInventory();
      }

      setSyncStatus("ok");
      console.info(
        `[UnityViewer] ✓ Plantas actualizadas: ${plantasActualizadas} | Semillas instanciadas: ${nuevasSemillas.length}`
      );
      setTimeout(() => setSyncStatus("idle"), 3000);
    } catch (err) {
      console.error("[UnityViewer] Error al importar .tree:", err);
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 3000);
    } finally {
      input.value = "";
    }
  };

  const handleClose = () => {
    isUnityViewerOpen.value = false;
  };

  return (
    <div
      class="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm"
      id="unity-viewer-overlay"
    >
      {/* ── Barra superior ─────────────────────────────────────────────── */}
      <div class="relative w-full max-w-[1000px] flex items-center justify-between px-4 py-2
                  bg-[#1a2e0e]/90 border-b border-emerald-700/40 rounded-t-2xl">

        <div class="flex items-center gap-3">
          {/* Ícono Unity */}
          <span class="text-2xl select-none">🎮</span>
          <div>
            <p class="text-emerald-300 font-black text-sm uppercase tracking-wide">Treegimon 3D</p>
            <p class="text-emerald-500/70 text-xs">Juego Unity WebGL integrado</p>
          </div>
        </div>

        {/* Controles de datos */}
        <div class="flex items-center gap-2">

          {/* Exportar .tree → Unity */}
          <button
            id="btn-export-tree"
            onClick={handleExportTree}
            title="Descargar tu .tree para importarlo en Unity"
            class={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs
                    border transition-all duration-200 active:scale-95
                    ${treeExported
                      ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
                      : "bg-emerald-800/60 border-emerald-600/40 text-emerald-200 hover:bg-emerald-700/70"}`}
          >
            {treeExported ? "✓" : (
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={2}>
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 4v12m0 0l-4-4m4 4l4-4" />
              </svg>
            )}
            {treeExported ? "¡Listo!" : "Exportar .tree"}
          </button>

          {/* Importar .tree ← Unity */}
          <button
            id="btn-import-tree"
            onClick={handleImportClick}
            disabled={syncStatus === "loading"}
            title="Importar .tree desde Unity para sincronizar datos 3D"
            class={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs
                    border transition-all duration-200 active:scale-95 disabled:cursor-wait
                    ${syncStatus === "ok"    ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300" :
                      syncStatus === "error" ? "bg-red-800/60 border-red-600/40 text-red-300" :
                      syncStatus === "loading" ? "bg-emerald-900/60 border-emerald-700/40 text-emerald-400" :
                      "bg-sky-800/60 border-sky-600/40 text-sky-200 hover:bg-sky-700/70"}`}
          >
            {syncStatus === "loading" && (
              <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            )}
            {syncStatus === "ok"    && <span>✓</span>}
            {syncStatus === "error" && <span>✗</span>}
            {syncStatus === "idle"  && (
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={2}>
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 8l-3-3m3 3l3-3" />
              </svg>
            )}
            {syncStatus === "loading" ? "Sincronizando..." :
             syncStatus === "ok"      ? "¡Sincronizado!" :
             syncStatus === "error"   ? "Error en .tree" :
                                        "Importar .tree"}
          </button>

          {/* Separador */}
          <div class="w-px h-6 bg-emerald-700/40 mx-1" />

          {/* Cerrar */}
          <button
            id="btn-close-unity-viewer"
            onClick={handleClose}
            title="Cerrar visor 3D"
            class="w-8 h-8 flex items-center justify-center rounded-lg bg-red-900/50 border border-red-700/40
                   text-red-300 hover:bg-red-700/60 transition-all duration-200 active:scale-90 font-black text-sm"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Iframe Unity WebGL ─────────────────────────────────────────────── */}
      <div class="relative w-full max-w-[1000px] flex-1 overflow-hidden rounded-b-2xl border border-emerald-800/40 border-t-0"
           style={{ height: "600px", maxHeight: "80vh" }}>
        <iframe
          ref={iframeRef}
          id="unity-webgl-iframe"
          src={UNITY_URL}
          title="Treegimon 3D - Unity WebGL"
          allow="fullscreen"
          class="w-full h-full border-0 bg-[#1a2e0e]"
          style={{ display: "block" }}
        />
      </div>

      {/* ── Hint de flujo de trabajo ───────────────────────────────────────── */}
      <div class="w-full max-w-[1000px] flex items-center justify-center gap-6 py-2
                  text-emerald-600/70 text-[11px] font-medium select-none">
        <span>① Haz clic en <strong class="text-emerald-400">Exportar .tree</strong> para guardar tus datos</span>
        <span class="text-emerald-700/50">→</span>
        <span>② Importa el archivo en el menú de Unity</span>
        <span class="text-emerald-700/50">→</span>
        <span>③ Cuando termines, <strong class="text-emerald-400">Importar .tree</strong> para sincronizar</span>
      </div>

      {/* Input oculto para leer el .tree */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".tree"
        onChange={handleTreeFileChange}
        class="hidden"
        id="unity-viewer-tree-input"
      />
    </div>
  );
}
