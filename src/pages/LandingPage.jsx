import { useNavigate } from 'react-router-dom';

const go = (navigate, path) => () => navigate(path);

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#1a1a1a', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px', background: '#1A4731', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <span style={{ color: '#FFBE00', fontWeight: 900, fontSize: '22px', letterSpacing: '-0.5px' }}>
          BON PLAN
        </span>
        <button onClick={go(navigate, '/auth')} style={styles.navBtn}>Se connecter</button>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(150deg, #1A4731 0%, #2E7D52 60%, #FFBE00 100%)',
        minHeight: '92vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '60px 24px', textAlign: 'center',
      }}>
        <div style={{
          background: '#FFBE00', borderRadius: '24px',
          width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '36px', marginBottom: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        }}>💰</div>

        <h1 style={{
          color: 'white', fontSize: 'clamp(28px, 6vw, 52px)',
          fontWeight: 900, lineHeight: 1.15, maxWidth: '640px',
          marginBottom: '16px', letterSpacing: '-1px',
        }}>
          Épargnez avec discipline,<br />atteignez vos rêves
        </h1>

        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '18px', marginBottom: '40px' }}>
          L'app d'épargne made in Guinée 🇬🇳
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={go(navigate, '/onboarding')} style={styles.heroPrimary}>
            Commencer gratuitement
          </button>
          <button onClick={go(navigate, '/auth')} style={styles.heroSecondary}>
            Se connecter
          </button>
        </div>
      </section>

      {/* ── PROBLÈME ── */}
      <section style={{ padding: '72px 24px', background: '#FAFAFA', textAlign: 'center' }}>
        <h2 style={styles.sectionTitle}>Tu gagnes mais tu n'épargnes pas ?</h2>
        <p style={styles.sectionSub}>Tu n'es pas seul. C'est un problème universel.</p>

        <div style={styles.grid3}>
          {[
            { icon: '💸', text: "L'argent part sans qu'on sache où" },
            { icon: '😔', text: 'Les bonnes intentions ne suffisent pas' },
            { icon: '🤝', text: 'Les tontines sont risquées et informelles' },
          ].map(({ icon, text }) => (
            <div key={text} style={styles.painCard}>
              <span style={{ fontSize: '40px' }}>{icon}</span>
              <p style={{ marginTop: '12px', fontWeight: 600, color: '#333', fontSize: '15px', lineHeight: 1.5 }}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section style={{ padding: '72px 24px', background: 'white', textAlign: 'center' }}>
        <h2 style={styles.sectionTitle}>BON PLAN change la donne</h2>
        <p style={styles.sectionSub}>Des outils pensés pour ta réalité.</p>

        <div style={styles.grid3}>
          {[
            { icon: '🎯', title: 'Objectifs clairs', text: 'Fixe un montant et une deadline. Suis ta progression chaque jour.' },
            { icon: '🔒', title: 'Tes règles', text: 'Bloque tes retraits, fixe des limites. Tu te protèges contre toi-même.' },
            { icon: '🤝', title: 'Cercles d\'épargne', text: 'Crée une tontine numérique transparente avec tes proches.' },
          ].map(({ icon, title, text }) => (
            <div key={title} style={styles.solutionCard}>
              <div style={styles.iconCircle}>{icon}</div>
              <h3 style={{ fontWeight: 800, fontSize: '18px', color: '#1A4731', margin: '16px 0 8px' }}>{title}</h3>
              <p style={{ color: '#555', fontSize: '14px', lineHeight: 1.6 }}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section style={{ padding: '72px 24px', background: '#F0F9F4', textAlign: 'center' }}>
        <h2 style={styles.sectionTitle}>Comment ça marche ?</h2>
        <p style={styles.sectionSub}>3 étapes, c'est tout.</p>

        <div style={{ ...styles.grid3, maxWidth: '800px', margin: '0 auto' }}>
          {[
            { step: '1', icon: '🎯', title: 'Crée ton objectif', text: 'Donne-lui un nom, un montant, une date cible.' },
            { step: '2', icon: '📱', title: 'Dépose via Mobile Money', text: 'Orange Money, MTN, Moov — c\'est simple et rapide.' },
            { step: '3', icon: '🏆', title: 'Atteins ton rêve', text: 'Regarde ton épargne grandir, retirer quand tu es prêt.' },
          ].map(({ step, icon, title, text }) => (
            <div key={step} style={styles.stepCard}>
              <div style={styles.stepBadge}>{step}</div>
              <div style={{ fontSize: '36px', margin: '12px 0 8px' }}>{icon}</div>
              <h3 style={{ fontWeight: 800, fontSize: '16px', color: '#1A4731', marginBottom: '8px' }}>{title}</h3>
              <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.5 }}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{
        background: 'linear-gradient(135deg, #1A4731 0%, #2E7D52 100%)',
        padding: '80px 24px', textAlign: 'center',
      }}>
        <h2 style={{ color: 'white', fontSize: 'clamp(22px, 5vw, 40px)', fontWeight: 900, marginBottom: '16px', maxWidth: '560px', margin: '0 auto 16px' }}>
          Rejoins des milliers de Guinéens qui épargnent
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '16px', marginBottom: '36px' }}>
          Gratuit. Sans frais cachés. Toujours sous ton contrôle.
        </p>
        <button onClick={go(navigate, '/onboarding')} style={styles.ctaBtn}>
          Créer mon compte gratuit →
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#111', color: '#888', textAlign: 'center', padding: '24px', fontSize: '13px' }}>
        © {new Date().getFullYear()} BON PLAN · Made with ❤️ in Guinée
      </footer>

    </div>
  );
}

const styles = {
  navBtn: {
    background: '#FFBE00', color: '#1A4731', border: 'none',
    borderRadius: '10px', padding: '10px 20px',
    fontWeight: 700, fontSize: '14px', cursor: 'pointer',
  },
  heroPrimary: {
    background: '#FFBE00', color: '#1A4731', border: 'none',
    borderRadius: '14px', padding: '16px 32px',
    fontWeight: 800, fontSize: '16px', cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
  heroSecondary: {
    background: 'rgba(255,255,255,0.15)', color: 'white',
    border: '2px solid rgba(255,255,255,0.5)',
    borderRadius: '14px', padding: '16px 32px',
    fontWeight: 700, fontSize: '16px', cursor: 'pointer',
  },
  sectionTitle: {
    fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 900,
    color: '#1A4731', marginBottom: '12px',
  },
  sectionSub: {
    color: '#666', fontSize: '16px', marginBottom: '48px',
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '24px', maxWidth: '960px', margin: '0 auto',
  },
  painCard: {
    background: 'white', borderRadius: '16px',
    padding: '32px 24px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
    textAlign: 'center',
  },
  solutionCard: {
    background: '#F0F9F4', borderRadius: '20px',
    padding: '32px 24px', textAlign: 'center',
    border: '1px solid #D4EDDA',
  },
  iconCircle: {
    width: 64, height: 64, borderRadius: '50%',
    background: '#1A4731', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '28px', margin: '0 auto',
  },
  stepCard: {
    background: 'white', borderRadius: '20px',
    padding: '32px 20px', textAlign: 'center',
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
    position: 'relative',
  },
  stepBadge: {
    width: 36, height: 36, borderRadius: '50%',
    background: '#FFBE00', color: '#1A4731',
    fontWeight: 900, fontSize: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto',
  },
  ctaBtn: {
    background: '#FFBE00', color: '#1A4731', border: 'none',
    borderRadius: '14px', padding: '18px 40px',
    fontWeight: 900, fontSize: '17px', cursor: 'pointer',
    boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
  },
};
