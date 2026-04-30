import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useTheme } from '../ThemeContext';
import 'leaflet/dist/leaflet.css';
 
// Fix icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
 
const STATUS_MAP = {
  ENVOYEE: { label: 'Envoyée', color: '#FF0000' },
  PRISE_EN_CHARGE: { label: 'En charge', color: '#FF8C00' },
  EN_INTERVENTION: { label: 'Intervention', color: '#00CC44' },
  CLOTUREE: { label: 'Clôturée', color: '#9B5FFF' },
};
 
const createIcon = (color) => L.divIcon({
  className: '',
  html: `
    <div style="
      width: 32px; height: 32px;
      background: ${color};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
    ">
      <div style="
        width: 10px; height: 10px;
        background: white; border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36],
});
 
function FitBounds({ alerts }) {
  const map = useMap();
  useEffect(() => {
    if (alerts.length > 0) {
      const bounds = alerts.map(a => [parseFloat(a.latitude), parseFloat(a.longitude)]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [alerts]);
  return null;
}
 
export default function MapView() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const dark = theme === 'dark';
 
  const surface = dark ? '#111' : 'white';
  const border = dark ? '#1A1A1A' : '#E5E5E5';
  const textColor = dark ? 'white' : '#111';
  const labelColor = dark ? '#555' : '#999';
  const muted = dark ? '#444' : '#bbb';
  const bg = dark ? '#0D0D0D' : '#F5F5F5';
 
  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filter) params.status = filter;
    api.get('/emergencies', { params })
      .then(r => setAlerts(r.data.filter(a => a.latitude && a.longitude)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);
 
  const activeAlerts = alerts.filter(a => a.status !== 'CLOTUREE');
 
  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column', transition: 'background 0.3s' }}>
      <style>{`
        .leaflet-container { border-radius: 10px; }
        .leaflet-popup-content-wrapper { background: ${surface}; color: ${textColor}; border: 1px solid ${border}; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
        .leaflet-popup-tip { background: ${surface}; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
 
      <Navbar />
 
      <div style={{ padding: '1.5rem 2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
 
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: textColor }}>
              Carte <span style={{ color: '#FF0000' }}>GPS</span>
            </h1>
            <p style={{ fontSize: '13px', color: labelColor, marginTop: '4px' }}>Localisation des alertes actives sur le campus</p>
          </div>
 
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {activeAlerts.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', color: '#FF0000', fontWeight: 600 }}>
                <div style={{ width: '7px', height: '7px', background: '#FF0000', borderRadius: '50%', animation: 'blink 0.8s ease infinite' }} />
                {activeAlerts.length} active{activeAlerts.length > 1 ? 's' : ''}
              </div>
            )}
            <select value={filter} onChange={e => setFilter(e.target.value)} style={{
              padding: '8px 14px', background: surface, border: `1px solid ${border}`,
              borderRadius: '8px', fontSize: '13px', color: textColor,
              fontFamily: 'Inter, sans-serif', outline: 'none', cursor: 'pointer',
            }}>
              <option value="">Toutes les alertes</option>
              <option value="ENVOYEE">Envoyées</option>
              <option value="PRISE_EN_CHARGE">En charge</option>
              <option value="EN_INTERVENTION">En intervention</option>
              <option value="CLOTUREE">Clôturées</option>
            </select>
          </div>
        </div>
 
        {/* Légende */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {Object.entries(STATUS_MAP).map(([key, { label, color }]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: labelColor }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
              {label}
            </div>
          ))}
        </div>
 
        {/* Carte + liste */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '14px', flex: 1, minHeight: '500px' }}>
 
          {/* Carte */}
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '10px', overflow: 'hidden', minHeight: '500px' }}>
            {loading ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ width: 32, height: 32, border: `3px solid ${border}`, borderTopColor: '#FF0000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: muted, fontSize: '13px' }}>Chargement de la carte...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : alerts.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '40px' }}>🗺️</div>
                <p style={{ color: muted, fontSize: '14px' }}>Aucune alerte géolocalisée</p>
              </div>
            ) : (
              <MapContainer
                center={[31.6295, -7.9811]}
                zoom={14}
                style={{ height: '100%', width: '100%', minHeight: '500px' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <FitBounds alerts={alerts} />
                {alerts.map(a => {
                  const s = STATUS_MAP[a.status] || STATUS_MAP.ENVOYEE;
                  return (
                    <Marker
                      key={a.id}
                      position={[parseFloat(a.latitude), parseFloat(a.longitude)]}
                      icon={createIcon(s.color)}
                    >
                      <Popup>
                        <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '180px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 700, fontSize: '14px', color: textColor }}>#{a.id} — {a.user_name}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: labelColor, marginBottom: '4px' }}>
                             {a.emergency_type}
                          </div>
                          <div style={{ fontSize: '12px', color: labelColor, marginBottom: '8px' }}>
                             {a.message || '—'}
                          </div>
                          <div style={{ display: 'inline-block', background: `${s.color}20`, color: s.color, border: `1px solid ${s.color}40`, padding: '3px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px' }}>
                            {s.label}
                          </div>
                          {a.assigned_agent && (
                            <div style={{ fontSize: '11px', color: labelColor, marginTop: '6px' }}>
                               {a.assigned_agent}
                            </div>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            )}
          </div>
 
          {/* Liste latérale */}
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '10px', padding: '16px', overflowY: 'auto', maxHeight: '600px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: textColor, marginBottom: '1rem' }}>
              {alerts.length} alerte{alerts.length !== 1 ? 's' : ''} localisée{alerts.length !== 1 ? 's' : ''}
            </div>
            {alerts.length === 0 ? (
              <p style={{ fontSize: '13px', color: muted, textAlign: 'center', marginTop: '2rem' }}>Aucune alerte</p>
            ) : alerts.map(a => {
              const s = STATUS_MAP[a.status] || STATUS_MAP.ENVOYEE;
              return (
                <div key={a.id} style={{ padding: '12px 0', borderBottom: `1px solid ${border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: textColor }}>{a.user_name}</span>
                    <span style={{ background: `${s.color}18`, color: s.color, padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>{s.label}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: muted }}>
                    {a.emergency_type} · {a.message?.slice(0, 40) || '—'}
                  </div>
                  <div style={{ fontSize: '11px', color: labelColor, marginTop: '2px' }}>
                    📍 {a.latitude}, {a.longitude}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}