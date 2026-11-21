import React, { useState, useEffect, useCallback } from 'react';
import { Balance1Exercise } from '../types.ts';
import { NumberPicker } from './NumberPicker.tsx';
import { audio } from './AudioEngine.ts';
import { triggerCelebration } from './CelebrationEffects.tsx';
import { Scale, ArrowRight, Sparkles, RotateCcw, CheckCircle2 } from 'lucide-react';

interface TabBalance1Props {
  exercise: Balance1Exercise;
  levelIndex: number;
  totalLevels: number;
  studentName?: string;
  onExerciseComplete: () => void;
  setCanelitaMsg: (msg: string) => void;
}

export const TabBalance1: React.FC<TabBalance1Props> = ({
  exercise,
  levelIndex,
  totalLevels,
  studentName = 'Rachel',
  onExerciseComplete,
  setCanelitaMsg
}) => {
  const [state, setState] = useState<Balance1Exercise>({ ...exercise });
  const [op, setOp] = useState<'sub' | 'add' | 'mul' | 'div'>('sub');
  // Initialize to 0 so the student must choose the number themselves!
  const [val, setVal] = useState<number>(0);

  // When x is isolated on the balance scale, the student must deduce and enter the value of X
  const [isIsolated, setIsIsolated] = useState<boolean>(false);
  const [studentGuessX, setStudentGuessX] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [guessError, setGuessError] = useState<boolean>(false);

  // Reset state when exercise changes
  const resetToStart = useCallback(() => {
    setState({ ...exercise });
    setOp('sub');
    setVal(0);
    setIsIsolated(false);
    setStudentGuessX(0);
    setIsCompleted(false);
    setHasError(false);
    setGuessError(false);

    const introMsg =
      "Queremos dejar a la X solita en su plato. ¿Qué operación y qué número debemos aplicar a ambos lados?";
    setCanelitaMsg(introMsg);
    if (levelIndex === 0) {
      audio.hablar(introMsg);
    }
  }, [exercise, levelIndex, setCanelitaMsg]);

  useEffect(() => {
    resetToStart();
  }, [resetToStart]);

  // Apply chosen operation to both pans of the balance
  const handleApply = useCallback(() => {
    if (isCompleted || isIsolated) return;

    if (val === 0) {
      setHasError(true);
      audio.play8Bit('err');
      setCanelitaMsg("Elige un número mayor que 0 para aplicar a la balanza.");
      setTimeout(() => setHasError(false), 800);
      return;
    }

    let nextX = state.x;
    let nextC = state.c;
    let nextR = state.r;
    let nextIsD = state.isD;

    if (op === 'sub') {
      nextC -= val;
      nextR -= val;
    } else if (op === 'add') {
      nextC += val;
      nextR += val;
    } else if (op === 'mul') {
      nextX *= val;
      nextC *= val;
      nextR *= val;
      nextIsD = false;
    } else if (op === 'div') {
      nextX = Math.round(nextX / val);
      nextC = Math.round(nextC / val);
      nextR = Math.round(nextR / val);
    }

    const nextState = { x: nextX, c: nextC, r: nextR, isD: nextIsD };
    setState(nextState);

    // Check if x is isolated (x === 1, c === 0)
    if (nextX === 1 && nextC === 0) {
      setIsIsolated(true);
      setHasError(false);
      audio.play8Bit('step');
      const msg = "¡Genial! La X quedó sola en el plato izquierdo. Observa el plato derecho: ¿Cuánto vale X?";
      setCanelitaMsg(msg);
      audio.hablar(msg);
    } else if (Math.abs(nextC) < Math.abs(state.c)) {
      // Made progress towards 0
      audio.play8Bit('step');
      setCanelitaMsg("¡Buen paso! La balanza se simplificó. ¿Qué operación aplicas ahora para despejar la X?");
    } else {
      // Increased distance or went negative
      setHasError(true);
      audio.play8Bit('err');
      setCanelitaMsg("¡Atenta! Esa operación no canceló el número. Recuerda usar la operación contraria (o pulsa Reiniciar).");
      setTimeout(() => setHasError(false), 800);
    }
  }, [isCompleted, isIsolated, val, op, state, setCanelitaMsg]);

  // When X is isolated, student submits their deduction of X
  const handleVerifyGuess = useCallback(() => {
    if (studentGuessX === state.r) {
      setIsCompleted(true);
      setGuessError(false);
      audio.play8Bit('win');
      triggerCelebration();

      const isFirst = levelIndex === 0;
      const isLast = levelIndex === totalLevels - 1;

      if (isFirst) {
        const winMsg = `✨ ¡Muy buen procedimiento! Mantuviste el equilibrio y despejaste la incógnita paso a paso. X = ${state.r} ✨`;
        setCanelitaMsg(winMsg);
        audio.hablar("¡Muy buen procedimiento! Mantuviste el equilibrio y despejaste la incógnita paso a paso.");
      } else if (isLast) {
        const winMsg = `✨ ¡Felicitaciones ${studentName}! Completaste la balanza en equilibrio. X = ${state.r} ✨`;
        setCanelitaMsg(winMsg);
        audio.hablar(`¡Felicitaciones ${studentName}! Has dominado el procedimiento de la balanza: aprendiste que para mantener el equilibrio se aplica la misma operación a ambos lados hasta despejar la incógnita.`);
      } else {
        const shortPhrases = ["¡Muy bien!", "¡Excelente!", "¡Así se hace!"];
        const phrase = shortPhrases[(levelIndex - 1) % shortPhrases.length];
        setCanelitaMsg(`✨ ${phrase} X = ${state.r} ✨`);
        audio.hablar(phrase);
      }
    } else {
      setGuessError(true);
      audio.play8Bit('err');
      setCanelitaMsg("Cuenta con atención los bloques que quedaron en el plato derecho.");
      audio.hablar("Cuenta los bloques que quedaron en el plato derecho.");
      setTimeout(() => setGuessError(false), 800);
    }
  }, [studentGuessX, state.r, levelIndex, totalLevels, setCanelitaMsg]);

  // Support Enter key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (isCompleted) {
          onExerciseComplete();
        } else if (isIsolated) {
          handleVerifyGuess();
        } else {
          handleApply();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCompleted, isIsolated, handleApply, handleVerifyGuess, onExerciseComplete]);

  // Format equation
  const xPart = state.isD ? 'x/?' : state.x === 1 ? 'x' : `${state.x}x`;
  const cPart = state.c > 0 ? `+ ${state.c}` : state.c < 0 ? `- ${Math.abs(state.c)}` : '';
  const formulaStr = `${xPart} ${cPart} = ${state.r}`;

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      {/* Current Equation Display */}
      <div className="w-full bg-amber-50/80 border-3 border-dashed border-pink-400 rounded-3xl p-5 text-center mb-5 shadow-sm">
        <div className="text-3xl md:text-4xl font-black text-purple-800 tracking-wide font-mono">
          {formulaStr}
        </div>
      </div>

      {/* Interactive Balance Graphic */}
      <div className="w-full bg-white border-3 border-purple-200 rounded-2xl p-6 mb-5 shadow-sm flex flex-col items-center">
        <div className="w-full flex justify-around items-end min-h-[120px] pb-2 border-b-6 border-amber-800">
          {/* Left Pan */}
          <div className="flex flex-wrap gap-1.5 max-w-[45%] justify-center items-end p-2 bg-amber-50/60 rounded-xl min-h-[55px] border-2 border-amber-200">
            {state.isD ? (
              <div className="w-16 h-8 bg-purple-100 border-2 border-dashed border-purple-600 text-purple-800 font-bold text-sm rounded flex items-center justify-center">
                x/?
              </div>
            ) : (
              Array.from({ length: Math.max(0, state.x) }).map((_, j) => (
                <div
                  key={`bx-${j}`}
                  className="w-14 h-8 bg-purple-600 text-white font-bold text-sm rounded-lg flex items-center justify-center shadow-sm"
                >
                  x
                </div>
              ))
            )}

            {Array.from({ length: Math.abs(state.c) }).map((_, j) => (
              <div
                key={`bc-${j}`}
                className={`w-8 h-8 font-bold text-xs rounded-lg flex items-center justify-center shadow-sm ${
                  state.c < 0
                    ? 'bg-rose-600 text-white border border-rose-700'
                    : 'bg-amber-300 text-amber-950 border border-amber-400'
                }`}
              >
                {state.c > 0 ? '1' : '-1'}
              </div>
            ))}
          </div>

          {/* Balance Scale Center Pivot */}
          <div className="flex flex-col items-center pb-1">
            <Scale className="w-8 h-8 text-amber-900" />
            <div className="text-2xl font-black text-amber-900">=</div>
          </div>

          {/* Right Pan */}
          <div className="flex flex-wrap gap-1.5 max-w-[45%] justify-center items-end p-2 bg-amber-50/60 rounded-xl min-h-[55px] border-2 border-amber-200">
            {Array.from({ length: Math.abs(state.r) }).map((_, j) => (
              <div
                key={`br-${j}`}
                className={`w-8 h-8 font-bold text-xs rounded-lg flex items-center justify-center shadow-sm ${
                  state.r < 0
                    ? 'bg-rose-600 text-white border border-rose-700'
                    : 'bg-amber-300 text-amber-950 border border-amber-400'
                }`}
              >
                {state.r > 0 ? '1' : '-1'}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STAGE 1: Student manipulates the balance to isolate X */}
      {!isIsolated && !isCompleted && (
        <div
          className={`w-full bg-white rounded-2xl p-5 border-3 shadow-md flex flex-col items-center gap-4 transition-all ${
            hasError ? 'border-rose-500 bg-rose-50/50 animate-shake' : 'border-purple-200'
          }`}
        >
          <div className="text-center font-bold text-purple-900 text-sm md:text-base">
            Elige qué operación y qué número aplicar a ambos lados:
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            <select
              value={op}
              onChange={e => setOp(e.target.value as 'sub' | 'add' | 'mul' | 'div')}
              className="text-base sm:text-lg font-bold text-purple-900 bg-purple-50 border-2 border-purple-300 rounded-xl py-2 px-3 focus:outline-none focus:border-purple-600 cursor-pointer"
            >
              <option value="sub">➖ Restar a ambos lados</option>
              <option value="add">➕ Sumar a ambos lados</option>
              <option value="mul">✖️ Multiplicar ambos lados</option>
              <option value="div">➗ Dividir ambos lados</option>
            </select>

            <NumberPicker
              id="v2-input"
              value={val}
              onChange={setVal}
              min={0}
              max={30}
            />
          </div>

          <div className="flex items-center gap-3 w-full max-w-md">
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-purple-700 hover:bg-purple-800 active:scale-98 text-white font-extrabold text-base sm:text-lg shadow-[0_5px_0_#581c87] cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              APLICAR A LA BALANZA ⚖️
            </button>

            <button
              type="button"
              onClick={resetToStart}
              title="Reiniciar ejercicio"
              className="py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-300 font-bold cursor-pointer transition-all flex items-center justify-center"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: X is isolated! Rachel must discover and enter what X equals */}
      {isIsolated && !isCompleted && (
        <div
          className={`w-full bg-amber-50/90 rounded-2xl p-6 border-3 shadow-md flex flex-col items-center gap-4 transition-all animate-fade-in ${
            guessError ? 'border-rose-500 bg-rose-50 animate-shake' : 'border-amber-400'
          }`}
        >
          <div className="flex items-center gap-2 text-amber-900 font-black text-lg md:text-xl text-center">
            <Sparkles className="w-6 h-6 text-amber-500 animate-spin" />
            ¡La X quedó sola en la balanza!
          </div>

          <p className="text-slate-700 font-bold text-center text-base">
            Observa el plato derecho. ¿Cuánto vale X?
          </p>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-purple-900 font-mono">X =</span>
            <NumberPicker
              id="guess-x-input"
              value={studentGuessX}
              onChange={setStudentGuessX}
              min={0}
              max={50}
            />
          </div>

          <div className="flex items-center gap-3 w-full max-w-md">
            <button
              type="button"
              onClick={handleVerifyGuess}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-lg shadow-[0_5px_0_#15803d] cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-6 h-6" />
              COMPROBAR VALOR DE X
            </button>

            <button
              type="button"
              onClick={resetToStart}
              title="Reiniciar ejercicio"
              className="py-3.5 px-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border-2 border-slate-300 font-bold cursor-pointer transition-all"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: Completed! Next level button */}
      {isCompleted && (
        <div className="w-full bg-emerald-50 rounded-2xl p-6 border-3 border-emerald-400 shadow-md flex flex-col items-center gap-4 animate-fade-in">
          <div className="flex items-center gap-2 text-emerald-800 font-black text-xl md:text-2xl text-center">
            <Sparkles className="w-7 h-7 text-amber-400 animate-spin" />
            {levelIndex === totalLevels - 1
              ? '¡FELICITACIONES RACHEL!'
              : levelIndex === 0
              ? '¡EXCELENTE PROCEDIMIENTO!'
              : '¡MUY BIEN!'}
          </div>

          <p className="text-emerald-700 text-center font-extrabold text-lg">
            {levelIndex === totalLevels - 1
              ? `¡Completaste los 10 ejercicios! Aprendiste que para despejar la incógnita debes aplicar la misma operación a ambos lados manteniendo la balanza en equilibrio. ¡X = ${state.r}!`
              : levelIndex === 0
              ? `¡Muy buen procedimiento! Mantuviste la balanza en equilibrio y descubriste que X = ${state.r}.`
              : `¡Descubriste el valor exacto manteniendo la balanza en equilibrio: X = ${state.r}!`}
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
