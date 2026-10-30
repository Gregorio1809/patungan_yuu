import { createRoot } from 'react-dom/client'
import App from './App'
import {
  applyPreferences,
  usePreferencesStore,
} from './store/preferences'
import './styles.css'

const initialPreferences = usePreferencesStore.getState()
applyPreferences(
  initialPreferences.language,
  initialPreferences.theme,
)

createRoot(document.getElementById('root')!).render(<App />)
