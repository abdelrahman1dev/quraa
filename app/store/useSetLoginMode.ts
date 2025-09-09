import { create } from 'zustand';

interface LoginModeState {
  mode: 'login' | 'signup';
  setMode: (mode: 'login' | 'signup') => void;
}

const useSetLoginMode = create<LoginModeState>((set) => ({
  mode: 'login',
  setMode: (mode) => set({ mode } ,),
  
}));

export default useSetLoginMode;
