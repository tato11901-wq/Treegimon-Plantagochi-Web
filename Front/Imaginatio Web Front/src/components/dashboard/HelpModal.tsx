import { isHelpModalOpen } from "../../store/resourceStore";
import btnMinijuegoAgua from "../../assets/Recursos web media/btn_MinijuegoAgua.png";
import btnMinijuegoComposta from "../../assets/Recursos web media/btn_MinijuegoComposta.png";
import btnMinijuegoSol from "../../assets/Recursos web media/SolEscenario.png";
import btnRegar from "../../assets/Recursos web media/btn_regar.png";
import btnIluminar from "../../assets/Recursos web media/btn_iluminar.png";
import btnAbonar from "../../assets/Recursos web media/btn_abonar.png";
import plantaIcon from "../../assets/Recursos web media/PLANTA.png";
import barrasRecursos from "../../assets/Ayuda recursos/barras recursos_Sol_AGUA.png";
import panelEstadoAbono from "../../assets/Ayuda recursos/abono Panel_img.png";
import imgEvolucion from "../../assets/Ayuda recursos/evolucionIMG.png";

export default function HelpModal() {
  if (!isHelpModalOpen.value) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-md pointer-events-auto"
      onClick={() => isHelpModalOpen.value = false}
    >
      <div
        className="bg-[#f5e6c8] w-[900px] max-w-[95%] h-[85%] max-h-[800px] rounded-[2rem] border-8 border-[#4e341b] p-8 shadow-2xl flex flex-col relative animate-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => isHelpModalOpen.value = false}
          className="absolute -top-4 -right-4 w-12 h-12 flex items-center justify-center font-black text-xl rounded-full border-4 border-[#4e341b] bg-red-500 text-white hover:bg-red-600 active:scale-90 transition-all shadow-[0_4px_0_#4e341b] z-20"
          title="Cerrar"
        >
          X
        </button>

        <h2 className="text-5xl font-black text-[#4e341b] uppercase tracking-widest text-center mb-6 mt-2 flex-shrink-0 drop-shadow-md">
          Guía de Plantagochi🌱
        </h2>

        {/* Scrollable Content Area */}
        <div className="flex-1 w-full overflow-y-auto px-8 pb-8 
                        scrollbar-thin scrollbar-thumb-[#8B4513] scrollbar-track-[#f5e6c8]">

          <div className="flex flex-col gap-10">
            {/* Introducción */}
            <div className="flex flex-row gap-6 items-start w-full bg-[#fff9eb] border-4 border-[#8B4513] p-6 rounded-3xl shadow-sm">
              <img src={plantaIcon.src} alt="Planta" className="w-32 h-32 object-contain drop-shadow-xl" />
              <div className="flex flex-col gap-3 flex-1 w-full justify-center text-[#5c3e21]">
                <h3 className="text-2xl font-black text-[#4e341b] uppercase">¡Bienvenido a Plantagochi!</h3>
                <p className="font-medium text-lg leading-relaxed">
                  Tu objetivo es cuidar a tus plantitas, hacerlas crecer y mantenerlas saludables. Si descuidas a tu planta y se queda sin agua o sol, MORIRÁ. ¡Mantente atento!
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6 items-center w-full bg-[#fff9eb] border-4 border-[#8B4513] p-6 rounded-3xl shadow-sm">
              <h3 className="text-2xl font-black text-[#4e341b] uppercase">Guía de recursos</h3>

              <div className="flex flex-row gap-6 items-start w-full">
                <img src={barrasRecursos.src} alt="Barras de recursos" className="w-full max-w-[200px] h-auto object-contain drop-shadow-xl" />
                <p className="font-medium text-lg leading-relaxed text-[#5c3e21] flex-1">
                  El progreso actual de los recursos de agua y sol se muestran en los paneles de la izquierda, estos gastan una unidad de recurso cada 10 minutos, ten cuidado con ambos ya que si ambos llegan a 0 tu planta morirá.
                </p>
              </div>

              <div className="flex flex-row gap-6 items-start w-full mt-2">
                <img src={panelEstadoAbono.src} alt="Panel Abono" className="w-full max-w-[200px] h-auto object-contain drop-shadow-xl" />
                <p className="font-medium text-lg leading-relaxed text-[#5c3e21] flex-1">
                  Por otro lado el progreso de abono se muestra en el panel de la derecha, este al contrario que los otros recursos NO se gasta con el tiempo, ten en cuenta que llenar este medidor será fundamental para evolucionar a tu planta.
                </p>
              </div>
            </div>

            {/* Minijuegos y Recursos */}
            <div className="flex flex-col gap-6 w-full bg-[#fff9eb] border-4 border-[#8B4513] p-8 rounded-3xl shadow-sm">
              <h3 className="text-2xl font-black text-[#4e341b] uppercase text-center w-full mb-2">
                🎮 Minijuegos (Conseguir Recursos)
              </h3>
              <p className="text-center font-medium text-[#5c3e21] text-lg mb-4">
                Usa los botones repartidos por la pantalla para jugar minijuegos y conseguir recursos para tu inventario.
              </p>

              <div className="grid grid-cols-3 gap-6">
                {/* Minijuego Agua */}
                <div className="flex flex-col items-center text-center gap-3 bg-[#f5e6c8] p-4 rounded-2xl border-2 border-[#d4bc96]">
                  <img src={btnMinijuegoAgua.src} alt="Agua" className="w-20 h-20 object-contain hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-[#4e341b] text-xl">Regadera</h4>
                  <p className="text-sm font-medium text-[#5c3e21]">Usa click repetidamente para recoger agua, mientras mas click tengas mas agua tendras.</p>
                </div>

                {/* Minijuego Sol */}
                <div className="flex flex-col items-center text-center gap-3 bg-[#f5e6c8] p-4 rounded-2xl border-2 border-[#d4bc96]">
                  <img src={btnMinijuegoSol.src} alt="Sol" className="w-20 h-20 object-contain hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-[#4e341b] text-xl">Premios solares</h4>
                  <p className="text-sm font-medium text-[#5c3e21]">Haz click repetidamente para evolucionar el premio solar y conseguir la mayor cantidad de soles.</p>
                </div>

                {/* Minijuego Compost */}
                <div className="flex flex-col items-center text-center gap-3 bg-[#f5e6c8] p-4 rounded-2xl border-2 border-[#d4bc96]">
                  <img src={btnMinijuegoComposta.src} alt="Composta" className="w-20 h-20 object-contain hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-[#4e341b] text-xl">Compostaje</h4>
                  <p class="text-sm font-medium text-[#5c3e21]">Haz click sobre los recursos organicos para ganar composta. ¡Cada <strong>2</strong> de composta te dan 1 de Abono!</p>

                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-row gap-6 items-start w-full bg-[#fff9eb] border-4 border-[#8B4513] p-6 rounded-3xl shadow-sm">
              <div className="flex flex-col gap-4 items-center justify-center w-32 flex-shrink-0">
                <img src={btnRegar.src} alt="Regar" className="w-16 h-16 object-contain" />
                <img src={btnIluminar.src} alt="Iluminar" className="w-16 h-16 object-contain" />
                <img src={btnAbonar.src} alt="Abonar" className="w-16 h-16 object-contain" />
              </div>
              <div className="flex flex-col gap-4 flex-1 w-full justify-center text-[#5c3e21]">
                <h3 className="text-2xl font-black text-[#4e341b] uppercase">Cuidar a tu Planta</h3>
                <p className="font-medium text-lg leading-relaxed">
                  Usa los botones de la derecha para gastar los recursos de tu inventario en la planta activa.
                </p>
                <ul className="list-disc pl-6 space-y-2 font-medium text-lg">
                  <li><strong>Regar e Iluminar:</strong> Mantienen la salud de la planta. Si llegan a 0, la planta muere.</li>
                  <li><strong>Abonar:</strong> Agrega nutrientes necesarios para que tu planta crezca.</li>
                </ul>
              </div>
            </div>

            {/* Evolución */}
            <div className="flex flex-col gap-6 items-center w-full bg-[#fff9eb] border-4 border-[#8B4513] p-6 rounded-3xl shadow-sm">
              <h3 className="text-2xl font-black text-[#4e341b] uppercase w-full">Evolución</h3>
              <div className="flex w-full justify-center">
                <img src={imgEvolucion.src} alt="Evolucion" className="w-[90%] max-w-[600px] h-auto object-contain drop-shadow-xl" />
              </div>
              <div className="flex flex-col gap-4 flex-1 w-full text-[#5c3e21]">
                <p className="font-medium text-lg leading-relaxed">
                  Tu planta tiene diferentes fases de crecimiento. Para que evolucione a la siguiente etapa, debes llenar por completo sus requerimientos de recursos:
                </p>
                <ul className="list-disc pl-6 space-y-2 font-medium text-lg">
                  <li>Llenar la barra de <strong className="text-blue-600">Agua</strong>.</li>
                  <li>Llenar la barra de <strong className="text-yellow-600">Sol</strong>.</li>
                  <li>Llenar el medidor de <strong className="text-[#8B4513]">Abono</strong>.</li>
                </ul>
                <p className="font-medium text-lg leading-relaxed mt-2">
                  ¡Sigue cuidándola hasta que alcance su forma final y se convierta en un <strong className="text-emerald-700">Ent inmortal</strong>!
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
