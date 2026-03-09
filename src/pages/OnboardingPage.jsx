import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const finish = () => {
    localStorage.setItem('bonplan_onboarded', 'true');
    navigate('/auth');
  };

  const next = () => {
    if (current < 2) {
      setCurrent(current + 1);
    } else {
      finish();
    }
  };

  const slide = slides[current];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #1A4731 0%, #2E7D52 50%, #FFBE00 100%)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '24px' }}>
        <button
          onClick={finish}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.75)',
            fontSize: '15px',
            cursor: 'pointer',
          }}
        >
          Passer
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 32px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '96px', marginBottom: '40px' }}>{slide.icon}</div>
        <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', lineHeight: 1.3 }}>
          {slide.title}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', lineHeight: 1.6, maxWidth: '300px' }}>
          {slide.text}
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          padding: '0 32px 48px',
        }}
      >
        {/* Dots */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {slides.map((_, i) => (
            <div
              key={i}
              style={{
                height: '8px',
                width: i === current ? '24px' : '8px',
                borderRadius: '4px',
                background: 'white',
                opacity: i === current ? 1 : 0.4,
                transition: 'width 0.3s, opacity 0.3s',
              }}
            />
          ))}
        </div>

        {/* Button */}
        <button
          onClick={next}
          style={{
            width: '100%',
            maxWidth: '320px',
            padding: '16px',
            borderRadius: '16px',
            border: 'none',
            background: 'white',
            color: '#1A4731',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {current < 2 ? 'Suivant' : 'Commencer'}
        </button>
      </div>
    </div>
  );
}
