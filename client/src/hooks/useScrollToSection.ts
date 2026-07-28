import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Navega a "/" y hace scroll suave hasta una sección del Home (#catalogo,
 * #como-funciona, #nosotros) sin usar el hash de la URL — la app ya usa
 * HashRouter para las rutas, así que un href="#id" normal chocaría con el
 * ruteo. Home.tsx debe leer location.state.scrollTo para completar el scroll
 * cuando la navegación viene desde otra ruta.
 */
export function useScrollToSection() {
  const navigate = useNavigate();
  const location = useLocation();

  return (id: string) => {
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/', { state: { scrollTo: id } });
    }
  };
}
