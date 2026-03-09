import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  {
    icon: '🎯',
    title: 'Atteins tes objectifs financiers',
    text: "Crée des objectifs d'épargne et protège ton argent contre les dépenses impulsives",
  },
  {
    icon: '🔒',
    title: 'Tu choisis tes propres règles',
    text: 'Bloque tes retraits, fixe des limites mensuelles. Tu te protèges contre toi-même',
  },
  {
    icon: '🤝',
    title: "Créez des cercles d'épargne",
    text: 'Invitez vos amis et famille dans une tontine numérique transparente',
  },
];

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();

  const finish = () => {
    localStorage.setItem('bonplan_onboarded', 'true');
    navigate('/auth', { replace: true });
  };

  const next = () => {
    if (current < slides.length - 1) {
      setDirection(1);
      setCurrent(current + 1);
    } else {
      finish();
    }
  };

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  const slide = slides[current];

  return (
    <div
      className="relative flex flex-col min-h-screen overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1A4731 0%, #2E7D52 50%, #FFBE00 100%)' }}
    >
      {/* Passer */}
      <div className="flex justify-end p-6 z-10">
        <button
          onClick={finish}
          className="text-white/70 text-sm font-medium hover:text-white transition-colors"
        >
          Passer
        </button>
      </div>

      {/* Slide area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
            className="flex flex-col items-center text-center absolute inset-x-8"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              className="text-8xl mb-10 select-none"
              style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.25))' }}
            >
              {slide.icon}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-white text-2xl font-bold mb-4 leading-tight"
            >
              {slide.title}
            </motion.h1>

            {/* Text */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-white/80 text-base leading-relaxed max-w-xs"
            >
              {slide.text}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="flex flex-col items-center gap-6 pb-12 px-8 z-10">
        {/* Dots */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <motion.div
              key={i}
              animate={{ width: i === current ? 24 : 8, opacity: i === current ? 1 : 0.4 }}
              transition={{ duration: 0.3 }}
              className="h-2 rounded-full bg-white"
            />
          ))}
        </div>

        {/* Button */}
        <button
          onClick={next}
          className="w-full max-w-xs rounded-2xl py-4 font-bold text-base transition-transform active:scale-95"
          style={{ background: 'white', color: '#1A4731' }}
        >
          {current < slides.length - 1 ? 'Suivant' : 'Commencer'}
        </button>
      </div>
    </div>
  );
}
