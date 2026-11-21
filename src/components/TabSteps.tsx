import React, { useState, useEffect, useCallback } from 'react';
import { StepExercise } from '../types.ts';
import { NumberPicker } from './NumberPicker.tsx';
import { audio } from './AudioEngine.ts';
import { triggerCelebration } from './CelebrationEffects.tsx';
import { CheckCircle2, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';

interface TabStepsProps {
  exercise: StepExercise;
  levelIndex: number;
  totalLevels: number;
  studentName?: string;
  onExerciseComplete: () => void;
  setCanelitaMsg: (msg: string) => void;
}

export const TabSteps: React.FC<TabStepsProps> = ({
  exercise,
  levelIndex,
  totalLevels,
  studentName = 'Rachel',
  onExerciseComplete,
  setCanelitaMsg
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [inputValue, setInputValue] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [stepSuccessMsg, setStepSuccessMsg] = useState<string | null>(null);

  const paso = exercise.pasos[currentStepIndex];

  // Reset state whenever the exercise changes
  useEffect(() => {
    setCurrentStepIndex(0);
    setInputValue(0);
    setIsCompleted(false);
    setHasError(false);
    setStepSuccessMsg(null);
    setCanelitaMsg(`${studentName}, mira cómo resolvemos primero el paréntesis: ${exercise.pasos[0].p}`);
    audio.hablar(`${studentName}, resuelve primero: ${exercise.pasos[0].p.replace('*', 'por').replace('/', 'dividido en')}`);
  }, [exercise, studentName, setCanelitaMsg]);

  // Handler to check answer
  const handleCheck = useCallback(() => {
    if (!paso || isCompleted) return;

    if (inputValue === paso.r) {
      setHasError(false);
      audio.play8Bit('step');

      const isLastStep = currentStepIndex >= exercise.pasos.length - 1;

      if (!isLastStep) {
        // Advance to next step in the exercise
        setStepSuccessMsg(`¡Muy bien! ${paso.p} = ${paso.r}. Ahora calcula el total.`);
        const nextStepIdx = currentStepIndex + 1;
        setCurrentStepIndex(nextStepIdx);
        setInputValue(0);
        const nextPaso = exercise.pasos[nextStepIdx];
        setCanelitaMsg(`¡Excelente! Ahora calcula: ${nextPaso.p}`);
        audio.hablar(`¡Excelente! Ahora calcula: ${nextPaso.p}`);
      } else {
        // Exercise fully solved!
        setIsCompleted(true);
        setStepSuccessMsg(`¡Correcto! El resultado es ${paso.r}.`);
        audio.play8Bit('win');
        triggerCelebration();

        const isFirst = levelIndex === 0;
        const isLast = levelIndex === totalLevels - 1;

        if (isFirst) {
          setCanelitaMsg("✨ ¡Muy bien! Excelente procedimiento para resolver las operaciones en el orden correcto. ✨");
          audio.hablar("¡Muy bien! Excelente procedimiento para resolver las operaciones en el orden correcto.");
        } else if (isLast) {
          setCanelitaMsg(`✨ ¡Felicitaciones ${studentName}! Completaste la sección resolviendo las operaciones en orden. ✨`);
          audio.hablar(`¡Felicitaciones ${studentName}! Has dominado el procedimiento de pasos: aprendiste a respetar la jerarquía de las operaciones resolviendo primero las multiplicaciones y divisiones agrupadas antes de sumar o restar.`);
        } else {
          const shortPhrases = ["¡Muy bien!", "¡Excelente!", "¡Así se hace!"];
          const phrase = shortPhrases[(levelIndex - 1) % shortPhrases.length];
          setCanelitaMsg(`✨ ${phrase} ✨`);
          audio.hablar(phrase);
        }
      }
    } else {
      setHasError(true);
      audio.play8Bit('err');
      setCanelitaMsg(`¡Casi! Revisa bien el cálculo de ${paso.p} o cuenta los bloques.`);
      setTimeout(() => setHasError(false), 800);
    }
  }, [inputValue, paso, isCompleted, currentStepIndex, exercise.pasos, setCanelitaMsg]);

  // Handler to advance to next exercise
  const handleNextExercise = useCallback(() => {
    onExerciseComplete();
  }, [onExerciseComplete]);

  // Keyboard support: Enter key submits or advances
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (isCompleted) {
          handleNextExercise();
        } else {
          handleCheck();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCompleted, handleCheck, handleNextExercise]);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      {/* Mathematical display formula */}
      <div className="w-full bg-amber-50/80 border-3 border-dashed border-pink-400 rounded-3xl p-5 text-center mb-5 shadow-sm transition-all">
        <div
          className="text-3xl md:text-4xl font-black text-purple-800 tracking-wide font-mono"
          dangerouslySetInnerHTML={{
            __html: isCompleted ? `${exercise.title} = ${exercise.pasos[exercise.pasos.length - 1].r}` : paso.v
          }}
        />
        {stepSuccessMsg && (
          <div className="mt-2 text-emerald-700 font-bold text-sm md:text-base flex items-center justify-center gap-1.5 animate-bounce">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            {stepSuccessMsg}
          </div>
        )}
      </div>

      {/* Pictorial Representation Area */}
      <div className="w-full min-h-[140px] bg-white border-3 border-purple-200 rounded-2xl flex flex-wrap items-center justify-center gap-2 p-5 mb-6 shadow-sm">
        {/* Render pictorial blocks according to order and operation */}
        {paso.order === 'outsideFirst' && (
          <>
            {/* Outside single yellow blocks */}
            <div className="flex flex-wrap gap-1.5 justify-center items-center max-w-[45%]">
              {Array.from({ length: paso.bOutside }).map((_, i) => (
                <div
                  key={`out-${i}`}
                  className="w-9 h-9 bg-amber-300 text-amber-950 font-bold text-sm rounded-lg flex items-center justify-center shadow-sm border border-amber-400 transition-transform hover:scale-105"
                  title="Bloque 1"
                >
                  1
                </div>
              ))}
            </div>

            <div className="text-2xl font-black text-purple-700 px-2">+</div>
          </>
        )}

        {/* The grouped operation blocks (multiplication, division, or resolved addition) */}
        {paso.mul ? (
          // Grouped boxes for multiplication
          <div className="flex flex-wrap gap-3 items-center justify-center p-2 rounded-2xl bg-rose-50/70 border-2 border-rose-300">
            {Array.from({ length: paso.mul }).map((_, mIdx) => (
              <div
                key={`box-${mIdx}`}
                className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-white border-2 border-rose-400 shadow-sm"
                title={`Caja ${mIdx + 1} (${paso.mulCount} bloques)`}
              >
                {Array.from({ length: paso.mulCount || 0 }).map((_, kIdx) => (
                  <div
                    key={`box-${mIdx}-tile-${kIdx}`}
                    className="w-9 h-9 bg-rose-400 text-white font-bold text-sm rounded-lg flex items-center justify-center shadow-sm"
                  >
                    1
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : paso.div ? (
          // Grouped partition grid for division
          <div className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-indigo-50/70 border-2 border-indigo-300">
            <div
              className="grid gap-2 p-2 bg-white rounded-xl border-2 border-dashed border-indigo-400"
              style={{ gridTemplateColumns: `repeat(${paso.div}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: paso.divTotal || 0 }).map((_, dIdx) => (
                <div
                  key={`div-tile-${dIdx}`}
                  className="w-8 h-8 bg-indigo-200 text-indigo-900 font-bold text-xs rounded-lg flex items-center justify-center border border-indigo-300"
                  title="Bloque repartido"
                >
                  1
                </div>
              ))}
            </div>
            <span className="text-xs font-semibold text-indigo-700">
              Repartido en {paso.div} partes iguales
            </span>
          </div>
        ) : (
          // Resolved operand blocks
          <div className="flex flex-wrap gap-1.5 justify-center items-center p-2 bg-pink-50 rounded-xl border border-pink-200">
            {Array.from({ length: paso.bOp1 || 0 }).map((_, i) => (
              <div
                key={`op1-${i}`}
                className="w-9 h-9 bg-rose-400 text-white font-bold text-sm rounded-lg flex items-center justify-center shadow-sm"
              >
                1
              </div>
            ))}
          </div>
        )}

        {paso.order === 'opFirst' && (
          <>
            <div className="text-2xl font-black text-purple-700 px-2">+</div>

            {/* Outside single yellow blocks */}
            <div className="flex flex-wrap gap-1.5 justify-center items-center max-w-[45%]">
              {Array.from({ length: paso.bOutside }).map((_, i) => (
                <div
                  key={`out-${i}`}
                  className="w-9 h-9 bg-amber-300 text-amber-950 font-bold text-sm rounded-lg flex items-center justify-center shadow-sm border border-amber-400 transition-transform hover:scale-105"
                  title="Bloque 1"
                >
                  1
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Action and Input Card */}
      {!isCompleted ? (
        <div
          className={`w-full bg-white rounded-2xl p-6 border-3 shadow-md flex flex-col items-center gap-4 transition-all ${
            hasError ? 'border-rose-500 bg-rose-50/50 animate-shake' : 'border-purple-200'
          }`}
        >
          <div className="flex items-center gap-2 text-lg md:text-xl font-bold text-slate-800 text-center">
            <HelpCircle className="w-5 h-5 text-purple-600 shrink-0" />
            <span>
              ¿Cuál es el resultado de{' '}
              <span className="text-rose-600 bg-rose-100 px-2 py-0.5 rounded-lg border border-rose-300 font-mono">
                {paso.p}
              </span>
              ?
            </span>
          </div>

          {/* Value Picker */}
          <NumberPicker
            id="p3-input"
            value={inputValue}
            onChange={setInputValue}
            min={0}
            max={100}
          />

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleCheck}
            className="w-full max-w-sm py-3.5 px-6 rounded-2xl bg-purple-700 hover:bg-purple-800 active:scale-98 text-white font-extrabold text-lg shadow-[0_5px_0_#581c87] cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            COMPROBAR
          </button>
        </div>
      ) : (
        /* SOLVED STATE: Clear Celebration & Guaranteed Next Exercise Advance */
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
              ? '¡Completaste los 10 ejercicios! Aprendiste a respetar la jerarquía de las operaciones resolviendo primero los bloques agrupados.'
              : levelIndex === 0
              ? '¡Excelente procedimiento! Resolviste las operaciones en el orden correcto paso a paso.'
              : '¡Operación resuelta con éxito! Continúa con el siguiente ejercicio.'}
          </p>

          <button
            type="button"
            id="btn-next-step"
            onClick={handleNextExercise}
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
