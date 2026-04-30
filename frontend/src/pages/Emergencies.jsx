import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useTheme } from '../ThemeContext';

const STATUS_MAP = {
  ENVOYEE: { label: 'Envoyée', color: '#FF0000', bg: 'rgba(255,0,0,0.12)', border: 'rgba(255,0,0,0.25)' },
  PRISE_EN_CHARGE: { label: 'En charge', color: '#FF8C00', bg: 'rgba(255,107,0,0.12)', border: 'rgba(255,107,0,0.25)' },
  EN_INTERVENTION: { label: 'Intervention', color: '#00CC44', bg: 'rgba(0,204,68,0.12)', border: 'rgba(0,204,68,0.25)' },
  CLOTUREE: { label: 'Clôturée', color: '#9B5FFF', bg: 'rgba(123,47,255,0.12)', border: 'rgba(123,47,255,0.25)' },
};

const TYPE_ICONS = { médicale: '', sécurité: '', incendie: '', autre: '' };

const formatDate = (val) => {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function Emergencies() {
  const [emergencies, setEmergencies] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const surface = dark ? '#111' : 'white';
  const border = dark ? '#1A1A1A' : '#E5E5E5';
  const muted = dark ? '#444' : '#bbb';
  const labelColor = dark ? '#555' : '#999';
  const textColor = dark ? 'white' : '#111';
  const rowHover = dark ? '#1A1A1A' : '#F5F5F5';

  // APRÈS
  useEffect(() => {
    setLoading(true);
    const role = localStorage.getItem('role');
    const url  = role === 'AGENT' ? '/emergencies/assigned' : '/emergencies';
    const params = {};
    if (filter) params.status = filter;
    api.get(url, { params })
      .then(r => setEmergencies(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  const filtered = emergencies.filter(e => {
    const matchSearch =
      e.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.emergency_type?.toLowerCase().includes(search.toLowerCase()) ||
      e.assigned_agent?.toLowerCase().includes(search.toLowerCase());

    const date = new Date(e.created_at);
    const matchFrom = dateFrom ? date >= new Date(dateFrom) : true;
    const matchTo = dateTo ? date <= new Date(dateTo + 'T23:59:59') : true;

    return matchSearch && matchFrom && matchTo;
  });

  const resetFilters = () => { setSearch(''); setFilter(''); setDateFrom(''); setDateTo(''); };

  const inp = { padding: '10px 16px', background: surface, border: `1px solid ${border}`, borderRadius: '8px', fontSize: '13px', color: textColor, fontFamily: 'Inter, sans-serif', outline: 'none' };

  return (
    <div style={{ minHeight: '100vh', background: dark ? '#0D0D0D' : '#F5F5F5', transition: 'background 0.3s', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ padding: '1.5rem 2rem', flex: 1 }}>

        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: textColor }}>
            Alertes <span style={{ color: '#FF0000' }}>SOS</span>
          </h1>
          <p style={{ fontSize: '13px', color: labelColor, marginTop: '4px' }}>Gestion et suivi des urgences campus</p>
        </div>

        {/* Filtres */}
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '10px', padding: '14px 16px', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>

            {/* Recherche */}
            <div style={{ position: 'relative', flex: 2, minWidth: '180px' }}>
              <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: labelColor }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom, type, agent..." style={{ ...inp, width: '100%', paddingLeft: '36px' }} />
            </div>

            {/* Filtre statut */}
            <select value={filter} onChange={e => setFilter(e.target.value)} style={{ ...inp, cursor: 'pointer', flex: 1, minWidth: '140px' }}>
              <option value="">Tous les statuts</option>
              <option value="ENVOYEE">Envoyée</option>
              <option value="PRISE_EN_CHARGE">En charge</option>
              <option value="EN_INTERVENTION">Intervention</option>
              <option value="CLOTUREE">Clôturée</option>
            </select>

            {/* Date début */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <label style={{ fontSize: '10px', color: labelColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Du</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ ...inp, cursor: 'pointer' }} />
            </div>

            {/* Date fin */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <label style={{ fontSize: '10px', color: labelColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Au</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ ...inp, cursor: 'pointer' }} />
            </div>

            {/* Reset */}
            {(search || filter || dateFrom || dateTo) && (
              <button onClick={resetFilters} style={{ background: 'rgba(255,0,0,0.1)', color: '#FF0000', border: '1px solid rgba(255,0,0,0.25)', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, whiteSpace: 'nowrap' }}>
                ✕ Réinitialiser
              </button>
            )}

            <span style={{ fontSize: '12px', color: labelColor, whiteSpace: 'nowrap', marginLeft: 'auto' }}>
              {filtered.length} alerte{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '10px', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <div style={{ width: 32, height: 32, border: `3px solid ${border}`, borderTopColor: '#FF0000', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
              <p style={{ color: muted, fontSize: '14px' }}>Chargement...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: muted }}>
              <div style={{ fontSize: '36px', marginBottom: '1rem' }}></div>
              <p style={{ fontSize: '14px' }}>Aucune alerte trouvée</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: dark ? '#0D0D0D' : '#F5F5F5', borderBottom: `1px solid ${border}` }}>
                  {['ID', 'Utilisateur', 'Type', 'Statut', 'Agent', 'Date', ''].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.7px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => {
                  const s = STATUS_MAP[e.status] || STATUS_MAP.ENVOYEE;
                  const icon = TYPE_ICONS[e.emergency_type?.toLowerCase()] || '';
                  return (
                    <tr key={e.id} style={{ borderBottom: `1px solid ${border}`, cursor: 'pointer', transition: 'background 0.15s' }}
                      onClick={() => navigate(`/emergencies/${e.id}`)}
                      onMouseOver={ev => ev.currentTarget.style.background = rowHover}
                      onMouseOut={ev => ev.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '13px 16px', fontSize: '12px', color: muted }}>#{e.id}</td>
                      <td style={{ padding: '13px 16px', fontSize: '13px', fontWeight: 500, color: textColor }}>{e.user_name}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ fontSize: '12px', color: labelColor }}>{icon} {e.emergency_type}</span>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {s.label}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: '12px', color: muted }}>{e.assigned_agent || '—'}</td>
                      <td style={{ padding: '13px 16px', fontSize: '12px', color: muted }}>{formatDate(e.created_at)}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <button onClick={ev => { ev.stopPropagation(); navigate(`/emergencies/${e.id}`); }}
                          style={{ background: 'transparent', border: `1px solid ${border}`, color: labelColor, padding: '5px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                          Voir →
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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}