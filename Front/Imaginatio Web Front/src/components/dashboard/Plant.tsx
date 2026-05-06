import { useEffect, useState, useRef } from "preact/hooks";
import { isPlantInfoOpen, activePlantId, isMuted, globalVolume } from "../../store/resourceStore";
import {
  plantPhase,
  plantSpeciesId,
  plantUnitySubid,
  type PlantPhase,
  isWatering,
  isFertilizing,
  isSunning,
  isEvolving,
  plantHealth,
  plantWaterProgress,
  plantSunProgress,
  EVOLUTION_REQUIREMENTS
} from "../../store/plantStore";
import { SpriteAnimator } from './SpriteAnimator';
import { getSpriteConfig } from '../../config/plantSpriteRegistry';

// Lápida
import tombStoneSprite from '../../assets/Recursos planta/TombStone.png';

// Efectos de estado compartidos por todas las especies
import evolucionSpriteSheet from '../../assets/Recursos estadosPlanta/Evolucion.png';
import watherSpriteSheet from '../../assets/Recursos estadosPlanta/Wather.png';
import abonoSpriteSheet from '../../assets/Recursos estadosPlanta/Abono.png';
import solSpriteSheet from '../../assets/Recursos estadosPlanta/Sol.png';
import criticalParticlesSprite from '../../assets/Recursos estadosPlanta/Critical Particles.png';
import dangerParticlesSprite from '../../assets/Recursos estadosPlanta/Danger Particles.png';

// Audios
import abonoAudioSrc from '../../assets/Sonidos Interacciones/Abono.mp3';
import regarAudioSrc from '../../assets/Sonidos Interacciones/Regar.mp3';
import solAudioSrc from '../../assets/Sonidos Interacciones/Sol.mp3';
import evolucionAudioSrc from '../../assets/Sonidos Interacciones/dogwolf123-retro-power-up-sound-03-474809.mp3';

