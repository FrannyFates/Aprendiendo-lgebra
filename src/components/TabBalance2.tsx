import React, { useState, useEffect, useCallback } from 'react';
import { Balance2Exercise } from '../types.ts';
import { NumberPicker } from './NumberPicker.tsx';
import { audio } from './AudioEngine.ts';
import { triggerCelebration } from './CelebrationEffects.tsx';
import { Scale, ArrowRight, Sparkles, RotateCcw, CheckCircle2 } from 'lucide-react';

interface TabBalance2Props {
  exercise: Balance2Exercise;
  levelIndex: number;
  totalLevels: number;
  studentName?: string;
  onExerciseComplete: () => void;
  setCanelitaMsg: (msg: string) => void;
}

export const TabBalance2: React.FC<TabBalance2Props> = ({
  exercise,
  levelIndex,
  totalLevels,
  studentName = 'Rachel',
  onExerciseComplete,
  setCanelitaMsg
}) => {
  const [state, setState] = useState({
    ...exercise,
    den: exercise.den || 1,
    phase: exercise.c === 0 ? 2 : 1
  });

  const [op, setOp] = useState<'sub' | 'add' | 'mul' | 'div' | ''>('');
  // Initialize to 0 so the student decides which number to apply!
  const [val, setVal] = useState<number>(0);

  // When X is isolated, student must find and enter X
  const [isIsolated, setIsIsolated] = useState<boolean>(false);
  const [studentGuessX, setStudentGuessX] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [guessError, setGuessError] = useState<boolean>(false);

  const resetToStart = useCallback(() => {
    const initPhase = exercise.c === 0 ? 2 : 1;
    setState({
      ...exercise,
      den: exercise.den || 1,
      phase: initPhase
    });
    setOp(''); // Do not auto-select operation: student chooses freely!
    setVal(0);
    setIsIsolated(false);
    setStudentGuessX(0);
    setIsCompleted(false);
    setHasError(false);
    setGuessError(false);

    if (initPhase === 1) {
      const msg = "Paso 1: ¿Qué operación y qué número aplicas para quitar el número suelto?";
      setCanelitaMsg(msg);
      if (levelIndex === 0) audio.hablar(msg);
    } else {
      const msg = "Paso 2: ¿Qué operación y número necesitas para dejar una sola X?";
      setCanelitaMsg(msg);
      if (levelIndex === 0) audio.hablar(msg);
    }
  }, [exercise, levelIndex, setCanelitaMsg]);

  useEffect(() => {
    resetToStart();
  }, [resetToStart]);

  const handleApply = useCallback(() => {
    if (isCompleted || isIsolated) return;

    if (!op) {
      setHasError(true);
      audio.play8Bit('err');
      setCanelitaMsg("Primero debes elegir qué operación vas a aplicar (Sumar, Restar, Multiplicar o Dividir).");
      setTimeout(() => setHasError(false), 800);
      return;
    }

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
    let nextDen = state.den;
    let nextPhase = state.phase;

    if (nextPhase === 1) {
      // Phase 1: eliminate constant
      if (op === 'sub') {
        nextC -= val;
        nextR -= val;
      } else if (op === 'add') {
        nextC += val;
        nextR += val;
      } else {
        // If multiplied or divided during constant elimination phase
        setHasError(true);
        audio.play8Bit('err');
        setCanelitaMsg("Para quitar un número suelto sumando o restando, debes sumar o restar a ambos lados.");
        setTimeout(() => setHasError(false), 800);
        return;
      }

      if (nextC === 0) {
        nextPhase = 2;
        audio.play8Bit('step');
        setVal(0); // Reset picker so student chooses phase 2 number
        setOp(''); // Student chooses phase 2 operation by herself!
        const msg = "¡Bien! Eliminaste el número suelto. Ahora Paso 2: ¿Qué operación y qué número aplicas para despejar la X?";
        setCanelitaMsg(msg);
        audio.hablar("¡Bien! Ahora despeja la incógnita.");
      } else {
        setHasError(true);
        audio.play8Bit('err');
        setCanelitaMsg("Intenta elegir la operación y número que deje el lado izquierdo sin números sueltos.");
        setTimeout(() => setHasError(false), 800);
      }
    } else {
      // Phase 2: eliminate coefficient or denominator
      if (op === 'div') {
        nextX = Math.round(nextX / val);
        nextR = Math.round(nextR / val);
      } else if (op === 'mul') {
        nextR *= val;
        nextDen = Math.round(nextDen / val);
      } else {
        setHasError(true);
        audio.play8Bit('err');
        setCanelitaMsg(state.ty === 'f' ? "Para quitar la división de la X, debes multiplicar a ambos lados." : "Para quitar el número que multiplica a la X, debes dividir a ambos lados.");
        setTimeout(() => setHasError(false), 800);
        return;
      }

      if ((nextX === 1 && nextC === 0) || (state.ty === 'f' && nextDen === 1 && nextC === 0)) {
        setIsIsolated(true);
        setHasError(false);
        audio.play8Bit('step');
        const msg = "¡Excelente! La X quedó despejada en la balanza. Observa el plato derecho: ¿Cuánto vale X?";
        setCanelitaMsg(msg);
        audio.hablar(msg);
      } else {
        setHasError(true);
        audio.play8Bit('err');
        setCanelitaMsg("Revisa la operación para dejar exactamente una X solita.");
        setTimeout(() => setHasError(false), 800);
      }
    }

    setState({
      ...state,
      x: nextX,
      c: nextC,
      r: nextR,
      den: nextDen,
      phase: nextPhase
    });
  }, [isCompleted, isIsolated, val, op, state, setCanelitaMsg]);

  // When X is isolated, verify the student's deduction
  const handleVerifyGuess = useCallback(() => {
    if (studentGuessX === state.r) {
      setIsCompleted(true);
      setGuessError(false);
      audio.play8Bit('win');
      triggerCelebration();

      const isFirst = levelIndex === 0;
      const isLast = levelIndex === totalLevels - 1;

      if (isFirst) {
        const winMsg = `✨ ¡Excelente procedimiento! Cancelaste los términos y despejaste la incógnita paso a paso. X = ${state.r} ✨`;
        setCanelitaMsg(winMsg);
        audio.hablar("¡Excelente procedimiento! Cancelaste los términos y despejaste la incógnita paso a paso.");
      } else if (isLast) {
        const winMsg = `✨ ¡Felicitaciones ${studentName}! Completaste la balanza pro. X = ${state.r} ✨`;
        setCanelitaMsg(winMsg);
        audio.hablar(`¡Felicitaciones ${studentName}! Has dominado el procedimiento completo: primero cancelaste los números sueltos y luego dividiste o multiplicaste para despejar la incógnita.`);
      } else {
        const shortPhrases = ["¡Muy bien!", "¡Excelente!", "¡Así se hace!"];
        const phrase = shortPhrases[(levelIndex - 1) % shortPhrases.length];
        setCanelitaMsg(`✨ ${phrase} X = ${state.r} ✨`);
        audio.hablar(phrase);
      }
    } else {
      setGuessError(true);
      audio.play8Bit('err');
      setCanelitaMsg("Cuenta cuántos bloques hay en el plato derecho de la balanza.");
      audio.hablar("Cuenta cuántos bloques hay en el plato derecho.");
      setTimeout(() => setGuessError(false), 800);
    }
  }, [studentGuessX, state.r, levelIndex, totalLevels, studentName, setCanelitaMsg]);

  // Handle proceeding to next exercise with guard against multiple clicks
  const handleProceedNext = useCallback(() => {
    setIsCompleted(false);
    onExerciseComplete();
  }, [onExerciseComplete]);

  // Support Enter key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (isCompleted) {
          handleProceedNext();
        } else if (isIsolated) {
          handleVerifyGuess();
        } else {
          handleApply();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCompleted, isIsolated, handleApply, handleVerifyGuess, handleProceedNext]);

  // Format equation
  const xPart = state.ty === 'f' && state.den > 1 ? `x/${state.den}` : state.x === 1 ? 'x' : `${state.x}x`;
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
            {state.ty === 'f' && state.den > 1 ? (
              <div className="w-16 h-8 bg-purple-100 border-2 border-dashed border-purple-600 text-purple-800 font-bold text-sm rounded flex items-center justify-center">
                x/{state.den}
              </div>
            ) : (
              Array.from({ length: Math.max(0, state.x) }).map((_, j) => (
                <div
                  key={`p4-x-${j}`}
                  className="w-14 h-8 bg-purple-600 text-white font-bold text-sm rounded-lg flex items-center justify-center shadow-sm"
                >
                  x
                </div>
              ))
            )}

            {Array.from({ length: Math.abs(state.c) }).map((_, j) => (
              <div
                key={`p4-c-${j}`}
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
                key={`p4-r-${j}`}
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

      {/* STAGE 1: Student manipulates balance */}
      {!isIsolated && !isCompleted && (
        <div
          className={`w-full bg-white rounded-2xl p-5 border-3 shadow-md flex flex-col items-center gap-4 transition-all ${
            hasError ? 'border-rose-500 bg-rose-50/50 animate-shake' : 'border-purple-200'
          }`}
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-purple-100 text-purple-900 font-extrabold text-sm md:text-base border border-purple-300">
            {state.phase === 1
              ? 'Paso 1: Quita el número que acompaña a la X'
              : 'Paso 2: Despeja la X totalmente'}
          </div>

          <div className="flex flex-col items-center gap-3 w-full">
            <div className="text-xs font-black text-purple-900 uppercase tracking-wider">
              1. Selecciona la operación que deseas aplicar:
            </div>

            {/* 4 Interactive Operation Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-lg">
              {[
                { id: 'add', label: 'Sumar (+)', icon: '➕', color: 'border-emerald-400 bg-emerald-50 text-emerald-950 hover:bg-emerald-100 active:bg-emerald-200' },
                { id: 'sub', label: 'Restar (−)', icon: '➖', color: 'border-rose-400 bg-rose-50 text-rose-950 hover:bg-rose-100 active:bg-rose-200' },
                { id: 'mul', label: 'Multiplicar (×)', icon: '✖️', color: 'border-indigo-400 bg-indigo-50 text-indigo-950 hover:bg-indigo-100 active:bg-indigo-200' },
                { id: 'div', label: 'Dividir (÷)', icon: '➗', color: 'border-amber-400 bg-amber-50 text-amber-950 hover:bg-amber-100 active:bg-amber-200' },
              ].map(item => {
                const isSelected = op === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setOp(item.id as 'sub' | 'add' | 'mul' | 'div');
                      audio.play8Bit('step');
                    }}
                    className={`py-2.5 px-3 rounded-xl border-2 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                      isSelected
                        ? 'bg-purple-600 border-purple-800 text-white scale-103 shadow-md ring-2 ring-purple-300'
                        : `${item.color} opacity-85 hover:opacity-100`
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 w-full mt-1">
              <span className="text-xs font-black text-purple-900 uppercase tracking-wider">
                2. Número a aplicar:
              </span>
              <NumberPicker
                id="v4-input"
                value={val}
                onChange={setVal}
                min={0}
                max={30}
              />
            </div>
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

      {/* STAGE 2: X is isolated! Rachel deduces and writes X */}
      {isIsolated && !isCompleted && (
        <div
          className={`w-full bg-amber-50/90 rounded-2xl p-6 border-3 shadow-md flex flex-col items-center gap-4 transition-all animate-fade-in ${
            guessError ? 'border-rose-500 bg-rose-50 animate-shake' : 'border-amber-400'
          }`}
        >
          <div className="flex items-center gap-2 text-amber-900 font-black text-lg md:text-xl text-center">
            <Sparkles className="w-6 h-6 text-amber-500 animate-spin" />
            ¡La X quedó completamente despejada!
          </div>

          <p className="text-slate-700 font-bold text-center text-base">
            Observa el plato derecho de la balanza. ¿Cuánto vale X?
          </p>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-purple-900 font-mono">X =</span>
            <NumberPicker
              id="guess-x4-input"
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
              ? `¡FELICITACIONES ${studentName.toUpperCase()}!`
              : levelIndex === 0
              ? '¡EXCELENTE PROCEDIMIENTO!'
              : '¡MUY BIEN!'}
          </div>

          <p className="text-emerald-700 text-center font-extrabold text-lg">
            {levelIndex === totalLevels - 1
              ? `¡Completaste los 10 ejercicios! Aprendiste el procedimiento de dos pasos: eliminar constantes y despejar la incógnita. ¡X = ${state.r}!`
              : levelIndex === 0
              ? `¡Completaste ambos pasos con un procedimiento impecable y encontraste que X = ${state.r}!`
              : `¡Completaste ambos pasos y encontraste que X = ${state.r}!`}
          </p>

          <button
            type="button"
            onClick={handleProceedNext}
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
