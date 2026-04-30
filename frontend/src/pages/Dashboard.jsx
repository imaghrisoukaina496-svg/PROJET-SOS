import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useTheme } from '../ThemeContext';

const BAR_COLORS = ['#FF0000', '#FF6B00', '#00CC44', '#7B2FFF'];

const STATUS_MAP = {
  ENVOYEE:         { label: 'ENVOYÉE',      color: '#FF0000', bg: 'rgba(255,0,0,0.15)',    border: 'rgba(255,0,0,0.3)' },
  PRISE_EN_CHARGE: { label: 'EN CHARGE',    color: '#FF8C00', bg: 'rgba(255,107,0,0.15)',  border: 'rgba(255,107,0,0.3)' },
  EN_INTERVENTION: { label: 'INTERVENTION', color: '#00CC44', bg: 'rgba(0,204,68,0.15)',   border: 'rgba(0,204,68,0.3)' },
  CLOTUREE:        { label: 'CLÔTURÉE',     color: '#9B5FFF', bg: 'rgba(123,47,255,0.15)', border: 'rgba(123,47,255,0.3)' },
};

// Couleurs par type (remplace les emojis)
const TYPE_COLORS = {
  'médicale': '#FF0000',
  'sécurité': '#FF6B00',
  'incendie': '#FF8C00',
  'autre':    '#6B7280',
};

const TYPE_LABELS = {
  'médicale': 'M',
  'sécurité': 'S',
  'incendie': 'I',
  'autre':    'A',
};

const timeAgo = (val) => {
  if (!val) return '';
  const diff = Math.floor((Date.now() - new Date(val)) / 60000);
  if (diff < 1) return "à l'instant";
  if (diff < 60) return `${diff} min`;
  return `${Math.floor(diff / 60)}h`;
};

const STATS = [
  { key: 'envoyees',         label: 'ENVOYÉES',     color: '#FF0000', trend: 'En attente' },
  { key: 'prises_en_charge', label: 'EN CHARGE',    color: '#FF6B00', trend: 'Prises en main' },
  { key: 'en_intervention',  label: 'INTERVENTION', color: '#00CC44', trend: 'Sur le terrain' },
  { key: 'cloturees',        label: 'CLÔTURÉES',    color: '#7B2FFF', trend: 'Résolues' },
];

