import { useState, useEffect } from "preact/hooks";
import { userId, username, syncUserState, waterInventory, sunInventory, compostInventory, fertilizerInventory, activePlantId } from "../store/resourceStore";
import { login, fetchMyState, getToken, logout } from "../store/apiClient";
import { initUnityBridge } from "../store/unityBridge";

import TopHeader from "./dashboard/TopHeader";
import LeftSigns from "./dashboard/LeftSigns";
import RightSigns from "./dashboard/RightSigns";
import GameArea from "./dashboard/GameArea";
import BottomActions from "./dashboard/BottomActions";
import Inventory from "./dashboard/Inventory";
import HelpModal from "./dashboard/HelpModal";
import EntWelcomeModal from "./dashboard/EntWelcomeModal";
import DeathTutorialModal from "./dashboard/DeathTutorialModal";
import CreditsModal from "./dashboard/CreditsModal";
import PlantNamingModal from "./dashboard/PlantNamingModal";
import MobileOrientationOverlay from "./MobileOrientationOverlay";
import { isNamingModalOpen, isHelpModalOpen } from "../store/resourceStore";

import { useScale } from "../hooks/useScale";
import Water from "./MiniGames/water";
import Compost from "./MiniGames/compost";
import Sun from "./MiniGames/sun";
import fondoMain from '../assets/Recursos web media/FondoMain.png';

