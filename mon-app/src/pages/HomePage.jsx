import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, Users, Award, BarChart2, Calendar,
  ChevronRight, Star, MapPin, Phone, Mail, ArrowRight,
  Shield, Layers, Cpu, Globe, BookOpen, TrendingUp,
  CheckCircle, Clock, Zap, HeartHandshake, Menu, X,
} from 'lucide-react';

/* ─── DATA ─────────────────────────────────────────────────────────────────── */
const STATS = [
  { value:'2 400+', label:'Étudiants inscrits',   icon:'👨‍🎓' },
  { value:'120+',   label:'Enseignants qualifiés', icon:'👩‍🏫' },
  { value:'18',     label:'Filières disponibles',  icon:'📚' },
  { value:'96 %',   label:'Taux de réussite',      icon:'🏆' },
];

const FEATURES = [
  { icon:<BarChart2 size={20}/>, title:'Suivi académique',        desc:'Notes, absences et bulletins en temps réel depuis n\'importe quel appareil.', color:'#6366f1', bg:'#eef2ff' },
  { icon:<Calendar size={20}/>,  title:'Emploi du temps',          desc:'Calendrier dynamique avec cours, examens et événements.',                      color:'#8b5cf6', bg:'#f5f3ff' },
  { icon:<Shield size={20}/>,    title:'Sécurité des données',     desc:'Vos données académiques protégées selon les meilleurs standards.',              color:'#06b6d4', bg:'#ecfeff' },
  { icon:<Layers size={20}/>,    title:'Frais en ligne',           desc:'Payez et suivez vos frais de scolarité sans vous déplacer.',                   color:'#10b981', bg:'#ecfdf5' },
  { icon:<Cpu size={20}/>,       title:'Bibliothèque numérique',   desc:'Des milliers de ressources pédagogiques accessibles 24h/24.',                  color:'#f59e0b', bg:'#fffbeb' },
  { icon:<Globe size={20}/>,     title:'Stages & Carrières',       desc:'Offres de stage et accompagnement pour votre insertion professionnelle.',       color:'#ef4444', bg:'#fef2f2' },
];

const PROGRAMS = [
  { name:'Informatique de Gestion',    icon:'💻', students:420, duration:'3 ans', level:'Licence' },
  { name:'Génie Logiciel',             icon:'⚙️', students:310, duration:'3 ans', level:'Licence' },
  { name:'Réseaux & Télécoms',         icon:'📡', students:280, duration:'3 ans', level:'Licence' },
  { name:'Administration des Affaires',icon:'📊', students:390, duration:'3 ans', level:'Licence' },
  { name:'Comptabilité & Finance',     icon:'💰', students:260, duration:'3 ans', level:'Licence' },
  { name:'Droit des Affaires',         icon:'⚖️', students:200, duration:'3 ans', level:'Licence' },
];

const WHY_US = [
  { num:'01', title:'Excellence académique',     desc:'Nos programmes sont conçus par des experts reconnus et constamment mis à jour pour répondre aux exigences du marché.', color:'#6366f1' },
  { num:'02', title:'Professeurs expérimentés',  desc:'Une équipe de 120+ enseignants certifiés, alliant expertise théorique et expérience professionnelle de terrain.', color:'#8b5cf6' },
  { num:'03', title:'Technologie de pointe',     desc:'Laboratoires informatiques équipés, bibliothèque numérique et plateforme de gestion moderne pour chaque étudiant.', color:'#06b6d4' },
  { num:'04', title:'Insertion professionnelle', desc:'Un réseau solide de 200+ entreprises partenaires pour vos stages et votre premier emploi après l\'obtention du diplôme.', color:'#10b981' },
];

const AGENDA = [
  { date:'15 Sep', month:'2025', title:'Rentrée académique 2025–2026', type:'Rentrée',   color:'#6366f1', bg:'#eef2ff' },
  { date:'01 Oct', month:'2025', title:'Début des inscriptions S1',    type:'Inscription', color:'#10b981', bg:'#ecfdf5' },
  { date:'20 Nov', month:'2025', title:'Examens de mi-semestre',        type:'Examen',   color:'#f59e0b', bg:'#fffbeb' },
  { date:'15 Jan', month:'2026', title:'Début du semestre 2',           type:'Cours',    color:'#8b5cf6', bg:'#f5f3ff' },
];

