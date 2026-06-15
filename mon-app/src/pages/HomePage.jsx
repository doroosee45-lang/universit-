import { Link } from 'react-router-dom';
import {
  GraduationCap, Users, Award, BarChart2, Calendar,
  ChevronRight, Star, MapPin, Phone, Mail, ArrowRight,
  Shield, Layers, Cpu, Globe,
} from 'lucide-react';

const STATS = [
  { value: '2 400+', label: 'Étudiants inscrits' },
  { value: '120+',   label: 'Enseignants qualifiés' },
  { value: '18',     label: 'Filières disponibles' },
  { value: '96 %',   label: 'Taux de réussite' },
];

const FEATURES = [
  { icon: <BarChart2 size={22}/>, title: 'Suivi académique en temps réel', desc: 'Consultez vos notes, absences et bulletins à tout moment depuis n\'importe quel appareil.', color:'#6366f1', bg:'#eef2ff' },
  { icon: <Calendar size={22}/>,  title: 'Emploi du temps intelligent',    desc: 'Un calendrier dynamique qui affiche vos cours, examens et événements en un coup d\'œil.',    color:'#8b5cf6', bg:'#f5f3ff' },
  { icon: <Shield size={22}/>,    title: 'Espace sécurisé & privé',        desc: 'Vos données académiques sont protégées avec les meilleurs standards de sécurité.',            color:'#06b6d4', bg:'#ecfeff' },
  { icon: <Layers size={22}/>,    title: 'Gestion des frais en ligne',     desc: 'Payez et suivez vos frais de scolarité facilement sans vous déplacer.',                       color:'#10b981', bg:'#ecfdf5' },
  { icon: <Cpu size={22}/>,       title: 'Bibliothèque numérique',         desc: 'Accédez à des milliers de ressources pédagogiques et livres en ligne 24h/24.',                color:'#f59e0b', bg:'#fffbeb' },
  { icon: <Globe size={22}/>,     title: 'Stages & carrières',             desc: 'Trouvez des offres de stage et préparez votre insertion professionnelle.',                     color:'#ef4444', bg:'#fef2f2' },
];

const PROGRAMS = [
  { code:'L1–L3', name:'Informatique de Gestion',    icon:'💻', students:420 },
  { code:'L1–L3', name:'Génie Logiciel',             icon:'⚙️', students:310 },
  { code:'L1–L3', name:'Réseaux & Télécoms',         icon:'📡', students:280 },
  { code:'L1–L3', name:'Administration des Affaires',icon:'📊', students:390 },
  { code:'L1–L3', name:'Comptabilité & Finance',     icon:'💰', students:260 },
  { code:'L1–L3', name:'Droit des Affaires',         icon:'⚖️', students:200 },
];

