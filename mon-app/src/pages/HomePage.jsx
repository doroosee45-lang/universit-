import { Link } from 'react-router-dom';
import {
  GraduationCap, BookOpen, Users, Award, BarChart2, Calendar,
  ChevronRight, Star, MapPin, Phone, Mail, ArrowRight,
  Shield, Layers, Cpu, Globe,
} from 'lucide-react';

/* ── Données statiques ────────────────────────────────────────────────────── */
const STATS = [
  { value: '2 400+', label: 'Étudiants inscrits',   color: '#6366f1' },
  { value: '120+',   label: 'Enseignants qualifiés', color: '#8b5cf6' },
  { value: '18',     label: 'Filières disponibles',  color: '#06b6d4' },
  { value: '96 %',   label: 'Taux de réussite',      color: '#10b981' },
];

const FEATURES = [
  {
    icon: <BarChart2 size={22} />,
    title: 'Suivi académique en temps réel',
    desc: 'Consultez vos notes, absences et bulletins à tout moment depuis n\'importe quel appareil.',
    color: '#6366f1', bg: '#eef2ff',
  },
  {
    icon: <Calendar size={22} />,
    title: 'Emploi du temps intelligent',
    desc: 'Un calendrier dynamique qui affiche vos cours, examens et événements en un coup d\'œil.',
    color: '#8b5cf6', bg: '#f5f3ff',
  },
  {
    icon: <Shield size={22} />,
    title: 'Espace sécurisé & privé',
    desc: 'Vos données académiques sont protégées avec les meilleurs standards de sécurité.',
    color: '#06b6d4', bg: '#ecfeff',
  },
  {
    icon: <Layers size={22} />,
    title: 'Gestion des frais en ligne',
    desc: 'Payez et suivez vos frais de scolarité facilement sans vous déplacer.',
    color: '#10b981', bg: '#ecfdf5',
  },
  {
    icon: <Cpu size={22} />,
    title: 'Bibliothèque numérique',
    desc: 'Accédez à des milliers de ressources pédagogiques et livres en ligne 24h/24.',
    color: '#f59e0b', bg: '#fffbeb',
  },
  {
    icon: <Globe size={22} />,
    title: 'Stages & carrières',
    desc: 'Trouvez des offres de stage et préparez votre insertion professionnelle.',
    color: '#ef4444', bg: '#fef2f2',
  },
];

const PROGRAMS = [
  { code: 'L1–L3', name: 'Informatique de Gestion', icon: '💻', students: 420 },
  { code: 'L1–L3', name: 'Génie Logiciel',          icon: '⚙️', students: 310 },
  { code: 'L1–L3', name: 'Réseaux & Télécoms',      icon: '📡', students: 280 },
  { code: 'L1–L3', name: 'Administration des Affaires', icon: '📊', students: 390 },
  { code: 'L1–L3', name: 'Comptabilité & Finance',  icon: '💰', students: 260 },
  { code: 'L1–L3', name: 'Droit des Affaires',      icon: '⚖️', students: 200 },
];

const TESTIMONIALS = [
  {
    name: 'Marie Lukamba',
    role: 'Étudiante L2 — Informatique',
    text: 'La plateforme a complètement transformé ma façon de suivre mes cours. Tout est accessible, clair et rapide.',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&crop=face',
    stars: 5,
  },
  {
    name: 'Patrick Mbemba',
    role: 'Étudiant L3 — Génie Logiciel',
    text: 'Grâce au suivi des absences en temps réel, je ne rate plus aucun cours important. Excellent outil !',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face',
    stars: 5,
  },
  {
    name: 'Clarisse Nzombi',
    role: 'Étudiante L1 — Comptabilité',
    text: 'Payer mes frais de scolarité depuis mon téléphone, c\'est une vraie révolution. Je recommande à tous.',
    avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=80&h=80&fit=crop&crop=face',
    stars: 5,
  },
];

/* ── Composants utilitaires ───────────────────────────────────────────────── */
function StarRating({ count = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
      ))}
    </div>
  );
}

