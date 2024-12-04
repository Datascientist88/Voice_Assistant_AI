import { create } from 'zustand';


const useLanguageStore = create((set) => ({
  selectedLanguage: "ar-SA", // Default language
  setSelectedLanguage: (language) => set({ selectedLanguage: language }),
}));

export default useLanguageStore;