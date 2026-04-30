import { useEffect, useState } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useTheme } from '../ThemeContext';

const formatDate = (val) => {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const COLORS = ['#FF0000', '#FF6B00', '#00CC44', '#7B2FFF', '#FF3399', '#00AAFF'];

export default function EmergencyTypes() {
  const [types, setTypes] = useState([]);
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState('');
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('ok');
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const surface = dark ? '#111' : 'white';
  const border = dark ? '#1A1A1A' : '#E5E5E5';
  const muted = dark ? '#444' : '#bbb';
  const labelColor = dark ? '#555' : '#999';
  const textColor = dark ? 'white' : '#111';
  const rowHover = dark ? '#1A1A1A' : '#F5F5F5';

  const fetchTypes = async () => {
    try { const res = await api.get('/emergency-types'); setTypes(res.data); } catch {}
  };

  useEffect(() => { fetchTypes(); }, []);

  const showMsg = (text, type = 'ok') => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(''), 3000);
  };

  const reset = () => { setLabel(''); setIcon(''); setEditId(null); };

  const handleSubmit = async () => {
    if (!label.trim()) return showMsg('Le label est obligatoire', 'err');
    try {
      if (editId) { await api.put(`/emergency-types/${editId}`, { label, icon }); showMsg('Type modifié ✓'); }
      else { await api.post('/emergency-types', { label, icon }); showMsg('Type créé ✓'); }
      reset(); fetchTypes();
    } catch (e) { showMsg(e.response?.data?.message || 'Erreur', 'err'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce type ?')) return;
    try { await api.delete(`/emergency-types/${id}`); showMsg('Supprimé ✓'); fetchTypes(); }
    catch (e) { showMsg(e.response?.data?.message || 'Erreur', 'err'); }
  };

  const inp = { flex: 1, minWidth: '140px', padding: '10px 14px', background: dark ? '#1A1A1A' : '#F5F5F5', border: `1px solid ${border}`, borderRadius: '8px', fontSize: '13px', color: textColor, fontFamily: 'Inter, sans-serif', outline: 'none' };

  return (
    <div style={{ minHeight: '100vh', background: dark ? '#0D0D0D' : '#F5F5F5', transition: 'background 0.3s' }}>
      <Navbar />
      <div style={{ padding: '1.5rem 2rem', maxWidth: '900px', margin: '0 auto' }}>

        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: textColor }}>
            Types <span style={{ color: '#FF0000' }}>d'urgence</span>
          </h1>
          <p style={{ fontSize: '13px', color: labelColor, marginTop: '4px' }}>Gérer les catégories d'alertes SOS Campus</p>
        </div>

        {msg && (
          <div style={{ background: msgType === 'ok' ? 'rgba(0,204,68,0.1)' : 'rgba(255,0,0,0.1)', color: msgType === 'ok' ? '#00CC44' : '#FF4444', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '13px', borderLeft: `3px solid ${msgType === 'ok' ? '#00CC44' : '#FF0000'}` }}>
            {msg}
          </div>
        )}

        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '10px', padding: '16px', marginBottom: '1.2rem' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: textColor, marginBottom: '1rem' }}>
            {editId ? 'Modifier le type' : 'Ajouter un type'}
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input style={inp} placeholder="Label (ex: Médicale)" value={label} onChange={e => setLabel(e.target.value)} />
            <input style={{ ...inp, flex: 0.5 }} placeholder="Icône (ex:)" value={icon} onChange={e => setIcon(e.target.value)} />
            <button onClick={handleSubmit} style={{ padding: '10px 20px', background: '#FF0000', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 14px rgba(255,0,0,0.25)' }}>
              {editId ? 'Modifier' : 'Ajouter'}
            </button>
            {editId && (
              <button onClick={reset} style={{ padding: '10px 16px', background: 'transparent', color: labelColor, border: `1px solid ${border}`, borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Annuler
              </button>
            )}
          </div>
        </div>

        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '10px', overflow: 'hidden' }}>
          {types.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: muted, fontSize: '14px' }}>Aucun type — ajoutez-en un ci-dessus</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: dark ? '#0D0D0D' : '#F5F5F5', borderBottom: `1px solid ${border}` }}>
                  {['ID', 'Label', 'Icône', 'Créé le', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.7px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {types.map((t, i) => {
                  const color = COLORS[i % COLORS.length];
                  return (
                    <tr key={t.id} style={{ borderBottom: `1px solid ${border}`, transition: 'background 0.15s' }}
                      onMouseOver={e => e.currentTarget.style.background = rowHover}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '13px 16px', fontSize: '12px', color: muted }}>#{t.id}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ background: `${color}18`, color, border: `1px solid ${color}30`, padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {t.label}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: '18px' }}>{t.icon || '—'}</td>
                      <td style={{ padding: '13px 16px', fontSize: '12px', color: muted }}>{formatDate(t.created_at)}</td>
                      <td style={{ padding: '13px 16px', display: 'flex', gap: '8px' }}>
                        <button onClick={() => { setEditId(t.id); setLabel(t.label); setIcon(t.icon || ''); }}
                          style={{ background: 'transparent', color: labelColor, border: `1px solid ${border}`, padding: '5px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                          Modifier
                        </button>
                        <button onClick={() => handleDelete(t.id)}
                          style={{ background: 'rgba(255,0,0,0.1)', color: '#FF4444', border: '1px solid rgba(255,0,0,0.25)', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
