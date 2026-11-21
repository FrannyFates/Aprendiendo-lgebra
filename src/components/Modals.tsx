import React, { useState, useEffect } from 'react';
import { CanelitaAvatar } from './CanelitaAvatar.tsx';
import { Tutorial } from '../types.ts';
import { triggerCelebration } from './CelebrationEffects.tsx';
import { audio } from './AudioEngine.ts';
import { Sparkles, ArrowRight, Play, Check, Volume2, User, Edit3 } from 'lucide-react';

interface WelcomeModalProps {
  initialName?: string;
  onStart: (studentName: string) => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ initialName = 'Rachel', onStart }) => {
  const [name, setName] = useState<string>(initialName);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const speakGreeting = () => {
    setIsSpeaking(true);
    audio.hablar(
      "¡Hola! Soy Canelita. Te doy la bienvenida a nuestro taller de álgebra. Escribe tu nombre para comenzar a jugar y aprender juntos."
    );
    setTimeout(() => setIsSpeaking(false), 4500);
  };

  useEffect(() => {
    // Vocal welcome presentation shortly after modal is mounted
    const timer = setTimeout(() => {
      speakGreeting();
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    const finalName = name.trim() || 'Rachel';
    onStart(finalName);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [name]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border-4 border-purple-500 shadow-2xl flex flex-col items-center text-center">
        <div className="relative mb-3">
          <CanelitaAvatar size="xl" src="/bienvenida.png" />
          <span className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 text-xs font-black px-2 py-0.5 rounded-full border border-amber-600 shadow-sm">
            🐶 Canelita
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-purple-900 mb-2 tracking-tight">
          ¡Hola! Soy Canelita 🌸
        </h1>

        <p className="text-slate-700 text-base sm:text-lg leading-relaxed mb-4 font-medium max-w-md">
          ¡Mucho gusto! Te doy la bienvenida a nuestro <strong className="text-purple-700">taller de álgebra interactivo</strong>. Juntos vamos a dibujar ecuaciones, equilibrar balanzas y resolver divertidos misterios matemáticos.
        </p>

        {/* Audio replay button */}
        <button
          type="button"
          onClick={speakGreeting}
          className="mb-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs sm:text-sm font-bold border border-purple-300 transition-all cursor-pointer active:scale-95"
          title="Escuchar la voz de Canelita"
        >
          <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-pink-600 animate-pulse' : 'text-purple-700'}`} />
          <span>{isSpeaking ? 'Canelita hablando... 🐾' : 'Escuchar presentación 🔊'}</span>
        </button>

        {/* Student Name Input Form */}
        <div className="w-full max-w-sm mb-6 text-left bg-purple-50/70 p-4 rounded-2xl border-2 border-purple-200">
          <label
            htmlFor="student-name-input"
            className="block text-xs font-black text-purple-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
          >
            <User className="w-4 h-4 text-purple-600" />
            <span>¿Cuál es el nombre del estudiante?</span>
          </label>
          <div className="relative">
            <input
              id="student-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Escribe tu nombre..."
              maxLength={24}
              autoFocus
              className="w-full text-center text-xl sm:text-2xl font-black text-purple-950 bg-white border-2 border-purple-300 focus:border-purple-600 rounded-xl py-2.5 px-3 outline-none transition-all shadow-sm"
            />
          </div>
          <p className="text-[11px] text-purple-700/80 mt-1.5 text-center font-medium">
            Usaremos tu nombre en todas las actividades, pistas y diplomas ✨
          </p>
        </div>

        <button
          type="button"
          onClick={handleStart}
          className="w-full max-w-sm py-4 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xl shadow-[0_6px_0_#15803d] cursor-pointer transition-all flex items-center justify-center gap-3"
        >
          <Play className="w-6 h-6 fill-current" />
          <span>¡Comenzar la aventura! 🐾</span>
        </button>
      </div>
    </div>
  );
};

interface TutorialModalProps {
  tutorial: Tutorial;
  stepIndex: number;
  onNextStep: () => void;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  tutorial,
  stepIndex,
  onNextStep,
  onClose
}) => {
  const currentStep = tutorial.steps[stepIndex] || tutorial.steps[0];
  const isLast = stepIndex >= tutorial.steps.length - 1;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (isLast) {
          onClose();
        } else {
          onNextStep();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLast, onNextStep, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-7 max-w-md w-full border-4 border-purple-500 shadow-2xl flex flex-col items-center text-center">
        <CanelitaAvatar size="lg" src="/instrucciones.png" className="mb-3" />
        <h2 className="text-2xl font-black text-purple-900 mb-2">
          {tutorial.t}
        </h2>
        <div className="text-4xl my-4 min-h-[50px] flex items-center justify-center">
          {currentStep.v}
        </div>
        <p className="text-slate-700 text-lg leading-relaxed mb-6 font-medium">
          {currentStep.txt}
        </p>
        <div className="flex gap-1.5 mb-5">
          {tutorial.steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === stepIndex ? 'w-8 bg-purple-600' : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={isLast ? onClose : onNextStep}
          className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xl shadow-[0_5px_0_#15803d] cursor-pointer transition-all flex items-center justify-center gap-2"
        >
          <span>{isLast ? '¡A Jugar! 🐾' : 'Siguiente Paso ➡️'}</span>
        </button>
      </div>
    </div>
  );
};

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-7 max-w-md w-full border-4 border-purple-500 shadow-2xl flex flex-col items-center text-center">
        <CanelitaAvatar size="lg" src="/instrucciones.png" className="mb-3" />
        <h2 className="text-2xl font-black text-purple-900 mb-2">
          Reglas para despejar ✨
        </h2>
        <div className="w-full bg-purple-50 border-2 border-purple-300 rounded-2xl p-5 my-4 text-xl font-bold flex flex-col gap-3">
          <div className="flex items-center justify-center gap-3">
            <span className="text-emerald-700">➕ Suma</span>
            <span className="text-slate-400">↔️</span>
            <span className="text-rose-600">➖ Resta</span>
          </div>
          <div className="border-t border-purple-200 my-1" />
          <div className="flex items-center justify-center gap-3">
            <span className="text-purple-700">✖️ Multiplicación</span>
            <span className="text-slate-400">↔️</span>
            <span className="text-sky-700">➗ División</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xl shadow-[0_5px_0_#15803d] cursor-pointer transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-6 h-6 stroke-[3]" />
          ¡Entendido!
        </button>
      </div>
    </div>
  );
};

interface CelebrationModalProps {
  tabTitle: string;
  studentName?: string;
  procedureSummary?: string;
  hasNextTab: boolean;
  onNextTab: () => void;
  onReplay: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  tabTitle,
  studentName = 'Rachel',
  procedureSummary,
  hasNextTab,
  onNextTab,
  onReplay
}) => {
  useEffect(() => {
    triggerCelebration(`¡Sección Completada, ${studentName}! 🌟🎉`);
  }, [studentName]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full border-4 border-amber-400 shadow-2xl flex flex-col items-center text-center">
        <CanelitaAvatar size="xl" src="/celebra.png" className="mb-4" />
        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-sm mb-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          ¡MISIÓN CUMPLIDA!
        </div>
        <h1 className="text-3xl font-black text-emerald-600 mb-2">
          ¡QUÉ GRAN TRABAJO! 🌟
        </h1>
        <p className="text-slate-700 text-lg mb-4 font-medium leading-relaxed">
          ¡{studentName}, completaste con éxito los diez ejercicios de <strong>{tabTitle}</strong>!
        </p>

        {procedureSummary && (
          <div className="w-full bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-6 text-left">
            <div className="text-xs font-black text-amber-800 uppercase tracking-wider mb-1">
              Procedimiento aprendido:
            </div>
            <p className="text-amber-950 font-semibold text-sm sm:text-base leading-snug">
              {procedureSummary}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 w-full">
          {hasNextTab && (
            <button
              type="button"
              onClick={onNextTab}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xl shadow-[0_6px_0_#15803d] cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <span>Continuar a la siguiente sección</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          <button
            type="button"
            onClick={onReplay}
            className="w-full py-3 px-6 rounded-2xl bg-purple-100 hover:bg-purple-200 active:scale-95 text-purple-900 font-bold text-base border-2 border-purple-300 cursor-pointer transition-all"
          >
            Practicar esta sección de nuevo 🔄
          </button>
        </div>
      </div>
    </div>
  );
};

interface ChangeNameModalProps {
  currentName: string;
  onSave: (newName: string) => void;
  onClose: () => void;
}

export const ChangeNameModal: React.FC<ChangeNameModalProps> = ({
  currentName,
  onSave,
  onClose
}) => {
  const [name, setName] = useState<string>(currentName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || currentName || 'Rachel';
    onSave(finalName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full border-4 border-purple-500 shadow-2xl flex flex-col items-center text-center">
        <CanelitaAvatar size="md" src="/bienvenida.png" className="mb-3" />
        <h2 className="text-xl sm:text-2xl font-black text-purple-900 mb-1">
          Cambiar Estudiante 🌸
        </h2>
        <p className="text-slate-600 text-sm mb-4">
          Ingresa el nombre de quien jugará ahora:
        </p>

        <form onSubmit={handleSubmit} className="w-full">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del estudiante..."
            maxLength={24}
            autoFocus
            className="w-full text-center text-xl font-black text-purple-950 bg-purple-50 border-2 border-purple-300 focus:border-purple-600 focus:bg-white rounded-xl py-2.5 px-3 outline-none transition-all shadow-inner mb-4"
          />

          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow-[0_4px_0_#6b21a8] cursor-pointer transition-all active:scale-95"
            >
              Guardar ✨
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
