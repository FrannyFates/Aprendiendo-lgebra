import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ManipulativeExercise } from '../types.ts';
import { NumberPicker } from './NumberPicker.tsx';
import { audio } from './AudioEngine.ts';
import { triggerCelebration } from './CelebrationEffects.tsx';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  MoveRight,
  Plus,
  Minus,
  Trash2,
  MousePointerClick,
  Layers,
  Scale,
  HelpCircle
} from 'lucide-react';

interface TabManipulativeProps {
  exercise: ManipulativeExercise;
  levelIndex: number;
  totalLevels: number;
  studentName?: string;
  onExerciseComplete: () => void;
  setCanelitaMsg: (msg: string) => void;
}

export const TabManipulative: React.FC<TabManipulativeProps> = ({
  exercise,
  levelIndex,
  totalLevels,
  studentName = 'Rachel',
  onExerciseComplete,
  setCanelitaMsg
}) => {
  // Phase 1: Constant cancellation (Sumar arrastrando al centro o Restar arrastrando hacia afuera)
  // Phase 2: Variable isolation (Dividir agrupando con el mouse o Multiplicar haciendo clic)
  // Phase 3: Final deduction of X
  const [phase, setPhase] = useState<1 | 2 | 3>(exercise.c === 0 ? 2 : 1);

  // Current values
  const [currentC, setCurrentC] = useState<number>(exercise.c);
  const [currentR, setCurrentR] = useState<number>(exercise.r);

  // Multiplication state for fraction exercises:
  // Left side: clicks on X figure.
  // Right side: adds unit blocks until indicating the multiplication result!
  const [multClicksLeft, setMultClicksLeft] = useState<number>(0);
  const [multRightBlocks, setMultRightBlocks] = useState<number>(exercise.r);
  const [baseR, setBaseR] = useState<number>(exercise.r);
  const [isMultiplied, setIsMultiplied] = useState<boolean>(false);

  // Grouping state for division exercises
  // baskets[basketIndex] = count of unit items in this basket
  const [baskets, setBaskets] = useState<number[]>([]);
  const [unassignedBlocks, setUnassignedBlocks] = useState<number>(0);

  // Deduction state - Rachel writes her answer directly!
  const [inputStr, setInputStr] = useState<string>('');
  const [studentGuessX, setStudentGuessX] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [guessError, setGuessError] = useState<boolean>(false);

  // Dragging state
  const [isDraggingFromSupply, setIsDraggingFromSupply] = useState<boolean>(false);
  const [isDraggingToOutside, setIsDraggingToOutside] = useState<boolean>(false);

  // Initialize and Reset
  const resetExercise = useCallback(() => {
    const initPhase = exercise.c === 0 ? 2 : 1;
    setPhase(initPhase);
    setCurrentC(exercise.c);
    setCurrentR(exercise.r);
    setIsMultiplied(false);
    setMultClicksLeft(0);
    const initialBaseR = exercise.c === 0
      ? exercise.r
      : exercise.c > 0
      ? exercise.r - exercise.c
      : exercise.r + Math.abs(exercise.c);
    setBaseR(initialBaseR);
    setMultRightBlocks(initialBaseR);
    setInputStr('');
    setStudentGuessX(0);
    setIsCompleted(false);
    setGuessError(false);

    if (exercise.ty === 'm') {
      // Grouping: baskets initialized to 0, all units in unassigned
      const targetR = exercise.c === 0 ? exercise.r : exercise.r - exercise.c;
      setBaskets(new Array(exercise.xCount).fill(0));
      setUnassignedBlocks(targetR);
    } else {
      setBaskets([]);
      setUnassignedBlocks(0);
    }

    if (initPhase === 1) {
      if (exercise.c > 0) {
        const msg = `Paso 1: Cancela la constante en el lado izquierdo y equilibra el lado derecho.`;
        setCanelitaMsg(msg);
        if (levelIndex === 0) audio.hablar(msg);
      } else {
        const msg = `Paso 1: Neutraliza la resta en el lado izquierdo y equilibra el lado derecho.`;
        setCanelitaMsg(msg);
        if (levelIndex === 0) audio.hablar(msg);
      }
    } else {
      if (exercise.ty === 'm') {
        const msg = `Paso 2: Distribuye las unidades equitativamente en los grupos de X.`;
        setCanelitaMsg(msg);
        if (levelIndex === 0) audio.hablar(msg);
      } else {
        const msg = `Paso 2: Multiplica en el lado izquierdo y equilibra el lado derecho agregando los bloques correspondientes.`;
        setCanelitaMsg(msg);
        if (levelIndex === 0) audio.hablar(msg);
      }
    }
  }, [exercise, levelIndex, setCanelitaMsg]);

  useEffect(() => {
    resetExercise();
  }, [resetExercise]);

  // Balance calculations for Phase 1
  const leftDelta = currentC - exercise.c;
  const rightDelta = currentR - exercise.r;
  const isBalanced = leftDelta === rightDelta;
  const isConstantCancelled = currentC === 0;

  // Phase 1: Left side - Subtract 1 from constant (eliminates +1)
  const handleSubtractOneLeft = useCallback(() => {
    if (phase !== 1) return;

    if (currentC <= 0) {
      audio.play8Bit('err');
      setCanelitaMsg(`Tienes un número negativo (${currentC}). Para neutralizar una resta debes sumar.`);
      return;
    }

    const nextC = currentC - 1;
    setCurrentC(nextC);
    audio.play8Bit('step');
    setCanelitaMsg('Quitaste 1 unidad a la izquierda. Recuerda equilibrar la derecha.');
  }, [phase, currentC, setCanelitaMsg]);

  // Phase 1: Left side - Add 1 to constant (neutralizes -1)
  const handleAddOneLeft = useCallback(() => {
    if (phase !== 1) return;

    if (currentC >= 0) {
      audio.play8Bit('err');
      setCanelitaMsg(`Tienes un número positivo (+${currentC}). Para cancelar una suma debes restar.`);
      return;
    }

    const nextC = currentC + 1;
    setCurrentC(nextC);
    audio.play8Bit('step');
    setCanelitaMsg('Agregaste 1 unidad a la izquierda. Recuerda equilibrar la derecha.');
  }, [phase, currentC, setCanelitaMsg]);

  // Phase 1: Right side - Rachel subtracts 1 block herself
  const handleSubtractOneRight = useCallback(() => {
    if (phase !== 1) return;
    if (currentR <= 0) {
      audio.play8Bit('err');
      return;
    }
    setCurrentR(prev => prev - 1);
    audio.play8Bit('step');
  }, [phase, currentR]);

  // Phase 1: Right side - Rachel adds 1 block herself
  const handleAddOneRight = useCallback(() => {
    if (phase !== 1) return;
    setCurrentR(prev => prev + 1);
    audio.play8Bit('step');
  }, [phase]);

  // Phase 1: Right side - Reset right side blocks
  const handleResetRight = useCallback(() => {
    if (phase !== 1) return;
    setCurrentR(exercise.r);
    audio.play8Bit('step');
  }, [phase, exercise.r]);

  // Auto-advance Phase 1 when constant is cancelled AND right side is balanced by Rachel
  useEffect(() => {
    if (phase === 1 && currentC === 0 && (currentC - exercise.c) === (currentR - exercise.r)) {
      const timer = setTimeout(() => {
        setPhase(2);
        audio.play8Bit('win');
        setBaseR(currentR);
        setMultRightBlocks(currentR);
        setMultClicksLeft(0);
        if (exercise.ty === 'm') {
          setBaskets(new Array(exercise.xCount).fill(0));
          setUnassignedBlocks(currentR);
          const msg = `¡Excelente! Cancelaste la constante manteniendo ambos lados en equilibrio. Ahora pasa al Paso 2.`;
          setCanelitaMsg(msg);
          audio.hablar(msg);
        } else {
          const msg = `¡Excelente! Cancelaste la constante manteniendo ambos lados en equilibrio. Ahora pasa al Paso 2.`;
          setCanelitaMsg(msg);
          audio.hablar(msg);
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [phase, currentC, currentR, exercise, setCanelitaMsg]);

  // Phase 2: Click to multiply Left Side
  const handleClickMultiplyLeft = useCallback(() => {
    if (phase !== 2 || exercise.ty !== 'f' || isMultiplied) return;
    const targetClicks = exercise.den || 2;
    setMultClicksLeft(targetClicks);
    audio.play8Bit('step');

    const msg = `¡Incógnita X multiplicada por ${targetClicks} y completada! Ahora equilibra el lado derecho agregando los bloques correspondientes.`;
    setCanelitaMsg(msg);
    audio.hablar(msg);
  }, [phase, exercise, isMultiplied, setCanelitaMsg]);

  // Phase 2: Right side - add/remove blocks for multiplication
  const handleAddBlockRight = useCallback(() => {
    if (phase !== 2 || exercise.ty !== 'f' || isMultiplied) return;
    setMultRightBlocks(prev => prev + 1);
    audio.play8Bit('step');
  }, [phase, exercise, isMultiplied]);

  const handleAddGroupRight = useCallback(() => {
    if (phase !== 2 || exercise.ty !== 'f' || isMultiplied) return;
    setMultRightBlocks(prev => prev + baseR);
    audio.play8Bit('step');
  }, [phase, exercise, isMultiplied, baseR]);

  const handleRemoveBlockRight = useCallback(() => {
    if (phase !== 2 || exercise.ty !== 'f' || isMultiplied) return;
    setMultRightBlocks(prev => Math.max(0, prev - 1));
    audio.play8Bit('step');
  }, [phase, exercise, isMultiplied]);

  const handleResetBlocksRight = useCallback(() => {
    if (phase !== 2 || exercise.ty !== 'f' || isMultiplied) return;
    setMultRightBlocks(baseR);
    audio.play8Bit('step');
  }, [phase, exercise, isMultiplied, baseR]);

  // Phase 2: Confirm multiplication result
  const handleConfirmMultiplication = useCallback(() => {
    if (phase !== 2 || exercise.ty !== 'f' || isMultiplied) return;
    const targetClicks = exercise.den || 2;
    const targetTotal = baseR * targetClicks;

    if (multRightBlocks !== targetTotal) {
      audio.play8Bit('err');
      const msg = `La cantidad de bloques en la derecha debe ser ${targetTotal} (${baseR} × ${targetClicks}). Revisa los bloques agregados.`;
      setCanelitaMsg(msg);
      audio.hablar('Revisa tu cálculo y ajusta los bloques en el lado derecho.');
      return;
    }

    // Auto-complete left side multiplication if student hasn't clicked it yet
    setMultClicksLeft(targetClicks);
    setIsMultiplied(true);
    setCurrentR(targetTotal);
    setPhase(3);
    audio.play8Bit('win');
    const msg = `¡Excelente! Has multiplicado y equilibrado ambos lados. Ahora deduce el valor de X.`;
    setCanelitaMsg(msg);
    audio.hablar(msg);
  }, [phase, exercise, isMultiplied, multRightBlocks, baseR, setCanelitaMsg]);

  // Phase 2: Add block to basket (grouping)
  const handleAssignToBasket = useCallback(
    (basketIdx: number) => {
      if (phase !== 2 || exercise.ty !== 'm' || unassignedBlocks <= 0) return;

      const newBaskets = [...baskets];
      newBaskets[basketIdx] += 1;
      const newUnassigned = unassignedBlocks - 1;

      setBaskets(newBaskets);
      setUnassignedBlocks(newUnassigned);
      audio.play8Bit('step');

      if (newUnassigned === 0) {
        const isEven = newBaskets.every(b => b === newBaskets[0]);

        if (isEven) {
          setPhase(3);
          audio.play8Bit('win');
          const msg = `¡Perfecto! Agrupaste las unidades equitativamente. Ahora escribe el valor de X.`;
          setCanelitaMsg(msg);
          audio.hablar(msg);
        } else {
          setCanelitaMsg('Los grupos no tienen la misma cantidad. Distribuye de forma equitativa para que cada X tenga lo mismo.');
          audio.hablar('Distribuye de forma equitativa para que cada X tenga lo mismo.');
        }
      }
    },
    [phase, exercise, unassignedBlocks, baskets, setCanelitaMsg]
  );

  // Phase 2: Remove block from basket and return to unassigned
  const handleRemoveFromBasket = useCallback(
    (basketIdx: number) => {
      if (phase !== 2 || exercise.ty !== 'm' || baskets[basketIdx] <= 0) return;

      const newBaskets = [...baskets];
      newBaskets[basketIdx] -= 1;
      const newUnassigned = unassignedBlocks + 1;

      setBaskets(newBaskets);
      setUnassignedBlocks(newUnassigned);
      audio.play8Bit('step');
    },
    [phase, exercise, unassignedBlocks, baskets]
  );

  // Phase 3: Check student's final deduction of X
  const handleCheckSolution = useCallback(
    (overrideVal?: number) => {
      const parsedInput = parseInt(inputStr, 10);
      const guessed =
        typeof overrideVal === 'number'
          ? overrideVal
          : studentGuessX || (!isNaN(parsedInput) ? parsedInput : 0);

      if (guessed === exercise.sol) {
        setIsCompleted(true);
        setGuessError(false);
        setStudentGuessX(exercise.sol);
        setInputStr(String(exercise.sol));
        audio.play8Bit('win');
        triggerCelebration();

        const isFirst = levelIndex === 0;
        const isLast = levelIndex === totalLevels - 1;

        if (isFirst) {
          const msg = `✨ ¡Excelente procedimiento! Cancelaste las constantes y manipulaste los grupos para despejar la incógnita. X = ${exercise.sol} ✨`;
          setCanelitaMsg(msg);
          audio.hablar("¡Excelente procedimiento! Cancelaste las constantes y manipulaste los grupos para despejar la incógnita.");
        } else if (isLast) {
          const msg = `✨ ¡Felicitaciones ${studentName}! Completaste la sección manipulativa. X = ${exercise.sol} ✨`;
          setCanelitaMsg(msg);
          audio.hablar(`¡Felicitaciones ${studentName}! Has dominado el procedimiento manipulativo: aprendiste a arrastrar al centro para sumar, hacia afuera para restar, hacer clic para multiplicar y agrupar para dividir.`);
        } else {
          const shortPhrases = ["¡Muy bien!", "¡Excelente!", "¡Así se hace!"];
          const phrase = shortPhrases[(levelIndex - 1) % shortPhrases.length];
          setCanelitaMsg(`✨ ${phrase} X = ${exercise.sol} ✨`);
          audio.hablar(phrase);
        }
      } else {
        setGuessError(true);
        audio.play8Bit('err');
        audio.hablar("Cuenta con atención las unidades que corresponden a una sola X.");
        setTimeout(() => setGuessError(false), 800);
      }
    },
    [studentGuessX, inputStr, exercise.sol, levelIndex, totalLevels, setCanelitaMsg]
  );

  // Keyboard Enter shortcut for rapid interaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (isCompleted) {
          onExerciseComplete();
        } else if (phase === 3) {
          handleCheckSolution();
        } else if (phase === 2 && exercise.ty === 'f') {
          handleConfirmMultiplication();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCompleted, phase, exercise, onExerciseComplete, handleCheckSolution, handleConfirmMultiplication]);

  // Split multiplication blocks into enclosed groups of size `baseR`
  const groupSize = Math.max(1, baseR);
  const multGroups: number[][] = [];
  for (let i = 0; i < multRightBlocks; i += groupSize) {
    const grp: number[] = [];
    const limit = Math.min(i + groupSize, multRightBlocks);
    for (let j = i; j < limit; j++) {
      grp.push(j);
    }
    multGroups.push(grp);
  }
  const completedGroupsCount = multGroups.filter(g => g.length === groupSize).length;

  return (
    <div className="w-full flex flex-col items-center max-w-4xl mx-auto px-2 sm:px-4">
      {/* Exercise Header & Progress */}
      <div className="w-full flex items-center justify-between mb-3 bg-white/90 backdrop-blur-sm p-3 rounded-2xl border-2 border-purple-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-purple-600 text-white font-black text-sm rounded-full">
            Nivel {levelIndex + 1} de {totalLevels}
          </span>
          <span className="text-xl sm:text-2xl font-black text-purple-950 font-mono tracking-wider">
            {exercise.title}
          </span>
        </div>

        <button
          onClick={resetExercise}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-colors border border-slate-300"
          title="Reiniciar ejercicio"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reiniciar</span>
        </button>
      </div>

      {/* Phase Indicator Steps */}
      <div className="w-full grid grid-cols-3 gap-2 mb-4 text-center">
        <div
          className={`p-2 rounded-xl text-xs sm:text-sm font-black border-2 transition-all ${
            phase === 1
              ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-sm scale-102'
              : phase > 1
              ? 'bg-emerald-100 border-emerald-400 text-emerald-900'
              : 'bg-slate-100 border-slate-300 text-slate-500'
          }`}
        >
          {phase > 1 ? '✓ ' : '1. '}
          Cancelar y equilibrar
        </div>

        <div
          className={`p-2 rounded-xl text-xs sm:text-sm font-black border-2 transition-all ${
            phase === 2
              ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-sm scale-102'
              : phase > 2
              ? 'bg-emerald-100 border-emerald-400 text-emerald-900'
              : 'bg-slate-100 border-slate-300 text-slate-500'
          }`}
        >
          {phase > 2 ? '✓ ' : '2. '}
          {exercise.ty === 'm' ? 'Agrupar para dividir' : 'Clic para multiplicar'}
        </div>

        <div
          className={`p-2 rounded-xl text-xs sm:text-sm font-black border-2 transition-all ${
            phase === 3
              ? 'bg-purple-100 border-purple-500 text-purple-900 shadow-sm scale-102 ring-2 ring-purple-300'
              : isCompleted
              ? 'bg-emerald-100 border-emerald-400 text-emerald-900'
              : 'bg-slate-100 border-slate-300 text-slate-500'
          }`}
        >
          {isCompleted ? '✓ ' : '3. '}
          Deducción de X
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="w-full bg-white rounded-3xl p-4 sm:p-6 border-3 border-purple-300 shadow-lg mb-5 relative flex flex-col items-center min-h-[360px]">
        {/* PHASE 1: CANCELAR CONSTANTES Y EQUILIBRAR AMBOS LADOS MANUALMENTE */}
        {phase === 1 && (
          <div className="w-full flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 text-purple-900 font-black text-xs sm:text-sm mb-3 border border-purple-200">
              <Scale className="w-4 h-4 text-purple-600" />
              <span>Paso 1: Cancela la constante en el lado izquierdo y equilibra el lado derecho</span>
            </div>

            {/* Balance Indicator Bar */}
            <div className="w-full flex items-center justify-center mb-4">
              {isBalanced ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-900 border-2 border-emerald-300 rounded-full font-black text-xs sm:text-sm shadow-xs">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  <span>⚖️ En equilibrio: Ambos lados tienen la misma modificación</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-900 border-2 border-amber-300 rounded-full font-black text-xs sm:text-sm shadow-xs animate-pulse">
                  <Scale className="w-4 h-4 text-amber-600" />
                  <span>
                    {leftDelta < rightDelta
                      ? '⚖️ Desequilibrado: Has quitado en la izquierda. Quita también a la derecha para equilibrar.'
                      : '⚖️ Desequilibrado: Has agregado en la izquierda. Agrega también a la derecha para equilibrar.'}
                  </span>
                </div>
              )}
            </div>

            {/* Workstage comparison area */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* Left Column: Equation Left Side + Supply for Add & Eliminate */}
              <div className="flex flex-col gap-3">
                {/* Left Side: Equation Variable & Constant */}
                <div className="bg-purple-50/70 rounded-2xl p-4 border-2 border-purple-200 flex flex-col items-center min-h-[170px] justify-between">
                  <div className="text-xs font-black text-purple-800 uppercase tracking-wider mb-2">
                    Lado Izquierdo
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 my-auto">
                    {/* Variables */}
                    {exercise.ty === 'm' ? (
                      Array.from({ length: exercise.xCount }).map((_, i) => (
                        <div
                          key={`x-${i}`}
                          className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-2xl shadow-md border-2 border-purple-700 select-none"
                        >
                          X
                        </div>
                      ))
                    ) : (
                      <div className="w-16 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-md border-2 border-purple-700 select-none">
                        X/{exercise.den || 2}
                      </div>
                    )}

                    {/* Positive Constants: Click to remove */}
                    {currentC > 0 && (
                      <div className="flex flex-wrap items-center justify-center gap-2 p-2 bg-amber-100/60 rounded-xl border border-dashed border-amber-400">
                        {Array.from({ length: currentC }).map((_, i) => (
                          <div
                            key={`c-${i}`}
                            onClick={handleSubtractOneLeft}
                            className="w-9 h-9 bg-amber-400 hover:bg-rose-400 active:scale-90 text-amber-950 font-black rounded-lg flex items-center justify-center text-sm shadow-sm cursor-pointer border border-amber-600 transition-all hover:scale-110 select-none group"
                            title="Haz clic para quitar este +1"
                          >
                            +1
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Negative Constants */}
                    {currentC < 0 && (
                      <div className="flex flex-wrap items-center justify-center gap-2 p-2 bg-rose-100/60 rounded-xl border border-dashed border-rose-400">
                        {Array.from({ length: Math.abs(currentC) }).map((_, i) => (
                          <div
                            key={`c-neg-${i}`}
                            className="w-9 h-9 bg-rose-300 text-rose-950 font-black rounded-lg flex items-center justify-center text-sm shadow-sm border border-rose-500 select-none"
                          >
                            -1
                          </div>
                        ))}
                      </div>
                    )}

                    {currentC === 0 && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                        ✓ ¡Sin constantes a la izquierda!
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-bold text-purple-700 mt-2">
                    {exercise.ty === 'm' ? `${exercise.xCount}x` : `x/${exercise.den || 2}`}{' '}
                    {currentC > 0 ? `+ ${currentC}` : currentC < 0 ? `- ${Math.abs(currentC)}` : ''}
                  </div>
                </div>

                {/* Suministro en la Izquierda: Agregar y Eliminar */}
                <div className="bg-white rounded-2xl p-3 border-2 border-purple-300 shadow-sm flex flex-col gap-2">
                  <div className="text-xs font-black text-purple-900 uppercase tracking-wider text-center">
                    📦 Suministro en la Izquierda
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Suministro para Agregar (+1) */}
                    <button
                      type="button"
                      onClick={handleAddOneLeft}
                      className="p-3 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 hover:border-emerald-500 rounded-xl flex flex-col items-center justify-between cursor-pointer transition-all active:scale-98 group"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-8 h-8 bg-emerald-500 text-white font-black rounded-lg flex items-center justify-center text-xs shadow-xs group-hover:scale-105 transition-transform">
                          <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black text-emerald-950">
                          Agregar (+1)
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-800 text-center leading-tight">
                        Neutraliza restas
                      </span>
                    </button>

                    {/* Suministro para Eliminar (-1) */}
                    <button
                      type="button"
                      onClick={handleSubtractOneLeft}
                      className="p-3 bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 hover:border-rose-500 rounded-xl flex flex-col items-center justify-between cursor-pointer transition-all active:scale-98 group"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-8 h-8 bg-rose-500 text-white font-black rounded-lg flex items-center justify-center text-xs shadow-xs group-hover:scale-105 transition-transform">
                          <Trash2 className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black text-rose-950">
                          Eliminar (-1)
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-rose-800 text-center leading-tight">
                        Elimina sumas
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Lado Derecho Units in Balance with Manual Controls */}
              <div className="bg-purple-50/70 rounded-2xl p-4 border-2 border-purple-200 flex flex-col items-center min-h-[260px] justify-between">
                <div className="w-full flex items-center justify-between mb-2">
                  <div className="text-xs font-black text-purple-800 uppercase tracking-wider">
                    Lado Derecho
                  </div>
                  <span className="text-xs font-bold text-purple-800 bg-purple-200/70 px-2.5 py-0.5 rounded-full">
                    {currentR} {currentR === 1 ? 'bloque' : 'bloques'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-[280px] p-3 bg-white/70 rounded-xl border border-purple-200 min-h-[110px] w-full my-auto">
                  {Array.from({ length: currentR }).map((_, i) => (
                    <div
                      key={`r-${i}`}
                      onClick={handleSubtractOneRight}
                      className="w-8 h-8 bg-amber-400 hover:bg-rose-400 active:scale-90 text-amber-950 font-black rounded-lg flex items-center justify-center text-xs shadow-xs border border-amber-600 cursor-pointer transition-all hover:scale-110 select-none group"
                      title="Haz clic para quitar este bloque y equilibrar"
                    >
                      1
                    </div>
                  ))}
                  {currentR === 0 && (
                    <span className="text-xs font-bold text-slate-400">
                      Sin bloques en la derecha
                    </span>
                  )}
                </div>

                {/* Suministro / Controles en la Derecha */}
                <div className="w-full flex flex-col gap-2 mt-3">
                  <div className="text-xs font-black text-purple-900 uppercase tracking-wider text-center">
                    ⚖️ Suministro en la Derecha (Equilibrar)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleSubtractOneRight}
                      disabled={currentR <= 0}
                      className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 disabled:opacity-40 border-2 border-rose-300 rounded-xl font-black text-xs text-rose-900 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    >
                      <Minus className="w-4 h-4 text-rose-600" />
                      <span>Quitar (-1)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAddOneRight}
                      className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 rounded-xl font-black text-xs text-emerald-900 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    >
                      <Plus className="w-4 h-4 text-emerald-600" />
                      <span>Agregar (+1)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 2: VARIABLE ISOLATION (AGRUPAR PARA DIVIDIR O AGREGAR ELEMENTOS PARA MULTIPLICAR) */}
        {phase === 2 && (
          <div className="w-full flex flex-col items-center">
            {exercise.ty === 'm' ? (
              // GROUPING TO DIVIDE
              <div className="w-full flex flex-col items-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-900 font-black text-sm mb-3 border border-indigo-200">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Distribuye las unidades en las {exercise.xCount} canastas de X</span>
                </div>

                {/* Available unassigned blocks to group */}
                <div className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 mb-4 flex flex-col items-center">
                  <div className="text-xs font-bold text-slate-600 mb-2 flex items-center justify-between w-full px-2">
                    <span>Unidades por distribuir: {unassignedBlocks}</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-1.5 min-h-[40px]">
                    {Array.from({ length: unassignedBlocks }).map((_, i) => (
                      <div
                        key={`unassigned-${i}`}
                        className="w-7 h-7 bg-amber-400 text-amber-950 font-black rounded-md flex items-center justify-center text-xs shadow-xs border border-amber-600 select-none animate-pulse"
                      >
                        1
                      </div>
                    ))}
                    {unassignedBlocks === 0 && (
                      <span className="text-xs font-bold text-emerald-600">
                        ¡Todas las unidades han sido agrupadas!
                      </span>
                    )}
                  </div>
                </div>

                {/* Baskets for each X */}
                <div className="w-full grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                  {baskets.map((count, idx) => (
                    <div
                      key={`basket-${idx}`}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-between min-h-[150px] transition-all ${
                        unassignedBlocks > 0
                          ? 'bg-purple-50/70 border-purple-300 hover:bg-purple-100 hover:border-purple-500 hover:shadow-md'
                          : 'bg-emerald-50 border-emerald-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                          X{idx + 1}
                        </div>
                        <span className="text-xs font-bold text-purple-900">
                          {count} {count === 1 ? 'unidad' : 'unidades'}
                        </span>
                      </div>

                      {/* Display assigned units */}
                      <div className="flex flex-wrap items-center justify-center gap-1 my-2 max-w-[130px]">
                        {Array.from({ length: count }).map((_, uIdx) => (
                          <div
                            key={`b-${idx}-u-${uIdx}`}
                            onClick={() => handleRemoveFromBasket(idx)}
                            className="w-6 h-6 bg-amber-400 hover:bg-rose-400 text-amber-950 font-black rounded flex items-center justify-center text-[10px] shadow-xs border border-amber-600 cursor-pointer transition-all hover:scale-110 active:scale-90 select-none"
                            title="Haz clic para regresar esta unidad a las no asignadas"
                          >
                            1
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5 w-full mt-1">
                        <button
                          type="button"
                          onClick={() => handleAssignToBasket(idx)}
                          disabled={unassignedBlocks <= 0}
                          className="flex-1 py-1 px-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-black text-[11px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Asignar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveFromBasket(idx)}
                          disabled={count <= 0}
                          className="py-1 px-2 bg-rose-100 hover:bg-rose-200 disabled:opacity-40 text-rose-800 font-black text-[11px] rounded-lg transition-all flex items-center justify-center cursor-pointer active:scale-95"
                          title="Quitar unidad de esta canasta"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // MULTIPLICATION (FOR FRACTIONS):
              // Left side: clicks on X figure to complete X.
              // Right side: interactive supply where Rachel adds elements until reaching the multiplication result!
              <div className="w-full flex flex-col items-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-950 font-black text-xs sm:text-sm mb-3 border-2 border-purple-200 shadow-xs text-center">
                  <MousePointerClick className="w-5 h-5 text-purple-700 shrink-0" />
                  <span>
                    Paso 2: Multiplica en el lado izquierdo para completar la X y equilibra el lado derecho agregando los bloques correspondientes
                  </span>
                </div>

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch mb-4">
                  {/* Left Side: Multiply X with clicks */}
                  <div
                    onClick={handleClickMultiplyLeft}
                    className={`rounded-2xl p-4 border-3 flex flex-col items-center justify-between min-h-[260px] transition-all cursor-pointer select-none shadow-sm ${
                      multClicksLeft >= (exercise.den || 2)
                        ? 'bg-emerald-50 border-emerald-500'
                        : 'bg-purple-50/80 border-purple-400 hover:border-purple-600 hover:bg-purple-100 hover:scale-101'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-xs font-black text-purple-900 uppercase tracking-wider">
                        Lado Izquierdo (X/{exercise.den || 2})
                      </span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: exercise.den || 2 }).map((_, i) => (
                          <div
                            key={`click-l-${i}`}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all ${
                              i < multClicksLeft
                                ? 'bg-emerald-500 border-emerald-700 text-white shadow-xs'
                                : 'bg-white border-slate-300 text-slate-400'
                            }`}
                          >
                            {i < multClicksLeft ? '✓' : i + 1}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="relative my-auto flex flex-col items-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl flex flex-col items-center justify-center font-black shadow-lg border-2 border-purple-700 p-2">
                        <span className="text-2xl">
                          {multClicksLeft >= (exercise.den || 2) ? 'X' : `X/${exercise.den || 2}`}
                        </span>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: exercise.den || 2 }).map((_, i) => (
                            <div
                              key={`slice-l-${i}`}
                              className={`h-2 rounded-full transition-all ${
                                i < multClicksLeft
                                  ? 'w-4 bg-amber-300'
                                  : 'w-3 bg-purple-300/50'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-950 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-600 shadow-sm">
                        ×{exercise.den || 2}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleClickMultiplyLeft();
                      }}
                      disabled={multClicksLeft >= (exercise.den || 2)}
                      className={`w-full mt-3 py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        multClicksLeft >= (exercise.den || 2)
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md active:scale-98'
                      }`}
                    >
                      <MousePointerClick className="w-4 h-4" />
                      <span>
                        {multClicksLeft >= (exercise.den || 2)
                          ? '✓ ¡Incógnita X multiplicada y lista!'
                          : `Clic para multiplicar incógnita X (×${exercise.den || 2})`}
                      </span>
                    </button>
                  </div>

                  {/* Right Side: Add elements to indicate multiplication result! */}
                  <div className="rounded-2xl p-4 border-3 bg-purple-50/80 border-purple-300 flex flex-col items-center justify-between min-h-[260px] shadow-sm">
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-xs font-black text-purple-900 uppercase tracking-wider">
                        Lado Derecho
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-indigo-900 bg-indigo-100 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                          {completedGroupsCount} {completedGroupsCount === 1 ? 'grupo' : 'grupos'} ({multRightBlocks} {multRightBlocks === 1 ? 'bloque' : 'bloques'})
                        </span>
                      </div>
                    </div>

                    {/* Enclosed Groups Display Area */}
                    <div className="my-auto flex flex-wrap items-stretch justify-center gap-2.5 p-2.5 bg-white/70 rounded-xl border border-purple-200 min-h-[120px] max-h-[230px] overflow-y-auto w-full">
                      {multGroups.map((grp, gIdx) => {
                        const isFull = grp.length === groupSize;
                        return (
                          <div
                            key={`mult-group-${gIdx}`}
                            className={`p-2.5 rounded-xl border-2 flex flex-col items-center justify-between gap-1.5 transition-all shadow-xs min-w-[110px] flex-1 max-w-[180px] ${
                              isFull
                                ? 'border-indigo-400 bg-indigo-50/85 shadow-indigo-100'
                                : 'border-amber-400 border-dashed bg-amber-50/85'
                            }`}
                          >
                            {/* Group Header with iteration badge */}
                            <div className="flex items-center justify-between gap-1 w-full border-b border-indigo-200/60 pb-1">
                              <span className="text-[11px] font-black text-indigo-950 flex items-center gap-1">
                                <span
                                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-black shrink-0 ${
                                    isFull ? 'bg-indigo-600' : 'bg-amber-500'
                                  }`}
                                >
                                  {gIdx + 1}
                                </span>
                                <span>Grupo {gIdx + 1}</span>
                              </span>
                              <span
                                className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                                  isFull
                                    ? 'bg-indigo-200/80 text-indigo-900'
                                    : 'bg-amber-200/80 text-amber-900'
                                }`}
                              >
                                {grp.length}/{groupSize}
                              </span>
                            </div>

                            {/* Blocks inside this enclosed group */}
                            <div className="flex flex-wrap items-center justify-center gap-1 py-1">
                              {grp.map((_, i) => (
                                <div
                                  key={`r-mult-b-${gIdx}-${i}`}
                                  onClick={handleRemoveBlockRight}
                                  className="w-7 h-7 bg-amber-400 hover:bg-rose-400 text-amber-950 font-black rounded-lg flex items-center justify-center text-xs shadow-xs border border-amber-600 cursor-pointer transition-all hover:scale-110 active:scale-90"
                                  title="Haz clic para quitar este bloque"
                                >
                                  1
                                </div>
                              ))}
                            </div>

                            {/* Tag indicating the multiplication count */}
                            <span
                              className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                                isFull
                                  ? 'text-indigo-800 bg-indigo-100/90 border border-indigo-200'
                                  : 'text-amber-800 bg-amber-100/90 border border-amber-200'
                              }`}
                            >
                              {isFull
                                ? `✓ Multiplicado ${gIdx + 1}ª vez`
                                : `Incompleto (${grp.length} de ${groupSize})`}
                            </span>
                          </div>
                        );
                      })}

                      {multRightBlocks === 0 && (
                        <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                          <Layers className="w-8 h-8 mb-1 text-slate-300" />
                          <span className="text-xs font-bold text-center">
                            Usa los botones para agregar bloques o grupos
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Suministro / Controls to add elements until indicating multiplication result */}
                    <div className="w-full flex flex-col gap-2 mt-2">
                      <div className="flex items-center justify-center gap-1.5 w-full">
                        <button
                          type="button"
                          onClick={handleAddBlockRight}
                          className="flex-1 py-1.5 px-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-amber-950 font-black text-xs rounded-xl shadow-xs border border-amber-600 flex items-center justify-center gap-1 cursor-pointer transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+1 Bloque</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleAddGroupRight}
                          className="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs border border-indigo-800 flex items-center justify-center gap-1 cursor-pointer transition-all"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>+ 1 Grupo</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleRemoveBlockRight}
                          disabled={multRightBlocks <= 0}
                          className="py-1.5 px-2 bg-rose-100 hover:bg-rose-200 active:scale-95 text-rose-800 font-black text-xs rounded-xl border border-rose-300 disabled:opacity-40 flex items-center justify-center gap-0.5 cursor-pointer transition-all"
                          title="Quitar un bloque"
                        >
                          <Minus className="w-3.5 h-3.5" />
                          <span>-1</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleResetBlocksRight}
                          className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 flex items-center justify-center cursor-pointer transition-all"
                          title="Reiniciar a las unidades iniciales"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Validate Multiplication Button */}
                      <button
                        type="button"
                        onClick={handleConfirmMultiplication}
                        className="w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirmar resultado de la multiplicación</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PHASE 3: FINAL DEDUCTION OF X */}
        {phase === 3 && (
          <div className="w-full flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-900 font-black text-sm mb-4 border border-emerald-300 animate-bounce">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>¡La incógnita X ha quedado despejada!</span>
            </div>

            {/* Visual proof of X isolated */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-6">
              <div className="bg-purple-50 rounded-2xl p-4 border-2 border-purple-300 flex flex-col items-center justify-center min-h-[160px]">
                <div className="text-xs font-black text-purple-800 uppercase tracking-wider mb-2">
                  Una sola X
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-3xl shadow-md border-2 border-purple-800">
                  X
                </div>
              </div>

              <div className="bg-purple-50 rounded-2xl p-4 border-2 border-purple-300 flex flex-col items-center justify-between min-h-[160px]">
                <div className="text-xs font-black text-purple-800 uppercase tracking-wider mb-2">
                  Lado Derecho
                </div>

                {isCompleted ? (
                  <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-[240px] my-auto">
                    {Array.from({ length: exercise.sol }).map((_, i) => (
                      <div
                        key={`sol-${i}`}
                        className="w-7 h-7 bg-amber-400 text-amber-950 font-black rounded-md flex items-center justify-center text-xs shadow-xs border border-amber-600 animate-bounce"
                      >
                        1
                      </div>
                    ))}
                  </div>
                ) : exercise.ty === 'm' ? (
                  <div className="flex flex-col items-center gap-2 my-auto">
                    <span className="text-[11px] font-bold text-purple-900 text-center">
                      Grupos de X que formaste (cada canasta es 1 X):
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {baskets.map((count, idx) => (
                        <div
                          key={`p3-b-${idx}`}
                          onClick={() => {
                            if (!isCompleted) {
                              setInputStr(String(count));
                              setStudentGuessX(count);
                              handleCheckSolution(count);
                            }
                          }}
                          className={`p-2.5 bg-white rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center shadow-xs hover:border-purple-500 hover:scale-105 active:scale-95 ${
                            studentGuessX === count
                              ? 'border-purple-600 bg-purple-100/50 ring-2 ring-purple-400'
                              : 'border-purple-200'
                          }`}
                          title={`Haz clic para seleccionar ${count} como el valor de X`}
                        >
                          <span className="text-[11px] font-black text-purple-800 mb-1">
                            X{idx + 1} ({count})
                          </span>
                          <div className="flex flex-wrap gap-1 justify-center max-w-[75px]">
                            {Array.from({ length: count }).map((_, bi) => (
                              <div
                                key={`p3-bi-${bi}`}
                                className="w-5 h-5 bg-amber-400 text-amber-950 font-black rounded text-[9px] flex items-center justify-center border border-amber-600 shadow-2xs"
                              >
                                1
                              </div>
                            ))}
                          </div>
                          <span className="text-[9px] font-bold text-purple-600 mt-1.5 bg-purple-50 px-1.5 py-0.5 rounded-md border border-purple-200">
                            Elegir {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 my-auto w-full">
                    <span className="text-xs font-black text-purple-950 text-center">
                      La X completa equivale al total de bloques ({exercise.sol}):
                    </span>
                    <div
                      onClick={() => {
                        if (!isCompleted) {
                          setInputStr(String(exercise.sol));
                          setStudentGuessX(exercise.sol);
                          handleCheckSolution(exercise.sol);
                        }
                      }}
                      className="p-3.5 bg-indigo-50/90 hover:bg-indigo-100/90 rounded-2xl border-2 border-indigo-400 hover:border-indigo-600 flex flex-col items-center gap-2 shadow-xs hover:scale-102 active:scale-98 cursor-pointer transition-all max-w-[340px] w-full"
                      title={`Haz clic aquí para seleccionar ${exercise.sol} como el valor de X`}
                    >
                      <div className="flex items-center justify-between w-full px-1">
                        <span className="text-xs font-black text-indigo-900">
                          {exercise.den || 2} grupos de {baseR} bloques
                        </span>
                        <span className="text-xs font-black text-indigo-800 bg-indigo-200/80 px-2 py-0.5 rounded-full border border-indigo-300">
                          Total: {exercise.sol} bloques
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 max-h-[140px] overflow-y-auto">
                        {Array.from({ length: exercise.sol }).map((_, bi) => (
                          <div
                            key={`p3-mult-sol-${bi}`}
                            className="w-7 h-7 bg-amber-400 text-amber-950 font-black rounded-lg text-xs flex items-center justify-center border border-amber-600 shadow-xs"
                          >
                            1
                          </div>
                        ))}
                      </div>

                      <span className="text-[11px] font-extrabold text-indigo-900 bg-white/95 px-3 py-1 rounded-full border border-indigo-300 shadow-2xs">
                        {baseR} × {exercise.den || 2} = {exercise.sol} bloques (Clic para elegir)
                      </span>
                    </div>
                  </div>
                )}

                <div className="text-xs font-bold text-purple-800 mt-2 text-center">
                  ¿Cuántos bloques corresponden a una sola X?
                </div>
              </div>
            </div>

            {/* Deduction Input - Rachel types her answer directly */}
            <div
              className={`w-full max-w-md bg-purple-50/90 rounded-2xl p-5 border-3 transition-all flex flex-col items-center gap-4 ${
                guessError
                  ? 'border-rose-500 bg-rose-50 animate-shake'
                  : 'border-purple-300 shadow-md'
              }`}
            >
              <div className="text-base sm:text-lg font-black text-purple-950 text-center">
                Escribe tu cálculo: ¿Cuánto vale X?
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-purple-950 font-mono">X =</span>
                  <input
                    id="input-guess-x"
                    type="number"
                    min={0}
                    max={99}
                    value={inputStr}
                    onChange={e => {
                      const valStr = e.target.value;
                      setInputStr(valStr);
                      const parsed = parseInt(valStr, 10);
                      setStudentGuessX(isNaN(parsed) ? 0 : parsed);
                    }}
                    placeholder="?"
                    disabled={isCompleted}
                    className="w-28 h-16 text-center text-3xl font-black text-purple-950 bg-white border-3 border-purple-500 rounded-2xl shadow-inner focus:border-purple-700 focus:ring-4 focus:ring-purple-200 outline-hidden transition-all"
                  />
                </div>

                {/* Quick numeric buttons for touch or fast input */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2 max-w-xs">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15, 16].map(num => (
                    <button
                      key={`quick-num-${num}`}
                      type="button"
                      disabled={isCompleted}
                      onClick={() => {
                        setInputStr(String(num));
                        setStudentGuessX(num);
                        audio.play8Bit('step');
                        if (num === exercise.sol) {
                          handleCheckSolution(num);
                        }
                      }}
                      className={`w-9 h-9 rounded-xl font-black text-sm border-2 transition-all cursor-pointer ${
                        studentGuessX === num
                          ? 'bg-purple-600 text-white border-purple-800 scale-105 shadow-xs'
                          : 'bg-white text-purple-900 border-purple-200 hover:bg-purple-100 hover:border-purple-400'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={isCompleted}
                    onClick={() => {
                      setInputStr('');
                      setStudentGuessX(0);
                      audio.play8Bit('step');
                    }}
                    className="px-3 h-9 rounded-xl font-black text-xs border-2 bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Borrar
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCheckSolution()}
                disabled={isCompleted || (!inputStr && studentGuessX === 0)}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 active:scale-98 disabled:opacity-50 text-white font-black text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>COMPROBAR VALOR DE X ✅</span>
              </button>
            </div>
          </div>
        )}

        {/* Completion Card */}
        {isCompleted && (
          <div className="w-full mt-6 bg-emerald-50 rounded-2xl p-6 border-3 border-emerald-400 shadow-md flex flex-col items-center gap-4 animate-fade-in">
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
                ? `¡Completaste los 10 ejercicios manipulativos! Aprendiste a arrastrar al centro para sumar, afuera para restar, hacer clic para multiplicar y agrupar para dividir. ¡X = ${exercise.sol}!`
                : levelIndex === 0
                ? `¡Excelente procedimiento! Manipulaste los bloques y despejaste que X = ${exercise.sol}.`
                : `¡Encontraste la solución correcta manipulando los bloques: X = ${exercise.sol}!`}
            </p>

            <button
              onClick={onExerciseComplete}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-lg rounded-2xl shadow-lg transition-transform flex items-center gap-2"
            >
              <span>
                {levelIndex === totalLevels - 1 ? '¡FINALIZAR SECCIÓN! 🏆' : 'SIGUIENTE EJERCICIO ➔'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
