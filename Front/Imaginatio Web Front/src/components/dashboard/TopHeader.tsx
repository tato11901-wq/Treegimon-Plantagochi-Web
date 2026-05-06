import { useState, useEffect, useRef } from "preact/hooks";
import { isInventoryOpen, isHelpModalOpen, isCreditsModalOpen, plantName, activePlantId, username, isMuted, globalVolume } from '../../store/resourceStore';
import { fetchMyActivePlant, renamePlant } from '../../store/apiClient';
import { syncPlantState, plantHealth, plantWaterProgress, plantSunProgress, plantPhase, EVOLUTION_REQUIREMENTS } from '../../store/plantStore';
import panelHudSuperior from '../../assets/Recursos web media/Panel_HUD_superior.png';
import panelNombrePlanta from '../../assets/Recursos web media/Panel_NombrePlanta.png';
import panelAvisoPlanta from '../../assets/Recursos web media/Panel_AvisoPlanta.png';
import btnInventario from '../../assets/Recursos web media/btn_Inventario.png';
import btnAyuda from '../../assets/Recursos web media/btn_ayuda.png';

export default function TopHeader({ onLogout }: { onLogout?: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const volumePanelRef = useRef<HTMLDivElement>(null);
  const volumeButtonRef = useRef<HTMLDivElement>(null);
  const [isVolumePanelOpen, setIsVolumePanelOpen] = useState(false);

  // Cerrar panel de volumen al presionar Esc o clic fuera
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsVolumePanelOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (
        volumePanelRef.current && 
        !volumePanelRef.current.contains(e.target as Node) &&
        volumeButtonRef.current &&
        !volumeButtonRef.current.contains(e.target as Node)
      ) {
        setIsVolumePanelOpen(false);
      }
    };

    if (isVolumePanelOpen) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVolumePanelOpen]);

  // Fetch plant name on mount
  useEffect(() => {
    fetchMyActivePlant()
      .then((plant: any) => {
        if (plant?.name) {
          plantName.value = plant.name;
        }
        if (plant?.id) {
          activePlantId.value = plant.id;
        }

        // Sincroniza los recursos y la fase desde el backend
        syncPlantState(plant);
      })
      .catch(() => {
        // No active plant yet — keep default
      });
  }, []);

  // Focus the input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEditing = () => {
    setEditValue(plantName.value);
    setIsEditing(true);
  };

  const handleConfirm = async () => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      setIsEditing(false);
      return;
    }

    plantName.value = trimmed;
    setIsEditing(false);

    // Persist to backend if we have an active plant
    if (activePlantId.value) {
      try {
        await renamePlant(activePlantId.value, trimmed);
      } catch {
        // Silently fail — name is already updated locally
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirm();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const deadMessageRandomIndex = useRef<Record<string, number>>({});

  // ── Lógica de Mensajes Dinámicos ──
  const getStatusMessage = () => {
    const health = plantHealth.value;
    const water = plantWaterProgress.value;
    const sun = plantSunProgress.value;

    // 1. Estado Muerta
    if (health <= 0) {
      const deadMessages = [
        "Pudiste haberme cuidado mejor… ojalá en otra vida alguien sí lo haga 🪦",
        "Ahora descanso en paz… espero no ser el abono de una planta mejor cuidada 🪦",
        "Me quedé sin fuerzas... recuerdame como una plantita que intentó ser grande 🪦",
        "Pudiste haberme cuidado mejor… tal vez en otra vida florezca en manos que sí sepan quererme 🪦"
      ];
      
      // Selección totalmente aleatoria pero estable por planta para evitar parpadeos
      const id = activePlantId.value || "default";
      if (deadMessageRandomIndex.current[id] === undefined) {
        deadMessageRandomIndex.current[id] = Math.floor(Math.random() * deadMessages.length);
      }
      const index = deadMessageRandomIndex.current[id];

      return {
        text: deadMessages[index],
        isCritical: true
      };
    }

    // 2. Estado Crítico (1 o menos de algún recurso)
    if (water <= 1 || sun <= 1) {
      let needs = [];
      if (water <= 1) needs.push("AGUA");
      if (sun <= 1) needs.push("SOL");
      return {
        text: `⚠️ ¡SOCORRO! NECESITO ${needs.join(" Y ")} AHORA MISMO ⚠️`,
        isCritical: true
      };
    }

    const reqs = EVOLUTION_REQUIREMENTS[plantPhase.value] || { water: 10, sun: 10 };
    const waterPct = (water / reqs.water) * 100;
    const sunPct = (sun / reqs.sun) * 100;

    // 3. Necesidad Ligera / Alerta (50% o menos)
    if (waterPct <= 50 || sunPct <= 50) {
      let needs = [];
      if (waterPct <= 50) needs.push("un traguito de agua");
      if (sunPct <= 50) needs.push("sentir los rayos del sol");
      return {
        text: `Hola... ¿me darías ${needs.join(" y ")}? Me vendría muy bien.`,
        isCritical: false
      };
    }

    // 3. Estado Saludable
    const healthyMessages = [
      "¡Me siento genial! Gracias por cuidarme tanto.",
      "Qué lindo día... ¡mira cómo brillan mis hojas!",
      "Me encanta este invernadero, ¡estoy creciendo muy feliz!",
      "¡Hola! Gracias por estar pendiente de mí, me siento radiante."
    ];
    // Usamos el ID de la planta para que el mensaje sea estable para esa planta
    const index = activePlantId.value ? activePlantId.value.length % healthyMessages.length : 0;
    return {
      text: healthyMessages[index],
      isCritical: false
    };
  };

  const status = getStatusMessage();

  return (
    <div className="flex flex-row justify-between items-start w-full px-6 pt-0 z-30 relative pointer-events-none">

      {/* Top Header Background - Panel HUD Superior */}
      <div className="absolute top-0 left-4 right-4 h-30 z-0 flex items-center justify-center">
        <img src={panelHudSuperior.src} alt="Panel HUD Superior" className="w-full h-full object-fill" />
      </div>

      <div className="relative z-10 flex w-full justify-between items-center px-8 mt-6 pointer-events-auto">
        {/* Nombre de planta - Left */}
        <div
          className="relative w-52 h-16 flex items-center justify-center cursor-pointer ml-10 group"
          onClick={!isEditing ? handleStartEditing : undefined}
          title="Haz clic para cambiar el nombre"
        >
          <img src={panelNombrePlanta.src} alt="Nombre Planta" className="w-full h-full object-contain" />

          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              maxLength={12}
              onInput={(e) => setEditValue((e.target as HTMLInputElement).value)}
              onKeyDown={handleKeyDown}
              onBlur={handleConfirm}
              className="absolute inset-0 bg-transparent text-white font-bold text-base text-center pt-1 outline-none border-none caret-yellow-300"
              style={{ background: "transparent" }}
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-base pt-1 group-hover:text-yellow-200 transition-colors duration-200">
              {plantName.value}
            </span>
          )}
        </div>

        {/* Aviso de planta - Center */}
        <div className="relative w-full h-16 flex items-center justify-center mx-4">
          <img src={panelAvisoPlanta.src} alt="Aviso Planta" className="w-full h-full object-contain" />
          <span
            className={`absolute inset-0 flex items-center justify-center text-center px-12 font-bold text-sm pt-1 transition-all duration-300
              ${status.isCritical ? "animate-alert-text" : "text-white font-medium"}
            `}
          >
            {status.text}
          </span>
        </div>

        {/* Right buttons: Créditos, Inventario, Ayuda y Cerrar Sesión */}
        <div className="flex gap-5 shrink-0 mr-10 items-center">
          <div
            onClick={() => isCreditsModalOpen.value = true}
            className="w-16 h-16 flex items-center justify-center cursor-pointer transition-all duration-150 ease-in-out hover:opacity-60 active:scale-90 bg-[#f5e6c8] border-4 border-[#4e341b] rounded-2xl shadow-[0_4px_0_#4e341b] text-[#4e341b] font-black text-2xl"
            title="Créditos"
          >
            🌟
          </div>
          <div
            onClick={() => isInventoryOpen.value = true}
            className="w-16 h-16 flex items-center justify-center cursor-pointer transition-all duration-150 ease-in-out hover:opacity-60 active:scale-90"
          >
            <img src={btnInventario.src} alt="Inventario" className="w-full h-full object-contain" />
          </div>
          <div
            onClick={() => isHelpModalOpen.value = true}
            className="w-16 h-16 flex items-center justify-center cursor-pointer transition-all duration-150 ease-in-out hover:opacity-60 active:scale-90"
          >
            <img src={btnAyuda.src} alt="Ayuda" className="w-full h-full object-contain" />
          </div>

          {/* Botón de Sonido (Abre panel) */}
          <div className="relative">
            <div
              ref={volumeButtonRef}
              onClick={() => setIsVolumePanelOpen(!isVolumePanelOpen)}
              className={`w-16 h-16 flex items-center justify-center cursor-pointer transition-all duration-150 ease-in-out hover:opacity-80 active:scale-90 bg-[#f5e6c8] border-4 rounded-2xl shadow-[0_4px_0_#4e341b] font-black text-2xl
                ${isMuted.value ? 'border-red-800 text-red-800 opacity-60' : 'border-[#4e341b] text-[#4e341b]'}`}
              title="Ajustar volumen"
            >
              {isMuted.value || globalVolume.value === 0 ? "🔇" : "🔊"}
            </div>

            {/* Panel de volumen */}
            {isVolumePanelOpen && (
              <div 
                ref={volumePanelRef}
                className="absolute top-20 right-0 w-48 bg-[#f5e6c8] border-4 border-[#4e341b] rounded-2xl shadow-[0_8px_0_#4e341b] p-4 flex flex-col gap-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#4e341b] text-sm uppercase">Volumen</span>
                  <button 
                    onClick={() => isMuted.value = !isMuted.value}
                    className={`text-xl transition-transform active:scale-90 ${isMuted.value ? 'opacity-50' : 'opacity-100'}`}
                  >
                    {isMuted.value ? "🔇" : "🔊"}
                  </button>
                </div>
                
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted.value ? 0 : globalVolume.value}
                  onInput={(e) => {
                    const val = parseFloat((e.target as HTMLInputElement).value);
                    globalVolume.value = val;
                    if (val > 0) isMuted.value = false;
                  }}
                  className="w-full h-3 bg-[#4e341b]/20 rounded-lg appearance-none cursor-pointer accent-[#4e341b]"
                />
                
                <div className="text-right text-[10px] font-black text-[#4e341b]/60 uppercase">
                  {Math.round((isMuted.value ? 0 : globalVolume.value) * 100)}%
                </div>
              </div>
            )}
          </div>

          {/* Botón Cerrar Sesión */}
          {onLogout && (
            <div className="flex flex-col items-center gap-1">
              <button
                id="btn-logout"
                onClick={onLogout}
                title={`Cerrar sesión de ${username.value}`}
                className="w-12 h-12 rounded-full bg-red-900/80 border-2 border-red-400/60 flex items-center justify-center
                           shadow-lg hover:bg-red-700 hover:border-red-300 hover:scale-110 active:scale-90
                           transition-all duration-150 ease-in-out"
              >
                {/* Ícono: puerta de salida */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                  className="w-6 h-6 text-red-200">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
              <span className="text-[9px] text-red-200/70 font-bold uppercase tracking-wide max-w-[56px] truncate text-center">
                {username.value}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
