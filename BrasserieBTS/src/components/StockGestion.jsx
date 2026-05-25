import { useEffect, useState } from 'react'

const EMPTY_STOCK = { idType: '', idFormat: '', quantite: '' }

async function api(path, method = 'GET', body = null) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : null,
  })
  return res
}

function StockGestion({ activeTab, setActiveTab, TABS, API_URL }) {
  const [types,   setTypes]   = useState([])
  const [formats, setFormats] = useState([])
  const [stocks,  setStocks]  = useState([])

  const [typeLabel,   setTypeLabel]   = useState('')
  const [formatLabel, setFormatLabel] = useState('')
  const [stockForm,   setStockForm]   = useState(EMPTY_STOCK)

  const [editId,        setEditId]        = useState(null)
  const [stockEditForm, setStockEditForm] = useState(EMPTY_STOCK)

  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error,   setError]   = useState('')

  const flash = (msg, isError = false) => {
    setMessage(isError ? '' : msg)
    setError(isError ? msg : '')
  }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [t, f, s] = await Promise.all([
        fetch(`${API_URL}/types`).then(r => r.json()),
        fetch(`${API_URL}/formats`).then(r => r.json()),
        fetch(`${API_URL}/beers`).then(r => r.json()),
      ])
      setTypes(t); setFormats(f); setStocks(s)
    } catch {
      flash('Connexion API impossible.', true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const createType = async (e) => {
    e.preventDefault()
    const res = await api(`${API_URL}/types`, 'POST', { libelle: typeLabel.trim() })
    if (!res.ok) return flash('Échec création type.', true)
    setTypeLabel(''); flash('Type ajouté.'); fetchAll()
  }

  const updateType = async (type) => {
    const libelle = window.prompt('Nouveau libellé :', type.libelle)
    if (!libelle?.trim()) return
    const res = await api(`${API_URL}/types/${type.id}`, 'PUT', { libelle: libelle.trim() })
    if (!res.ok) return flash('Échec modification type.', true)
    flash('Type modifié.'); fetchAll()
  }

  const deleteType = async (id) => {
    if (!window.confirm('Supprimer ce type ?')) return
    const res = await api(`${API_URL}/types/${id}`, 'DELETE')
    if (!res.ok) return flash('Échec suppression type.', true)
    flash('Type supprimé.'); fetchAll()
  }

  const createFormat = async (e) => {
    e.preventDefault()
    const res = await api(`${API_URL}/formats`, 'POST', { libelle: formatLabel.trim() })
    if (!res.ok) return flash('Échec création format.', true)
    setFormatLabel(''); flash('Format ajouté.'); fetchAll()
  }

  const updateFormat = async (format) => {
    const libelle = window.prompt('Nouveau libellé :', format.libelle)
    if (!libelle?.trim()) return
    const res = await api(`${API_URL}/formats/${format.id}`, 'PUT', { libelle: libelle.trim() })
    if (!res.ok) return flash('Échec modification format.', true)
    flash('Format modifié.'); fetchAll()
  }

  const deleteFormat = async (id) => {
    if (!window.confirm('Supprimer ce format ?')) return
    const res = await api(`${API_URL}/formats/${id}`, 'DELETE')
    if (!res.ok) return flash('Échec suppression format.', true)
    flash('Format supprimé.'); fetchAll()
  }

  const toNumbers = (f) => ({ idType: Number(f.idType), idFormat: Number(f.idFormat), quantite: Number(f.quantite) })

  const createStock = async (e) => {
    e.preventDefault()
    const res = await api(`${API_URL}/beers`, 'POST', toNumbers(stockForm))
    if (!res.ok) return flash('Échec création stock.', true)
    setStockForm(EMPTY_STOCK); flash('Stock ajouté.'); fetchAll()
  }

  const saveStock = async () => {
    const res = await api(`${API_URL}/beers/${editId}`, 'PUT', toNumbers(stockEditForm))
    if (!res.ok) return flash('Échec modification stock.', true)
    setEditId(null); flash('Stock modifié.'); fetchAll()
  }

  const deleteStock = async (id) => {
    if (!window.confirm('Supprimer ce stock ?')) return
    const res = await api(`${API_URL}/beers/${id}`, 'DELETE')
    if (!res.ok) return flash('Échec suppression stock.', true)
    flash('Stock supprimé.'); fetchAll()
  }

  return (
    <>
      <nav className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {message && <div className="flash success">{message}</div>}
      {error   && <div className="flash error">{error}</div>}

      {loading ? <p className="loading">Chargement…</p> : (
        <>
          {activeTab === 'types' && (
            <section className="panel">
              <h2 className="panel-title">Types de bière</h2>
              <form className="row-form" onSubmit={createType}>
                <input value={typeLabel} onChange={e => setTypeLabel(e.target.value)} placeholder="Nouveau type (ex: IPA)" />
                <button className="btn btn-primary">Ajouter</button>
              </form>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>ID</th><th>Libellé</th><th>Actions</th></tr></thead>
                  <tbody>
                    {types.map(type => (
                      <tr key={type.id}>
                        <td>{type.id}</td>
                        <td>{type.libelle}</td>
                        <td className="actions">
                          <button className="btn btn-ghost"  onClick={() => updateType(type)}>Modifier</button>
                          <button className="btn btn-danger" onClick={() => deleteType(type.id)}>Supprimer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'formats' && (
            <section className="panel">
              <h2 className="panel-title">Formats</h2>
              <form className="row-form" onSubmit={createFormat}>
                <input value={formatLabel} onChange={e => setFormatLabel(e.target.value)} placeholder="Nouveau format (ex: 33cl)" />
                <button className="btn btn-primary">Ajouter</button>
              </form>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>ID</th><th>Libellé</th><th>Actions</th></tr></thead>
                  <tbody>
                    {formats.map(format => (
                      <tr key={format.id}>
                        <td>{format.id}</td>
                        <td>{format.libelle}</td>
                        <td className="actions">
                          <button className="btn btn-ghost"  onClick={() => updateFormat(format)}>Modifier</button>
                          <button className="btn btn-danger" onClick={() => deleteFormat(format.id)}>Supprimer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'stocks' && (
            <>
              <section className="panel">
                <h2 className="panel-title">Ajouter un stock</h2>
                <form className="row-form" onSubmit={createStock}>
                  <select value={stockForm.idType} onChange={e => setStockForm(f => ({ ...f, idType: e.target.value }))}>
                    <option value="">-- Type --</option>
                    {types.map(t => <option key={t.id} value={t.id}>{t.libelle}</option>)}
                  </select>
                  <select value={stockForm.idFormat} onChange={e => setStockForm(f => ({ ...f, idFormat: e.target.value }))}>
                    <option value="">-- Format --</option>
                    {formats.map(f => <option key={f.id} value={f.id}>{f.libelle}</option>)}
                  </select>
                  <input type="number" min="0" value={stockForm.quantite} onChange={e => setStockForm(f => ({ ...f, quantite: e.target.value }))} placeholder="Quantité" />
                  <button className="btn btn-primary">Ajouter</button>
                </form>
              </section>

              <section className="panel">
                <h2 className="panel-title">Stocks</h2>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
                  <img src="/ressources/produits-01.png" alt="produit 1" style={{ height: '60px', objectFit: 'contain' }} />
                  <img src="/ressources/produits-02.png" alt="produit 2" style={{ height: '60px', objectFit: 'contain' }} />
                  <img src="/ressources/produits-03.png" alt="produit 3" style={{ height: '60px', objectFit: 'contain' }} />
                  <img src="/ressources/gin.png"         alt="produit 4" style={{ height: '60px', objectFit: 'contain' }} />
                  <img src="/ressources/whisky.png"      alt="produit 5" style={{ height: '60px', objectFit: 'contain' }} />
                </div>

                <div className="table-wrap">
                  <table>
                    <thead><tr><th>ID</th><th>Type</th><th>Format</th><th>Quantité</th><th>Actions</th></tr></thead>
                    <tbody>
                      {stocks.map(stock => {
                        const isEditing = editId === stock.id
                        return (
                          <tr key={stock.id}>
                            <td>{stock.id}</td>
                            <td>
                              {isEditing
                                ? <select value={stockEditForm.idType} onChange={e => setStockEditForm(f => ({ ...f, idType: e.target.value }))}>
                                    {types.map(t => <option key={t.id} value={t.id}>{t.libelle}</option>)}
                                  </select>
                                : stock.type
                              }
                            </td>
                            <td>
                              {isEditing
                                ? <select value={stockEditForm.idFormat} onChange={e => setStockEditForm(f => ({ ...f, idFormat: e.target.value }))}>
                                    {formats.map(f => <option key={f.id} value={f.id}>{f.libelle}</option>)}
                                  </select>
                                : stock.format
                              }
                            </td>
                            <td>
                              {isEditing
                                ? <input type="number" min="0" value={stockEditForm.quantite} onChange={e => setStockEditForm(f => ({ ...f, quantite: e.target.value }))} />
                                : stock.quantite
                              }
                            </td>
                            <td className="actions">
                              {isEditing ? (
                                <>
                                  <button className="btn btn-primary" onClick={saveStock}>Sauvegarder</button>
                                  <button className="btn btn-ghost"   onClick={() => setEditId(null)}>Annuler</button>
                                </>
                              ) : (
                                <>
                                  <button className="btn btn-ghost"  onClick={() => { setEditId(stock.id); setStockEditForm({ idType: stock.idType, idFormat: stock.idFormat, quantite: stock.quantite }) }}>Modifier</button>
                                  <button className="btn btn-danger" onClick={() => deleteStock(stock.id)}>Supprimer</button>
                                </>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </>
      )}
    </>
  )
}

export default StockGestion
