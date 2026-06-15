import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, Users, Award, BarChart2, Calendar,
  ChevronRight, Star, MapPin, Phone, Mail, ArrowRight,
  Shield, Layers, Cpu, Globe, CheckCircle, Clock, Zap,
  Menu, X, BookOpen, TrendingUp,
} from 'lucide-react';

/* ════════════════════════════════════════════════════════════════
   HOOKS
════════════════════════════════════════════════════════════════ */
function useScrolled(threshold = 30) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', fn, { passive: true });
    fn();
    return () => window.removeEventListener('scroll', fn);
  }, [threshold]);
  return scrolled;
}

function useInView(threshold = 0.25) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function useCountUp(end, duration, active) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf;
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, end, duration]);
  return val;
}

/* ════════════════════════════════════════════════════════════════
   DATA
════════════════════════════════════════════════════════════════ */
const STATS = [
  { num: 2400, suffix: '+', label: 'Étudiants inscrits', icon: '👨‍🎓' },
  { num: 120,  suffix: '+', label: 'Enseignants qualifiés', icon: '👩‍🏫' },
  { num: 18,   suffix: '',  label: 'Filières disponibles', icon: '📚' },
  { num: 96,   suffix: ' %', label: 'Taux de réussite', icon: '🏆' },
];

const FEATURES = [
  { icon: <BarChart2 size={22}/>, title: 'Suivi académique',      desc: 'Notes, absences et bulletins en temps réel depuis n\'importe quel appareil.', color: '#6366f1', bg: '#eef2ff' },
  { icon: <Calendar size={22}/>,  title: 'Emploi du temps',        desc: 'Calendrier dynamique avec cours, examens et événements synchronisés.', color: '#8b5cf6', bg: '#f5f3ff' },
  { icon: <Shield size={22}/>,    title: 'Sécurité des données',   desc: 'Vos données académiques protégées selon les meilleurs standards.', color: '#06b6d4', bg: '#ecfeff' },
  { icon: <Layers size={22}/>,    title: 'Frais en ligne',         desc: 'Payez et suivez vos frais de scolarité sans vous déplacer.', color: '#10b981', bg: '#ecfdf5' },
  { icon: <Cpu size={22}/>,       title: 'Bibliothèque numérique', desc: 'Des milliers de ressources pédagogiques accessibles 24h/24.', color: '#f59e0b', bg: '#fffbeb' },
  { icon: <Globe size={22}/>,     title: 'Stages & Carrières',     desc: 'Offres de stage et accompagnement pour votre insertion pro.', color: '#ef4444', bg: '#fef2f2' },
];

const PROGRAMS = [
  { name: 'Informatique de Gestion',     icon: '💻', students: 420, color: '#6366f1', bg: '#eef2ff' },
  { name: 'Génie Logiciel',              icon: '⚙️', students: 310, color: '#8b5cf6', bg: '#f5f3ff' },
  { name: 'Réseaux & Télécoms',          icon: '📡', students: 280, color: '#06b6d4', bg: '#ecfeff' },
  { name: 'Administration des Affaires', icon: '📊', students: 390, color: '#10b981', bg: '#ecfdf5' },
  { name: 'Comptabilité & Finance',      icon: '💰', students: 260, color: '#f59e0b', bg: '#fffbeb' },
  { name: 'Droit des Affaires',          icon: '⚖️', students: 200, color: '#ef4444', bg: '#fef2f2' },
];

const WHY_US = [
  { num: '01', title: 'Excellence académique',    desc: 'Programmes conçus par des experts et mis à jour selon les exigences du marché.', color: '#6366f1' },
  { num: '02', title: 'Professeurs expérimentés', desc: '120+ enseignants certifiés alliant théorie et expérience professionnelle.', color: '#8b5cf6' },
  { num: '03', title: 'Technologie de pointe',    desc: 'Labos équipés, bibliothèque numérique et plateforme de gestion moderne.', color: '#06b6d4' },
  { num: '04', title: 'Insertion professionnelle',desc: 'Réseau de 200+ entreprises partenaires pour vos stages et premier emploi.', color: '#10b981' },
];

const AGENDA = [
  { day: '15', mon: 'Sep 2025', title: 'Rentrée académique 2025–2026', type: 'Rentrée',    color: '#6366f1', bg: '#eef2ff' },
  { day: '01', mon: 'Oct 2025', title: 'Début des inscriptions S1',    type: 'Inscription',color: '#10b981', bg: '#ecfdf5' },
  { day: '20', mon: 'Nov 2025', title: 'Examens de mi-semestre',        type: 'Examen',    color: '#f59e0b', bg: '#fffbeb' },
  { day: '15', mon: 'Jan 2026', title: 'Début du semestre 2',           type: 'Cours',     color: '#8b5cf6', bg: '#f5f3ff' },
];

const TESTIMONIALS = [
  {
    name: 'Marie Lukamba', role: 'Étudiante L2 Informatique',
    text: 'La plateforme a transformé ma façon de suivre mes cours. Tout est accessible, clair et rapide. Je recommande à tous !',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Patrick Mbemba', role: 'Étudiant L3 Génie Logiciel',
    text: 'Grâce au suivi des absences en temps réel, je ne rate plus aucun cours important. Un outil vraiment excellent !',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Clarisse Nzombi', role: 'Étudiante L1 Comptabilité',
    text: 'Payer mes frais depuis mon téléphone, c\'est une vraie révolution. L\'interface est belle et très intuitive.',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop&crop=face',
  },
];

const PARTNERS = ['Microsoft', 'Oracle', 'Cisco', 'SAP', 'IBM', 'Google', 'Huawei', 'Lenovo'];