const TESTIMONIALS = [
  { name:'Marie Lukamba',  role:'Étudiante L2 — Informatique', text:'La plateforme a complètement transformé ma façon de suivre mes cours. Tout est accessible, clair et rapide.', avatar:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&crop=face' },
  { name:'Patrick Mbemba', role:'Étudiant L3 — Génie Logiciel', text:'Grâce au suivi des absences en temps réel, je ne rate plus aucun cours important. Excellent outil !',         avatar:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face' },
  { name:'Clarisse Nzombi',role:'Étudiante L1 — Comptabilité',  text:'Payer mes frais de scolarité depuis mon téléphone, c\'est une vraie révolution. Je recommande à tous.',       avatar:'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=80&h=80&fit=crop&crop=face' },
];

const AVATARS = [
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=40&h=40&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=40&h=40&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
];

export default function HomePage() {
  return (
    <div className="hp-root">

      {/* ══ STYLES ══════════════════════════════════════════════════════════ */}
      <style>{`
        .hp-root { font-family:'Poppins',sans-serif; background:#fff; overflow-x:hidden; }

        /* ── Navbar ── */
        .hp-nav { position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,0.93);backdrop-filter:blur(12px);border-bottom:1px solid rgba(99,102,241,0.1);padding:0 5%;height:64px;display:flex;align-items:center;justify-content:space-between; }
        .hp-nav-links { display:flex;gap:28px;align-items:center; }
        .hp-nav-links a { font-size:14px;font-weight:500;color:#374151;text-decoration:none;transition:color .2s; }
        .hp-nav-links a:hover { color:#6366f1; }
        .hp-nav-btn { display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:12px;text-decoration:none;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:600;font-size:13px;white-space:nowrap; }

        /* ── Hero ── */
        .hp-hero { min-height:100vh;background:linear-gradient(135deg,#f0f4ff 0%,#faf5ff 50%,#f0fdff 100%);display:flex;align-items:center;padding:100px 5% 60px;position:relative;overflow:hidden; }
        .hp-hero-grid { max-width:1200px;margin:0 auto;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center; }
        .hp-hero-badge { display:inline-flex;align-items:center;gap:8px;background:#eef2ff;border-radius:100px;padding:6px 16px;margin-bottom:20px; }
        .hp-hero-dot { width:8px;height:8px;border-radius:50%;background:#6366f1;display:inline-block; }
        .hp-hero-title { font-size:clamp(1.8rem,4vw,3rem);font-weight:800;color:#1e1b4b;line-height:1.15;margin:0 0 18px; }
        .hp-hero-grad { background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
        .hp-hero-sub { font-size:16px;color:#6b7280;line-height:1.7;margin:0 0 28px;max-width:460px; }
        .hp-hero-btns { display:flex;gap:12px;flex-wrap:wrap; }
        .hp-btn-primary { display:inline-flex;align-items:center;gap:8px;padding:13px 24px;border-radius:14px;text-decoration:none;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:700;font-size:14px;font-family:inherit; }
        .hp-btn-outline  { display:inline-flex;align-items:center;gap:8px;padding:13px 24px;border-radius:14px;text-decoration:none;background:#fff;color:#374151;font-weight:600;font-size:14px;border:1.5px solid #e5e7eb;font-family:inherit; }
        .hp-avatars { display:flex;align-items:center;gap:12px;margin-top:28px; }
        .hp-avatar-stack { display:flex; }
        .hp-avatar-stack img { width:34px;height:34px;border-radius:50%;border:2.5px solid #fff;object-fit:cover; }
        .hp-avatar-stack img:not(:first-child) { margin-left:-10px; }
        .hp-stars { display:flex;gap:2px; }

        /* Hero image */
        .hp-hero-img-wrap { position:relative; }
        .hp-hero-img { border-radius:24px;overflow:hidden;aspect-ratio:4/3;box-shadow:0 28px 72px rgba(99,102,241,0.18),0 8px 28px rgba(0,0,0,0.1); }
        .hp-hero-img img { width:100%;height:100%;object-fit:cover; }
        .hp-badge-float { position:absolute;background:#fff;border-radius:16px;padding:10px 16px;box-shadow:0 8px 28px rgba(0,0,0,0.12);display:flex;align-items:center;gap:10px; }
        .hp-badge-float-1 { top:20px;left:-16px; }
        .hp-badge-float-2 { bottom:20px;right:-16px; }
        .hp-badge-icon { width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }

        /* ── Stats ── */
        .hp-stats { background:linear-gradient(135deg,#6366f1,#4f46e5,#7c3aed);padding:48px 5%; }
        .hp-stats-grid { max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:24px; }
        .hp-stat { text-align:center; }
        .hp-stat-val { font-size:clamp(1.8rem,3vw,2.6rem);font-weight:800;color:#fff;line-height:1; }
        .hp-stat-lbl { font-size:13px;color:rgba(255,255,255,0.75);margin-top:6px;font-weight:500; }

        /* ── Features ── */
        .hp-section { padding:80px 5%; }
        .hp-section-gray { background:#f9fafb; }
        .hp-center { text-align:center;margin-bottom:52px; }
        .hp-chip { display:inline-block;border-radius:100px;padding:5px 16px;font-size:12px;font-weight:600;margin-bottom:14px; }
        .hp-h2 { font-size:clamp(1.5rem,3vw,2.2rem);font-weight:800;color:#1e1b4b;margin:0 0 12px; }
        .hp-lead { font-size:15px;color:#6b7280;max-width:520px;margin:0 auto;line-height:1.7; }
        .hp-features-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:20px; }
        .hp-feat { background:#fff;border-radius:20px;padding:26px;border:1px solid #f3f4f6;box-shadow:0 2px 12px rgba(0,0,0,0.04);transition:transform .2s,box-shadow .2s; }
        .hp-feat:hover { transform:translateY(-4px);box-shadow:0 12px 36px rgba(0,0,0,0.09); }
        .hp-feat-icon { width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;margin-bottom:16px; }
        .hp-feat-title { font-size:15px;font-weight:700;color:#1e1b4b;margin:0 0 8px; }
        .hp-feat-desc { font-size:13px;color:#6b7280;line-height:1.65;margin:0; }

        /* ── Campus ── */
        .hp-campus-grid { max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center; }
        .hp-mosaic { display:grid;grid-template-columns:1fr 1fr;grid-template-rows:220px 220px;gap:10px;border-radius:20px;overflow:hidden; }
        .hp-mosaic img { width:100%;height:100%;object-fit:cover; }
        .hp-check-list { list-style:none;padding:0;margin:0; }
        .hp-check-item { display:flex;align-items:center;gap:10px;margin-bottom:12px;font-size:14px;color:#374151;font-weight:500; }
        .hp-check-dot { width:20px;height:20px;border-radius:50%;background:#eef2ff;display:flex;align-items:center;justify-content:center;flex-shrink:0; }

        /* ── Filières ── */
        .hp-programs-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:16px; }
        .hp-program { background:#f9fafb;border-radius:18px;padding:20px 22px;border:1.5px solid #f3f4f6;display:flex;align-items:center;gap:14px;transition:all .2s; }
        .hp-program:hover { border-color:#c7d2fe;background:#fafbff;transform:translateY(-2px); }
        .hp-prog-emoji { font-size:32px;line-height:1;flex-shrink:0; }
        .hp-prog-code { font-size:10px;font-weight:700;color:#6366f1;letter-spacing:1px;margin-bottom:3px; }
        .hp-prog-name { font-size:14px;font-weight:700;color:#1e1b4b;margin-bottom:2px; }
        .hp-prog-count { font-size:12px;color:#9ca3af; }

        /* ── Testimonials ── */
        .hp-testi-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:20px; }
        .hp-testi { background:#fff;border-radius:22px;padding:28px;box-shadow:0 4px 24px rgba(99,102,241,0.07);border:1px solid rgba(99,102,241,0.07); }
        .hp-testi-text { font-size:14px;color:#374151;line-height:1.75;margin:16px 0 22px;font-style:italic; }
        .hp-testi-author { display:flex;align-items:center;gap:12px; }
        .hp-testi-author img { width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid #eef2ff;flex-shrink:0; }

        /* ── CTA ── */
        .hp-cta-box { max-width:760px;margin:0 auto;text-align:center;background:linear-gradient(135deg,#6366f1,#7c3aed);border-radius:28px;padding:56px 32px;box-shadow:0 20px 56px rgba(99,102,241,0.32); }
        .hp-cta-btn { display:inline-flex;align-items:center;gap:10px;padding:14px 32px;border-radius:14px;text-decoration:none;background:#fff;color:#6366f1;font-weight:700;font-size:15px;font-family:inherit;box-shadow:0 6px 20px rgba(0,0,0,0.12); }

        /* ── Footer ── */
        .hp-footer { background:#1e1b4b;color:#fff;padding:56px 5% 28px; }
        .hp-footer-grid { display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;margin-bottom:40px; }
        .hp-footer-bottom { border-top:1px solid rgba(255,255,255,0.08);padding-top:22px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;font-size:13px;color:#64748b; }

        /* ══ RESPONSIVE ══════════════════════════════════════════════════════ */
        @media (max-width: 900px) {
          .hp-nav-links { display:none; }
          .hp-hero-grid { grid-template-columns:1fr; gap:36px; }
          .hp-badge-float { display:none; }
          .hp-features-grid { grid-template-columns:1fr 1fr; }
          .hp-campus-grid { grid-template-columns:1fr; }
          .hp-mosaic { grid-template-rows:180px 180px; }
          .hp-programs-grid { grid-template-columns:1fr 1fr; }
          .hp-testi-grid { grid-template-columns:1fr; }
          .hp-footer-grid { grid-template-columns:1fr 1fr; gap:28px; }
          .hp-stats-grid { grid-template-columns:1fr 1fr; gap:16px; }
        }
        @media (max-width: 560px) {
          .hp-hero { padding:88px 5% 48px; }
          .hp-hero-title { font-size:1.75rem; }
          .hp-btn-outline { display:none; }
          .hp-hero-sub { font-size:14px; }
          .hp-features-grid { grid-template-columns:1fr; }
          .hp-programs-grid { grid-template-columns:1fr; }
          .hp-mosaic { grid-template-columns:1fr;grid-template-rows:180px; height:180px; }
          .hp-mosaic img:not(:first-child) { display:none; }
          .hp-mosaic img:first-child { grid-row:unset; }
          .hp-stats-grid { grid-template-columns:1fr 1fr; }
          .hp-footer-grid { grid-template-columns:1fr; }
          .hp-section { padding:56px 5%; }
          .hp-cta-box { padding:40px 20px; }
          .hp-nav-btn span { display:none; }
        }
      `}</style>

      {/* ══ NAVBAR ════════════════════════════════════════════════════════════ */}
      <nav className="hp-nav">
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 12px rgba(99,102,241,0.3)' }}>
            <GraduationCap size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight:800,fontSize:16,color:'#1e1b4b',lineHeight:1 }}>ACAN</div>
            <div style={{ fontSize:10,color:'#6366f1',fontWeight:600,letterSpacing:1 }}>UNIVERSITÉ</div>
          </div>
        </div>

        <div className="hp-nav-links">
          {['Accueil','Filières','Plateforme','Contact'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`}>{item}</a>
          ))}
        </div>

        <Link to="/login" className="hp-nav-btn">
          Se connecter <ChevronRight size={14} />
        </Link>
      </nav>

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section id="accueil" className="hp-hero">
        <div style={{ position:'absolute',top:-80,right:-80,width:360,height:360,borderRadius:'50%',background:'radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)',pointerEvents:'none' }} />

        <div className="hp-hero-grid">
          {/* Texte */}
          <div>
            <div className="hp-hero-badge">
              <span className="hp-hero-dot" />
              <span style={{ fontSize:12,fontWeight:600,color:'#6366f1' }}>Plateforme de Gestion Universitaire</span>
            </div>
            <h1 className="hp-hero-title">
              L'avenir de<br />
              <span className="hp-hero-grad">l'éducation</span>{' '}
              commence ici
            </h1>
            <p className="hp-hero-sub">
              L'Université ACAN offre une formation d'excellence en Informatique,
              Gestion et Droit. Rejoignez des milliers d'étudiants qui construisent leur avenir avec nous.
            </p>
            <div className="hp-hero-btns">
              <Link to="/login" className="hp-btn-primary">
                Accéder à mon espace <ArrowRight size={15} />
              </Link>
              <a href="#plateforme" className="hp-btn-outline">
                Découvrir la plateforme
              </a>
            </div>
            <div className="hp-avatars">
              <div className="hp-avatar-stack">
                {AVATARS.map((src,i) => <img key={i} src={src} alt="" />)}
              </div>
              <div>
                <div className="hp-stars">
                  {[1,2,3,4,5].map(i => <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <div style={{ fontSize:12,color:'#6b7280',fontWeight:500,marginTop:2 }}>+2 400 étudiants nous font confiance</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="hp-hero-img-wrap">
            <div className="hp-hero-img">
              <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900&q=80" alt="Étudiants" />
            </div>
            <div className="hp-badge-float hp-badge-float-1">
              <div className="hp-badge-icon" style={{ background:'#eef2ff' }}><Award size={18} color="#6366f1" /></div>
              <div>
                <div style={{ fontSize:17,fontWeight:800,color:'#1e1b4b' }}>96%</div>
                <div style={{ fontSize:11,color:'#9ca3af' }}>Taux de réussite</div>
              </div>
            </div>
            <div className="hp-badge-float hp-badge-float-2">
              <div className="hp-badge-icon" style={{ background:'#ecfdf5' }}><Users size={18} color="#10b981" /></div>
              <div>
                <div style={{ fontSize:17,fontWeight:800,color:'#1e1b4b' }}>2 400+</div>
                <div style={{ fontSize:11,color:'#9ca3af' }}>Étudiants actifs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS ═════════════════════════════════════════════════════════════ */}
      <section className="hp-stats">
        <div className="hp-stats-grid">
          {STATS.map((s,i) => (
            <div key={i} className="hp-stat">
              <div className="hp-stat-val">{s.value}</div>
              <div className="hp-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════════════════ */}
      <section id="plateforme" className="hp-section hp-section-gray">
        <div style={{ maxWidth:1200,margin:'0 auto' }}>
          <div className="hp-center">
            <div className="hp-chip" style={{ background:'#eef2ff',color:'#6366f1' }}>Notre plateforme</div>
            <h2 className="hp-h2">Tout ce dont vous avez besoin</h2>
            <p className="hp-lead">Une suite complète d'outils pensés pour simplifier la vie des étudiants, enseignants et administrateurs.</p>
          </div>
          <div className="hp-features-grid">
            {FEATURES.map((f,i) => (
              <div key={i} className="hp-feat">
                <div className="hp-feat-icon" style={{ background:f.bg,color:f.color }}>{f.icon}</div>
                <h3 className="hp-feat-title">{f.title}</h3>
                <p className="hp-feat-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CAMPUS ════════════════════════════════════════════════════════════ */}
      <section className="hp-section hp-section-gray" style={{ paddingTop:0 }}>
        <div className="hp-campus-grid">
          <div className="hp-mosaic">
            <img src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=500&q=80" alt="Étudiants" style={{ gridRow:'span 2' }} />
            <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&q=80" alt="Bibliothèque" />
            <img src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=500&q=80" alt="Campus" />
          </div>
          <div>
            <div className="hp-chip" style={{ background:'#ecfdf5',color:'#10b981' }}>Vie sur le campus</div>
            <h2 className="hp-h2" style={{ textAlign:'left',maxWidth:'none' }}>
              Un environnement d'apprentissage stimulant
            </h2>
            <p style={{ fontSize:14,color:'#6b7280',lineHeight:1.8,marginBottom:24 }}>
              Notre campus moderne offre des salles équipées, une bibliothèque riche,
              des laboratoires de pointe et des espaces de collaboration.
            </p>
            <ul className="hp-check-list">
              {['Salles équipées de vidéoprojecteurs','Connexion Wi-Fi haute vitesse','Bibliothèque avec +5 000 ouvrages','Laboratoires informatiques 7j/7'].map((item,i) => (
                <li key={i} className="hp-check-item">
                  <div className="hp-check-dot">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ══ FILIÈRES ══════════════════════════════════════════════════════════ */}
      <section id="filières" className="hp-section">
        <div style={{ maxWidth:1200,margin:'0 auto' }}>
          <div className="hp-center">
            <div className="hp-chip" style={{ background:'#f5f3ff',color:'#8b5cf6' }}>Nos formations</div>
            <h2 className="hp-h2">Filières disponibles</h2>
            <p className="hp-lead">Des formations reconnues et adaptées aux besoins du marché de l'emploi congolais et international.</p>
          </div>
          <div className="hp-programs-grid">
            {PROGRAMS.map((p,i) => (
              <div key={i} className="hp-program">
                <div className="hp-prog-emoji">{p.icon}</div>
                <div style={{ flex:1 }}>
                  <div className="hp-prog-code">{p.code}</div>
                  <div className="hp-prog-name">{p.name}</div>
                  <div className="hp-prog-count">{p.students} étudiants</div>
                </div>
                <ChevronRight size={16} color="#d1d5db" style={{ flexShrink:0 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TÉMOIGNAGES ═══════════════════════════════════════════════════════ */}
      <section className="hp-section" style={{ background:'linear-gradient(135deg,#f0f4ff,#faf5ff)' }}>
        <div style={{ maxWidth:1200,margin:'0 auto' }}>
          <div className="hp-center">
            <div className="hp-chip" style={{ background:'#fffbeb',color:'#f59e0b' }}>Témoignages</div>
            <h2 className="hp-h2">Ce que disent nos étudiants</h2>
          </div>
          <div className="hp-testi-grid">
            {TESTIMONIALS.map((t,i) => (
              <div key={i} className="hp-testi">
                <div className="hp-stars">{[1,2,3,4,5].map(j => <Star key={j} size={13} fill="#f59e0b" color="#f59e0b" />)}</div>
                <p className="hp-testi-text">"{t.text}"</p>
                <div className="hp-testi-author">
                  <img src={t.avatar} alt={t.name} />
                  <div>
                    <div style={{ fontWeight:700,fontSize:14,color:'#1e1b4b' }}>{t.name}</div>
                    <div style={{ fontSize:12,color:'#9ca3af' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════════════════════ */}
      <section className="hp-section">
        <div className="hp-cta-box">
          <div style={{ fontSize:40,marginBottom:14 }}>🎓</div>
          <h2 style={{ fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:800,color:'#fff',margin:'0 0 14px' }}>
            Prêt à rejoindre l'université ?
          </h2>
          <p style={{ fontSize:15,color:'rgba(255,255,255,0.8)',lineHeight:1.7,margin:'0 auto 28px',maxWidth:440 }}>
            Connectez-vous à votre espace personnel pour accéder à vos cours, notes, emploi du temps et bien plus.
          </p>
          <Link to="/login" className="hp-cta-btn">
            <GraduationCap size={19} /> Accéder à mon espace
          </Link>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════════════ */}
      <footer id="contact" className="hp-footer">
        <div style={{ maxWidth:1200,margin:'0 auto' }}>
          <div className="hp-footer-grid">
            <div>
              <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:16 }}>
                <div style={{ width:38,height:38,borderRadius:10,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <GraduationCap size={18} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight:800,fontSize:15,color:'#fff' }}>ACAN</div>
                  <div style={{ fontSize:10,color:'#a5b4fc',fontWeight:600,letterSpacing:1 }}>UNIVERSITÉ</div>
                </div>
              </div>
              <p style={{ fontSize:13,color:'#94a3b8',lineHeight:1.8,maxWidth:260 }}>
                L'Université ACAN forme les leaders de demain depuis Brazzaville.
              </p>
              <div style={{ marginTop:16,display:'flex',gap:8 }}>
                {['f','in','tw'].map(s => (
                  <div key={s} style={{ width:34,height:34,borderRadius:8,background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#a5b4fc' }}>{s}</div>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight:700,fontSize:13,marginBottom:16,color:'#fff' }}>Navigation</h4>
              {['Accueil','Filières','Plateforme','Contact'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} style={{ display:'block',fontSize:13,color:'#94a3b8',marginBottom:10,textDecoration:'none' }}>{item}</a>
              ))}
            </div>
            <div>
              <h4 style={{ fontWeight:700,fontSize:13,marginBottom:16,color:'#fff' }}>Formations</h4>
              {['Informatique','Génie Logiciel','Réseaux','Gestion','Comptabilité','Droit'].map(item => (
                <div key={item} style={{ fontSize:13,color:'#94a3b8',marginBottom:10 }}>{item}</div>
              ))}
            </div>
            <div>
              <h4 style={{ fontWeight:700,fontSize:13,marginBottom:16,color:'#fff' }}>Contact</h4>
              {[
                { icon:<MapPin size={13}/>, text:'Brazzaville, Congo' },
                { icon:<Phone size={13}/>, text:'+242 06 000 0000' },
                { icon:<Mail size={13}/>, text:'info@acan-univ.cg' },
              ].map((c,i) => (
                <div key={i} style={{ display:'flex',alignItems:'center',gap:8,marginBottom:12,color:'#94a3b8',fontSize:13 }}>
                  <span style={{ color:'#6366f1',flexShrink:0 }}>{c.icon}</span>{c.text}
                </div>
              ))}
            </div>
          </div>
          <div className="hp-footer-bottom">
            <span>© 2024 Université ACAN — Tous droits réservés</span>
            <span>Conçu avec ❤️ à Brazzaville</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