export default function Dashboard() {
  const [summary,      setSummary]      = useState(null);
  const [byType,       setByType]       = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const user      = JSON.parse(localStorage.getItem('user') || '{}');
  const firstName = user.full_name?.split(' ')[0] || 'Admin';
  const today     = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const surface    = dark ? '#111'    : 'white';
  const border     = dark ? '#1A1A1A' : '#E5E5E5';
  const muted      = dark ? '#444'    : '#bbb';
  const labelColor = dark ? '#555'    : '#999';
  const textColor  = dark ? 'white'   : '#111';
  const bg         = dark ? '#0D0D0D' : '#F5F5F5';

  useEffect(() => {
    const loadData = () => {
      api.get('/emergencies').then(r => {
        const all = r.data;
        const s = {
          envoyees:         all.filter(e => e.status === 'ENVOYEE').length,
          prises_en_charge: all.filter(e => e.status === 'PRISE_EN_CHARGE').length,
          en_intervention:  all.filter(e => e.status === 'EN_INTERVENTION').length,
          cloturees:        all.filter(e => e.status === 'CLOTUREE').length,
          total:            all.length,
          aujourd_hui:      all.filter(e => {
            const d = new Date(e.created_at);
            return d.toDateString() === new Date().toDateString();
          }).length,
        };
        setSummary(s);

        const typeCount = {};
        all.forEach(e => {
          const t = e.emergency_type || 'Autre';
          typeCount[t] = (typeCount[t] || 0) + 1;
        });
        setByType(Object.entries(typeCount).map(([type, total]) => ({ type, total })));
        setRecentAlerts(all.slice(0, 6));
      }).catch(() => {});
    };

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const activeCount = (summary?.envoyees || 0)
                    + (summary?.prises_en_charge || 0)
                    + (summary?.en_intervention || 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) return (
      <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: textColor }}>
        <p style={{ color: muted, marginBottom: '4px' }}>{label}</p>
        <p style={{ color: '#FF0000', fontWeight: 600 }}>{payload[0].value} alerte{payload[0].value > 1 ? 's' : ''}</p>
      </div>
    );
    return null;
  };

  return (
    <div style={{ minHeight: '100vh', background: bg, transition: 'background 0.3s', display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      <Navbar />
      <div style={{ padding: '1.5rem 2rem', flex: 1 }}>

        {/* Banner */}
        {activeCount > 0 && (
          <div style={{ background: 'linear-gradient(90deg,#FF0000,#CC0000)', borderRadius: '10px', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, fontSize: '15px', color: 'white' }}>
              <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%', animation: 'blink 0.8s ease infinite' }} />
              {activeCount} alerte{activeCount > 1 ? 's' : ''} active{activeCount > 1 ? 's' : ''} en ce moment sur le campus
            </div>
            <button onClick={() => navigate('/emergencies')} style={{ background: 'white', color: '#FF0000', fontSize: '13px', fontWeight: 700, padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
              Voir toutes →
            </button>
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: textColor }}>
              Bonjour, <span style={{ color: '#FF0000' }}>{firstName}</span>
            </h1>
            <p style={{ fontSize: '13px', color: labelColor, marginTop: '4px' }}>Centre de supervision des urgences campus</p>
          </div>
          <span style={{ fontSize: '13px', color: labelColor, background: surface, border: `1px solid ${border}`, padding: '7px 16px', borderRadius: '20px' }}>{today}</span>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
          {STATS.map(({ key, label: lbl, color, trend }) => (
            <div key={key}
              style={{ background: surface, border: `1px solid ${border}`, borderRadius: '10px', padding: '18px', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e  => e.currentTarget.style.transform = 'none'}
              onClick={() => navigate('/emergencies')}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color }} />
              <div style={{ fontSize: '10px', color: labelColor, textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600, marginBottom: '6px', marginTop: '8px' }}>{lbl}</div>
              <div style={{ fontSize: '38px', fontWeight: 700, color, lineHeight: 1, marginBottom: '6px' }}>{summary?.[key] ?? 0}</div>
              <div style={{ fontSize: '12px', color: muted }}>{trend}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

          {/* Alertes récentes */}
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '10px', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '7px', height: '7px', background: '#FF0000', borderRadius: '50%', animation: 'blink 0.8s ease infinite' }} />
              <span style={{ fontSize: '15px', fontWeight: 600, color: textColor }}>Alertes en cours</span>
            </div>
            <p style={{ fontSize: '12px', color: muted, marginBottom: '1rem' }}>Mises à jour en temps réel</p>
            {recentAlerts.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: muted, fontSize: '13px' }}>Aucune alerte</div>
            ) : recentAlerts.map(e => {
              const s     = STATUS_MAP[e.status] || STATUS_MAP.ENVOYEE;
              const type  = e.emergency_type?.toLowerCase() || 'autre';
              const color = TYPE_COLORS[type] || '#6B7280';
              const label = TYPE_LABELS[type] || '?';
              return (
                <div key={e.id}
                  onClick={() => navigate(`/emergencies/${e.id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: `1px solid ${border}`, cursor: 'pointer', transition: 'opacity 0.2s' }}
                  onMouseOver={ev => ev.currentTarget.style.opacity = '0.75'}
                  onMouseOut={ev  => ev.currentTarget.style.opacity = '1'}
                >
                  {/* Icône colorée avec lettre */}
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: `${color}20`,
                    border: `2px solid ${color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, color, fontWeight: 700, fontSize: '14px'
                  }}>
                    {label}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: textColor, marginBottom: '2px' }}>{e.user_name}</div>
                    <div style={{ fontSize: '11px', color: muted }}>{e.emergency_type} · {e.message?.slice(0, 30) || '—'} · {timeAgo(e.created_at)}</div>
                  </div>
                  <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '4px 10px', borderRadius: '5px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{s.label}</span>
                </div>
              );
            })}
          </div>

          {/* Graphique + résumé */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '10px', padding: '18px', flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: textColor, marginBottom: '4px' }}>Répartition par type</div>
              <p style={{ fontSize: '12px', color: muted, marginBottom: '1rem' }}>Incidents signalés</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={byType} barSize={28}>
                  <XAxis dataKey="type" tick={{ fontSize: 11, fill: labelColor, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: labelColor, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: dark ? '#1A1A1A' : '#F5F5F5' }} />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {byType.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '10px', padding: '18px' }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: textColor, marginBottom: '1rem' }}>Résumé global</div>
              {[
                { label: 'Total alertes',  val: summary?.total ?? 0,          color: '#FF0000' },
                { label: "Aujourd'hui",    val: summary?.aujourd_hui ?? 0,     color: '#FF6B00' },
                { label: 'Non clôturées', val: (summary?.envoyees ?? 0)
                                             + (summary?.prises_en_charge ?? 0)
                                             + (summary?.en_intervention ?? 0), color: '#00CC44' },
              ].map(({ label: lbl, val, color }) => (
                <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${border}` }}>
                  <span style={{ fontSize: '13px', color: labelColor }}>{lbl}</span>
                  <span style={{ fontSize: '22px', fontWeight: 700, color }}>{val}</span>
                </div>
              ))}
            </div>

            <button onClick={() => navigate('/emergencies')} style={{ background: '#FF0000', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(255,0,0,0.3)' }}>
              Voir toutes les alertes →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}