const AVATARS = [
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=44&h=44&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=44&h=44&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=44&h=44&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=44&h=44&fit=crop&crop=face',
];

/* ════════════════════════════════════════════════════════════════
   SUB-COMPONENT — animated stat
════════════════════════════════════════════════════════════════ */
function StatItem({ num, suffix, label, icon, active, delay }) {
  const count = useCountUp(num, 2000, active);
  const display = num >= 1000 ? Math.round(count).toLocaleString('fr-FR') : count;
  return (
    <div className="hp-stat" style={{ animationDelay: delay }}>
      <div className="hp-stat-ico">{icon}</div>
      <div className="hp-stat-val">{display}{suffix}</div>
      <div className="hp-stat-lbl">{label}</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScrolled(40);
  const [statsRef, statsVisible] = useInView(0.3);

  /* Global scroll-reveal observer */
  useEffect(() => {
    const els = document.querySelectorAll('.hp-rv,.hp-rv-l,.hp-rv-r,.hp-rv-s');
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
      }),
      { threshold: 0.1 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="hp">
      {/* Image de fond fixe — fonctionne sur iOS et tous navigateurs */}
      <div className="hp-bg" aria-hidden="true"/>

      {/* ═══ STYLES ══════════════════════════════════════════════════ */}
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        .hp{font-family:'Poppins',sans-serif;overflow-x:hidden;color:#1e1b4b;}
        .hp-bg{position:fixed;inset:0;z-index:-1;background-image:url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&q=85');background-size:cover;background-position:center top;}

        /* ── KEYFRAMES ─────────────────────────────────── */
        @keyframes blobMove{
          0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%;transform:translate(0,0) scale(1);}
          33%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%;transform:translate(28px,-18px) scale(1.04);}
          66%{border-radius:20% 60% 50% 80%/30% 70% 30% 60%;transform:translate(-18px,14px) scale(.97);}
        }
        @keyframes floatY{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
        @keyframes pulseDot{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(.8);}}
        @keyframes pulseRing{0%{box-shadow:0 0 0 0 rgba(99,102,241,.45);}70%{box-shadow:0 0 0 12px rgba(99,102,241,0);}100%{box-shadow:0 0 0 0 rgba(99,102,241,0);}}
        @keyframes heroL{from{opacity:0;transform:translateX(-36px);}to{opacity:1;transform:none;}}
        @keyframes heroR{from{opacity:0;transform:translateX(36px);}to{opacity:1;transform:none;}}
        @keyframes heroUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:none;}}
        @keyframes gradShift{0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;}}
        @keyframes marquee{from{transform:translateX(0);}to{transform:translateX(-50%);}}
        @keyframes statIn{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:none;}}
        @keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}

        /* ── SCROLL REVEAL ─────────────────────────────── */
        .hp-rv{opacity:0;transform:translateY(32px);transition:opacity .7s ease,transform .7s ease;}
        .hp-rv.in{opacity:1;transform:none;}
        .hp-rv-l{opacity:0;transform:translateX(-36px);transition:opacity .7s ease,transform .7s ease;}
        .hp-rv-l.in{opacity:1;transform:none;}
        .hp-rv-r{opacity:0;transform:translateX(36px);transition:opacity .7s ease,transform .7s ease;}
        .hp-rv-r.in{opacity:1;transform:none;}
        .hp-rv-s{opacity:0;transform:scale(.93);transition:opacity .6s ease,transform .6s ease;}
        .hp-rv-s.in{opacity:1;transform:scale(1);}

        /* ── NAVBAR ────────────────────────────────────── */
        .hp-nav{position:fixed;top:0;left:0;right:0;z-index:200;height:66px;padding:0 5%;display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.96);backdrop-filter:blur(16px);transition:box-shadow .3s,background .3s;}
        .hp-nav.scrolled{box-shadow:0 2px 20px rgba(0,0,0,0.08);}
        .hp-logo{display:flex;align-items:center;gap:10px;text-decoration:none;}
        .hp-logo-icon{width:42px;height:42px;border-radius:13px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(99,102,241,.35);flex-shrink:0;animation:pulseRing 2.5s ease-in-out infinite;}
        .hp-logo-main{font-weight:800;font-size:16px;color:#1e1b4b;line-height:1;}
        .hp-logo-sub{font-size:10px;color:#6366f1;font-weight:600;letter-spacing:1.2px;}
        .hp-nav-links{display:flex;gap:30px;align-items:center;}
        .hp-nav-links a{font-size:13.5px;font-weight:500;color:#4b5563;text-decoration:none;transition:color .2s;position:relative;padding-bottom:2px;}
        .hp-nav-links a::after{content:'';position:absolute;bottom:-2px;left:0;right:0;height:2px;background:#6366f1;border-radius:2px;transform:scaleX(0);transition:transform .25s;}
        .hp-nav-links a:hover{color:#6366f1;}
        .hp-nav-links a:hover::after{transform:scaleX(1);}
        .hp-nav-cta{display:inline-flex;align-items:center;gap:6px;padding:9px 20px;border-radius:12px;text-decoration:none;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:600;font-size:13px;box-shadow:0 4px 14px rgba(99,102,241,.3);transition:transform .15s,box-shadow .15s;}
        .hp-nav-cta:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(99,102,241,.45);}
        .hp-menu-btn{display:none;background:none;border:1.5px solid #e5e7eb;border-radius:9px;padding:7px;cursor:pointer;color:#374151;align-items:center;}
        .hp-mob-menu{display:none;position:fixed;top:66px;left:0;right:0;background:#fff;border-bottom:1px solid #f3f4f6;padding:16px 5% 20px;z-index:199;flex-direction:column;gap:4px;box-shadow:0 8px 24px rgba(0,0,0,.08);}
        .hp-mob-menu.open{display:flex;}
        .hp-mob-menu a{padding:11px 14px;font-size:14px;font-weight:500;color:#374151;text-decoration:none;border-radius:10px;transition:background .15s,color .15s;}
        .hp-mob-menu a:hover{background:#f3f4f6;color:#6366f1;}
        .hp-mob-cta{margin-top:8px;padding:12px;border-radius:12px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:700;font-size:14px;text-decoration:none;text-align:center;}

        /* ── HERO ──────────────────────────────────────── */
        .hp-hero{min-height:100vh;background:rgba(232,238,255,0.72);display:flex;align-items:center;padding:100px 5% 70px;position:relative;overflow:hidden;}
        .hp-blob{position:absolute;pointer-events:none;filter:blur(55px);opacity:.16;}
        .hp-blob-1{width:500px;height:500px;top:-120px;right:-100px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:60% 40% 30% 70%/60% 30% 70% 40%;animation:blobMove 14s ease-in-out infinite;}
        .hp-blob-2{width:350px;height:350px;bottom:-80px;left:-80px;background:linear-gradient(135deg,#06b6d4,#6366f1);border-radius:60% 40% 30% 70%/60% 30% 70% 40%;animation:blobMove 10s ease-in-out infinite reverse;animation-delay:-4s;}
        .hp-blob-3{width:200px;height:200px;top:35%;right:35%;background:#a78bfa;border-radius:50%;animation:blobMove 8s ease-in-out infinite;animation-delay:-7s;opacity:.07;}
        .hp-hero-inner{max-width:1200px;margin:0 auto;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;position:relative;z-index:1;}

        /* Hero text animates on load */
        .hp-hero-text{animation:heroL .85s .1s both;}
        .hp-hero-img-wrap{animation:heroR .85s .25s both;}

        .hp-pill{display:inline-flex;align-items:center;gap:8px;background:#eef2ff;border:1px solid rgba(99,102,241,.2);border-radius:100px;padding:6px 16px;margin-bottom:22px;animation:heroUp .6s .05s both;}
        .hp-pill-dot{width:7px;height:7px;border-radius:50%;background:#6366f1;animation:pulseDot 2s ease-in-out infinite;}
        .hp-h1{font-size:clamp(1.9rem,4vw,3.2rem);font-weight:800;color:#1e1b4b;line-height:1.12;margin-bottom:18px;}
        .hp-grad{background:linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4);background-size:200% 200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:gradShift 4s ease infinite;}
        .hp-hero-p{font-size:16px;color:#6b7280;line-height:1.78;margin-bottom:30px;max-width:440px;}
        .hp-btns{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:32px;}
        .hp-btn-p{display:inline-flex;align-items:center;gap:8px;padding:13px 26px;border-radius:14px;text-decoration:none;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:700;font-size:14px;font-family:inherit;box-shadow:0 8px 24px rgba(99,102,241,.38);transition:transform .18s,box-shadow .18s;}
        .hp-btn-p:hover{transform:translateY(-2px);box-shadow:0 14px 36px rgba(99,102,241,.48);}
        .hp-btn-s{display:inline-flex;align-items:center;gap:8px;padding:13px 26px;border-radius:14px;text-decoration:none;background:#fff;color:#374151;font-weight:600;font-size:14px;font-family:inherit;border:1.5px solid #e5e7eb;transition:border-color .2s,color .2s,box-shadow .2s;}
        .hp-btn-s:hover{border-color:#6366f1;color:#6366f1;box-shadow:0 4px 16px rgba(99,102,241,.12);}
        .hp-social-proof{display:flex;align-items:center;gap:12px;}
        .hp-av-stack{display:flex;}
        .hp-av-stack img{width:34px;height:34px;border-radius:50%;border:2.5px solid #fff;object-fit:cover;}
        .hp-av-stack img+img{margin-left:-9px;}
        .hp-stars{display:flex;gap:2px;}
        .hp-sp-text{font-size:12px;color:#6b7280;font-weight:500;margin-top:3px;}

        /* Hero image */
        .hp-hero-img-wrap{position:relative;}
        .hp-hero-photo{border-radius:26px;overflow:hidden;aspect-ratio:4/3;box-shadow:0 32px 80px rgba(99,102,241,.2),0 8px 32px rgba(0,0,0,.1);position:relative;}
        .hp-hero-photo img{width:100%;height:100%;object-fit:cover;display:block;transform:scale(1);transition:transform 8s ease;}
        .hp-hero-photo:hover img{transform:scale(1.04);}
        .hp-hero-photo::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 60%,rgba(15,23,42,.25));}
        /* Animated gradient ring */
        .hp-hero-ring{position:absolute;inset:-3px;border-radius:28px;background:linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4,#6366f1);background-size:300% 300%;animation:gradShift 3.5s ease infinite;z-index:-1;}
        .hp-float{position:absolute;background:#fff;border-radius:16px;padding:11px 16px;box-shadow:0 10px 32px rgba(0,0,0,.12);display:flex;align-items:center;gap:10px;}
        .hp-float-1{top:20px;left:-22px;animation:floatY 3.2s ease-in-out infinite;}
        .hp-float-2{bottom:24px;right:-22px;animation:floatY 3.2s ease-in-out infinite;animation-delay:-1.6s;}
        .hp-float-ico{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .hp-float-val{font-size:18px;font-weight:800;color:#1e1b4b;line-height:1;}
        .hp-float-lbl{font-size:11px;color:#9ca3af;margin-top:2px;}

        /* Scroll indicator */
        .hp-scroll-ind{position:absolute;bottom:32px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:6px;animation:heroUp .8s .9s both;}
        .hp-scroll-dot{width:5px;height:5px;border-radius:50%;background:#6366f1;animation:floatY 1.4s ease-in-out infinite;}
        .hp-scroll-dot:nth-child(2){animation-delay:.2s;}
        .hp-scroll-dot:nth-child(3){animation-delay:.4s;}

        /* ── STATS ─────────────────────────────────────── */
        .hp-stats{background:linear-gradient(135deg,#4f46e5 0%,#6366f1 50%,#7c3aed 100%);padding:52px 5%;position:relative;overflow:hidden;}
        .hp-stats::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1' fill='rgba(255,255,255,0.05)'/%3E%3C/svg%3E");background-size:40px 40px;}
        .hp-stats-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:24px;position:relative;}
        .hp-stat{text-align:center;padding:0 12px;animation:statIn .7s ease both;}
        .hp-stat-ico{font-size:30px;margin-bottom:10px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.2));}
        .hp-stat-val{font-size:clamp(1.8rem,2.5vw,2.6rem);font-weight:800;color:#fff;line-height:1;}
        .hp-stat-lbl{font-size:13px;color:rgba(255,255,255,.7);margin-top:6px;font-weight:500;}
        .hp-stat:not(:last-child){border-right:1px solid rgba(255,255,255,.12);}

        /* ── SHARED SECTION ────────────────────────────── */
        .hp-sec{padding:96px 5%;background:rgba(255,255,255,0.86);}
        .hp-sec-g{background:rgba(248,250,252,0.91);}
        .hp-sec-pu{background:rgba(245,243,255,0.88);}
        .hp-inner{max-width:1200px;margin:0 auto;}
        .hp-center{text-align:center;margin-bottom:60px;}
        .hp-chip{display:inline-block;border-radius:100px;padding:5px 16px;font-size:12px;font-weight:600;margin-bottom:14px;}
        .hp-h2{font-size:clamp(1.5rem,2.8vw,2.15rem);font-weight:800;color:#1e1b4b;line-height:1.2;margin-bottom:12px;}
        .hp-subtext{font-size:15px;color:#6b7280;max-width:520px;margin:0 auto;line-height:1.72;}

        /* ── FEATURES ──────────────────────────────────── */
        .hp-sec-feat{position:relative;padding:96px 5%;overflow:hidden;}
        .hp-sec-feat-bg{display:none;}
        .hp-sec-feat-overlay{position:absolute;inset:0;background:linear-gradient(135deg,rgba(15,23,42,.88) 0%,rgba(30,27,75,.82) 100%);}
        .hp-sec-feat-content{position:relative;z-index:1;max-width:1200px;margin:0 auto;}
        .hp-feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
        .hp-feat{background:rgba(255,255,255,.07);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-radius:22px;padding:28px;border:1px solid rgba(255,255,255,.12);transition:transform .25s,box-shadow .25s,background .25s;cursor:default;}
        .hp-feat:hover{transform:translateY(-6px);box-shadow:0 20px 50px rgba(0,0,0,.35);background:rgba(255,255,255,.13);border-color:rgba(255,255,255,.22);}
        .hp-feat-ico{width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;margin-bottom:18px;transition:transform .2s;}
        .hp-feat:hover .hp-feat-ico{transform:scale(1.1) rotate(-5deg);}
        .hp-feat-title{font-size:15px;font-weight:700;color:#fff;margin-bottom:8px;}
        .hp-feat-desc{font-size:13px;color:rgba(255,255,255,.65);line-height:1.68;}

        /* ── WHY US ────────────────────────────────────── */
        .hp-why-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:22px;}
        .hp-why-card{background:#fff;border-radius:22px;padding:32px;border:1px solid #f0f0f0;display:flex;gap:20px;box-shadow:0 2px 12px rgba(0,0,0,.04);transition:transform .25s,box-shadow .25s;}
        .hp-why-card:hover{transform:translateY(-4px);box-shadow:0 14px 40px rgba(0,0,0,.09);}
        .hp-why-num{font-size:40px;font-weight:900;line-height:1;flex-shrink:0;margin-top:2px;}
        .hp-why-title{font-size:16px;font-weight:700;color:#1e1b4b;margin-bottom:8px;}
        .hp-why-desc{font-size:13.5px;color:#6b7280;line-height:1.7;}

        /* ── CAMPUS ────────────────────────────────────── */
        .hp-campus-grid{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;}
        .hp-mosaic{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:210px 210px;gap:10px;border-radius:24px;overflow:hidden;}
        .hp-mosaic img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease;}
        .hp-mosaic img:hover{transform:scale(1.05);}
        .hp-check-list{list-style:none;margin-top:20px;}
        .hp-check-item{display:flex;align-items:center;gap:10px;margin-bottom:14px;font-size:14px;color:#374151;font-weight:500;}
        .hp-check-dot{width:24px;height:24px;border-radius:50%;background:#eef2ff;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .2s;}
        .hp-check-item:hover .hp-check-dot{background:#c7d2fe;}

        /* ── PROGRAMS ──────────────────────────────────── */
        .hp-prog-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
        .hp-prog{border-radius:20px;padding:22px;border:1.5px solid #f0f0f0;display:flex;align-items:center;gap:14px;transition:all .25s;cursor:default;position:relative;overflow:hidden;}
        .hp-prog::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,var(--pc),transparent);opacity:0;transition:opacity .25s;}
        .hp-prog:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(99,102,241,.12);border-color:transparent;}
        .hp-prog:hover::before{opacity:.06;}
        .hp-prog-emoji{font-size:30px;flex-shrink:0;transition:transform .2s;}
        .hp-prog:hover .hp-prog-emoji{transform:scale(1.2) rotate(-5deg);}
        .hp-prog-badge{font-size:10px;font-weight:700;letter-spacing:1px;margin-bottom:3px;}
        .hp-prog-name{font-size:14px;font-weight:700;color:#1e1b4b;margin-bottom:3px;}
        .hp-prog-meta{font-size:11px;color:#9ca3af;display:flex;gap:6px;}

        /* ── AGENDA ────────────────────────────────────── */
        .hp-agenda-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;}
        .hp-agenda-item{background:#fff;border-radius:20px;padding:22px 26px;border:1px solid #f0f0f0;display:flex;align-items:center;gap:20px;box-shadow:0 2px 8px rgba(0,0,0,.04);transition:transform .2s,box-shadow .2s;}
        .hp-agenda-item:hover{transform:translateY(-3px);box-shadow:0 12px 30px rgba(0,0,0,.08);}
        .hp-agenda-date{text-align:center;min-width:52px;}
        .hp-agenda-day{font-size:26px;font-weight:800;color:#1e1b4b;line-height:1;}
        .hp-agenda-mon{font-size:11px;color:#9ca3af;font-weight:600;letter-spacing:.5px;}
        .hp-agenda-sep{width:1px;height:44px;background:#f0f0f0;flex-shrink:0;}
        .hp-agenda-badge{display:inline-block;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:600;margin-bottom:5px;}
        .hp-agenda-title{font-size:14px;font-weight:600;color:#1e1b4b;}

        /* ── TESTIMONIALS ──────────────────────────────── */
        .hp-testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
        .hp-testi{background:#fff;border-radius:24px;padding:30px;box-shadow:0 4px 24px rgba(99,102,241,.07);border:1px solid rgba(99,102,241,.06);transition:transform .25s,box-shadow .25s;}
        .hp-testi:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(99,102,241,.12);}
        .hp-testi-quote{font-size:48px;font-weight:900;line-height:1;margin-bottom:8px;background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .hp-testi-text{font-size:14px;color:#4b5563;line-height:1.78;margin-bottom:22px;}
        .hp-testi-author{display:flex;align-items:center;gap:12px;}
        .hp-testi-author img{width:46px;height:46px;border-radius:50%;object-fit:cover;border:2.5px solid #eef2ff;flex-shrink:0;}
        .hp-testi-name{font-weight:700;font-size:14px;color:#1e1b4b;}
        .hp-testi-role{font-size:12px;color:#9ca3af;margin-top:2px;}

        /* ── PARTNERS MARQUEE ──────────────────────────── */
        .hp-marquee-wrap{overflow:hidden;width:100%;padding:8px 0;}
        .hp-marquee-track{display:flex;width:max-content;gap:16px;animation:marquee 22s linear infinite;}
        .hp-marquee-track:hover{animation-play-state:paused;}
        .hp-partner{padding:14px 32px;background:#fff;border:1.5px solid #f0f0f0;border-radius:16px;font-size:14px;font-weight:700;color:#9ca3af;letter-spacing:.5px;white-space:nowrap;transition:all .2s;cursor:default;flex-shrink:0;}
        .hp-partner:hover{border-color:#c7d2fe;color:#6366f1;background:#fafaff;}

        /* ── CTA ───────────────────────────────────────── */
        .hp-cta-outer{padding:88px 5%;background:rgba(240,244,255,0.80);}
        .hp-cta-box{max-width:820px;margin:0 auto;text-align:center;background:linear-gradient(135deg,#4f46e5,#6366f1 50%,#7c3aed);background-size:200% 200%;animation:gradShift 5s ease infinite;border-radius:32px;padding:72px 40px;box-shadow:0 28px 70px rgba(99,102,241,.35);position:relative;overflow:hidden;}
        .hp-cta-deco{position:absolute;border-radius:50%;pointer-events:none;}
        .hp-cta-deco-1{width:240px;height:240px;top:-80px;right:-60px;background:rgba(255,255,255,.06);}
        .hp-cta-deco-2{width:180px;height:180px;bottom:-50px;left:-30px;background:rgba(255,255,255,.04);}
        .hp-cta-btn{display:inline-flex;align-items:center;gap:10px;padding:16px 36px;border-radius:18px;text-decoration:none;background:#fff;color:#6366f1;font-weight:700;font-size:15px;font-family:inherit;box-shadow:0 10px 28px rgba(0,0,0,.15);transition:transform .18s,box-shadow .18s;}
        .hp-cta-btn:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(0,0,0,.2);}
        .hp-cta-feats{display:flex;justify-content:center;gap:28px;margin-top:28px;flex-wrap:wrap;}
        .hp-cta-feat{display:flex;align-items:center;gap:6px;font-size:13px;color:rgba(255,255,255,.85);}

        /* ── FOOTER ────────────────────────────────────── */
        .hp-footer{background:#0f172a;color:#fff;padding:72px 5% 32px;}
        .hp-footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:44px;margin-bottom:52px;}
        .hp-footer-logo{display:flex;align-items:center;gap:10px;margin-bottom:18px;}
        .hp-footer-logo-ico{width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .hp-footer-desc{font-size:13px;color:#94a3b8;line-height:1.82;max-width:260px;margin-bottom:22px;}
        .hp-footer-socials{display:flex;gap:8px;}
        .hp-footer-social{width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#94a3b8;cursor:pointer;transition:all .2s;}
        .hp-footer-social:hover{background:rgba(99,102,241,.45);color:#fff;transform:translateY(-2px);}
        .hp-footer-col-title{font-weight:700;font-size:13px;color:#fff;margin-bottom:18px;}
        .hp-footer-link{display:block;font-size:13px;color:#64748b;margin-bottom:11px;text-decoration:none;transition:color .2s,padding-left .2s;}
        .hp-footer-link:hover{color:#a5b4fc;padding-left:4px;}
        .hp-footer-contact{display:flex;align-items:center;gap:10px;font-size:13px;color:#64748b;margin-bottom:13px;}
        .hp-footer-contact svg{color:#6366f1;flex-shrink:0;}
        .hp-footer-bottom{border-top:1px solid rgba(255,255,255,.06);padding-top:26px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;font-size:12px;color:#475569;}
        .hp-footer-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(99,102,241,.15);border:1px solid rgba(99,102,241,.2);border-radius:100px;padding:4px 13px;font-size:11px;color:#a5b4fc;font-weight:600;}

        /* ══ RESPONSIVE ════════════════════════════════════════ */
        @media(max-width:900px){
          .hp-sec-feat-bg{background-attachment:scroll;}
          .hp-nav-links{display:none;}
          .hp-menu-btn{display:flex;}
          .hp-hero-inner{grid-template-columns:1fr;gap:36px;}
          .hp-float{display:none;}
          .hp-scroll-ind{display:none;}
          .hp-stats-inner{grid-template-columns:1fr 1fr;gap:16px;}
          .hp-stat:nth-child(2){border-right:1px solid rgba(255,255,255,.12);}
          .hp-stat:nth-child(3){border-right:none;}
          .hp-feat-grid{grid-template-columns:1fr 1fr;}
          .hp-why-grid{grid-template-columns:1fr;}
          .hp-campus-grid{grid-template-columns:1fr;}
          .hp-prog-grid{grid-template-columns:1fr 1fr;}
          .hp-agenda-grid{grid-template-columns:1fr;}
          .hp-testi-grid{grid-template-columns:1fr;}
          .hp-footer-grid{grid-template-columns:1fr 1fr;gap:28px;}
        }
        @media(max-width:560px){
          .hp-hero{padding:88px 5% 56px;}
          .hp-btn-s{display:none;}
          .hp-feat-grid{grid-template-columns:1fr;}
          .hp-prog-grid{grid-template-columns:1fr;}
          .hp-mosaic{grid-template-columns:1fr 1fr;grid-template-rows:160px;height:160px;}
          .hp-mosaic img:nth-child(1){grid-row:unset!important;}
          .hp-mosaic img:nth-child(3),.hp-mosaic img:nth-child(4){display:none;}
          .hp-stats-inner{grid-template-columns:1fr 1fr;}
          .hp-stat{border-right:none!important;}
          .hp-footer-grid{grid-template-columns:1fr;}
          .hp-cta-box{padding:48px 20px;}
          .hp-sec{padding:68px 5%;}
          .hp-why-card{flex-direction:column;gap:10px;}
          .hp-why-num{font-size:30px;}
          .hp-cta-feats{gap:14px;}
        }
      `}</style>

      {/* ══ NAVBAR ═══════════════════════════════════════════════ */}
      <nav className={`hp-nav${scrolled ? ' scrolled' : ''}`}>
        <Link to="/" className="hp-logo">
          <div className="hp-logo-icon"><GraduationCap size={22} color="#fff"/></div>
          <div>
            <div className="hp-logo-main">ACAN</div>
            <div className="hp-logo-sub">UNIVERSITÉ</div>
          </div>
        </Link>

        <div className="hp-nav-links">
          {[['Accueil','#accueil'],['Filières','#filieres'],['Plateforme','#plateforme'],['Contact','#contact']].map(([label,href]) => (
            <a key={label} href={href}>{label}</a>
          ))}
        </div>

        <div style={{ display:'flex',gap:10,alignItems:'center' }}>
          <Link to="/login" className="hp-nav-cta">Se connecter <ChevronRight size={14}/></Link>
          <button className="hp-menu-btn" onClick={() => setMenuOpen(o => !o)} aria-label="menu">
            {menuOpen ? <X size={18}/> : <Menu size={18}/>}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`hp-mob-menu${menuOpen ? ' open' : ''}`}>
        {[['Accueil','#accueil'],['Filières','#filieres'],['Plateforme','#plateforme'],['Contact','#contact']].map(([label,href]) => (
          <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
        ))}
        <Link to="/login" className="hp-mob-cta" onClick={() => setMenuOpen(false)}>Se connecter</Link>
      </div>

      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <section id="accueil" className="hp-hero">
        {/* Animated blobs */}
        <div className="hp-blob hp-blob-1"/>
        <div className="hp-blob hp-blob-2"/>
        <div className="hp-blob hp-blob-3"/>

        <div className="hp-hero-inner">
          {/* Left: text */}
          <div className="hp-hero-text">
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
              <a href="#filieres" className="hp-btn-s">Voir les filières <ChevronRight size={14}/></a>
            </div>
            <div className="hp-social-proof">
              <div className="hp-av-stack">
                {AVATARS.map((src,i) => <img key={i} src={src} alt=""/>)}
              </div>
              <div>
                <div className="hp-stars">{[1,2,3,4,5].map(i => <Star key={i} size={12} fill="#f59e0b" color="#f59e0b"/>)}</div>
                <div className="hp-sp-text">+2 400 étudiants nous font confiance</div>
              </div>
            </div>
          </div>

          {/* Right: image */}
          <div className="hp-hero-img-wrap">
            <div style={{ position:'relative' }}>
              <div className="hp-hero-ring"/>
              <div className="hp-hero-photo">
                <img
                  src="https://omedevservicefrontend.onrender.com/assets/os5-zDql6FmJ.jpeg"
                  alt="Étudiants Université ACAN"
                />
              </div>
              {/* Floating badge 1 */}
              <div className="hp-float hp-float-1">
                <div className="hp-float-ico" style={{ background:'#eef2ff' }}><Award size={18} color="#6366f1"/></div>
                <div><div className="hp-float-val">96%</div><div className="hp-float-lbl">Taux de réussite</div></div>
              </div>
              {/* Floating badge 2 */}
              <div className="hp-float hp-float-2">
                <div className="hp-float-ico" style={{ background:'#ecfdf5' }}><Users size={18} color="#10b981"/></div>
                <div><div className="hp-float-val">2 400+</div><div className="hp-float-lbl">Étudiants actifs</div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hp-scroll-ind">
          <div className="hp-scroll-dot"/>
          <div className="hp-scroll-dot"/>
          <div className="hp-scroll-dot"/>
        </div>
      </section>

      {/* ══ STATS ═════════════════════════════════════════════════ */}
      <section className="hp-stats">
        <div className="hp-stats-inner" ref={statsRef}>
          {STATS.map((s,i) => (
            <StatItem key={i} {...s} active={statsVisible} delay={`${i * 0.12}s`}/>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════ */}
      <section id="plateforme" className="hp-sec-feat">
        <div className="hp-sec-feat-bg"/>
        <div className="hp-sec-feat-overlay"/>
        <div className="hp-sec-feat-content">
          <div className="hp-center hp-rv" style={{ marginBottom:60 }}>
            <div className="hp-chip" style={{ background:'rgba(99,102,241,.25)',color:'#a5b4fc',border:'1px solid rgba(99,102,241,.3)' }}>Notre plateforme</div>
            <h2 className="hp-h2" style={{ color:'#fff' }}>Tout ce dont vous avez besoin</h2>
            <p className="hp-subtext" style={{ color:'rgba(255,255,255,.65)' }}>Une suite complète d'outils pensés pour simplifier la vie des étudiants, enseignants et administrateurs.</p>
          </div>
          <div className="hp-feat-grid">
            {FEATURES.map((f,i) => (
              <div key={i} className="hp-feat hp-rv" style={{ transitionDelay:`${i*0.08}s` }}>
                <div className="hp-feat-ico" style={{ background:f.bg,color:f.color }}>{f.icon}</div>
                <div className="hp-feat-title">{f.title}</div>
                <div className="hp-feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ POURQUOI NOUS ═════════════════════════════════════════ */}
      <section className="hp-sec">
        <div className="hp-inner">
          <div className="hp-center hp-rv">
            <div className="hp-chip" style={{ background:'#fef9c3',color:'#854d0e' }}>Nos atouts</div>
            <h2 className="hp-h2">Pourquoi choisir l'Université ACAN ?</h2>
            <p className="hp-subtext">Nous nous engageons à fournir une éducation de qualité qui prépare nos étudiants aux défis du monde professionnel.</p>
          </div>
          <div className="hp-why-grid">
            {WHY_US.map((w,i) => (
              <div key={i} className={`hp-why-card ${i%2===0 ? 'hp-rv-l' : 'hp-rv-r'}`} style={{ transitionDelay:`${i*0.1}s` }}>
                <div className="hp-why-num" style={{ color:w.color+'1a',WebkitTextStroke:`2px ${w.color}` }}>{w.num}</div>
                <div>
                  <div className="hp-why-title">{w.title}</div>
                  <div className="hp-why-desc">{w.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CAMPUS ════════════════════════════════════════════════ */}
      <section className="hp-sec hp-sec-g">
        <div className="hp-inner">
          <div className="hp-campus-grid">
            <div className="hp-mosaic hp-rv-l">
              <img
                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80"
                alt="Étudiants" style={{ gridRow:'span 2' }}
              />
              <img src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80" alt="Salle de cours"/>
              <img src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80" alt="Bibliothèque"/>
            </div>
            <div className="hp-rv-r">
              <div className="hp-chip" style={{ background:'#ecfdf5',color:'#15803d' }}>Vie sur le campus</div>
              <h2 className="hp-h2" style={{ textAlign:'left' }}>Un cadre d'apprentissage moderne et stimulant</h2>
              <p style={{ fontSize:14,color:'#6b7280',lineHeight:1.82,marginBottom:10 }}>
                Notre campus offre un environnement propice à l'épanouissement académique et personnel de chaque étudiant, doté d'infrastructures de pointe.
              </p>
              <ul className="hp-check-list">
                {[
                  'Salles équipées de vidéoprojecteurs et tableaux numériques',
                  'Connexion Wi-Fi haut débit sur tout le campus',
                  'Bibliothèque physique et numérique avec +5 000 ouvrages',
                  'Laboratoires informatiques ouverts 7 jours/7',
                  'Espaces de co-working et salles de travail en groupe',
                ].map((item,i) => (
                  <li key={i} className="hp-check-item">
                    <div className="hp-check-dot">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="#6366f1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
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

      {/* ══ FILIÈRES ══════════════════════════════════════════════ */}
      <section id="filieres" className="hp-sec">
        <div className="hp-inner">
          <div className="hp-center hp-rv">
            <div className="hp-chip" style={{ background:'#f5f3ff',color:'#7c3aed' }}>Nos formations</div>
            <h2 className="hp-h2">Filières disponibles</h2>
            <p className="hp-subtext">Des formations reconnues, adaptées aux besoins du marché de l'emploi congolais et international.</p>
          </div>
          <div className="hp-prog-grid">
            {PROGRAMS.map((p,i) => (
              <div key={i} className="hp-prog hp-rv-s" style={{ background:p.bg,transitionDelay:`${i*0.07}s`,'--pc':p.color }}>
                <div className="hp-prog-emoji">{p.icon}</div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div className="hp-prog-badge" style={{ color:p.color }}>L1 — L3 · 3 ans</div>
                  <div className="hp-prog-name">{p.name}</div>
                  <div className="hp-prog-meta">
                    <span>{p.students} étudiants</span>
                  </div>
                </div>
                <ChevronRight size={15} color={p.color} style={{ opacity:.5,flexShrink:0 }}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ AGENDA ════════════════════════════════════════════════ */}
      <section className="hp-sec hp-sec-g">
        <div className="hp-inner">
          <div className="hp-center hp-rv">
            <div className="hp-chip" style={{ background:'#ffe4e6',color:'#9f1239' }}>Calendrier</div>
            <h2 className="hp-h2">Agenda académique 2025–2026</h2>
            <p className="hp-subtext">Les dates importantes à ne pas manquer pour cette année académique.</p>
          </div>
          <div className="hp-agenda-grid">
            {AGENDA.map((a,i) => (
              <div key={i} className="hp-agenda-item hp-rv" style={{ transitionDelay:`${i*0.1}s` }}>
                <div className="hp-agenda-date">
                  <div className="hp-agenda-day">{a.day}</div>
                  <div className="hp-agenda-mon">{a.mon}</div>
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

      {/* ══ TÉMOIGNAGES ═══════════════════════════════════════════ */}
      <section className="hp-sec hp-sec-pu">
        <div className="hp-inner">
          <div className="hp-center hp-rv">
            <div className="hp-chip" style={{ background:'#fffbeb',color:'#b45309' }}>Témoignages</div>
            <h2 className="hp-h2">Ce que disent nos étudiants</h2>
          </div>
          <div className="hp-testi-grid">
            {TESTIMONIALS.map((t,i) => (
              <div key={i} className="hp-testi hp-rv" style={{ transitionDelay:`${i*0.12}s` }}>
                <div className="hp-testi-quote">"</div>
                <div className="hp-stars" style={{ marginBottom:14 }}>
                  {[1,2,3,4,5].map(j => <Star key={j} size={13} fill="#f59e0b" color="#f59e0b"/>)}
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

      {/* ══ PARTENAIRES — marquee ══════════════════════════════════ */}
      <section className="hp-sec">
        <div className="hp-inner">
          <div className="hp-center hp-rv" style={{ marginBottom:36 }}>
            <div className="hp-chip" style={{ background:'#f0f9ff',color:'#0369a1' }}>Partenaires</div>
            <h2 className="hp-h2">Nos partenaires technologiques</h2>
            <p className="hp-subtext">Nous collaborons avec les leaders mondiaux de la technologie pour enrichir votre formation.</p>
          </div>
          <div className="hp-marquee-wrap hp-rv">
            <div className="hp-marquee-track">
              {/* Duplicate for seamless loop */}
              {[...PARTNERS, ...PARTNERS].map((p,i) => (
                <div key={i} className="hp-partner">{p}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════════ */}
      <div className="hp-cta-outer">
        <div className="hp-cta-box hp-rv-s">
          <div className="hp-cta-deco hp-cta-deco-1"/>
          <div className="hp-cta-deco hp-cta-deco-2"/>
          <div style={{ position:'relative',zIndex:1 }}>
            <div style={{ fontSize:52,marginBottom:16,lineHeight:1 }}>🎓</div>
            <h2 style={{ fontSize:'clamp(1.5rem,3vw,2.1rem)',fontWeight:800,color:'#fff',marginBottom:14 }}>
              Prêt à rejoindre l'Université ACAN ?
            </h2>
            <p style={{ fontSize:15,color:'rgba(255,255,255,.82)',lineHeight:1.74,margin:'0 auto 34px',maxWidth:460 }}>
              Connectez-vous pour accéder à vos cours, notes, emploi du temps et bien plus encore.
            </p>
            <Link to="/login" className="hp-cta-btn">
              <GraduationCap size={20}/> Accéder à mon espace
            </Link>
            <div className="hp-cta-feats">
              {['Accès immédiat','Gratuit pour les étudiants','Support 24/7'].map((f,i) => (
                <div key={i} className="hp-cta-feat">
                  <CheckCircle size={14} color="#86efac"/>{f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ FOOTER ════════════════════════════════════════════════ */}
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
              {[['Accueil','#accueil'],['Filières','#filieres'],['Plateforme','#plateforme'],['Contact','#contact']].map(([label,href]) => (
                <a key={label} href={href} className="hp-footer-link">{label}</a>
              ))}
            </div>
            <div>
              <div className="hp-footer-col-title">Formations</div>
              {['Informatique','Génie Logiciel','Réseaux','Gestion','Comptabilité','Droit'].map(item => (
                <div key={item} className="hp-footer-link" style={{ cursor:'default' }}>{item}</div>
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
                <div key={i} className="hp-footer-contact">{c.icon}{c.text}</div>
              ))}
            </div>
          </div>
          <div className="hp-footer-bottom">
            <span>© 2024–2025 Université ACAN. Tous droits réservés.</span>
            <div style={{ display:'flex',gap:14,alignItems:'center' }}>
              <span className="hp-footer-badge"><Zap size={11}/>Propulsé par Omedev</span>
              <span>Conçu avec ❤️ à Brazzaville</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