const TESTIMONIALS = [
  { name:'Marie Lukamba',   role:'Étudiante L2 Informatique',    text:'La plateforme a transformé ma façon de suivre mes cours. Tout est accessible, clair et rapide.', avatar:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&crop=face' },
  { name:'Patrick Mbemba',  role:'Étudiant L3 Génie Logiciel',   text:'Grâce au suivi des absences en temps réel, je ne rate plus aucun cours important. Excellent !', avatar:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face' },
  { name:'Clarisse Nzombi', role:'Étudiante L1 Comptabilité',    text:'Payer mes frais depuis mon téléphone, c\'est une vraie révolution. Je recommande à tous.', avatar:'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=80&h=80&fit=crop&crop=face' },
];

const PARTNERS = ['Microsoft','Oracle','Cisco','SAP','IBM','Google'];

const AVATARS = [
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=40&h=40&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=40&h=40&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
];

/* ─── COMPONENT ─────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="hp">
      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        .hp { font-family:'Poppins',sans-serif; background:#fff; overflow-x:hidden; color:#1e1b4b; }

        /* ── NAV ── */
        .hp-nav { position:fixed;top:0;left:0;right:0;z-index:200;height:66px;padding:0 5%;display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.95);backdrop-filter:blur(14px);border-bottom:1px solid rgba(99,102,241,0.08);transition:box-shadow .3s; }
        .hp-logo { display:flex;align-items:center;gap:10px;text-decoration:none; }
        .hp-logo-icon { width:42px;height:42px;border-radius:13px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(99,102,241,0.35);flex-shrink:0; }
        .hp-logo-text-main { font-weight:800;font-size:16px;color:#1e1b4b;line-height:1; }
        .hp-logo-text-sub  { font-size:10px;color:#6366f1;font-weight:600;letter-spacing:1.2px; }
        .hp-nav-links { display:flex;gap:30px;align-items:center; }
        .hp-nav-links a { font-size:13.5px;font-weight:500;color:#4b5563;text-decoration:none;transition:color .2s;position:relative;padding-bottom:2px; }
        .hp-nav-links a::after { content:'';position:absolute;bottom:-2px;left:0;right:0;height:2px;background:#6366f1;border-radius:2px;transform:scaleX(0);transition:transform .2s; }
        .hp-nav-links a:hover { color:#6366f1; }
        .hp-nav-links a:hover::after { transform:scaleX(1); }
        .hp-nav-cta { display:inline-flex;align-items:center;gap:6px;padding:9px 20px;border-radius:12px;text-decoration:none;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:600;font-size:13px;box-shadow:0 4px 14px rgba(99,102,241,0.3);transition:transform .15s,box-shadow .15s; }
        .hp-nav-cta:hover { transform:translateY(-1px);box-shadow:0 6px 20px rgba(99,102,241,0.42); }
        .hp-menu-btn { display:none;background:none;border:1px solid #e5e7eb;border-radius:8px;padding:7px;cursor:pointer;color:#374151; }
        .hp-mobile-menu { display:none;position:fixed;top:66px;left:0;right:0;background:#fff;border-bottom:1px solid #f3f4f6;padding:16px 5% 20px;z-index:199;flex-direction:column;gap:4px;box-shadow:0 8px 24px rgba(0,0,0,0.08); }
        .hp-mobile-menu.open { display:flex; }
        .hp-mobile-menu a { padding:11px 14px;font-size:14px;font-weight:500;color:#374151;text-decoration:none;border-radius:10px;transition:background .15s; }
        .hp-mobile-menu a:hover { background:#f3f4f6;color:#6366f1; }
        .hp-mobile-cta { margin-top:8px;padding:12px;border-radius:12px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:700;font-size:14px;text-decoration:none;text-align:center; }

        /* ── HERO ── */
        .hp-hero { min-height:100vh;background:linear-gradient(145deg,#f0f4ff 0%,#faf5ff 45%,#f0fdff 100%);display:flex;align-items:center;padding:100px 5% 64px;position:relative;overflow:hidden; }
        .hp-hero-deco { position:absolute;border-radius:50%;pointer-events:none; }
        .hp-hero-deco-1 { width:480px;height:480px;top:-120px;right:-100px;background:radial-gradient(circle,rgba(99,102,241,0.09) 0%,transparent 70%); }
        .hp-hero-deco-2 { width:320px;height:320px;bottom:-80px;left:-60px;background:radial-gradient(circle,rgba(139,92,246,0.08) 0%,transparent 70%); }
        .hp-hero-inner { max-width:1200px;margin:0 auto;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center; }
        .hp-pill { display:inline-flex;align-items:center;gap:8px;background:#eef2ff;border-radius:100px;padding:6px 16px;margin-bottom:22px; }
        .hp-pill-dot { width:7px;height:7px;border-radius:50%;background:#6366f1;animation:pulse-dot 2s ease-in-out infinite; }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.85)} }
        .hp-h1 { font-size:clamp(1.9rem,4vw,3.1rem);font-weight:800;color:#1e1b4b;line-height:1.13;margin-bottom:18px; }
        .hp-grad { background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
        .hp-hero-p { font-size:16px;color:#6b7280;line-height:1.75;margin-bottom:30px;max-width:450px; }
        .hp-btns { display:flex;gap:12px;flex-wrap:wrap;margin-bottom:32px; }
        .hp-btn-p { display:inline-flex;align-items:center;gap:8px;padding:13px 26px;border-radius:14px;text-decoration:none;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:700;font-size:14px;font-family:inherit;box-shadow:0 8px 24px rgba(99,102,241,0.38);transition:transform .15s,box-shadow .15s; }
        .hp-btn-p:hover { transform:translateY(-2px);box-shadow:0 12px 32px rgba(99,102,241,0.45); }
        .hp-btn-s { display:inline-flex;align-items:center;gap:8px;padding:13px 26px;border-radius:14px;text-decoration:none;background:#fff;color:#374151;font-weight:600;font-size:14px;font-family:inherit;border:1.5px solid #e5e7eb;transition:border-color .2s,color .2s; }
        .hp-btn-s:hover { border-color:#6366f1;color:#6366f1; }
        .hp-social-proof { display:flex;align-items:center;gap:12px; }
        .hp-av-stack { display:flex; }
        .hp-av-stack img { width:34px;height:34px;border-radius:50%;border:2.5px solid #fff;object-fit:cover; }
        .hp-av-stack img+img { margin-left:-9px; }
        .hp-stars { display:flex;gap:2px; }
        .hp-sp-text { font-size:12px;color:#6b7280;font-weight:500;margin-top:3px; }

        /* Hero image */
        .hp-hero-right { position:relative; }
        .hp-hero-photo { border-radius:26px;overflow:hidden;aspect-ratio:4/3;box-shadow:0 30px 80px rgba(99,102,241,0.18),0 8px 30px rgba(0,0,0,0.1); }
        .hp-hero-photo img { width:100%;height:100%;object-fit:cover;display:block; }
        .hp-float { position:absolute;background:#fff;border-radius:16px;padding:11px 16px;box-shadow:0 8px 30px rgba(0,0,0,0.11);display:flex;align-items:center;gap:10px; }
        .hp-float-1 { top:18px;left:-18px; }
        .hp-float-2 { bottom:22px;right:-18px; }
        .hp-float-ico { width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
        .hp-float-val { font-size:18px;font-weight:800;color:#1e1b4b;line-height:1; }
        .hp-float-lbl { font-size:11px;color:#9ca3af;margin-top:2px; }

        /* ── STATS BAR ── */
        .hp-stats { background:linear-gradient(135deg,#4f46e5,#6366f1,#7c3aed);padding:44px 5%; }
        .hp-stats-inner { max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:24px; }
        .hp-stat { text-align:center;padding:0 12px; }
        .hp-stat-ico { font-size:28px;margin-bottom:8px; }
        .hp-stat-val { font-size:clamp(1.8rem,2.5vw,2.5rem);font-weight:800;color:#fff;line-height:1; }
        .hp-stat-lbl { font-size:13px;color:rgba(255,255,255,0.72);margin-top:5px;font-weight:500; }
        .hp-stat:not(:last-child) { border-right:1px solid rgba(255,255,255,0.12); }

        /* ── SHARED SECTION ── */
        .hp-sec { padding:88px 5%; }
        .hp-sec-g { background:#f9fafb; }
        .hp-sec-pu { background:linear-gradient(135deg,#f0f4ff,#faf5ff); }
        .hp-inner { max-width:1200px;margin:0 auto; }
        .hp-center { text-align:center;margin-bottom:56px; }
        .hp-chip { display:inline-block;border-radius:100px;padding:5px 16px;font-size:12px;font-weight:600;margin-bottom:14px; }
        .hp-h2 { font-size:clamp(1.5rem,2.8vw,2.1rem);font-weight:800;color:#1e1b4b;line-height:1.2;margin-bottom:12px; }
        .hp-subtext { font-size:15px;color:#6b7280;max-width:520px;margin:0 auto;line-height:1.7; }

        /* ── FEATURES ── */
        .hp-feat-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:20px; }
        .hp-feat { background:#fff;border-radius:20px;padding:26px;border:1px solid #f0f0f0;box-shadow:0 2px 12px rgba(0,0,0,0.04);transition:transform .2s,box-shadow .2s; }
        .hp-feat:hover { transform:translateY(-5px);box-shadow:0 16px 40px rgba(0,0,0,0.09); }
        .hp-feat-ico { width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;margin-bottom:16px; }
        .hp-feat-title { font-size:15px;font-weight:700;color:#1e1b4b;margin-bottom:8px; }
        .hp-feat-desc { font-size:13px;color:#6b7280;line-height:1.65; }

        /* ── WHY US ── */
        .hp-why-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:24px; }
        .hp-why-card { background:#fff;border-radius:22px;padding:32px;border:1px solid #f0f0f0;display:flex;gap:20px;box-shadow:0 2px 12px rgba(0,0,0,0.04);transition:transform .2s,box-shadow .2s; }
        .hp-why-card:hover { transform:translateY(-3px);box-shadow:0 12px 36px rgba(0,0,0,0.08); }
        .hp-why-num { font-size:38px;font-weight:900;line-height:1;flex-shrink:0;margin-top:2px; }
        .hp-why-title { font-size:16px;font-weight:700;color:#1e1b4b;margin-bottom:8px; }
        .hp-why-desc { font-size:13.5px;color:#6b7280;line-height:1.7; }

        /* ── CAMPUS ── */
        .hp-campus-grid { display:grid;grid-template-columns:1fr 1fr;gap:52px;align-items:center; }
        .hp-mosaic { display:grid;grid-template-columns:1fr 1fr;grid-template-rows:210px 210px;gap:10px;border-radius:22px;overflow:hidden; }
        .hp-mosaic img { width:100%;height:100%;object-fit:cover;display:block; }
        .hp-check-list { list-style:none;margin-top:20px; }
        .hp-check-item { display:flex;align-items:center;gap:10px;margin-bottom:13px;font-size:14px;color:#374151;font-weight:500; }
        .hp-check-dot { width:22px;height:22px;border-radius:50%;background:#eef2ff;display:flex;align-items:center;justify-content:center;flex-shrink:0; }

        /* ── PROGRAMS ── */
        .hp-prog-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:16px; }
        .hp-prog { background:#f9fafb;border-radius:18px;padding:20px 22px;border:1.5px solid #f0f0f0;display:flex;align-items:center;gap:14px;transition:all .2s;cursor:default; }
        .hp-prog:hover { border-color:#c7d2fe;background:#fafaff;transform:translateY(-2px);box-shadow:0 8px 24px rgba(99,102,241,0.1); }
        .hp-prog-emoji { font-size:30px;flex-shrink:0; }
        .hp-prog-code { font-size:10px;font-weight:700;color:#6366f1;letter-spacing:1px;margin-bottom:3px; }
        .hp-prog-name { font-size:14px;font-weight:700;color:#1e1b4b;margin-bottom:3px; }
        .hp-prog-meta { font-size:11px;color:#9ca3af;display:flex;gap:8px; }

        /* ── AGENDA ── */
        .hp-agenda-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:16px; }
        .hp-agenda-item { background:#fff;border-radius:18px;padding:20px 24px;border:1px solid #f0f0f0;display:flex;align-items:center;gap:18px;box-shadow:0 2px 8px rgba(0,0,0,0.04);transition:transform .2s; }
        .hp-agenda-item:hover { transform:translateY(-2px); }
        .hp-agenda-date { text-align:center;min-width:54px; }
        .hp-agenda-day { font-size:24px;font-weight:800;color:#1e1b4b;line-height:1; }
        .hp-agenda-month { font-size:11px;color:#9ca3af;font-weight:600;letter-spacing:.5px; }
        .hp-agenda-sep { width:1px;height:40px;background:#f0f0f0;flex-shrink:0; }
        .hp-agenda-badge { display:inline-block;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:600;margin-bottom:5px; }
        .hp-agenda-title { font-size:14px;font-weight:600;color:#1e1b4b; }

        /* ── TESTIMONIALS ── */
        .hp-testi-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:20px; }
        .hp-testi { background:#fff;border-radius:22px;padding:28px;box-shadow:0 4px 24px rgba(99,102,241,0.07);border:1px solid rgba(99,102,241,0.06);transition:transform .2s; }
        .hp-testi:hover { transform:translateY(-3px); }
        .hp-testi-quote { font-size:32px;color:#e0e7ff;font-weight:900;line-height:1;margin-bottom:10px; }
        .hp-testi-text { font-size:14px;color:#4b5563;line-height:1.75;margin-bottom:22px; }
        .hp-testi-author { display:flex;align-items:center;gap:12px; }
        .hp-testi-author img { width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid #eef2ff;flex-shrink:0; }
        .hp-testi-name { font-weight:700;font-size:14px;color:#1e1b4b; }
        .hp-testi-role { font-size:12px;color:#9ca3af;margin-top:2px; }

        /* ── PARTNERS ── */
        .hp-partners { display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:12px; }
        .hp-partner { padding:12px 28px;background:#fff;border:1.5px solid #f0f0f0;border-radius:14px;font-size:14px;font-weight:700;color:#9ca3af;letter-spacing:.5px;transition:all .2s; }
        .hp-partner:hover { border-color:#c7d2fe;color:#6366f1;background:#fafaff; }

        /* ── CTA ── */
        .hp-cta-box { max-width:780px;margin:0 auto;text-align:center;background:linear-gradient(135deg,#4f46e5,#6366f1,#7c3aed);border-radius:30px;padding:64px 36px;box-shadow:0 24px 64px rgba(99,102,241,0.32);position:relative;overflow:hidden; }
        .hp-cta-deco { position:absolute;border-radius:50%;pointer-events:none; }
        .hp-cta-deco-1 { width:200px;height:200px;top:-60px;right:-40px;background:rgba(255,255,255,0.06); }
        .hp-cta-deco-2 { width:150px;height:150px;bottom:-40px;left:-20px;background:rgba(255,255,255,0.04); }
        .hp-cta-btn { display:inline-flex;align-items:center;gap:10px;padding:15px 34px;border-radius:16px;text-decoration:none;background:#fff;color:#6366f1;font-weight:700;font-size:15px;font-family:inherit;box-shadow:0 8px 24px rgba(0,0,0,0.14);transition:transform .15s,box-shadow .15s; }
        .hp-cta-btn:hover { transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,0,0,0.18); }
        .hp-cta-features { display:flex;justify-content:center;gap:24px;margin-top:28px;flex-wrap:wrap; }
        .hp-cta-feat { display:flex;align-items:center;gap:6px;font-size:13px;color:rgba(255,255,255,0.8); }

        /* ── FOOTER ── */
        .hp-footer { background:#0f172a;color:#fff;padding:64px 5% 28px; }
        .hp-footer-grid { display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;margin-bottom:44px; }
        .hp-footer-logo { display:flex;align-items:center;gap:10px;margin-bottom:16px; }
        .hp-footer-logo-ico { width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;flex-shrink:0; }
        .hp-footer-desc { font-size:13px;color:#94a3b8;line-height:1.8;max-width:260px;margin-bottom:20px; }
        .hp-footer-socials { display:flex;gap:8px; }
        .hp-footer-social { width:34px;height:34px;border-radius:9px;background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#94a3b8;cursor:pointer;transition:background .2s; }
        .hp-footer-social:hover { background:rgba(99,102,241,0.4);color:#fff; }
        .hp-footer-col-title { font-weight:700;font-size:13px;color:#fff;margin-bottom:16px; }
        .hp-footer-link { display:block;font-size:13px;color:#64748b;margin-bottom:10px;text-decoration:none;transition:color .2s; }
        .hp-footer-link:hover { color:#a5b4fc; }
        .hp-footer-contact { display:flex;align-items:center;gap:9px;font-size:13px;color:#64748b;margin-bottom:12px; }
        .hp-footer-contact svg { color:#6366f1;flex-shrink:0; }
        .hp-footer-bottom { border-top:1px solid rgba(255,255,255,0.06);padding-top:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;font-size:12px;color:#475569; }
        .hp-footer-badge { display:inline-flex;align-items:center;gap:6px;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.2);border-radius:100px;padding:4px 12px;font-size:11px;color:#a5b4fc;font-weight:600; }

        /* ══ RESPONSIVE ══════════════════════════════════════════════════════ */
        @media (max-width:900px) {
          .hp-nav-links { display:none; }
          .hp-menu-btn { display:flex; }
          .hp-hero-inner { grid-template-columns:1fr;gap:36px; }
          .hp-float { display:none; }
          .hp-stats-inner { grid-template-columns:1fr 1fr;gap:16px; }
          .hp-stat:nth-child(2) { border-right:1px solid rgba(255,255,255,0.12); }
          .hp-stat:nth-child(3) { border-right:none; }
          .hp-feat-grid { grid-template-columns:1fr 1fr; }
          .hp-why-grid { grid-template-columns:1fr; }
          .hp-campus-grid { grid-template-columns:1fr; }
          .hp-prog-grid { grid-template-columns:1fr 1fr; }
          .hp-agenda-grid { grid-template-columns:1fr; }
          .hp-testi-grid { grid-template-columns:1fr; }
          .hp-footer-grid { grid-template-columns:1fr 1fr;gap:28px; }
        }
        @media (max-width:560px) {
          .hp-hero { padding:88px 5% 48px; }
          .hp-btn-s { display:none; }
          .hp-feat-grid { grid-template-columns:1fr; }
          .hp-prog-grid { grid-template-columns:1fr; }
          .hp-mosaic { grid-template-columns:1fr;grid-template-rows:200px;height:200px; }
          .hp-mosaic img:not(:first-child) { display:none; }
          .hp-mosaic img { grid-row:unset!important; }
          .hp-stats-inner { grid-template-columns:1fr 1fr; }
          .hp-stat { border-right:none!important; }
          .hp-footer-grid { grid-template-columns:1fr; }
          .hp-cta-box { padding:44px 20px; }
          .hp-sec { padding:60px 5%; }
          .hp-why-card { flex-direction:column;gap:10px; }
          .hp-why-num { font-size:28px; }
        }
      `}</style>

      {/* ══ NAVBAR ═══════════════════════════════════════════════════════════ */}
      <nav className="hp-nav">
        <Link to="/" className="hp-logo">
          <div className="hp-logo-icon"><GraduationCap size={22} color="#fff" /></div>
          <div>
            <div className="hp-logo-text-main">ACAN</div>
            <div className="hp-logo-text-sub">UNIVERSITÉ</div>
          </div>
        </Link>

        <div className="hp-nav-links">
          {['Accueil','Filières','Plateforme','Contact'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`}>{item}</a>
          ))}
        </div>

        <div style={{ display:'flex',gap:10,alignItems:'center' }}>
          <Link to="/login" className="hp-nav-cta">Se connecter <ChevronRight size={14}/></Link>
          <button className="hp-menu-btn" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X size={18}/> : <Menu size={18}/>}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`hp-mobile-menu ${menuOpen ? 'open' : ''}`}>
        {['Accueil','Filières','Plateforme','Contact'].map(item => (
          <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)}>{item}</a>
        ))}
        <Link to="/login" className="hp-mobile-cta" onClick={() => setMenuOpen(false)}>Se connecter</Link>
      </div>

      {/* ══ HERO ═════════════════════════════════════════════════════════════ */}
      <section id="accueil" className="hp-hero">
        <div className="hp-hero-deco hp-hero-deco-1"/>
        <div className="hp-hero-deco hp-hero-deco-2"/>
        <div className="hp-hero-inner">
          <div>
            <div className="hp-pill">
              <span className="hp-pill-dot"/>
              <span style={{ fontSize:12,fontWeight:600,color:'#6366f1' }}>Plateforme de Gestion Universitaire</span>
            </div>
            <h1 className="hp-h1">
              Construisez votre<br/>
              <span className="hp-grad">avenir académique</span><br/>
              avec ACAN
            </h1>
            <p className="hp-hero-p">
              L'Université ACAN offre une formation d'excellence en Informatique, Gestion et Droit.
              Rejoignez des milliers d'étudiants qui bâtissent leur avenir avec nous à Brazzaville.
            </p>
            <div className="hp-btns">
              <Link to="/login" className="hp-btn-p">Accéder à mon espace <ArrowRight size={15}/></Link>
              <a href="#filières" className="hp-btn-s">Voir les filières <ChevronRight size={14}/></a>
            </div>
            <div className="hp-social-proof">
              <div className="hp-av-stack">
                {AVATARS.map((src,i) => <img key={i} src={src} alt=""/>)}
              </div>
              <div>
                <div className="hp-stars">{[1,2,3,4,5].map(i=><Star key={i} size={12} fill="#f59e0b" color="#f59e0b"/>)}</div>
                <div className="hp-sp-text">+2 400 étudiants nous font confiance</div>
              </div>
            </div>
          </div>

          <div className="hp-hero-right">
            <div className="hp-hero-photo">
              <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900&q=80" alt="Étudiants ACAN"/>
            </div>
            <div className="hp-float hp-float-1">
              <div className="hp-float-ico" style={{ background:'#eef2ff' }}><Award size={18} color="#6366f1"/></div>
              <div><div className="hp-float-val">96%</div><div className="hp-float-lbl">Taux de réussite</div></div>
            </div>
            <div className="hp-float hp-float-2">
              <div className="hp-float-ico" style={{ background:'#ecfdf5' }}><Users size={18} color="#10b981"/></div>
              <div><div className="hp-float-val">2 400+</div><div className="hp-float-lbl">Étudiants actifs</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS ════════════════════════════════════════════════════════════ */}
      <section className="hp-stats">
        <div className="hp-stats-inner">
          {STATS.map((s,i) => (
            <div key={i} className="hp-stat">
              <div className="hp-stat-ico">{s.icon}</div>
              <div className="hp-stat-val">{s.value}</div>
              <div className="hp-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ═════════════════════════════════════════════════════════ */}
      <section id="plateforme" className="hp-sec hp-sec-g">
        <div className="hp-inner">
          <div className="hp-center">
            <div className="hp-chip" style={{ background:'#eef2ff',color:'#6366f1' }}>Notre plateforme</div>
            <h2 className="hp-h2">Tout ce dont vous avez besoin</h2>
            <p className="hp-subtext">Une suite complète d'outils pensés pour simplifier la vie des étudiants, enseignants et administrateurs.</p>
          </div>
          <div className="hp-feat-grid">
            {FEATURES.map((f,i) => (
              <div key={i} className="hp-feat">
                <div className="hp-feat-ico" style={{ background:f.bg,color:f.color }}>{f.icon}</div>
                <div className="hp-feat-title">{f.title}</div>
                <div className="hp-feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ POURQUOI NOUS ════════════════════════════════════════════════════ */}
      <section className="hp-sec">
        <div className="hp-inner">
          <div className="hp-center">
            <div className="hp-chip" style={{ background:'#fef9c3',color:'#854d0e' }}>Nos atouts</div>
            <h2 className="hp-h2">Pourquoi choisir l'Université ACAN ?</h2>
            <p className="hp-subtext">Nous nous engageons à fournir une éducation de qualité qui prépare nos étudiants aux défis du monde professionnel.</p>
          </div>
          <div className="hp-why-grid">
            {WHY_US.map((w,i) => (
              <div key={i} className="hp-why-card">
                <div className="hp-why-num" style={{ color: w.color + '22', WebkitTextStroke:`1.5px ${w.color}` }}>{w.num}</div>
                <div>
                  <div className="hp-why-title">{w.title}</div>
                  <div className="hp-why-desc">{w.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CAMPUS ═══════════════════════════════════════════════════════════ */}
      <section className="hp-sec hp-sec-g">
        <div className="hp-inner">
          <div className="hp-campus-grid">
            <div className="hp-mosaic">
              <img src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=500&q=80" alt="Étudiants" style={{ gridRow:'span 2' }}/>
              <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&q=80" alt="Bibliothèque"/>
              <img src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=500&q=80" alt="Campus"/>
            </div>
            <div>
              <div className="hp-chip" style={{ background:'#ecfdf5',color:'#15803d' }}>Vie sur le campus</div>
              <h2 className="hp-h2" style={{ textAlign:'left' }}>Un cadre d'apprentissage moderne et stimulant</h2>
              <p style={{ fontSize:14,color:'#6b7280',lineHeight:1.8,marginBottom:8 }}>
                Notre campus offre un environnement propice à l'épanouissement académique et personnel de chaque étudiant.
              </p>
              <ul className="hp-check-list">
                {[
                  'Salles équipées de vidéoprojecteurs et tableau numérique',
                  'Connexion Wi-Fi haut débit sur tout le campus',
                  'Bibliothèque physique et numérique avec +5 000 ouvrages',
                  'Laboratoires informatiques ouverts 7 jours/7',
                  'Espaces de co-working et salles de travail en groupe',
                ].map((item,i) => (
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
        </div>
      </section>

      {/* ══ FILIÈRES ═════════════════════════════════════════════════════════ */}
      <section id="filières" className="hp-sec">
        <div className="hp-inner">
          <div className="hp-center">
            <div className="hp-chip" style={{ background:'#f5f3ff',color:'#7c3aed' }}>Nos formations</div>
            <h2 className="hp-h2">Filières disponibles</h2>
            <p className="hp-subtext">Des formations reconnues, adaptées aux besoins du marché de l'emploi congolais et international.</p>
          </div>
          <div className="hp-prog-grid">
            {PROGRAMS.map((p,i) => (
              <div key={i} className="hp-prog">
                <div className="hp-prog-emoji">{p.icon}</div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div className="hp-prog-code">L1 — L3</div>
                  <div className="hp-prog-name">{p.name}</div>
                  <div className="hp-prog-meta">
                    <span>{p.duration}</span>
                    <span>·</span>
                    <span>{p.students} étudiants</span>
                  </div>
                </div>
                <ChevronRight size={15} color="#d1d5db" style={{ flexShrink:0 }}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ AGENDA ACADÉMIQUE ════════════════════════════════════════════════ */}
      <section className="hp-sec hp-sec-g">
        <div className="hp-inner">
          <div className="hp-center">
            <div className="hp-chip" style={{ background:'#ffe4e6',color:'#9f1239' }}>Calendrier</div>
            <h2 className="hp-h2">Agenda académique 2025–2026</h2>
            <p className="hp-subtext">Les dates importantes à ne pas manquer pour cette année académique.</p>
          </div>
          <div className="hp-agenda-grid">
            {AGENDA.map((a,i) => (
              <div key={i} className="hp-agenda-item">
                <div className="hp-agenda-date">
                  <div className="hp-agenda-day">{a.date.split(' ')[0]}</div>
                  <div className="hp-agenda-month">{a.date.split(' ')[1]} {a.month}</div>
                </div>
                <div className="hp-agenda-sep"/>
                <div>
                  <div className="hp-agenda-badge" style={{ background:a.bg,color:a.color }}>{a.type}</div>
                  <div className="hp-agenda-title">{a.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TÉMOIGNAGES ══════════════════════════════════════════════════════ */}
      <section className="hp-sec hp-sec-pu">
        <div className="hp-inner">
          <div className="hp-center">
            <div className="hp-chip" style={{ background:'#fffbeb',color:'#b45309' }}>Témoignages</div>
            <h2 className="hp-h2">Ce que disent nos étudiants</h2>
          </div>
          <div className="hp-testi-grid">
            {TESTIMONIALS.map((t,i) => (
              <div key={i} className="hp-testi">
                <div className="hp-testi-quote">"</div>
                <div className="hp-stars" style={{ marginBottom:12 }}>
                  {[1,2,3,4,5].map(j=><Star key={j} size={13} fill="#f59e0b" color="#f59e0b"/>)}
                </div>
                <p className="hp-testi-text">{t.text}</p>
                <div className="hp-testi-author">
                  <img src={t.avatar} alt={t.name}/>
                  <div>
                    <div className="hp-testi-name">{t.name}</div>
                    <div className="hp-testi-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PARTENAIRES ══════════════════════════════════════════════════════ */}
      <section className="hp-sec">
        <div className="hp-inner">
          <div className="hp-center" style={{ marginBottom:36 }}>
            <div className="hp-chip" style={{ background:'#f0f9ff',color:'#0369a1' }}>Partenaires</div>
            <h2 className="hp-h2">Nos partenaires technologiques</h2>
            <p className="hp-subtext">Nous collaborons avec les leaders mondiaux de la technologie pour enrichir votre formation.</p>
          </div>
          <div className="hp-partners">
            {PARTNERS.map((p,i) => (
              <div key={i} className="hp-partner">{p}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══════════════════════════════════════════════════════════════ */}
      <section className="hp-sec hp-sec-g">
        <div className="hp-cta-box">
          <div className="hp-cta-deco hp-cta-deco-1"/>
          <div className="hp-cta-deco hp-cta-deco-2"/>
          <div style={{ position:'relative',zIndex:1 }}>
            <div style={{ fontSize:44,marginBottom:16 }}>🎓</div>
            <h2 style={{ fontSize:'clamp(1.5rem,3vw,2rem)',fontWeight:800,color:'#fff',marginBottom:14 }}>
              Prêt à rejoindre l'Université ACAN ?
            </h2>
            <p style={{ fontSize:15,color:'rgba(255,255,255,0.8)',lineHeight:1.7,margin:'0 auto 32px',maxWidth:460 }}>
              Connectez-vous pour accéder à vos cours, notes, emploi du temps et bien plus encore.
            </p>
            <Link to="/login" className="hp-cta-btn">
              <GraduationCap size={19}/> Accéder à mon espace
            </Link>
            <div className="hp-cta-features">
              {['Accès immédiat','Sans frais cachés','Support 24/7'].map((f,i) => (
                <div key={i} className="hp-cta-feat">
                  <CheckCircle size={14} color="#86efac"/>{f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════════════════ */}
      <footer id="contact" className="hp-footer">
        <div style={{ maxWidth:1200,margin:'0 auto' }}>
          <div className="hp-footer-grid">
            <div>
              <div className="hp-footer-logo">
                <div className="hp-footer-logo-ico"><GraduationCap size={18} color="#fff"/></div>
                <div>
                  <div style={{ fontWeight:800,fontSize:15,color:'#fff' }}>ACAN</div>
                  <div style={{ fontSize:10,color:'#6366f1',fontWeight:600,letterSpacing:1 }}>UNIVERSITÉ</div>
                </div>
              </div>
              <p className="hp-footer-desc">
                L'Université ACAN forme les leaders de demain avec des programmes d'excellence depuis Brazzaville, Congo.
              </p>
              <div className="hp-footer-socials">
                {['f','in','tw','yt'].map(s => (
                  <div key={s} className="hp-footer-social">{s}</div>
                ))}
              </div>
            </div>
            <div>
              <div className="hp-footer-col-title">Navigation</div>
              {['Accueil','Filières','Plateforme','Contact'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} className="hp-footer-link">{item}</a>
              ))}
            </div>
            <div>
              <div className="hp-footer-col-title">Formations</div>
              {['Informatique','Génie Logiciel','Réseaux','Gestion','Comptabilité','Droit'].map(item => (
                <div key={item} className="hp-footer-link">{item}</div>
              ))}
            </div>
            <div>
              <div className="hp-footer-col-title">Contact</div>
              {[
                { icon:<MapPin size={13}/>, text:'Brazzaville, République du Congo' },
                { icon:<Phone size={13}/>, text:'+242 06 000 0000' },
                { icon:<Mail size={13}/>, text:'info@acan-univ.cg' },
                { icon:<Clock size={13}/>, text:'Lun–Sam : 7h00 – 18h00' },
              ].map((c,i) => (
                <div key={i} className="hp-footer-contact">
                  {c.icon}{c.text}
                </div>
              ))}
            </div>
          </div>
          <div className="hp-footer-bottom">
            <span>© 2024–2025 Université ACAN. Tous droits réservés.</span>
            <div style={{ display:'flex',gap:12,alignItems:'center' }}>
              <span className="hp-footer-badge"><Zap size={11}/>Propulsé par Omedev</span>
              <span>Conçu avec ❤️ à Brazzaville</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
