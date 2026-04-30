import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useTheme } from '../ThemeContext';

const STATUS_OPTIONS = ['ENVOYEE', 'PRISE_EN_CHARGE', 'EN_INTERVENTION', 'CLOTUREE'];
const STATUS_MAP = {
  ENVOYEE:         { label: 'Envoyée',      color: '#FF0000', bg: 'rgba(255,0,0,0.12)',    border: 'rgba(255,0,0,0.25)' },
  PRISE_EN_CHARGE: { label: 'En charge',    color: '#FF8C00', bg: 'rgba(255,107,0,0.12)',  border: 'rgba(255,107,0,0.25)' },
  EN_INTERVENTION: { label: 'Intervention', color: '#00CC44', bg: 'rgba(0,204,68,0.12)',   border: 'rgba(0,204,68,0.25)' },
  CLOTUREE:        { label: 'Clôturée',     color: '#9B5FFF', bg: 'rgba(123,47,255,0.12)', border: 'rgba(123,47,255,0.25)' },
};

const formatDate = (val) => {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function EmergencyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const role = localStorage.getItem('role');

  const [data,      setData]      = useState(null);
  const [agents,    setAgents]    = useState([]);
  const [newStatus, setNewStatus] = useState('');
  const [agentName, setAgentName] = useState('');
  const [updateMsg, setUpdateMsg] = useState('');
  const [msg,       setMsg]       = useState('');
  const [msgType,   setMsgType]   = useState('ok');
  const [loading,   setLoading]   = useState(true);

  const surface    = dark ? '#111'    : 'white';
  const border     = dark ? '#1A1A1A' : '#E5E5E5';
  const muted      = dark ? '#444'    : '#bbb';
  const labelColor = dark ? '#555'    : '#999';
  const textColor  = dark ? 'white'   : '#111';

  const showMsg = (text, type = 'ok') => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(''), 3000);
  };

  const fetchData = async () => {
    try {
      const res = await api.get(`/emergencies/${id}`);
      setData(res.data);
      setNewStatus(res.data.status);
    } catch { navigate('/emergencies'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    api.get('/auth/agents').then(r => setAgents(r.data)).catch(() => {});
  }, [id]);

  const handleStatus = async () => {
    try { await api.patch(`/emergencies/${id}/status`, { status: newStatus }); showMsg('Statut mis à jour ✓'); fetchData(); }
    catch (e) { showMsg(e.response?.data?.message || 'Erreur', 'err'); }
  };

  const handleAssign = async () => {
    if (!agentName.trim()) return showMsg("Choisissez un agent", 'err');
    try { await api.put(`/emergencies/${id}/assign`, { agent_name: agentName }); showMsg('Agent affecté ✓'); setAgentName(''); fetchData(); }
    catch (e) { showMsg(e.response?.data?.message || 'Erreur', 'err'); }
  };

  const handleUpdate = async () => {
    if (!updateMsg.trim()) return showMsg('Message obligatoire', 'err');
    try { await api.post(`/emergencies/${id}/updates`, { message: updateMsg }); showMsg('Mise à jour ajoutée ✓'); setUpdateMsg(''); fetchData(); }
    catch (e) { showMsg(e.response?.data?.message || 'Erreur', 'err'); }
  };

  const handleClose = async () => {
    if (!window.confirm('Clôturer définitivement cette alerte ?')) return;
    try { await api.put(`/emergencies/${id}/close`, {}); showMsg('Alerte clôturée ✓'); fetchData(); }
    catch (e) { showMsg(e.response?.data?.message || 'Erreur', 'err'); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: dark ? '#0D0D0D' : '#F5F5F5' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ width: 36, height: 36, border: `3px solid ${border}`, borderTopColor: '#FF0000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  const isClosed = data?.status === 'CLOTUREE';
  const ss = STATUS_MAP[data?.status] || STATUS_MAP.ENVOYEE;

  const inp = { width: '100%', padding: '10px 14px', background: dark ? '#1A1A1A' : '#F5F5F5', border: `1px solid ${border}`, borderRadius: '8px', fontSize: '13px', color: textColor, fontFamily: 'Inter, sans-serif', outline: 'none', marginBottom: '10px' };
  const card = { background: surface, border: `1px solid ${border}`, borderRadius: '10px', padding: '16px' };
  const btn = (bg) => ({ width: '100%', padding: '10px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'white', background: bg, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'opacity 0.2s' });

  return (
    <div style={{ minHeight: '100vh', background: dark ? '#0D0D0D' : '#F5F5F5', transition: 'background 0.3s' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      <Navbar />
      <div style={{ padding: '1.5rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>

        <button onClick={() => navigate('/emergencies')} style={{ background: 'none', border: 'none', color: labelColor, fontSize: '13px', cursor: 'pointer', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Inter, sans-serif' }}>
          ← Retour aux alertes
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: textColor }}>
              Alerte <span style={{ color: '#FF0000' }}>#{data?.id}</span>
            </h1>
            <p style={{ fontSize: '13px', color: labelColor, marginTop: '4px' }}>{data?.emergency_type} — {formatDate(data?.created_at)}</p>
          </div>
          <span style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', background: ss.color, borderRadius: '50%', animation: isClosed ? 'none' : 'blink 0.8s ease infinite' }} />
            {ss.label}
          </span>
        </div>

        {msg && (
          <div style={{ background: msgType === 'ok' ? 'rgba(0,204,68,0.1)' : 'rgba(255,0,0,0.1)', color: msgType === 'ok' ? '#00CC44' : '#FF4444', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '13px', borderLeft: `3px solid ${msgType === 'ok' ? '#00CC44' : '#FF0000'}` }}>
            {msg}
          </div>
        )}

        {isClosed && (
          <div style={{ background: 'rgba(123,47,255,0.1)', border: '1px solid rgba(123,47,255,0.25)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#9B5FFF', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
             Cette alerte est clôturée — aucune modification possible
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>

          {/* ── Informations ── */}
          <div style={card}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: textColor, marginBottom: '1rem' }}>Informations</div>
            {[
              ['Utilisateur',    data?.user_name],
              ["Type d'urgence", data?.emergency_type],
              ['Agent affecté',  data?.assigned_agent || 'Non affecté'],
              ['Latitude',       data?.latitude],
              ['Longitude',      data?.longitude],
              ['Message',        data?.message || '—'],
              ['Dernière MAJ',   formatDate(data?.updated_at)],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${border}`, fontSize: '13px' }}>
                <span style={{ color: labelColor }}>{k}</span>
                <span style={{ fontWeight: 500, color: textColor, maxWidth: '180px', textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* ── Actions ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

            {/* Changer statut */}
            <div style={card}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: textColor, marginBottom: '1rem' }}>Changer le statut</div>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)} disabled={isClosed} style={inp}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_MAP[s].label}</option>)}
              </select>
              <button onClick={handleStatus} disabled={isClosed} style={btn('#FF0000')}>Mettre à jour</button>
            </div>

            {/* Affecter un agent — Admin uniquement */}
            {role === 'ADMIN' && (
              <div style={card}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: textColor, marginBottom: '1rem' }}>Affecter un agent</div>
                <select
                  value={agentName}
                  onChange={e => setAgentName(e.target.value)}
                  disabled={isClosed}
                  style={inp}
                >
                  <option value="">Choisir un agent...</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.full_name}>
                      {a.full_name}
                    </option>
                  ))}
                </select>
                <button onClick={handleAssign} disabled={isClosed} style={btn('#FF6B00')}>Affecter</button>
              </div>
            )}

            {/* Clôturer */}
            {!isClosed && (
              <button onClick={handleClose} style={btn('#1A1A1A')}> Clôturer l'alerte</button>
            )}
          </div>
        </div>

        {/* Ajouter mise à jour */}
        {!isClosed && (
          <div style={{ ...card, marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: textColor, marginBottom: '1rem' }}>Ajouter une mise à jour</div>
            <textarea value={updateMsg} onChange={e => setUpdateMsg(e.target.value)} placeholder="Décrivez l'évolution de la situation..." rows={3}
              style={{ ...inp, resize: 'vertical' }} />
            <button onClick={handleUpdate} style={{ ...btn('#FF0000'), width: 'auto', padding: '9px 20px' }}>Envoyer</button>
          </div>
        )}

        {/* Historique */}
        <div style={card}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: textColor, marginBottom: '1rem' }}>Historique des interventions</div>
          {!data?.updates?.length ? (
            <p style={{ color: muted, fontSize: '13px' }}>Aucun historique disponible</p>
          ) : (
            <div>
              {data.updates.map((u, i) => (
                <div key={u.id} style={{ display: 'flex', gap: '12px', paddingBottom: '14px', position: 'relative' }}>
                  {i < data.updates.length - 1 && <div style={{ position: 'absolute', left: '13px', top: '28px', bottom: 0, width: '1px', background: border }} />}
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: dark ? '#1A1A1A' : '#F0F0F0', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '11px', color: labelColor, fontWeight: 700 }}>{i + 1}</div>
                  <div style={{ flex: 1, background: dark ? '#1A1A1A' : '#F5F5F5', borderRadius: '8px', padding: '10px 12px', border: `1px solid ${border}` }}>
                    <p style={{ fontSize: '13px', color: textColor, marginBottom: '4px' }}>{u.update_message}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: muted }}>
                      <span>{u.updated_by}</span>
                      <span>{formatDate(u.created_at)}</span>
                    </div>
                    {u.new_status && <div style={{ marginTop: '4px', fontSize: '10px', color: '#FF0000', fontWeight: 600 }}>→ {STATUS_MAP[u.new_status]?.label}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}