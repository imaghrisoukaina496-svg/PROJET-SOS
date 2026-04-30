import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import logo from '../assets/logo.png';
import { useTheme } from '../ThemeContext';

const EyeIcon = ({ open }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function Login() {
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ full_name: '', email: '', password: '', confirm: '', role: 'USER' });
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const nav = useNavigate();
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';

  // ─── Palette dynamique selon le thème ───────────────────────────────────────
  const c = dark ? {
    pageBg:       '#0D0D0D',
    rightBg:      '#1A0A0A',
    leftBg:       'linear-gradient(135deg, #1A0008 0%, #3D0010 40%, #8B0000 100%)',
    leftBorder:   '#FF000020',
    text:         '#FFFFFF',
    textMuted:    '#777777',
    textSubtle:   '#444444',
    inputBg:      '#2A1010',
    inputBorder:  '#FF000030',
    inputBorderH: '#FF0000',
    tabBg:        '#1A0A0A',
    tabBorder:    '#2A1A1A',
    toggleBg:     '#1A1A1A',
    toggleBorder: '#333333',
    toggleText:   '#DDDDDD',
  } : {
    pageBg:       '#F5F5F5',
    rightBg:      '#FFFFFF',
    leftBg:       'linear-gradient(135deg, #3D0010 0%, #8B0000 40%, #CC0000 100%)',
    leftBorder:   '#CC000030',
    text:         '#111111',
    textMuted:    '#555555',
    textSubtle:   '#888888',
    inputBg:      '#F8F8F8',
    inputBorder:  '#E0E0E0',
    inputBorderH: '#FF0000',
    tabBg:        '#F0F0F0',
    tabBorder:    '#E0E0E0',
    toggleBg:     '#FFFFFF',
    toggleBorder: '#E5E5E5',
    toggleText:   '#333333',
  };

  const upd = (k, v) => setF(p => ({ ...p, [k]: v }));
  const reset = () => { setErr(''); setOk(''); };

  const doLogin = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email: f.email, password: f.password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('role', res.data.user.role); 
      nav('/dashboard');
    } catch (err) {
      setErr(err.response?.data?.message || 'Email ou mot de passe incorrect');
      setLoading(false);
    }
  };

  const doRegister = async (e) => {
    e.preventDefault(); reset();
    if (f.password !== f.confirm) return setErr('Les mots de passe ne correspondent pas');
    if (f.password.length < 6) return setErr('Mot de passe trop court — minimum 6 caractères');
    setLoading(true);
    try {
      await api.post('/auth/register', { full_name: f.full_name, email: f.email, password: f.password, role: f.role });
      setOk('Compte créé ! Connectez-vous maintenant.');
      setMode('login');
      setF(p => ({ ...p, password: '', confirm: '' }));
    } catch (e) { setErr(e.response?.data?.message || 'Erreur'); }
    finally { setLoading(false); }
  };

  const doForgot = async (e) => {
    e.preventDefault(); reset();
    if (!f.email) return setErr('Entrez votre adresse email');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: f.email });
      setOk('Lien de réinitialisation envoyé à votre email.');
    } catch (e) { setErr(e.response?.data?.message || 'Erreur'); }
    finally { setLoading(false); }
  };

  // ─── Styles réutilisables ────────────────────────────────────────────────────
  const inp = {
    width: '100%', padding: '11px 16px',
    background: c.inputBg,
    border: `1px solid ${c.inputBorder}`,
    borderRadius: '8px', fontSize: '14px',
    color: c.text,
    outline: 'none', transition: 'border 0.2s',
    boxSizing: 'border-box',
  };
  const inpWrap = { position: 'relative' };
  const inpWithEye = { ...inp, paddingRight: '44px' };

  const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: 600,
    color: c.textMuted, marginBottom: '6px',
    textTransform: 'uppercase', letterSpacing: '0.7px',
  };

  const btnPrimary = {
    width: '100%', padding: '12px',
    background: '#FF0000', color: 'white',
    border: 'none', borderRadius: '8px',
    fontSize: '14px', fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(255,0,0,0.3)',
    transition: 'opacity 0.2s',
  };

  const msgError = {
    background: 'rgba(255,0,0,0.1)', color: '#FF4444',
    padding: '10px 14px', borderRadius: '8px',
    fontSize: '13px', marginBottom: '1rem',
    borderLeft: '3px solid #FF0000',
  };

  const msgOk = {
    background: 'rgba(0,204,68,0.1)', color: '#00CC44',
    padding: '10px 14px', borderRadius: '8px',
    fontSize: '13px', marginBottom: '1rem',
    borderLeft: '3px solid #00CC44',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: c.pageBg,
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      fontFamily: 'Inter, sans-serif',
      transition: 'background 0.3s, color 0.3s',
    }}>

      {/* ─── Bouton dark/light mode ─────────────────────────────────────── */}
      <button
        onClick={toggle}
        style={{
          position: 'fixed',   // fixed pour rester visible au scroll
          top: '20px', right: '25px',
          background: c.toggleBg,
          border: `1px solid ${c.toggleBorder}`,
          color: c.toggleText,
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '13px',
          cursor: 'pointer',
          fontWeight: 600,
          zIndex: 100,
          transition: 'background 0.3s, color 0.3s, border 0.3s',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}
      >
        {dark ? '☀️ Mode clair' : '🌙 Mode sombre'}
      </button>

      {/* ─── Panneau gauche ─────────────────────────────────────────────── */}
      <div style={{
        background: c.leftBg,
        borderRight: `1px solid ${c.leftBorder}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '3rem', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,0,0,0.15)', top: '-50px', left: '-50px', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,0,0,0.08)', bottom: '50px', right: '-30px', filter: 'blur(40px)' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <img
            src={logo} alt="SOS Campus"
            style={{ width: '80px', height: '80px', borderRadius: '20px', objectFit: 'cover', margin: '0 auto 1.5rem', boxShadow: '0 0 40px rgba(255,0,0,0.4)', display: 'block' }}
          />
          <h1 style={{ fontWeight: 700, fontSize: '36px', color: 'white', marginBottom: '8px' }}>
            SOS <span style={{ color: '#FF0000' }}>Campus</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.7, maxWidth: '280px', margin: '0 auto 2rem' }}>
            Plateforme d'urgence — alertes géolocalisées, intervention rapide et suivi en temps réel.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '2rem' }}>
            {[
              { icon: '', label: 'Envoyée',      color: '#FF0000' },
              { icon: '', label: 'En charge',    color: '#FF6B00' },
              { icon: '', label: 'Intervention', color: '#00CC44' },
              { icon: '', label: 'Clôturée',     color: '#7B2FFF' },
            ].map(({ icon, label, color }) => (
              <span key={label} style={{
                background: `${color}20`, color,
                border: `1px solid ${color}40`,
                padding: '5px 12px', borderRadius: '6px',
                fontSize: '12px', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>{icon} {label}</span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
            {[['4', 'Types'], ['24/7', 'Disponible'], ['GPS', 'Localisé']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'white' }}>{n}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Panneau droit ──────────────────────────────────────────────── */}
      <div style={{
        background: c.rightBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '3rem 2.5rem',
        transition: 'background 0.3s',
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>

          {/* ── Mot de passe oublié ── */}
          {mode === 'forgot' ? (
            <>
              <button onClick={() => { setMode('login'); reset(); }} style={{ background: 'none', border: 'none', color: c.textMuted, fontSize: '13px', cursor: 'pointer', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ← Retour
              </button>
              <h2 style={{ fontSize: '28px', fontWeight: 700, color: c.text, marginBottom: '6px' }}>
                Mot de passe <span style={{ color: '#FF0000' }}>oublié ?</span>
              </h2>
              <p style={{ fontSize: '13px', color: c.textMuted, marginBottom: '1.5rem' }}>Entrez votre email pour recevoir un lien.</p>
              <form onSubmit={doForgot}>
                {err && <div style={msgError}>{err}</div>}
                {ok  && <div style={msgOk}>{ok}</div>}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Email</label>
                  <input style={inp} type="email" placeholder="votre@email.com" value={f.email}
                    onChange={e => upd('email', e.target.value)} required
                    onFocus={e => e.target.style.borderColor = c.inputBorderH}
                    onBlur={e => e.target.style.borderColor = c.inputBorder} />
                </div>
                <button type="submit" disabled={loading} style={btnPrimary}>
                  {loading ? 'Envoi...' : 'Envoyer le lien →'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '28px', fontWeight: 700, color: c.text, marginBottom: '6px' }}>
                {mode === 'login'
                  ? <>Bon retour <span style={{ color: '#FF0000' }}></span></>
                  : <>Créer un <span style={{ color: '#FF0000' }}>compte</span></>}
              </h2>
              <p style={{ fontSize: '13px', color: c.textMuted, marginBottom: '1.5rem' }}>
                {mode === 'login' ? 'Accédez à votre espace SOS Campus' : 'Rejoignez la plateforme SOS Campus'}
              </p>

              {/* ── Onglets connexion / inscription ── */}
              <div style={{
                display: 'flex', background: c.tabBg,
                borderRadius: '10px', padding: '4px',
                marginBottom: '1.5rem', border: `1px solid ${c.tabBorder}`,
              }}>
                {['login', 'register'].map((m, i) => (
                  <button key={m} onClick={() => { setMode(m); reset(); }} style={{
                    flex: 1, padding: '9px', border: 'none', borderRadius: '7px',
                    fontSize: '13px', cursor: 'pointer', fontWeight: mode === m ? 600 : 400,
                    background: mode === m ? '#FF0000' : 'transparent',
                    color: mode === m ? 'white' : c.textMuted,
                    transition: 'all 0.2s',
                  }}>{i === 0 ? 'Connexion' : 'Créer un compte'}</button>
                ))}
              </div>

              {err && <div style={msgError}>{err}</div>}
              {ok  && <div style={msgOk}>{ok}</div>}

              {/* ── Formulaire connexion ── */}
              {mode === 'login' ? (
                <form onSubmit={doLogin}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={labelStyle}>Email</label>
                    <input style={inp} type="email" placeholder="admin@sos.ma" value={f.email}
                      onChange={e => upd('email', e.target.value)} required
                      onFocus={e => e.target.style.borderColor = c.inputBorderH}
                      onBlur={e => e.target.style.borderColor = c.inputBorder} />
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <label style={labelStyle}>Mot de passe</label>
                    <div style={inpWrap}>
                      <input style={inpWithEye} type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={f.password}
                        onChange={e => upd('password', e.target.value)} required
                        onFocus={e => e.target.style.borderColor = c.inputBorderH}
                        onBlur={e => e.target.style.borderColor = c.inputBorder} />
                      <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: c.textMuted, cursor: 'pointer' }}>
                        <EyeIcon open={showPwd} />
                      </button>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                    <button type="button" onClick={() => { setMode('forgot'); reset(); }} style={{ background: 'none', border: 'none', color: '#FF0000', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}>
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <button type="submit" disabled={loading} style={btnPrimary}>
                    {loading ? 'Connexion...' : 'Se connecter →'}
                  </button>
                  <p style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '13px', color: c.textMuted }}>
                    Pas de compte ?{' '}
                    <button onClick={() => { setMode('register'); reset(); }} style={{ background: 'none', border: 'none', color: '#FF0000', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}>
                      S'inscrire
                    </button>
                  </p>
                </form>
              ) : (
                /* ── Formulaire inscription ── */
                <form onSubmit={doRegister}>
                  {[
                    { k: 'full_name', label: 'Nom complet', type: 'text',  ph: 'Prénom Nom' },
                    { k: 'email',     label: 'Email',        type: 'email', ph: 'votre@email.com' },
                  ].map(({ k, label, type, ph }) => (
                    <div key={k} style={{ marginBottom: '1rem' }}>
                      <label style={labelStyle}>{label}</label>
                      <input style={inp} type={type} placeholder={ph} value={f[k]}
                        onChange={e => upd(k, e.target.value)} required
                        onFocus={e => e.target.style.borderColor = c.inputBorderH}
                        onBlur={e => e.target.style.borderColor = c.inputBorder} />
                    </div>
                  ))}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={labelStyle}>Rôle</label>
                    <select style={{ ...inp, cursor: 'pointer' }} value={f.role} onChange={e => upd('role', e.target.value)}>
                      <option value="USER">Utilisateur</option>
                      <option value="AGENT">Agent de sécurité</option>
                      <option value="ADMIN">Administrateur</option>
                    </select>
                  </div>
                  {[
                    { k: 'password', label: 'Mot de passe', show: showPwd,     toggle: () => setShowPwd(v => !v),     ph: 'Min. 6 caractères' },
                    { k: 'confirm',  label: 'Confirmer',    show: showConfirm,  toggle: () => setShowConfirm(v => !v), ph: '••••••••' },
                  ].map(({ k, label, show, toggle, ph }) => (
                    <div key={k} style={{ marginBottom: '1rem' }}>
                      <label style={labelStyle}>{label}</label>
                      <div style={inpWrap}>
                        <input style={inpWithEye} type={show ? 'text' : 'password'} placeholder={ph} value={f[k]}
                          onChange={e => upd(k, e.target.value)} required
                          onFocus={e => e.target.style.borderColor = c.inputBorderH}
                          onBlur={e => e.target.style.borderColor = c.inputBorder} />
                        <button type="button" onClick={toggle} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: c.textMuted, cursor: 'pointer' }}>
                          <EyeIcon open={show} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button type="submit" disabled={loading} style={btnPrimary}>
                    {loading ? 'Création...' : 'Créer mon compte →'}
                  </button>
                  <p style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '13px', color: c.textMuted }}>
                    Déjà un compte ?{' '}
                    <button onClick={() => { setMode('login'); reset(); }} style={{ background: 'none', border: 'none', color: '#FF0000', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}>
                      Se connecter
                    </button>
                  </p>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}