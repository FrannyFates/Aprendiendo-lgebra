import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TUTORIALS,
  getTutorials,
  DRAW_EXERCISES,
  BALANCE1_EXERCISES,
  STEPS_EXERCISES,
  BALANCE2_EXERCISES,
  MANIPULATIVE_EXERCISES
} from './data/exercises.ts';
import { TabDraw } from './components/TabDraw.tsx';
import { TabBalance1 } from './components/TabBalance1.tsx';
import { TabSteps } from './components/TabSteps.tsx';
import { TabBalance2 } from './components/TabBalance2.tsx';
import { TabManipulative } from './components/TabManipulative.tsx';
import { CanelitaAvatar } from './components/CanelitaAvatar.tsx';
import {
  WelcomeModal,
  TutorialModal,
  RulesModal,
  CelebrationModal,
  ChangeNameModal
} from './components/Modals.tsx';
import { CelebrationOverlay } from './components/CelebrationEffects.tsx';
import { audio } from './components/AudioEngine.ts';
import { Volume2, VolumeX, Sparkles, HelpCircle, Edit3 } from 'lucide-react';

const TABS = [
  { id: 0, title: '1. Dibujar', shortTitle: 'Dibujar' },
  { id: 1, title: '2. Balanza 1', shortTitle: 'Balanza 1' },
  { id: 2, title: '3. Pasos', shortTitle: '3. Pasos' },
  { id: 3, title: '4. Balanza 2', shortTitle: 'Balanza 2' },
  { id: 4, title: '5. Manipular', shortTitle: 'Manipular' }
];

const TAB_PROCEDURES: Record<number, string> = {
  0: 'Aprendiste a representar expresiones algebraicas asociando cada variable (x², x, fracciones de x) y constante numérica con su bloque correspondiente.',
  1: 'Aprendiste que para despejar la incógnita en una balanza se aplica la operación contraria a ambos lados manteniendo siempre el equilibrio.',
  2: 'Aprendiste a respetar la jerarquía de las operaciones, resolviendo primero las multiplicaciones y divisiones agrupadas antes de sumar o restar.',
  3: 'Aprendiste el procedimiento algebraico de dos pasos: primero cancelar los números que acompañan a la X y luego dividir o multiplicar para despejarla por completo.',
  4: 'Aprendiste el procedimiento manipulativo directo: arrastrar figuras hacia el centro para sumar, hacia afuera para restar, hacer clic para multiplicar y agrupar con el mouse para dividir.'
};

