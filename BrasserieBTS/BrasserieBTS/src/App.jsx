import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:8080'
const TOKEN_KEY = 'brasserie_admin_token'

const productHighlights = [
  {
    title: 'Biere Blonde',
    description:
      "Legere et rafraichissante, elle propose un equilibre entre douceur et amertume avec des notes de cereales et une touche florale.",
  },
  {
    title: 'Biere Brune',
    description:
      'Riche et intense, elle developpe des aromes de chocolat noir, caramel et une pointe de cafe pour une degustation reconfortante.',
  },
  {
    title: 'Biere IPA',
    description:
      'Audacieuse et aromatique, elle met en avant les houblons avec des notes d agrumes, de fruits tropicaux et une finale seche.',
  },
  {
    title: 'Whisky',
    description:
      'Vieilli en futs de chene, il offre des notes de vanille, epices douces et fruits secs, avec une finale elegante.',
  },
  {
    title: 'Gin',
    description:
      'Elabore avec des botaniques locales, il allie genevrier, zestes d agrumes et touches herbacees pour des cocktails raffines.',
  },
]

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? '')
  const [loginForm, setLoginForm] = useState({ username: 'admin', password: 'BTS2025!' })
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('stocks')

  const [types, setTypes] = useState([])
  const [formats, setFormats] = useState([])
  const [stocks, setStocks] = useState([])

  const [newType, setNewType] = useState('')
  const [newFormat, setNewFormat] = useState('')
  const [stockForm, setStockForm] = useState({ idType: '', idFormat: '', quantite: '' })

  const isLoggedIn = token.length > 0

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }),
    [token],
  )

  const loadData = async () => {
    if (!isLoggedIn) return
    try {
      const [typesRes, formatsRes, stocksRes] = await Promise.all([
        fetch(`${API_URL}/types`, { headers: authHeaders }),
        fetch(`${API_URL}/formats`, { headers: authHeaders }),
        fetch(`${API_URL}/beers`, { headers: authHeaders }),
      ])

      if (!typesRes.ok || !formatsRes.ok || !stocksRes.ok) {
        throw new Error('Impossible de charger les donnees. Verifier le token.')
      }

      setTypes(await typesRes.json())
      setFormats(await formatsRes.json())
      setStocks(await stocksRes.json())
    } catch (error) {
      setMessage(error.message)
    }
  }

  useEffect(() => {
    loadData()
  }, [isLoggedIn, token])

  const handleLogin = async (event) => {
    event.preventDefault()
    setMessage('')

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      })

      if (!response.ok) {
        throw new Error('Identifiants invalides.')
      }

      const data = await response.json()
      localStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
      setMessage('Connexion admin reussie.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken('')
    setTypes([])
    setFormats([])
    setStocks([])
    setMessage('Session fermee.')
  }

  const createType = async (event) => {
    event.preventDefault()
    if (!newType.trim()) return
    await fetch(`${API_URL}/types`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ libelle: newType.trim() }),
    })
    setNewType('')
    await loadData()
  }

  const updateType = async (type) => {
    const libelle = prompt('Nouveau libelle du type :', type.libelle)
    if (!libelle) return
    await fetch(`${API_URL}/types/${type.id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ libelle }),
    })
    await loadData()
  }

  const deleteType = async (id) => {
    await fetch(`${API_URL}/types/${id}`, { method: 'DELETE', headers: authHeaders })
    await loadData()
  }

  const createFormat = async (event) => {
    event.preventDefault()
    if (!newFormat.trim()) return
    await fetch(`${API_URL}/formats`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ libelle: newFormat.trim() }),
    })
    setNewFormat('')
    await loadData()
  }

  const updateFormat = async (format) => {
    const libelle = prompt('Nouveau libelle du format :', format.libelle)
    if (!libelle) return
    await fetch(`${API_URL}/formats/${format.id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ libelle }),
    })
    await loadData()
  }

  const deleteFormat = async (id) => {
    await fetch(`${API_URL}/formats/${id}`, { method: 'DELETE', headers: authHeaders })
    await loadData()
  }

  const createStock = async (event) => {
    event.preventDefault()
    await fetch(`${API_URL}/beers`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        idType: Number(stockForm.idType),
        idFormat: Number(stockForm.idFormat),
        quantite: Number(stockForm.quantite),
      }),
    })
    setStockForm({ idType: '', idFormat: '', quantite: '' })
    await loadData()
  }

  const updateStock = async (stock) => {
    const quantite = prompt('Nouvelle quantite :', String(stock.quantite))
    if (!quantite) return
    await fetch(`${API_URL}/beers/${stock.id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        idType: stock.idType ?? types.find((t) => t.libelle === stock.type)?.id,
        idFormat: stock.idFormat ?? formats.find((f) => f.libelle === stock.format)?.id,
        quantite: Number(quantite),
      }),
    })
    await loadData()
  }

  const deleteStock = async (id) => {
    await fetch(`${API_URL}/beers/${id}`, { method: 'DELETE', headers: authHeaders })
    await loadData()
  }

  return (
    <main className="app">
      <header className="hero">
        <h1>Brasserie Terroir et Savoirs</h1>
        <p>Gestion des stocks E6 - Application React + API REST Dart securisee</p>
      </header>

      {!isLoggedIn ? (
        <section className="card">
          <h2>Connexion administrateur</h2>
          <form onSubmit={handleLogin} className="form-grid">
            <input
              type="text"
              placeholder="Utilisateur"
              value={loginForm.username}
              onChange={(e) => setLoginForm((prev) => ({ ...prev, username: e.target.value }))}
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={loginForm.password}
              onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
            />
            <button type="submit">Se connecter</button>
          </form>
          <p className="hint">Compte par defaut: admin / BTS2025!</p>
        </section>
      ) : (
        <>
          <section className="toolbar">
            <div className="tabs">
              {['stocks', 'types', 'formats'].map((tab) => (
                <button
                  type="button"
                  key={tab}
                  className={activeTab === tab ? 'active' : ''}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button type="button" onClick={logout}>
              Deconnexion
            </button>
          </section>

          {activeTab === 'types' && (
            <section className="card">
              <h2>CRUD des types de produits</h2>
              <form onSubmit={createType} className="inline-form">
                <input value={newType} onChange={(e) => setNewType(e.target.value)} placeholder="Nouveau type" />
                <button type="submit">Ajouter</button>
              </form>
              <ul className="list">
                {types.map((type) => (
                  <li key={type.id}>
                    <span>{type.libelle}</span>
                    <div>
                      <button type="button" onClick={() => updateType(type)}>
                        Modifier
                      </button>
                      <button type="button" onClick={() => deleteType(type.id)}>
                        Supprimer
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {activeTab === 'formats' && (
            <section className="card">
              <h2>CRUD des formats de produits</h2>
              <form onSubmit={createFormat} className="inline-form">
                <input
                  value={newFormat}
                  onChange={(e) => setNewFormat(e.target.value)}
                  placeholder="Nouveau format"
                />
                <button type="submit">Ajouter</button>
              </form>
              <ul className="list">
                {formats.map((format) => (
                  <li key={format.id}>
                    <span>{format.libelle}</span>
                    <div>
                      <button type="button" onClick={() => updateFormat(format)}>
                        Modifier
                      </button>
                      <button type="button" onClick={() => deleteFormat(format.id)}>
                        Supprimer
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {activeTab === 'stocks' && (
            <section className="card">
              <h2>CRUD des stocks de produits</h2>
              <form onSubmit={createStock} className="inline-form three">
                <select
                  value={stockForm.idType}
                  onChange={(e) => setStockForm((prev) => ({ ...prev, idType: e.target.value }))}
                  required
                >
                  <option value="">Type</option>
                  {types.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.libelle}
                    </option>
                  ))}
                </select>
                <select
                  value={stockForm.idFormat}
                  onChange={(e) => setStockForm((prev) => ({ ...prev, idFormat: e.target.value }))}
                  required
                >
                  <option value="">Format</option>
                  {formats.map((format) => (
                    <option key={format.id} value={format.id}>
                      {format.libelle}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  value={stockForm.quantite}
                  onChange={(e) => setStockForm((prev) => ({ ...prev, quantite: e.target.value }))}
                  placeholder="Quantite"
                  required
                />
                <button type="submit">Ajouter</button>
              </form>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Format</th>
                    <th>Quantite</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock) => (
                    <tr key={stock.id}>
                      <td>{stock.id}</td>
                      <td>{stock.type}</td>
                      <td>{stock.format}</td>
                      <td>{stock.quantite}</td>
                      <td className="actions">
                        <button type="button" onClick={() => updateStock(stock)}>
                          Modifier
                        </button>
                        <button type="button" onClick={() => deleteStock(stock.id)}>
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </>
      )}

      <section className="card">
        <h2>Ressources produits</h2>
        <div className="resource-grid">
          {productHighlights.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>
      {message && <p className="status">{message}</p>}
    </main>
  )
}

export default App
