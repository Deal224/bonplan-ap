export function formatAmount(n) {
  if (n === undefined || n === null) return '0';
  return new Intl.NumberFormat('fr-FR').format(Math.round(n));
}

export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export function formatDateShort(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short',
  });
}

export function daysUntil(iso) {
  if (!iso) return 0;
  const diff = new Date(iso) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function progressPct(current, target) {
  if (!target) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

export function scoreColor(score) {
  if (score >= 80) return '#10B981';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
}

export function scoreLabel(score, lang = 'fr') {
  if (lang === 'en') {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Beginner';
  }
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Bien';
  if (score >= 40) return 'Moyen';
  return 'Débutant';
}

export function emojiList() {
  return [
    '🏠', '✈️', '🎓', '💍', '🚗', '💊', '📱', '👶', '🌱', '💼',
    '🎯', '🏋️', '🎨', '🎵', '🍽️', '🏖️', '💻', '📚', '🛒', '⚽',
  ];
}
