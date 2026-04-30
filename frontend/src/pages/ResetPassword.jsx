import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
 
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Outfit:wght@300;400;500;600&display=swap');
 
  .rw * { box-sizing: border-box; margin: 0; padding: 0; }
  .rw {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-family: 'Outfit', sans-serif;
  }
  @media (max-width: 768px) { .rw { grid-template-columns: 1fr; } .rl { display: none; } }
 
  .rl {
    background: linear-gradient(160deg, #3D0A1E 0%, #6B1232 40%, #B02252 80%, #E07A96 100%);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 3rem; position: relative; overflow: hidden;
  }
  .rl::before {
    content: ''; position: absolute;
    width: 500px; height: 500px; border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.07);
    top: -120px; left: -120px;
  }
  .rl::after {
    content: ''; position: absolute;
    width: 280px; height: 280px; border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.05);
    bottom: -60px; right: -60px;
  }
  .rblob { position: absolute; width: 180px; height: 180px; border-radius: 50%; background: rgba(255,255,255,0.04); top: 55%; left: 65%; transform: translate(-50%,-50%); }
 
  .rbadge {
    width: 90px; height: 90px; border-radius: 24px;
    background: rgba(255,255,255,0.1); border: 1.5px solid rgba(255,255,255,0.22);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1.5rem; position: relative; z-index: 1;
    animation: rpulse 3s ease infinite;
  }
  @keyframes rpulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.12); } 50% { box-shadow: 0 0 0 18px rgba(255,255,255,0); } }
 
  .rltitle { font-family: 'Playfair Display', serif; font-size: 38px; color: white; line-height: 1.2; margin-bottom: 1rem; text-align: center; position: relative; z-index: 1; }
  .rltitle em { font-style: italic; color: #EFA8BC; }
  .rlsub { color: rgba(255,255,255,0.55); font-size: 14px; font-weight: 300; line-height: 1.7; max-width: 300px; text-align: center; position: relative; z-index: 1; }
 
  .rsteps { display: flex; flex-direction: column; gap: 16px; margin-top: 2.5rem; position: relative; z-index: 1; width: 100%; max-width: 280px; }
  .rstep { display: flex; align-items: center; gap: 12px; }
  .rstep-num { width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 12px; color: white; font-weight: 600; flex-shrink: 0; }
  .rstep-txt { font-size: 13px; color: rgba(255,255,255,0.6); font-weight: 300; }
 
  .rpetal { position: absolute; width: 7px; height: 11px; background: rgba(255,255,255,0.13); border-radius: 50% 50% 50% 0; animation: rfall linear infinite; }
  @keyframes rfall { 0% { transform: translateY(-30px) rotate(0deg); opacity: 0.8; } 100% { transform: translateY(110vh) rotate(400deg); opacity: 0; } }
 
  .rr { background: #FDF2F5; display: flex; align-items: center; justify-content: center; padding: 3rem 2rem; }
  .rfb { width: 100%; max-width: 400px; animation: rup 0.45s ease; }
  @keyframes rup { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
 
  .rftitle { font-family: 'Playfair Display', serif; font-size: 34px; color: #3D0A1E; margin-bottom: 6px; line-height: 1.2; }
  .rftitle em { font-style: italic; color: #B02252; }
  .rfsub { color: #8B5567; font-size: 14px; margin-bottom: 2rem; font-weight: 300; line-height: 1.6; }
 
  .rfield { margin-bottom: 1.1rem; }
  .rfield label { display: block; font-size: 11px; font-weight: 600; color: #6B1232; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.7px; }
  .rinput-wrap { position: relative; }
  .rfield input {
    width: 100%; padding: 12px 44px 12px 16px;
    border: 1.5px solid #F0C4D2; border-radius: 10px;
    font-size: 14px; font-family: 'Outfit', sans-serif;
    color: #3D0A1E; background: white; outline: none;
    transition: border 0.2s, box-shadow 0.2s;
  }
  .rfield input:focus { border-color: #B02252; box-shadow: 0 0 0 3px rgba(176,34,82,0.09); }
 
  .eye-btn {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; padding: 4px;
    color: #C4A0AD; transition: color 0.2s; display: flex; align-items: center;
  }
  .eye-btn:hover { color: #B02252; }
 
  .rsbtn {
    width: 100%; padding: 14px;
    background: linear-gradient(135deg, #8B1A42, #B02252);
    color: white; border: none; border-radius: 10px;
    font-size: 15px; font-weight: 500; font-family: 'Outfit', sans-serif;
    cursor: pointer; transition: all 0.2s; margin-top: 6px; letter-spacing: 0.3px;
  }
  .rsbtn:hover { background: linear-gradient(135deg, #6B1232, #8B1A42); transform: translateY(-1px); }
  .rsbtn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
 
  .rerr { background: #FAE5EC; color: #6B1232; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 1rem; border-left: 3px solid #B02252; }
  .rok { background: #E8F5E9; color: #1B5E20; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 1rem; border-left: 3px solid #2E7D32; }
 
  .rstrength { margin-top: 6px; }
  .rstrength-bar { height: 3px; border-radius: 2px; transition: all 0.3s; margin-bottom: 4px; }
  .rstrength-txt { font-size: 11px; font-weight: 500; }
 
  .rback { background: none; border: none; color: #8B5567; font-size: 13px; cursor: pointer; font-family: 'Outfit', sans-serif; padding: 0; text-decoration: underline; text-underline-offset: 2px; margin-bottom: 1.5rem; display: block; }
`;
 
const PETALS = [
  { left: '8%', dur: '5s', delay: '0s' }, { left: '20%', dur: '6.5s', delay: '0.8s' },
  { left: '35%', dur: '4.5s', delay: '1.5s' }, { left: '50%', dur: '7s', delay: '0.3s' },
  { left: '65%', dur: '5.5s', delay: '2s' }, { left: '80%', dur: '6s', delay: '1s' },
  { left: '90%', dur: '4.8s', delay: '0.5s' },
];
 
const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
 
const getStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: 'transparent', width: '0%' };
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const map = [
    { label: '', color: 'transparent', width: '0%' },
    { label: 'Très faible', color: '#E53935', width: '20%' },
    { label: 'Faible', color: '#FB8C00', width: '40%' },
    { label: 'Moyen', color: '#FDD835', width: '60%' },
    { label: 'Fort', color: '#43A047', width: '80%' },
    { label: 'Très fort', color: '#1B5E20', width: '100%' },
  ];
  return map[score];
};
 
export default function ResetPassword() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const token = params.get('token');
  const strength = getStrength(password);
 
  useEffect(() => {
    if (!token) setErr('Lien invalide — retournez à la page de connexion.');
  }, [token]);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setOk('');
    if (password !== confirm) return setErr('Les mots de passe ne correspondent pas');
    if (password.length < 6) return setErr('Mot de passe trop court (6 caractères min)');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setOk('Mot de passe réinitialisé avec succès ! Redirection...');
      setTimeout(() => nav('/login'), 2500);
    } catch (e) {
      setErr(e.response?.data?.message || 'Lien invalide ou expiré');
    } finally { setLoading(false); }
  };
 
  return (
    <>
      <style>{css}</style>
      <div className="rw">
        {/* Panneau gauche */}
        <div className="rl">
          {PETALS.map((p, i) => <div key={i} className="rpetal" style={{ left: p.left, animationDuration: p.dur, animationDelay: p.delay }} />)}
          <div className="rblob" />
          <div className="rbadge">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="22" r="20" stroke="white" strokeWidth="1.5" />
              <path d="M14 22C14 17.58 17.58 14 22 14C26.42 14 30 17.58 30 22" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <rect x="11" y="22" width="22" height="12" rx="3" stroke="white" strokeWidth="1.5"/>
              <circle cx="22" cy="28" r="2" fill="white"/>
            </svg>
          </div>
          <h1 className="rltitle">Sécurisez<br /><em>votre compte</em></h1>
          <p className="rlsub">Choisissez un mot de passe fort pour protéger votre accès SOS Campus.</p>
          <div className="rsteps">
            {[
              'Au moins 6 caractères',
              'Majuscules et chiffres recommandés',
              'Caractères spéciaux pour plus de sécurité',
            ].map((s, i) => (
              <div key={i} className="rstep">
                <div className="rstep-num">{i + 1}</div>
                <span className="rstep-txt">{s}</span>
              </div>
            ))}
          </div>
        </div>
 
        {/* Panneau droit */}
        <div className="rr">
          <div className="rfb">
            <button className="rback" onClick={() => nav('/login')}>← Retour à la connexion</button>
 
            <h2 className="rftitle">Nouveau<br /><em>mot de passe</em></h2>
            <p className="rfsub">Définissez un nouveau mot de passe sécurisé pour votre compte SOS Campus.</p>
 
            <form onSubmit={handleSubmit}>
              {err && <div className="rerr">{err}</div>}
              {ok && <div className="rok">{ok}</div>}
 
              <div className="rfield">
                <label>Nouveau mot de passe</label>
                <div className="rinput-wrap">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Min. 6 caractères"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={!token}
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPwd(v => !v)}>
                    <EyeIcon open={showPwd} />
                  </button>
                </div>
                {password && (
                  <div className="rstrength">
                    <div className="rstrength-bar" style={{ background: strength.color, width: strength.width }} />
                    <span className="rstrength-txt" style={{ color: strength.color }}>{strength.label}</span>
                  </div>
                )}
              </div>
 
              <div className="rfield">
                <label>Confirmer le mot de passe</label>
                <div className="rinput-wrap">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    disabled={!token}
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowConfirm(v => !v)}>
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
                {confirm && password !== confirm && (
                  <p style={{ fontSize: '12px', color: '#E53935', marginTop: '4px' }}>Les mots de passe ne correspondent pas</p>
                )}
                {confirm && password === confirm && confirm.length >= 6 && (
                  <p style={{ fontSize: '12px', color: '#2E7D32', marginTop: '4px' }}>✓ Les mots de passe correspondent</p>
                )}
              </div>
 
              <button className="rsbtn" disabled={loading || !token}>
                {loading ? 'Enregistrement...' : 'Enregistrer le mot de passe →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}