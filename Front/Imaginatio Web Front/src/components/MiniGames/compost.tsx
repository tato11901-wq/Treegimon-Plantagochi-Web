import { useState, useEffect, useCallback } from "preact/hooks"
import { isCompostGameOpen, syncUserState } from "../../store/resourceStore"
import { startMinigame, endMinigame } from "../../store/apiClient"
import panelComposta from "../../assets/Recursos web media/Panel_Composta.png"

// Import assets
import inorganicoBasura from "../../assets/Recursos web media/Inorganico_Basura.png"
import inorganicoLata from "../../assets/Recursos web media/Inorganico_Lata.png"
import inorganicoVidrio from "../../assets/Recursos web media/Inorganico_Vidrio.png"
import organicoBanana from "../../assets/Recursos web media/Organico_Banana.png"
import organicoHoja from "../../assets/Recursos web media/Organico_Hoja.png"
import organicoManzana from "../../assets/Recursos web media/Organico_Manzana.png"

const itemImages: Record<number, any> = {
  1: organicoBanana,
  2: organicoManzana,
  3: organicoHoja,    // Fallback huevo -> hoja
  9: organicoHoja,
  10: organicoManzana, // Fallback flores -> manzana
  4: inorganicoBasura, // Vaso -> Basura
  5: inorganicoBasura, // Pila -> Basura
  6: inorganicoLata,   // Clip -> Lata
  7: inorganicoBasura, // Bolsa -> Basura
  8: inorganicoLata,   // Lata -> Lata
  11: inorganicoVidrio // Vidrio -> Vidrio
}

type GameState = "loading" | "idle" | "playing" | "submitting" | "won" | "lost"

export default function Compost() {
  const [items, setItems] = useState<any[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(3)
  const [gameState, setGameState] = useState<GameState>("idle")
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  // Solo renderiza si el estado global indica que está abierto
  if (!isCompostGameOpen.value) return null

  // Iniciar sesión de juego en el backend
  const startGame = useCallback(async () => {
    setGameState("loading")
    setMessage("Iniciando sesión...")
    try {
      const res = await startMinigame("compost")
      setSessionToken(res.session_token)
      setItems(res.items)
      setTimeLeft(res.duration_seconds)
      setSelected([])
      setGameState("playing")
    } catch (err: any) {
      setMessage(err.message || "Error al iniciar el juego")
      setGameState("lost")
    }
  }, [])

  // Temporizador visual — se detiene automáticamente cuando gameState pasa a "submitting"
  useEffect(() => {
    if (gameState !== "playing") return

    if (timeLeft <= 0) {
      handleGameOver()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, gameState])

  const handleGameOver = async () => {
    // Guard: si ya se disparó por el timer Y el botón al mismo tiempo, ignorar segunda llamada
    if (gameState !== "playing") return
    setGameState("submitting")
    setMessage("Validando composta...")
    try {
      if (!sessionToken) throw new Error("No hay token de sesión")

      const res = await endMinigame(sessionToken, {
        selected_items: selected
      })

      syncUserState(res.user)

      if (res.reward > 0) {
        setMessage(`¡Excelente! Obtuviste ${res.reward} unidades de composta.`)
        setGameState("won")
      } else {
        setMessage("No se obtuvo composta. Asegúrate de seleccionar solo los orgánicos.")
        setGameState("lost")
      }
    } catch (err: any) {
      setMessage(err.message || "Error al validar el resultado")
      setGameState("lost")
    }
  }


  const handleSelect = (id: number) => {
    if (gameState !== "playing") return

    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((s) => s !== id)
      }
      return [...prev, id]
    })
  }

  const handleClose = () => {
    setGameState("idle")
    setSelected([])
    setTimeLeft(3)
    isCompostGameOpen.value = false
  }

  return (
    <main class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-sm">
      <section className="relative w-[600px] h-[600px] flex flex-col items-center justify-center p-12">
        {/* Fondo de Panel */}
        <div className="absolute inset-0 z-0">
          <img src={panelComposta.src} alt="Panel Composta" className="w-full h-full object-contain" />
        </div>

        {/* Contenido del juego */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-4 mt-6">
          {/* Botón cerrar */}
          <button
            onClick={handleClose}
            class="absolute -top-4 -right-4 bg-red-500 hover:bg-red-400 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg transition-transform active:scale-95"
            title="Cerrar"
          >
            X
          </button>

          {/* Pantalla de carga / validación */}
          {(gameState === "loading" || gameState === "submitting") && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-black font-bold text-center">{message}</span>
            </div>
          )}

          {/* Estado idle — pantalla de inicio */}
          {gameState === "idle" && (
            <>
              <span class="text-black text-center text-xl font-black uppercase tracking-tight">
                🌱 Minijuego de Composta
              </span>
              <div className="bg-amber-100/50 p-4 rounded-xl border-2 border-amber-500/30">
                <p class="text-black text-center text-sm font-medium">
                  Selecciona <strong>SOLO</strong> los objetos orgánicos.<br />
                  Tienes 3 segundos. ¡Mucha suerte!
                </p>
              </div>
              <button
                onClick={startGame}
                class="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-10 rounded-xl shadow-lg transition transform hover:-translate-y-1 active:translate-y-0"
              >
                ¡Empezar!
              </button>
            </>
          )}

          {/* Estado playing — juego activo */}
          {gameState === "playing" && (
            <>
              <div className="flex justify-between items-center w-full px-2">
                <span class="text-black text-center font-bold bg-amber-200/80 px-3 py-1 rounded-lg border border-amber-500">
                  ⏱️ {timeLeft}s
                </span>
                <span className="text-black font-black text-sm uppercase">Selecciona los orgánicos</span>
                <span class="text-black text-center font-bold bg-green-200/80 px-3 py-1 rounded-lg border border-green-500">
                  ✅ {selected.length}
                </span>
              </div>

              <div class="grid grid-cols-4 gap-3 p-2 rounded-2xl">
                {items.map((item) => {
                  const isSelected = selected.includes(item.id)
                  const imgAsset = itemImages[item.id]
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      class={`
                        w-20 h-20 rounded-xl flex items-center justify-center p-2
                        transition-all duration-150 cursor-pointer select-none
                        ${isSelected
                          ? "bg-green-400/80 border-4 border-green-700 scale-95 shadow-inner"
                          : "bg-white/40 border-2 border-amber-800/50 hover:scale-105 hover:bg-white/60 shadow-md"
                        }
                      `}
                      title={item.name}
                    >
                      {imgAsset ? (
                        <img src={imgAsset.src} alt={item.name} className="w-full h-full object-contain pointer-events-none" />
                      ) : (
                        <span className="text-3xl">{item.emoji}</span>
                      )}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={handleGameOver}
                className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-2 rounded-xl mt-2 shadow-md transition"
              >
                ¡Terminé!
              </button>
            </>
          )}

          {/* Pantallas de resultado */}
          {(gameState === "won" || gameState === "lost") && (
            <div className="flex flex-col items-center gap-6 py-4">
              <span class={`text-center text-3xl font-black drop-shadow-sm ${gameState === "won" ? "text-green-800" : "text-red-700"}`}>
                {gameState === "won" ? "¡EXCELENTE!" : "¡SIGUE INTENTANDO!"}
              </span>
              <p class="text-black text-center font-medium bg-white/40 p-4 rounded-xl border border-white/60">
                {message}
              </p>
              <div class="flex gap-4">
                <button
                  onClick={handleClose}
                  class="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-10 rounded-xl shadow-md transition transform active:scale-95"
                >
                  Listo
                </button>
              </div>
            </div>
          )}

        </div>
      </section>
    </main>
  )
}
