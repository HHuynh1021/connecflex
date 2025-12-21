import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { Provider_css } from './components/ui/provider.tsx'
import { Provider } from 'react-redux'
import { store, persistor } from './services/store.tsx'
import { PersistGate } from 'redux-persist/integration/react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <Provider_css>
          <App />
        </Provider_css>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
