import { useState } from 'react';
import { supabase } from '../supabaseClient';

function AuthGestion({ setIsAuthed }) {
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError('');
    setLoading(true);

    const { username, password } = loginForm;

    try {            
      const { data: user, error } = await supabase
        .from('admins')
        .select('*')
        .eq('username', username.trim())
        .eq('password', password)
        .single();

      if (error || !user) {
        setLoginError('Identifiants invalides.');
        return;
      }

      setIsAuthed(true);
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setLoginError('Erreur, veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <section className="login-panel panel">
      <h2 className="panel-title">Connexion</h2>
      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="text"
          name="username"
          value={loginForm.username}
          onChange={handleChange}
          placeholder="Nom d'utilisateur"
          required
        />
        <input
          type="password"
          name="password"
          value={loginForm.password}
          onChange={handleChange}
          placeholder="Mot de passe"
          required
        />
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
      {loginError && <p className="flash flash--error">{loginError}</p>}
    </section>
  );
}

export default AuthGestion;
