import React, { useState, useEffect, useCallback } from 'react';
import { DrawExercise } from '../types.ts';
import { audio } from './AudioEngine.ts';
import { triggerCelebration } from './CelebrationEffects.tsx';
import { CheckCircle2, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';

interface TabDrawProps {
  exercise: DrawExercise;
  levelIndex: number;
  totalLevels: number;
  studentName?: string;
  onExerciseComplete: () => void;
  setCanelitaMsg: (msg: string) => void;
}

export const TabDraw: React.FC<TabDrawProps> = ({
  exercise,
  levelIndex,
  totalLevels,
  studentName = 'Rachel',
  onExerciseComplete,
  setCanelitaMsg
}) => {
  const [userBlocks, setUserBlocks] = useState({
    x2: 0,
    x: 0,
    xd2: 0,
    xd3: 0,
    xd4: 0,
    u: 0
  });

  const [isCompleted, setIsCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setUserBlocks({ x2: 0, x: 0, xd2: 0, xd3: 0, xd4: 0, u: 0 });
    setIsCompleted(false);
    setHasError(false);
    const msg =
      levelIndex === 0
        ? `${studentName}, mira cómo lo hago yo: si el cartel dice X, pongo un bloque morado. ¡Hazlo tú!`
        : `Representa en el tablero: ${exercise.t}`;
    setCanelitaMsg(msg);
    if (levelIndex === 0) {
      audio.hablar(`${studentName}, si el cartel dice X, pongo un bloque morado. ¡Hazlo tú!`);
    }
  }, [exercise, levelIndex, studentName, setCanelitaMsg]);

  const addBlock = (key: keyof typeof userBlocks, val: number) => {
    if (isCompleted) return;
    audio.play8Bit('pop');
    setUserBlocks(prev => {
      const nextVal = prev[key] + val;
      // Don't allow large negative values except for allowed -x and -u
      if (key === 'x2' || key === 'xd2' || key === 'xd3' || key === 'xd4') {
        return { ...prev, [key]: Math.max(0, nextVal) };
      }
      return { ...prev, [key]: nextVal };
    });
  };

  const handleReset = () => {
    audio.play8Bit('pop');
    setUserBlocks({ x2: 0, x: 0, xd2: 0, xd3: 0, xd4: 0, u: 0 });
    setHasError(false);
  };

  const handleCheck = useCallback(() => {
    if (isCompleted) return;

    const match =
      userBlocks.x2 === exercise.x2 &&
      userBlocks.x === exercise.x &&
      userBlocks.xd2 === exercise.xd2 &&
      userBlocks.xd3 === exercise.xd3 &&
      userBlocks.xd4 === exercise.xd4 &&
      userBlocks.u === exercise.u;

    if (match) {
      setIsCompleted(true);
      setHasError(false);
      audio.play8Bit('win');
      triggerCelebration();

      const isFirst = levelIndex === 0;
      const isLast = levelIndex === totalLevels - 1;

      if (isFirst) {
        const msg = "✨ ¡Excelente procedimiento! Representaste cada término exactamente con su bloque correspondiente. ✨";
        const speech = "¡Excelente procedimiento! Representaste cada término exactamente con su bloque correspondiente.";
        setCanelitaMsg(msg);
        audio.hablar(speech);
      } else if (isLast) {
        const msg = `✨ ¡Felicitaciones ${studentName}! Completaste la sección aprendiendo a representar cada término con sus bloques. ✨`;
        const speech = `¡Felicitaciones ${studentName}! Has dominado el procedimiento: aprendiste a representar cada término algebraico asociando las variables y números con sus bloques correspondientes.`;
        setCanelitaMsg(msg);
        audio.hablar(speech);
      } else {
        const shortPhrases = ["¡Muy bien!", "¡Excelente!", "¡Así se hace!"];
        const phrase = shortPhrases[(levelIndex - 1) % shortPhrases.length];
        setCanelitaMsg(`✨ ${phrase} ✨`);
        audio.hablar(phrase);
      }
    } else {
      setHasError(true);
      audio.play8Bit('err');
      setCanelitaMsg("¡Casi! Compara tus bloques con la expresión.");
      setTimeout(() => setHasError(false), 800);
    }
  }, [userBlocks, exercise, isCompleted, setCanelitaMsg]);

  // Support Enter key to check or advance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (isCompleted) {
          onExerciseComplete();
        } else {
          handleCheck();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCompleted, handleCheck, onExerciseComplete]);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      {/* Expression Display */}
      <div className="w-full bg-amber-50/80 border-3 border-dashed border-pink-400 rounded-3xl p-5 text-center mb-5 shadow-sm">
        <div className="text-3xl md:text-4xl font-black text-purple-800 tracking-wide font-mono">
          {exercise.t}
        </div>
      </div>

      {/* Visual Canvas Area */}
      <div className="w-full min-h-[140px] bg-white border-3 border-purple-200 rounded-2xl flex flex-wrap items-center justify-center gap-2 p-5 mb-5 shadow-sm">
        {/* x² */}
        {Array.from({ length: userBlocks.x2 }).map((_, i) => (
          <div
            key={`x2-${i}`}
            className="w-16 h-16 bg-purple-700 text-white font-black text-base rounded-xl flex items-center justify-center shadow-md border-2 border-purple-900"
          >
            x²
          </div>
        ))}

        {/* Positive x */}
        {Array.from({ length: Math.max(0, userBlocks.x) }).map((_, i) => (
          <div
            key={`x-pos-${i}`}
            className="w-16 h-8 bg-purple-600 text-white font-bold text-sm rounded-lg flex items-center justify-center shadow-md border border-purple-800"
          >
            x
          </div>
        ))}

        {/* Negative -x */}
        {Array.from({ length: Math.abs(Math.min(0, userBlocks.x)) }).map((_, i) => (
          <div
            key={`x-neg-${i}`}
            className="w-16 h-8 bg-rose-600 text-white font-bold text-sm rounded-lg flex items-center justify-center shadow-md border border-rose-800"
          >
            -x
          </div>
        ))}

        {/* Fractions: x/2, x/3, x/4 */}
        {[
          { count: userBlocks.xd2, den: 2 },
          { count: userBlocks.xd3, den: 3 },
          { count: userBlocks.xd4, den: 4 }
        ].map(({ count, den }) =>
          Array.from({ length: count }).map((_, i) => (
            <div
              key={`frac-${den}-${i}`}
              className="inline-grid gap-0.5 border-2 border-dashed border-purple-600 p-1 rounded-lg bg-purple-50"
              style={{ gridTemplateColumns: `repeat(${den}, minmax(0, 1fr))` }}
            >
              <div className="w-8 h-8 bg-purple-600 text-white font-bold text-xs rounded flex items-center justify-center">
                x
              </div>
              {Array.from({ length: den - 1 }).map((__, dIdx) => (
                <div key={dIdx} className="w-8 h-8 border border-slate-300 rounded bg-white" />
              ))}
            </div>
          ))
        )}

        {/* Positive 1 */}
        {Array.from({ length: Math.max(0, userBlocks.u) }).map((_, i) => (
          <div
            key={`u-pos-${i}`}
            className="w-9 h-9 bg-amber-300 text-amber-950 font-bold text-sm rounded-lg flex items-center justify-center shadow-sm border border-amber-400"
          >
            1
          </div>
        ))}

        {/* Negative -1 */}
        {Array.from({ length: Math.abs(Math.min(0, userBlocks.u)) }).map((_, i) => (
          <div
            key={`u-neg-${i}`}
            className="w-9 h-9 bg-rose-600 text-white font-bold text-sm rounded-lg flex items-center justify-center shadow-sm border border-rose-800"
          >
            -1
          </div>
        ))}

        {userBlocks.x2 === 0 &&
          userBlocks.x === 0 &&
          userBlocks.xd2 === 0 &&
          userBlocks.xd3 === 0 &&
          userBlocks.xd4 === 0 &&
          userBlocks.u === 0 && (
            <span className="text-slate-400 font-medium text-sm italic">
              Haz clic en los botones de abajo para agregar bloques...
            </span>
          )}
      </div>

      {/* Button Controls */}
      {!isCompleted ? (
        <div
          className={`w-full bg-white rounded-2xl p-5 border-3 shadow-md flex flex-col items-center gap-4 transition-all ${
            hasError ? 'border-rose-500 bg-rose-50/50 animate-shake' : 'border-purple-200'
          }`}
        >
          <div className="flex flex-wrap gap-2 justify-center w-full">
            <button
              type="button"
              onClick={() => addBlock('x2', 1)}
              className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 active:scale-95 text-white font-bold rounded-xl shadow-[0_3px_0_#581c87] cursor-pointer text-sm md:text-base"
            >
              + x²
            </button>
            <button
              type="button"
              onClick={() => addBlock('x', 1)}
              className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 active:scale-95 text-white font-bold rounded-xl shadow-[0_3px_0_#581c87] cursor-pointer text-sm md:text-base"
            >
              + x
            </button>
            <button
              type="button"
              onClick={() => addBlock('u', 1)}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 active:scale-95 text-amber-950 font-bold rounded-xl shadow-[0_3px_0_#d97706] cursor-pointer text-sm md:text-base"
            >
              + 1
            </button>
            <button
              type="button"
              onClick={() => addBlock('x', -1)}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold rounded-xl shadow-[0_3px_0_#9f1239] cursor-pointer text-sm md:text-base"
            >
              - x
            </button>
            <button
              type="button"
              onClick={() => addBlock('u', -1)}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold rounded-xl shadow-[0_3px_0_#9f1239] cursor-pointer text-sm md:text-base"
            >
              - 1
            </button>
          </div>

          <div className="flex flex-wrap gap-2 justify-center w-full">
            <button
              type="button"
              onClick={() => addBlock('xd2', 1)}
              className="px-3.5 py-2 bg-sky-100 hover:bg-sky-200 active:scale-95 text-sky-800 font-bold rounded-xl border border-sky-300 shadow-[0_3px_0_#bae6fd] cursor-pointer text-sm"
            >
              + x/2
            </button>
            <button
              type="button"
              onClick={() => addBlock('xd3', 1)}
              className="px-3.5 py-2 bg-sky-100 hover:bg-sky-200 active:scale-95 text-sky-800 font-bold rounded-xl border border-sky-300 shadow-[0_3px_0_#bae6fd] cursor-pointer text-sm"
            >
              + x/3
            </button>
            <button
              type="button"
              onClick={() => addBlock('xd4', 1)}
              className="px-3.5 py-2 bg-sky-100 hover:bg-sky-200 active:scale-95 text-sky-800 font-bold rounded-xl border border-sky-300 shadow-[0_3px_0_#bae6fd] cursor-pointer text-sm"
            >
              + x/4
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 bg-slate-500 hover:bg-slate-600 active:scale-95 text-white font-bold rounded-xl shadow-[0_3px_0_#334155] cursor-pointer text-sm flex items-center gap-1"
              title="Reiniciar bloques"
            >
              <RotateCcw className="w-4 h-4" />
              Borrar
            </button>
          </div>

          <button
            type="button"
            onClick={handleCheck}
            className="w-full max-w-sm mt-1 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-lg shadow-[0_5px_0_#15803d] cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            REVISAR DIBUJO ✅
          </button>
        </div>
      ) : (
        <div className="w-full bg-emerald-50 rounded-2xl p-6 border-3 border-emerald-400 shadow-md flex flex-col items-center gap-4 animate-fade-in">
          <div className="flex items-center gap-2 text-emerald-800 font-black text-xl md:text-2xl text-center">
            <Sparkles className="w-7 h-7 text-amber-400 animate-spin" />
            {levelIndex === totalLevels - 1
              ? '¡FELICITACIONES RACHEL!'
              : levelIndex === 0
              ? '¡EXCELENTE PROCEDIMIENTO!'
              : '¡MUY BIEN!'}
          </div>

          <p className="text-emerald-700 text-center font-medium">
            {levelIndex === totalLevels - 1
              ? '¡Completaste los 10 ejercicios! Aprendiste el procedimiento para representar variables y constantes con sus bloques.'
              : levelIndex === 0
              ? '¡Excelente procedimiento! Cada bloque coincide exactamente con los términos de la expresión.'
              : '¡Continúa con el siguiente ejercicio!'}
          </p>

          <button
            type="button"
            onClick={onExerciseComplete}
            className="w-full max-w-md py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xl shadow-[0_6px_0_#15803d] cursor-pointer transition-all flex items-center justify-center gap-3 animate-pulse"
          >
            <span>
              {levelIndex < totalLevels - 1 ? 'Siguiente Ejercicio ➡️' : '¡Finalizar Sección! 🌟'}
            </span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};
