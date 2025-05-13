// src/App.tsx
import { useRoutes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { routes } from './routes';
import { AuthProvider } from './context/AuthContext';

function App() {
    const routing = useRoutes(routes);

    return (
        <AuthProvider>
            {routing}
            <ToastContainer position="top-right" autoClose={5000} />
        </AuthProvider>
    );
}

export default App;