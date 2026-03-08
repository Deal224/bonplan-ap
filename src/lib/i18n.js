export const translations = {
  fr: {
    // Auth
    welcome: 'Bon Plan',
    tagline: 'Épargne comportementale',
    login: 'Se connecter',
    register: "S'inscrire",
    phone: 'Numéro de téléphone',
    pin: 'Code PIN (4 chiffres)',
    name: 'Votre prénom',
    alreadyAccount: 'Déjà un compte ?',
    noAccount: 'Pas encore de compte ?',
    connecting: 'Connexion...',
    creating: 'Création...',

    // Dashboard
    dashboard: 'Tableau de bord',
    totalBalance: 'Solde total',
    myObjectives: 'Mes objectifs',
    newObjective: 'Nouvel objectif',
    noObjectives: 'Aucun objectif pour l\'instant',
    startSaving: 'Commencez à épargner !',

    // Objective
    objectiveName: "Nom de l'objectif",
    targetAmount: 'Montant cible',
    lockDate: 'Date de verrouillage',
    emoji: 'Icône',
    withdrawalRule: 'Règle de retrait',
    ruleNone: 'Aucune restriction',
    ruleMaxMonthly: 'Max mensuel',
    ruleMinBalance: 'Solde minimum',
    ruleMaxAmount: 'Montant max par retrait',
    createObjective: 'Créer l\'objectif',
    deposit: 'Déposer',
    withdraw: 'Retirer',
    amount: 'Montant',
    note: 'Note (optionnel)',
    confirm: 'Confirmer',
    cancel: 'Annuler',
    close: 'Fermer',
    completed: 'Atteint',
    active: 'En cours',
    closed: 'Clôturé',
    progress: 'Progression',
    daysLeft: 'jours restants',
    locked: 'Verrouillé',

    // Transactions
    transactions: 'Historique',
    noTransactions: 'Aucune transaction',
    deposit_tx: 'Dépôt',
    withdrawal_tx: 'Retrait',
    payment: 'Paiement Mobile Money',

    // Score
    score: 'Score de discipline',
    scoreDesc: 'Votre score reflète votre régularité',
    badges: 'Badges',
    noBadges: 'Continuez à épargner pour débloquer des badges !',

    // Passport
    passport: "Passeport d'épargne",
    passportDesc: 'Votre carte d\'épargne partageable',
    share: 'Partager',
    totalSaved: 'Total épargné',
    completedObjectives: 'Objectifs atteints',
    resistances: 'Résistances',

    // Profile
    profile: 'Profil',
    changePin: 'Changer le PIN',
    currentPin: 'PIN actuel',
    newPin: 'Nouveau PIN',
    darkMode: 'Mode sombre',
    language: 'Langue',
    logout: 'Se déconnecter',
    save: 'Enregistrer',
    saving: 'Enregistrement...',

    // Nav
    home: 'Accueil',
    history: 'Historique',

    // Errors
    fillFields: 'Veuillez remplir tous les champs',
    pinLength: 'Le PIN doit faire 4 chiffres',
    phoneInvalid: 'Numéro de téléphone invalide',

    // Payment
    paymentInfo: 'Le dépôt se fait via Mobile Money (Orange, MTN, Wave...)',
    initiatePayment: 'Initier le paiement',
    paymentPhone: 'Numéro Mobile Money',
    paymentSuccess: 'Paiement initié ! Validez sur votre téléphone.',
    minAmount: 'Montant minimum : 1 000 GNF',

    // Units
    gnf: 'GNF',
    of: 'sur',
  },
  en: {
    welcome: 'Bon Plan',
    tagline: 'Behavioral savings',
    login: 'Sign in',
    register: 'Sign up',
    phone: 'Phone number',
    pin: 'PIN code (4 digits)',
    name: 'Your name',
    alreadyAccount: 'Already have an account?',
    noAccount: 'No account yet?',
    connecting: 'Connecting...',
    creating: 'Creating...',

    dashboard: 'Dashboard',
    totalBalance: 'Total balance',
    myObjectives: 'My goals',
    newObjective: 'New goal',
    noObjectives: 'No goals yet',
    startSaving: 'Start saving!',

    objectiveName: 'Goal name',
    targetAmount: 'Target amount',
    lockDate: 'Lock date',
    emoji: 'Icon',
    withdrawalRule: 'Withdrawal rule',
    ruleNone: 'No restriction',
    ruleMaxMonthly: 'Monthly max',
    ruleMinBalance: 'Minimum balance',
    ruleMaxAmount: 'Max amount per withdrawal',
    createObjective: 'Create goal',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    amount: 'Amount',
    note: 'Note (optional)',
    confirm: 'Confirm',
    cancel: 'Cancel',
    close: 'Close',
    completed: 'Completed',
    active: 'Active',
    closed: 'Closed',
    progress: 'Progress',
    daysLeft: 'days left',
    locked: 'Locked',

    transactions: 'History',
    noTransactions: 'No transactions',
    deposit_tx: 'Deposit',
    withdrawal_tx: 'Withdrawal',
    payment: 'Mobile Money payment',

    score: 'Discipline score',
    scoreDesc: 'Your score reflects your consistency',
    badges: 'Badges',
    noBadges: 'Keep saving to unlock badges!',

    passport: 'Savings passport',
    passportDesc: 'Your shareable savings card',
    share: 'Share',
    totalSaved: 'Total saved',
    completedObjectives: 'Completed goals',
    resistances: 'Resistances',

    profile: 'Profile',
    changePin: 'Change PIN',
    currentPin: 'Current PIN',
    newPin: 'New PIN',
    darkMode: 'Dark mode',
    language: 'Language',
    logout: 'Sign out',
    save: 'Save',
    saving: 'Saving...',

    home: 'Home',
    history: 'History',

    fillFields: 'Please fill in all fields',
    pinLength: 'PIN must be 4 digits',
    phoneInvalid: 'Invalid phone number',

    paymentInfo: 'Deposit via Mobile Money (Orange, MTN, Wave...)',
    initiatePayment: 'Initiate payment',
    paymentPhone: 'Mobile Money number',
    paymentSuccess: 'Payment initiated! Confirm on your phone.',
    minAmount: 'Minimum amount: 1,000 GNF',

    gnf: 'GNF',
    of: 'of',
  },
};

export function t(lang, key) {
  return translations[lang]?.[key] || translations.fr[key] || key;
}

export function useLang(lang) {
  return (key) => t(lang, key);
}