export default function MainUI() {
  // "checking" evita el parpadeo: mientras no sabemos si hay token, no mostramos nada.
  const [authState, setAuthState] = useState<"checking" | "logged" | "guest">("checking");
  const [tempName, setTempName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getToken(); // solo se ejecuta en el cliente, nunca en SSR
    if (token) {
      fetchMyState()
        .then(res => {
          syncUserState(res);
          initUnityBridge(); // Inicializar JSON canónico con datos del usuario
          setAuthState("logged");
          if (res.active_plant && res.active_plant.name === "Nueva Planta") {
            isNamingModalOpen.value = true;
          }
          if (!localStorage.getItem(`imaginatio_tutorial_seen_${res.id}`)) {
            isHelpModalOpen.value = true;
            localStorage.setItem(`imaginatio_tutorial_seen_${res.id}`, "1");
          }
        })
        .catch(() => {
          // Token inválido o expirado → ir a login
          setAuthState("guest");
        });
    } else {
      setAuthState("guest");
    }
  }, []);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    setLoading(true);
    try {
      const res = await login(tempName);
      syncUserState(res.user);
      initUnityBridge(); // Inicializar JSON canónico con datos del usuario
      setAuthState("logged");
      if (res.user.active_plant && res.user.active_plant.name === "Nueva Planta") {
        isNamingModalOpen.value = true;
      }
      if (!localStorage.getItem(`imaginatio_tutorial_seen_${res.user.id}`)) {
        isHelpModalOpen.value = true;
        localStorage.setItem(`imaginatio_tutorial_seen_${res.user.id}`, "1");
      }
    } catch (err) {
      alert("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    // Resetear signals globales para evitar que datos del usuario anterior
    // aparezcan momentáneamente si otro usuario inicia sesión en el mismo tab.
    userId.value = null;
    username.value = "";
    waterInventory.value = 0;
    sunInventory.value = 0;
    compostInventory.value = 0;
    fertilizerInventory.value = 0;
    activePlantId.value = null;
    setAuthState("guest");
  };

  // Mientras verifica el token: pantalla en negro sin parpadeo
  if (authState === "checking") {
    return <div className="flex h-screen w-full bg-[#1a2e0e]" />;
  }

  if (authState === "guest") {
    return (
      <div className="flex flex-col h-screen w-full bg-[#2d4a1d] items-center justify-center p-2 sm:p-4 overflow-hidden">
        <MobileOrientationOverlay />
        <div
          className="bg-[#f5e6c8] rounded-3xl border-[6px] sm:border-8 border-[#4e341b] shadow-2xl w-full overflow-hidden"
          style={{ maxWidth: '520px', maxHeight: '92vh' }}
        >
          <div
            className="flex items-center gap-3 p-4 sm:p-8"
            style={{
              /* On short viewports (mobile landscape), use row layout */
              flexDirection: window.innerHeight < 500 ? 'row' : 'column',
              justifyContent: window.innerHeight < 500 ? 'center' : 'center',
              alignItems: 'center',
            }}
          >
            {/* Branding section */}
            <div
              className="flex flex-col items-center shrink-0"
              style={{
                gap: window.innerHeight < 500 ? '0.25rem' : '0.75rem',
              }}
            >
              <span
                className="animate-bounce"
                style={{ fontSize: window.innerHeight < 500 ? '2rem' : '3.5rem' }}
              >
                🌿
              </span>
              <h1
                className="font-black text-[#4e341b] uppercase text-center"
                style={{ fontSize: window.innerHeight < 500 ? '1.1rem' : '1.75rem' }}
              >
                Plantagochi
              </h1>
            </div>

            {/* Form section */}
            <div className="flex flex-col w-full gap-2 sm:gap-3">
              <form onSubmit={handleLogin} className="flex flex-col w-full gap-2 sm:gap-3">
                <label
                  className="font-bold text-[#4e341b] uppercase"
                  style={{ fontSize: window.innerHeight < 500 ? '0.65rem' : '0.75rem' }}
                >
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  value={tempName}
                  onInput={(e) => setTempName((e.target as HTMLInputElement).value)}
                  placeholder="Ej: Jardinero88"
                  className="w-full px-3 rounded-xl border-4 border-[#8B4513] bg-[#fff9eb] text-black font-bold focus:outline-none focus:ring-2 ring-green-600"
                  style={{
                    paddingTop: window.innerHeight < 500 ? '0.35rem' : '0.625rem',
                    paddingBottom: window.innerHeight < 500 ? '0.35rem' : '0.625rem',
                    fontSize: window.innerHeight < 500 ? '0.85rem' : '1rem',
                  }}
                />
                <button
                  disabled={loading}
                  className="w-full bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-black rounded-xl shadow-lg transition transform active:scale-95 disabled:opacity-50"
                  style={{
                    paddingTop: window.innerHeight < 500 ? '0.5rem' : '0.75rem',
                    paddingBottom: window.innerHeight < 500 ? '0.5rem' : '0.75rem',
                    fontSize: window.innerHeight < 500 ? '0.8rem' : '1rem',
                  }}
                >
                  {loading ? "CARGANDO..." : "ENTRAR AL JARDÍN"}
                </button>
              </form>
              <p
                className="text-[#4e341b]/70 text-center leading-relaxed"
                style={{
                  fontSize: window.innerHeight < 500 ? '0.55rem' : '0.65rem',
                  display: window.innerHeight < 500 ? 'none' : 'block',
                }}
              >
                Tu progreso se guarda en este navegador.<br />
                <span className="font-bold">¿Ya tienes cuenta? Ingresa el mismo nombre</span>
                {" "}para retomar tu jardín donde lo dejaste. 🌱
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stage = useScale(1080);

  return (
    <div className="w-screen h-screen bg-[#2d4a1d] relative overflow-hidden text-slate-100 transition-all select-none">

      {/* Mobile Portrait Orientation Overlay */}
      <MobileOrientationOverlay />

      {/* Global Background */}
      <div className="absolute inset-0 pointer-events-none">
        <img src={fondoMain.src} alt="Fondo" className="w-full h-full object-cover opacity-60" />
      </div>

      {/* Stage escalado */}
      <div
        className="absolute shadow-2xl overflow-hidden"
        style={
          stage.isMobile
            ? {
                width: `${stage.virtualWidth}px`,
                height: `${stage.virtualHeight}px`,
                left: `${stage.offsetX}px`,
                top: `${stage.offsetY}px`,
                transform: `scale(${stage.scale})`,
                transformOrigin: '0 0',
              }
            : {
                width: `${stage.virtualWidth}px`,
                height: `${stage.virtualHeight}px`,
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) scale(${stage.scale})`,
                flexShrink: 0,
              }
        }
      >
        <div className="absolute inset-0 z-0">
          <img src={fondoMain.src} alt="Escenario" className="w-full h-full object-cover" />
        </div>

        <div className="relative z-10 flex flex-col w-full h-full">
          <TopHeader onLogout={handleLogout} />

          <div className="flex flex-row flex-grow w-full h-full relative z-10 mx-auto">
            <LeftSigns />
            <GameArea />
            <RightSigns />
            <BottomActions />
          </div>

          <Inventory />
          <HelpModal />
          <CreditsModal />
          <PlantNamingModal />

          {/* 🔥 Minijuegos como overlay */}
          <Water />
          <Compost />
          <Sun />

          {/* 🌳 Modal informativo del Ent y Muerte */}
          <EntWelcomeModal />
          <DeathTutorialModal />
        </div>
      </div>

    </div>
  );
}

