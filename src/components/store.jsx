
import create from 'zustand'

const useStore = create(set => ({
  apiKey: '',
  setApiKey: (apiKey) => set({ apiKey }),
}))

export default useStore;