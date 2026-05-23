import { useState } from 'react';
import './App.css';
import AuthGestion from './components/AuthGestion';
import StockGestion from './components/StockGestion';

// Les 3 onglets de l'application
const TABS = [
  { id: 'types', label: 'Types' },
  { id: 'formats', label: 'Formats' },
  { id: 'stocks', label: 'Stocks' },
];


const API_URL = 'http://localhost:8080';

function App() {
  const [isAuthed, setIsAuthed] = useState(false);   
  const [activeTab, setActiveTab] = useState('stocks'); 

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <div>
            <p className="header-eyebrow">Gestion de la brasserie</p>
            <h1>Tableau de bord</h1>
            <p className="header-lede">
              Gérez les types, formats et stocks de votre brasserie.
            </p>
          </div>
          {isAuthed && (
            <button
              className="btn btn-ghost btn-logout"
              onClick={() => setIsAuthed(false)}
            >
              Déconnexion
            </button>
          )}
        </div>
      </header>

      <main>
        {/* Si connecté → affiche le tableau de bord, sinon → affiche la page de connexion */}
        {isAuthed ? (
          <StockGestion
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            TABS={TABS}
            API_URL={API_URL}
          />
        ) : (
          <AuthGestion setIsAuthed={setIsAuthed} />
        )}
      </main>
    </div>
  );
}

export default App;