export const Plant = () => {
  const [displayPhase, setDisplayPhase] = useState<PlantPhase>(plantPhase.value);
  const [displaySpecies, setDisplaySpecies] = useState<string>(plantSpeciesId.value);

  const prevPhaseRef = useRef(plantPhase.value);
  const prevPlantIdRef = useRef(activePlantId.value);

  // Sincronización inmediata al cambiar de planta (evita flickering)
  useEffect(() => {
    if (prevPlantIdRef.current !== activePlantId.value) {
      setDisplayPhase(plantPhase.value);
      setDisplaySpecies(plantSpeciesId.value);
      prevPhaseRef.current = plantPhase.value;
      prevPlantIdRef.current = activePlantId.value;
    }
  }, [activePlantId.value, plantPhase.value, plantSpeciesId.value]);

  // Retrasar el cambio visual de fase SOLO durante la evolución
  useEffect(() => {
    if (prevPhaseRef.current !== plantPhase.value) {
      const newPhase = plantPhase.value;

      // Si estamos en proceso de evolución, esperamos a que la animación avance
      if (isEvolving.value) {
        const timer = setTimeout(() => {
          setDisplayPhase(newPhase);
          prevPhaseRef.current = newPhase;
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        // Si no hay evolución (ej: cambio de planta), actualizamos ya
        setDisplayPhase(newPhase);
        prevPhaseRef.current = newPhase;
      }
    }
  }, [plantPhase.value, isEvolving.value]);

  useEffect(() => {
    // Solo actualizamos la especie si no es un cambio de planta (manejado arriba)
    if (prevPlantIdRef.current === activePlantId.value) {
      setDisplaySpecies(plantSpeciesId.value);
    }
  }, [plantSpeciesId.value]);

  // Refs de audio
  const waterAudioRef = useRef<HTMLAudioElement>(null);
  const abonoAudioRef = useRef<HTMLAudioElement>(null);
  const solAudioRef = useRef<HTMLAudioElement>(null);
  const evolucionAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (isWatering.value && waterAudioRef.current && !isMuted.value) {
      waterAudioRef.current.volume = 0.3 * globalVolume.value;
      waterAudioRef.current.currentTime = 0;
      waterAudioRef.current.play().catch(() => {});
    }
  }, [isWatering.value, isMuted.value, globalVolume.value]);

  useEffect(() => {
    if (isFertilizing.value && abonoAudioRef.current && !isMuted.value) {
      abonoAudioRef.current.volume = 0.3 * globalVolume.value;
      abonoAudioRef.current.currentTime = 0;
      abonoAudioRef.current.play().catch(() => {});
    }
  }, [isFertilizing.value, isMuted.value, globalVolume.value]);

  useEffect(() => {
    if (isSunning.value && solAudioRef.current && !isMuted.value) {
      solAudioRef.current.volume = 0.8 * globalVolume.value;
      solAudioRef.current.currentTime = 0;
      solAudioRef.current.play().catch(() => {});
    }
  }, [isSunning.value, isMuted.value, globalVolume.value]);

  useEffect(() => {
    if (isEvolving.value && evolucionAudioRef.current && !isMuted.value) {
      evolucionAudioRef.current.volume = 0.5 * globalVolume.value;
      evolucionAudioRef.current.currentTime = 0;
      // Retraso de un segundo pedido por el usuario para sincronizar con el final de la animación
      const timer = setTimeout(() => {
        evolucionAudioRef.current?.play().catch(() => {});
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isEvolving.value, isMuted.value, globalVolume.value]);

  const config = getSpriteConfig(displaySpecies, plantUnitySubid.value, displayPhase);
  const isAnimated = config.frameCount > 1;
  const isDead = plantHealth.value <= 0;

  const water = plantWaterProgress.value;
  const sun = plantSunProgress.value;

  let isDanger = false;
  let isAlert = false;

  if (!isDead) {
    if (water <= 1 || sun <= 1) {
      isDanger = true;
    } else {
      const reqs = EVOLUTION_REQUIREMENTS[displayPhase] || { water: 10, sun: 10 };
      const waterPct = (water / reqs.water) * 100;
      const sunPct = (sun / reqs.sun) * 100;
      if (waterPct <= 50 || sunPct <= 50) {
        isAlert = true;
      }
    }
  }

  // Clases dinámicas de tamaño y posición según la fase de la planta
  const particleStyles: Record<PlantPhase, string> = {
    seed: "scale-[1.0] translate-y-15",
    small_bush: "scale-[1.3] translate-y-10",
    large_bush: "scale-[1.5] translate-y-3",
    ent: "scale-[2.5] translate-y-48"
  };
  const particleClass = particleStyles[displayPhase] || "scale-[1.5] -translate-y-20";

  return (
    <div className="relative mb-24 flex flex-col items-center pointer-events-none group">
      {/* Elementos de audio */}
      <audio ref={waterAudioRef} src={regarAudioSrc} />
      <audio ref={abonoAudioRef} src={abonoAudioSrc} />
      <audio ref={solAudioRef} src={solAudioSrc} />
      <audio ref={evolucionAudioRef} src={evolucionAudioSrc} />

      <div className="w-80 h-auto flex items-center justify-center z-20 relative transition-transform duration-300 group-hover:scale-105">

        {/* Sprite principal: Lápida si está muerta, de lo contrario animado o estático */}
        {isDead ? (
          <SpriteAnimator
            key="tombstone"
            src={tombStoneSprite.src}
            frameWidth={32}
            frameHeight={32}
            frameCount={40}
            scale={1}
            fps={7}
            className="w-full h-full object-contain drop-shadow-2xl [image-rendering:pixelated]"
          />
        ) : isAnimated ? (
          <SpriteAnimator
            key={`${displaySpecies}-${displayPhase}`}
            src={config.src}
            frameWidth={config.frameWidth}
            frameHeight={config.frameHeight}
            frameCount={config.frameCount}
            scale={config.scale}
            fps={20}
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        ) : (
          <img
            key={`${displaySpecies}-${displayPhase}`}
            src={config.src}
            alt={`${displaySpecies} – ${displayPhase}`}
            className="w-full h-full object-contain drop-shadow-2xl"
            style={{ transform: `scale(${config.scale})`, transformOrigin: "bottom center" }}
          />
        )}

        {/* Overlays de animaciones de interacción */}
        {isEvolving.value && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none scale-[2.5]">
            <SpriteAnimator src={evolucionSpriteSheet.src} frameWidth={500} frameHeight={500} frameCount={43} fps={20} className="w-full h-full object-contain mix-blend-screen" />
          </div>
        )}
        {isWatering.value && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none scale-[2.5] -translate-y-55">
            <SpriteAnimator src={watherSpriteSheet.src} frameWidth={500} frameHeight={500} frameCount={16} fps={12} className="w-full h-full object-contain mix-blend-screen" />
          </div>
        )}
        {isFertilizing.value && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none scale-[2] -translate-y-40">
            <SpriteAnimator src={abonoSpriteSheet.src} frameWidth={500} frameHeight={500} frameCount={25} fps={20} className="w-full h-full object-contain mix-blend-screen" />
          </div>
        )}
        {isSunning.value && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none scale-[2.5] -translate-y-50">
            <SpriteAnimator src={solSpriteSheet.src} frameWidth={500} frameHeight={500} frameCount={35} fps={20} className="w-full h-full object-contain mix-blend-screen opacity-50" />
          </div>
        )}

        {/* Partículas de Alerta y Peligro */}
        {isDanger && (
          <div className={`absolute inset-0 z-40 flex items-center justify-center pointer-events-none ${particleClass}`}>
            <SpriteAnimator src={dangerParticlesSprite.src} frameWidth={500} frameHeight={500} frameCount={13} fps={7} className="w-full h-full object-contain mix-blend-screen opacity-90" />
          </div>
        )}
        {isAlert && !isDanger && (
          <div className={`absolute inset-0 z-40 flex items-center justify-center pointer-events-none ${particleClass}`}>
            <SpriteAnimator src={criticalParticlesSprite.src} frameWidth={500} frameHeight={500} frameCount={13} fps={7} className="w-full h-full object-contain mix-blend-screen opacity-90" />
          </div>
        )}
      </div>

      {/* Hitbox invisible para abrir el panel de información */}
      <div
        onClick={() => (isPlantInfoOpen.value = true)}
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 z-40 pointer-events-auto cursor-pointer ${config.hitbox}`}
        title="Ver detalles de la planta"
      />
    </div>
  );
};

export default Plant;
