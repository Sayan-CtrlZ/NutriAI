import { NutriProvider } from './context/NutriContext';
import Home from './pages/Home';


function App() {
    return (
        <NutriProvider>
            <Home />
        </NutriProvider>
    );
}

export default App;
