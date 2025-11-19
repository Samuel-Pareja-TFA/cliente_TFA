import './App.css';
import { AppHeader } from './components/layout/AppHeader.jsx';
import { AppRoutes } from './router/AppRoutes.jsx';

/**
 * Componente raíz de la UI.
 *
 * Solo compone la cabecera y las rutas principales de la aplicación.
 * La lógica de rutas está en {@link AppRoutes} y la lógica de auth en {@link AuthProvider}.
 */
function App() {
  return (
    <>
      <AppHeader />
      <AppRoutes />
    </>
  );
}

export default App