/* ── Page principale ──────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: '#fff', overflowX: 'hidden' }}>

      {/* ══ NAVBAR ════════════════════════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(99,102,241,0.1)',
        padding: '0 5%', height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
          }}>
            <GraduationCap size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#1e1b4b', lineHeight: 1 }}>ACAN</div>
            <div style={{ fontSize: 10, color: '#6366f1', fontWeight: 600, letterSpacing: 1 }}>UNIVERSITÉ</div>
          </div>
        </div>

        {/* Nav liens (desktop) */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="nav-links">
          {['Accueil', 'Filières', 'Plateforme', 'Contact'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{
              fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none',
              transition: 'color .2s',
            }}
              onMouseEnter={e => e.target.style.color = '#6366f1'}
              onMouseLeave={e => e.target.style.color = '#374151'}
            >{item}</a>
          ))}
        </div>

        {/* CTA */}
        <Link to="/login" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '9px 22px', borderRadius: 12, textDecoration: 'none',
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          color: '#fff', fontWeight: 600, fontSize: 14,
          boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
          transition: 'transform .15s, box-shadow .15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.35)'; }}
        >
          Se connecter <ChevronRight size={15} />
        </Link>
      </nav>

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section id="accueil" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdff 100%)',
        display: 'flex', alignItems: 'center',
        padding: '120px 5% 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Cercles décoratifs */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          {/* Texte */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#eef2ff', borderRadius: 100, padding: '6px 16px', marginBottom: 24,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#6366f1' }}>Plateforme de Gestion Universitaire</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 800,
              color: '#1e1b4b', lineHeight: 1.15, marginBottom: 20,
            }}>
              L'avenir de<br />
              <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                l'éducation
              </span>{' '}
              commence ici
            </h1>

            <p style={{ fontSize: 17, color: '#6b7280', lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
              L'Université ACAN offre une formation d'excellence en Informatique,
              Gestion et Droit. Rejoignez des milliers d'étudiants qui construisent
              leur avenir avec nous.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', borderRadius: 14, textDecoration: 'none',
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff',
                fontWeight: 700, fontSize: 15,
                boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
              }}>
                Accéder à mon espace <ArrowRight size={16} />
              </Link>
              <a href="#plateforme" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', borderRadius: 14, textDecoration: 'none',
                background: '#fff', color: '#374151',
                fontWeight: 600, fontSize: 15,
                border: '1.5px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}>
                Découvrir la plateforme
              </a>
            </div>

            {/* Avatars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 36 }}>
              <div style={{ display: 'flex' }}>
                {[
                  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=40&h=40&fit=crop&crop=face',
                  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face',
                  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=40&h=40&fit=crop&crop=face',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
                ].map((src, i) => (
                  <img key={i} src={src} alt="étudiant"
                    style={{ width: 36, height: 36, borderRadius: '50%', border: '2.5px solid #fff', marginLeft: i > 0 ? -10 : 0, objectFit: 'cover' }}
                  />
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>+2 400 étudiants nous font confiance</div>
              </div>
            </div>
          </div>

          {/* Image hero */}
          <div style={{ position: 'relative' }}>
            <div style={{
              borderRadius: 28, overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(99,102,241,0.2), 0 8px 32px rgba(0,0,0,0.12)',
              aspectRatio: '4/3',
            }}>
              <img
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900&q=80"
                alt="Étudiants université"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(30,27,75,0.3) 0%, transparent 50%)' }} />
            </div>

            {/* Badge flottant 1 */}
            <div style={{
              position: 'absolute', top: 20, left: -24,
              background: '#fff', borderRadius: 16, padding: '12px 18px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={20} color="#6366f1" />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#1e1b4b' }}>96%</div>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Taux de réussite</div>
              </div>
            </div>

            {/* Badge flottant 2 */}
            <div style={{
              position: 'absolute', bottom: 24, right: -24,
              background: '#fff', borderRadius: 16, padding: '12px 18px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#1e1b4b' }}>2 400+</div>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Étudiants actifs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS ═════════════════════════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5,#7c3aed)', padding: '56px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32 }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(2rem,3vw,2.8rem)', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 6, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════════════════ */}
      <section id="plateforme" style={{ padding: '96px 5%', background: '#fafafa' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Titre */}
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', background: '#eef2ff', borderRadius: 100, padding: '6px 18px', marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#6366f1' }}>Notre plateforme</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, color: '#1e1b4b', marginBottom: 14 }}>
              Tout ce dont vous avez besoin
            </h2>
            <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
              Une suite complète d'outils pensés pour simplifier la vie des étudiants, enseignants et administrateurs.
            </p>
          </div>

          {/* Grille de features */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: 20, padding: 28,
                border: '1px solid #f3f4f6',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                transition: 'transform .2s, box-shadow .2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: f.bg, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e1b4b', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PHOTO SECTION ═════════════════════════════════════════════════════ */}
      <section style={{ padding: '0 5% 96px', background: '#fafafa' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          {/* Photos en mosaïque */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '240px 240px', gap: 12, borderRadius: 24, overflow: 'hidden' }}>
            <img src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=500&q=80" alt="Étudiants" style={{ width: '100%', height: '100%', objectFit: 'cover', gridRow: 'span 2' }} />
            <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&q=80" alt="Bibliothèque" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <img src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=500&q=80" alt="Campus" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Texte */}
          <div>
            <div style={{ display: 'inline-block', background: '#ecfdf5', borderRadius: 100, padding: '6px 18px', marginBottom: 20 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#10b981' }}>Vie sur le campus</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 800, color: '#1e1b4b', marginBottom: 18, lineHeight: 1.25 }}>
              Un environnement d'apprentissage stimulant
            </h2>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8, marginBottom: 28 }}>
              Notre campus moderne offre des salles équipées, une bibliothèque riche,
              des laboratoires informatiques de pointe et des espaces de collaboration
              pour favoriser la réussite de chaque étudiant.
            </p>
            {[
              'Salles de cours équipées de vidéoprojecteurs',
              'Connexion Wi-Fi haute vitesse partout',
              'Bibliothèque avec +5 000 ouvrages',
              'Laboratoires informatiques disponibles 7j/7',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FILIÈRES ══════════════════════════════════════════════════════════ */}
      <section id="filières" style={{ padding: '96px 5%', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: '#f5f3ff', borderRadius: 100, padding: '6px 18px', marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#8b5cf6' }}>Nos formations</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, color: '#1e1b4b', marginBottom: 14 }}>
              Filières disponibles
            </h2>
            <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 520, margin: '0 auto' }}>
              Des formations reconnues et adaptées aux besoins du marché de l'emploi congolais et international.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {PROGRAMS.map((p, i) => (
              <div key={i} style={{
                background: '#fafafa', borderRadius: 20, padding: '24px 28px',
                border: '1.5px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 18,
                transition: 'all .2s', cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#c7d2fe'; e.currentTarget.style.background = '#fafbff'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#f3f4f6'; e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ fontSize: 36, lineHeight: 1 }}>{p.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', letterSpacing: 1, marginBottom: 4 }}>{p.code}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1e1b4b', marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{p.students} étudiants</div>
                </div>
                <ChevronRight size={18} color="#d1d5db" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TÉMOIGNAGES ═══════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 5%', background: 'linear-gradient(135deg,#f0f4ff,#faf5ff)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: '#fffbeb', borderRadius: 100, padding: '6px 18px', marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b' }}>Témoignages</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, color: '#1e1b4b' }}>
              Ce que disent nos étudiants
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: 24, padding: 32,
                boxShadow: '0 4px 24px rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.08)',
              }}>
                <StarRating count={t.stars} />
                <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.75, margin: '18px 0 24px', fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={t.avatar} alt={t.name} style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', border: '2px solid #eef2ff' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1e1b4b' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 5%', background: '#fff' }}>
        <div style={{
          maxWidth: 820, margin: '0 auto', textAlign: 'center',
          background: 'linear-gradient(135deg,#6366f1,#7c3aed)',
          borderRadius: 32, padding: '64px 48px',
          boxShadow: '0 24px 64px rgba(99,102,241,0.35)',
        }}>
          <div style={{ fontSize: 42, marginBottom: 16 }}>🎓</div>
          <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 800, color: '#fff', marginBottom: 16 }}>
            Prêt à rejoindre l'université ?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
            Connectez-vous à votre espace personnel pour accéder à vos cours,
            notes, emploi du temps et bien plus encore.
          </p>
          <Link to="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '15px 36px', borderRadius: 14, textDecoration: 'none',
            background: '#fff', color: '#6366f1',
            fontWeight: 700, fontSize: 16,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }}>
            <GraduationCap size={20} />
            Accéder à mon espace
          </Link>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════════════ */}
      <footer id="contact" style={{ background: '#1e1b4b', color: '#fff', padding: '64px 5% 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
            {/* Colonne logo */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>ACAN</div>
                  <div style={{ fontSize: 10, color: '#a5b4fc', fontWeight: 600, letterSpacing: 1 }}>UNIVERSITÉ</div>
                </div>
              </div>
              <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.8, maxWidth: 280 }}>
                L'Université ACAN forme les leaders de demain avec des programmes
                académiques d'excellence depuis Brazzaville.
              </p>
              <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                {['f', 'in', 'tw'].map(s => (
                  <div key={s} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#a5b4fc', cursor: 'pointer' }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Liens rapides */}
            <div>
              <h4 style={{ fontWeight: 700, fontSize: 14, marginBottom: 18, color: '#fff' }}>Navigation</h4>
              {['Accueil', 'Filières', 'Plateforme', 'Contact'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} style={{ display: 'block', fontSize: 14, color: '#94a3b8', marginBottom: 10, textDecoration: 'none', transition: 'color .2s' }}
                  onMouseEnter={e => e.target.style.color = '#a5b4fc'}
                  onMouseLeave={e => e.target.style.color = '#94a3b8'}
                >{item}</a>
              ))}
            </div>

            {/* Formations */}
            <div>
              <h4 style={{ fontWeight: 700, fontSize: 14, marginBottom: 18, color: '#fff' }}>Formations</h4>
              {['Informatique', 'Génie Logiciel', 'Réseaux', 'Gestion', 'Comptabilité', 'Droit'].map(item => (
                <div key={item} style={{ fontSize: 14, color: '#94a3b8', marginBottom: 10 }}>{item}</div>
              ))}
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ fontWeight: 700, fontSize: 14, marginBottom: 18, color: '#fff' }}>Contact</h4>
              {[
                { icon: <MapPin size={14} />, text: 'Brazzaville, Congo' },
                { icon: <Phone size={14} />, text: '+242 06 000 0000' },
                { icon: <Mail size={14} />, text: 'info@acan-univ.cg' },
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, color: '#94a3b8', fontSize: 14 }}>
                  <span style={{ color: '#6366f1' }}>{c.icon}</span>
                  {c.text}
                </div>
              ))}
            </div>
          </div>

          {/* Bas de footer */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              © 2024 Université ACAN — Tous droits réservés
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Conçu avec ❤️ à Brazzaville
            </div>
          </div>
        </div>
      </footer>

      {/* ── Responsive CSS ─────────────────────────────────────────────────── */}
      <style>{`
        @media (max-width: 900px) {
          .nav-links { display: none !important; }
        }
        @media (max-width: 768px) {
          section > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          section > div[style*="repeat(3,1fr)"] {
            grid-template-columns: 1fr !important;
          }
          section > div[style*="repeat(4,1fr)"] {
            grid-template-columns: 1fr 1fr !important;
          }
          footer > div > div[style*="grid-template-columns: 2fr 1fr 1fr 1fr"] {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          section > div[style*="repeat(4,1fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