const getTabAudioFinish = (tab: number, name: string): string => {
  switch (tab) {
    case 0:
      return `¡Felicitaciones ${name}! Completaste los diez ejercicios. Aprendiste a representar expresiones algebraicas asociando cada variable y número con sus bloques correspondientes.`;
    case 1:
      return `¡Felicitaciones ${name}! Completaste los diez ejercicios. Aprendiste que para despejar la incógnita en una balanza se debe aplicar la operación contraria a ambos lados para mantener siempre el equilibrio.`;
    case 2:
      return `¡Felicitaciones ${name}! Completaste los diez ejercicios. Aprendiste la jerarquía de operaciones, resolviendo primero las operaciones agrupadas antes de sumar.`;
    case 3:
      return `¡Felicitaciones ${name}! Completaste los diez ejercicios. Aprendiste el procedimiento algebraico completo: cancelar primero las constantes y luego despejar la incógnita.`;
    case 4:
      return `¡Felicitaciones ${name}! Completaste los diez ejercicios. Aprendiste a arrastrar figuras hacia el centro para sumar, hacia afuera para restar, hacer clic para multiplicar y agrupar con el mouse para dividir.`;
    default:
      return `¡Felicitaciones ${name}! Completaste con éxito los diez ejercicios de esta sección.`;
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [tabLevels, setTabLevels] = useState<number[]>([0, 0, 0, 0, 0]);
  const [visitedTutorials, setVisitedTutorials] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false
  ]);

  // Student name state persisted in localStorage
  const [studentName, setStudentName] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('student_name') || 'Rachel';
    }
    return 'Rachel';
  });

  // Modal states
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [showChangeName, setShowChangeName] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [tutorialStep, setTutorialStep] = useState<number>(0);
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Audio toggles
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Canelita's current speech bubble message
  const [canelitaMsg, setCanelitaMsg] = useState<string>(
    `¡Hola ${studentName}! Bienvenida/o a tu taller de álgebra con Canelita.`
  );

  // Get current list of exercises and total count for active tab
  const getExerciseData = useCallback(() => {
    switch (activeTab) {
      case 0:
        return { list: DRAW_EXERCISES, total: DRAW_EXERCISES.length };
      case 1:
        return { list: BALANCE1_EXERCISES, total: BALANCE1_EXERCISES.length };
      case 2:
        return { list: STEPS_EXERCISES, total: STEPS_EXERCISES.length };
      case 3:
        return { list: BALANCE2_EXERCISES, total: BALANCE2_EXERCISES.length };
      case 4:
        return { list: MANIPULATIVE_EXERCISES, total: MANIPULATIVE_EXERCISES.length };
      default:
        return { list: DRAW_EXERCISES, total: DRAW_EXERCISES.length };
    }
  }, [activeTab]);

  const { list: currentExerciseList, total: totalLevels } = getExerciseData();
  const currentLevelIndex = Math.min(tabLevels[activeTab] || 0, totalLevels - 1);

  // Switch tab safely with tutorial trigger
  const handleSwitchTab = useCallback(
    (tabIndex: number) => {
      setActiveTab(tabIndex);

      if (tabIndex === 3 && !visitedTutorials[3]) {
        setShowRules(true);
      } else if (!visitedTutorials[tabIndex]) {
        setTutorialStep(0);
        setShowTutorial(true);
      }
    },
    [visitedTutorials]
  );

  // Start app from welcome screen with personalized name
  const handleStartApp = (name: string) => {
    const finalName = name.trim() || 'Rachel';
    setStudentName(finalName);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('student_name', finalName);
    }
    setShowWelcome(false);
    audio.play8Bit('step');
    setCanelitaMsg(`¡Hola ${finalName}! Bienvenida/o a tu taller de álgebra con Canelita.`);
    audio.hablar(`¡Hola ${finalName}! ¡Qué alegría tenerte aquí! Vamos a divertirnos y aprender mucho.`);
    // Launch tutorial for tab 0 if not visited
    if (!visitedTutorials[0]) {
      setTutorialStep(0);
      setShowTutorial(true);
    }
  };

  // Change student name
  const handleSaveNewName = (newName: string) => {
    const finalName = newName.trim() || 'Rachel';
    setStudentName(finalName);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('student_name', finalName);
    }
    setShowChangeName(false);
    audio.play8Bit('pop');
    setCanelitaMsg(`¡Hola ${finalName}! Seguimos aprendiendo juntos.`);
    audio.hablar(`¡Hola ${finalName}! Seguimos aprendiendo juntos.`);
  };

  // Close tutorial modal
  const handleCloseTutorial = () => {
    setShowTutorial(false);
    setVisitedTutorials(prev => {
      const next = [...prev];
      next[activeTab] = true;
      return next;
    });
  };

  // Close rules modal
  const handleCloseRules = () => {
    setShowRules(false);
    setVisitedTutorials(prev => {
      const next = [...prev];
      next[3] = true;
      return next;
    });
  };

  // Exercise completed in current or specified tab
  const handleExerciseComplete = useCallback(
    (tabIndex?: number) => {
      const targetTab = typeof tabIndex === 'number' ? tabIndex : activeTab;
      const allExerciseLists = [
        DRAW_EXERCISES,
        BALANCE1_EXERCISES,
        STEPS_EXERCISES,
        BALANCE2_EXERCISES,
        MANIPULATIVE_EXERCISES
      ];
      const targetList = allExerciseLists[targetTab] || DRAW_EXERCISES;
      const maxLevels = targetList.length;

      setTabLevels(prevLevels => {
        const current = prevLevels[targetTab] || 0;
        const nextLevel = current + 1;

        if (nextLevel >= maxLevels) {
          // Section fully completed! Show celebration
          setShowCelebration(true);
          audio.play8Bit('win');
          audio.hablar(getTabAudioFinish(targetTab, studentName));
          const updated = [...prevLevels];
          updated[targetTab] = maxLevels - 1;
          return updated;
        }

        const updated = [...prevLevels];
        updated[targetTab] = nextLevel;
        audio.play8Bit('step');
        return updated;
      });
    },
    [activeTab, studentName]
  );

  // Proceed to next tab from celebration modal
  const handleNextSection = () => {
    setShowCelebration(false);
    const nextTab = (activeTab + 1) % 5;
    handleSwitchTab(nextTab);
  };

  // Replay current section
  const handleReplaySection = () => {
    setShowCelebration(false);
    setTabLevels(prev => {
      const next = [...prev];
      next[activeTab] = 0;
      return next;
    });
  };

  // Toggle Mute / Sound
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audio.soundEffectsEnabled = !nextMuted;
    audio.speechEnabled = !nextMuted;
    if (nextMuted) {
      audio.stopHablar();
    }
  };

  // Repeat Canelita's current message
  const handleRepeatSpeech = () => {
    if (canelitaMsg) {
      audio.hablar(canelitaMsg);
    }
  };

  // Dynamic tutorials based on student name
  const currentTutorials = useMemo(() => getTutorials(studentName), [studentName]);

  // Read tutorial steps when tutorial step updates
  useEffect(() => {
    if (showTutorial && currentTutorials[activeTab]?.steps[tutorialStep]) {
      const s = currentTutorials[activeTab].steps[tutorialStep];
      audio.hablar(s.txt);
    }
  }, [showTutorial, currentTutorials, activeTab, tutorialStep]);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center py-4 px-2 sm:px-4 text-slate-800 selection:bg-purple-300 relative"
      style={{
        backgroundColor: '#f2eed8',
        backgroundImage: "url('/fondo.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '650px auto',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Top Banner & Header */}
      <header className="w-full max-w-4xl flex items-center justify-between px-4 py-2.5 mb-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border-2 border-purple-200/80">
        <div className="flex items-center gap-2.5">
          <CanelitaAvatar size="sm" src="/bienvenida.png" />
          <h1 className="text-xl sm:text-2xl font-black text-purple-900 tracking-tight flex items-center gap-1.5 flex-wrap">
            <span>Álgebra con Canelita</span>
            <button
              type="button"
              onClick={() => setShowChangeName(true)}
              className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 px-2.5 py-0.5 rounded-full font-extrabold text-sm sm:text-base flex items-center gap-1 transition-all border border-pink-200 shadow-xs cursor-pointer active:scale-95"
              title="Cambiar el nombre del estudiante"
            >
              <span>• {studentName} 🌸</span>
              <Edit3 className="w-3.5 h-3.5 opacity-60" />
            </button>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className="p-2.5 rounded-full bg-white/80 hover:bg-white text-purple-800 shadow-sm border border-purple-200 cursor-pointer transition-all active:scale-95"
            title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-rose-500" />
            ) : (
              <Volume2 className="w-5 h-5 text-emerald-600" />
            )}
          </button>

          {/* Help / Tutorial Trigger */}
          <button
            type="button"
            onClick={() => {
              setTutorialStep(0);
              setShowTutorial(true);
            }}
            className="px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-purple-900 font-bold text-sm shadow-sm border border-purple-200 cursor-pointer transition-all flex items-center gap-1 active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-purple-600" />
            <span>Tutorial</span>
          </button>
        </div>
      </header>

      {/* Main Game Container Card */}
      <main className="w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border-4 border-purple-600 overflow-hidden flex flex-col">
        {/* Navigation Tabs */}
        <nav className="flex bg-slate-100/90 border-b-3 border-purple-600 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              id={`tab-btn-${t.id}`}
              type="button"
              onClick={() => handleSwitchTab(t.id)}
              className={`flex-1 min-w-[85px] py-3 px-2 text-xs sm:text-sm md:text-base font-extrabold cursor-pointer border-b-4 transition-all whitespace-nowrap text-center ${
                activeTab === t.id
                  ? 'bg-white text-purple-900 border-purple-600 shadow-sm'
                  : 'text-slate-600 hover:text-purple-800 hover:bg-slate-200/60 border-transparent'
              }`}
            >
              {t.title}
            </button>
          ))}
        </nav>

        {/* Inner Game Stage */}
        <div className="p-4 sm:p-6 flex flex-col min-h-[500px]">
          {/* Progress Header */}
          <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-purple-900 mb-1 px-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Sección: {TABS[activeTab].title}
            </span>
            <span className="bg-purple-100 text-purple-900 px-3 py-0.5 rounded-full border border-purple-300">
              Nivel {currentLevelIndex + 1} de {totalLevels}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mb-4 shadow-inner border border-slate-300">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 ease-out"
              style={{
                width: `${((currentLevelIndex + 1) / totalLevels) * 100}%`
              }}
            />
          </div>

          {/* Canelita's Animated Speech Bubble */}
          <div
            onClick={handleRepeatSpeech}
            className="flex items-center gap-3 bg-amber-50 rounded-2xl p-3 sm:p-4 border-3 border-amber-300 shadow-sm mb-5 cursor-pointer hover:bg-amber-100/70 transition-colors group"
            title="Haz clic para escuchar a Canelita"
          >
            <CanelitaAvatar size="md" src="/instrucciones.png" className="group-hover:scale-105" />
            <div className="flex-1">
              <div className="text-xs font-black text-amber-800 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                <span>Canelita dice:</span>
                <Volume2 className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
              </div>
              <p className="text-amber-950 font-bold text-sm sm:text-base leading-snug">
                {canelitaMsg}
              </p>
            </div>
          </div>

          {/* Tab Specific Content */}
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            {activeTab === 0 && (
              <TabDraw
                key={`tab0-level-${currentLevelIndex}`}
                exercise={DRAW_EXERCISES[currentLevelIndex]}
                levelIndex={currentLevelIndex}
                totalLevels={DRAW_EXERCISES.length}
                studentName={studentName}
                onExerciseComplete={() => handleExerciseComplete(0)}
                setCanelitaMsg={setCanelitaMsg}
              />
            )}

            {activeTab === 1 && (
              <TabBalance1
                key={`tab1-level-${currentLevelIndex}`}
                exercise={BALANCE1_EXERCISES[currentLevelIndex]}
                levelIndex={currentLevelIndex}
                totalLevels={BALANCE1_EXERCISES.length}
                studentName={studentName}
                onExerciseComplete={() => handleExerciseComplete(1)}
                setCanelitaMsg={setCanelitaMsg}
              />
            )}

            {activeTab === 2 && (
              <TabSteps
                key={`tab2-level-${currentLevelIndex}`}
                exercise={STEPS_EXERCISES[currentLevelIndex]}
                levelIndex={currentLevelIndex}
                totalLevels={STEPS_EXERCISES.length}
                studentName={studentName}
                onExerciseComplete={() => handleExerciseComplete(2)}
                setCanelitaMsg={setCanelitaMsg}
              />
            )}

            {activeTab === 3 && (
              <TabBalance2
                key={`tab3-level-${currentLevelIndex}`}
                exercise={BALANCE2_EXERCISES[currentLevelIndex]}
                levelIndex={currentLevelIndex}
                totalLevels={BALANCE2_EXERCISES.length}
                studentName={studentName}
                onExerciseComplete={() => handleExerciseComplete(3)}
                setCanelitaMsg={setCanelitaMsg}
              />
            )}

            {activeTab === 4 && (
              <TabManipulative
                key={`tab4-level-${currentLevelIndex}`}
                exercise={MANIPULATIVE_EXERCISES[currentLevelIndex]}
                levelIndex={currentLevelIndex}
                totalLevels={MANIPULATIVE_EXERCISES.length}
                studentName={studentName}
                onExerciseComplete={() => handleExerciseComplete(4)}
                setCanelitaMsg={setCanelitaMsg}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="mt-4 text-xs font-semibold text-purple-900/70 text-center flex items-center gap-1">
        <span>Diseñado para {studentName} con cariño</span>
        <span>🐾</span>
        <span>Álgebra visual y divertida</span>
      </footer>

      {/* Global Modals */}
      {showWelcome && (
        <WelcomeModal initialName={studentName} onStart={handleStartApp} />
      )}

      {showChangeName && (
        <ChangeNameModal
          currentName={studentName}
          onSave={handleSaveNewName}
          onClose={() => setShowChangeName(false)}
        />
      )}

      {showTutorial && currentTutorials[activeTab] && (
        <TutorialModal
          tutorial={currentTutorials[activeTab]}
          stepIndex={tutorialStep}
          onNextStep={() => setTutorialStep(prev => prev + 1)}
          onClose={handleCloseTutorial}
        />
      )}

      {showRules && <RulesModal onClose={handleCloseRules} />}

      {showCelebration && (
        <CelebrationModal
          tabTitle={TABS[activeTab].title}
          studentName={studentName}
          procedureSummary={TAB_PROCEDURES[activeTab]}
          hasNextTab={activeTab < 4}
          onNextTab={handleNextSection}
          onReplay={handleReplaySection}
        />
      )}

      {/* Visual Confetti & Sparkles Overlay */}
      <CelebrationOverlay />
    </div>
  );
}
