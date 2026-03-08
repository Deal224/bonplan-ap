import { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem('bonplan_token') || null,
  objectives: [],
  transactions: [],
  score: null,
  darkMode: localStorage.getItem('bonplan_dark') === 'true',
  lang: localStorage.getItem('bonplan_lang') || 'fr',
  balanceVisible: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_AUTH':
      localStorage.setItem('bonplan_token', action.token);
      return { ...state, user: action.user, token: action.token };
    case 'SET_USER':
      return { ...state, user: action.user };
    case 'LOGOUT':
      localStorage.removeItem('bonplan_token');
      return { ...initialState, token: null, darkMode: state.darkMode, lang: state.lang };
    case 'SET_OBJECTIVES':
      return { ...state, objectives: action.objectives };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.transactions };
    case 'SET_SCORE':
      return { ...state, score: action.score };
    case 'TOGGLE_BALANCE':
      return { ...state, balanceVisible: !state.balanceVisible };
    case 'SET_DARK':
      localStorage.setItem('bonplan_dark', action.value);
      return { ...state, darkMode: action.value };
    case 'SET_LANG':
      localStorage.setItem('bonplan_lang', action.value);
      return { ...state, lang: action.value };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.darkMode);
  }, [state.darkMode]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
