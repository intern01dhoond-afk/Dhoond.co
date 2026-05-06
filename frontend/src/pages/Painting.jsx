import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import PaintingServiceList from '../components/PaintingServiceList';
import { useUI } from '../context/UIContext';

function loadScript(src) {
  return new Promise((res) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = res;
    document.head.appendChild(s);
  });
}

const PHONE = '+919102740274';

// Detect touch device to skip cursor & heavy GSAP
const isTouch = () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

export default function Painting() {
  const navigate = useNavigate();
  const location = useLocation();
  const [galleryActive, setGalleryActive] = useState('after');
  const [activeService, setActiveService] = useState('Painting');
  const [selectedService, setSelectedService] = useState(null);
  const { openComingSoon, locationLabel, locationSubtext } = useUI();

  // Sync URL Params -> Local Modal State
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sTitle = params.get('service');
    if (sTitle) {
      setSelectedService({
        title: sTitle,
        p: params.get('sub') || '',
        filter: params.get('filter') || ''
      });
    } else {
      setSelectedService(null);
    }
  }, [location.search]);

  const cleanupRef = useRef([]);

  useEffect(() => {
    const isBengaluru = locationLabel.toLowerCase().includes('bengaluru') || 
                         locationLabel.toLowerCase().includes('bangalore') ||
                         locationSubtext.toLowerCase().includes('bengaluru') ||
                         locationSubtext.toLowerCase().includes('bangalore');
    
    if (locationLabel && locationLabel !== 'Fetching location…' && locationLabel !== 'Detecting…' && !isBengaluru) {
      openComingSoon();
      navigate('/');
      return;
    }

    window.scrollTo(0, 0);
    const touch = isTouch();

    Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js'),
    ]).then(() => {
      const { gsap, ScrollTrigger } = window;
      if (!gsap) return;
      gsap.registerPlugin(ScrollTrigger);

      /* ── Scroll progress bar ── */
      const onScroll = () => {
        const p = (window.scrollY / (document.documentElement.scrollHeight - innerHeight)) * 100;
        const bar = document.getElementById('paint-progress');
        if (bar) bar.style.width = p + '%';
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      cleanupRef.current.push(() => window.removeEventListener('scroll', onScroll));

      /* ── Marquee ── */
      const mtrack = document.getElementById('paint-mtrack');
      let mpos = 0, mrafId;
      const mraf = () => {
        mpos -= 0.5;
        if (mtrack) {
          const half = mtrack.scrollWidth / 2;
          if (Math.abs(mpos) >= half) mpos = 0;
          mtrack.style.transform = `translateX(${mpos}px)`;
        }
        mrafId = requestAnimationFrame(mraf);
      };
      mrafId = requestAnimationFrame(mraf);
      cleanupRef.current.push(() => cancelAnimationFrame(mrafId));

      /* ── Respect prefers-reduced-motion ── */
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reducedMotion) {
        // Skip complex animations — just make everything visible
        document.querySelectorAll('.p-hero-badge,.p-line-inner,.p-hero-sub,.p-service-selector,.p-hero-actions,.p-hero-rating,.p-hero-media,.p-service-item,.gitem,.process-card,.p-tcard,.p-stat,#p-introText,#p-iimg1,#p-iimg2,.p-why-text,#p-ctaEl').forEach(el => {
          if (el) { el.style.opacity = '1'; el.style.transform = 'none'; }
        });
      } else {
        /* ── Hero entrance ── */
        const heroTL = gsap.timeline({ delay: .2 });
        heroTL
          .to('.p-hero-badge', { opacity: 1, y: 0, duration: .6, ease: 'power3.out' })
          .to('.p-line-inner', { y: '0%', duration: .85, ease: 'power4.out', stagger: .12 }, '-=.25')
          .to('.p-hero-sub', { opacity: 1, y: 0, duration: .65, ease: 'power3.out' }, '-=.4')
          .to('.p-service-selector', { opacity: 1, y: 0, duration: .55, ease: 'power3.out' }, '-=.35')
          .to('.p-hero-actions', { opacity: 1, y: 0, duration: .55, ease: 'power3.out' }, '-=.35')
          .to('.p-hero-rating', { opacity: 1, y: 0, duration: .45, ease: 'power3.out' }, '-=.25')
          .to('.p-hero-media', { opacity: 1, scale: 1, duration: .9, ease: 'power3.out' }, '-=.8');

        // Parallax only on desktop (performance)
        if (!touch) {
          gsap.to('#p-heroP', { y: '-20%', ease: 'none', scrollTrigger: { trigger: '.p-hero', start: 'top top', end: 'bottom top', scrub: 1.2 } });
        }
        gsap.to('#p-floatCard', { y: -14, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.5 });

        /* ── Services strip ── */
        ScrollTrigger.create({ trigger: '#p-sstrip', start: 'top 88%', onEnter: () => gsap.to('.p-service-item', { opacity: 1, y: 0, stagger: .09, duration: .7, ease: 'power3.out' }) });

        /* ── Intro ── */
        if (!touch) {
          gsap.to('#p-iimg1 .p-intro-img-inner', { y: '-12%', ease: 'none', scrollTrigger: { trigger: '#p-introSec', start: 'top bottom', end: 'bottom top', scrub: 1.5 } });
          gsap.to('#p-iimg2 .p-intro-img-inner', { y: '-7%', ease: 'none', scrollTrigger: { trigger: '#p-introSec', start: 'top bottom', end: 'bottom top', scrub: 1 } });
        }
        ScrollTrigger.create({
          trigger: '#p-introSec', start: 'top 80%',
          onEnter: () => {
            gsap.fromTo('#p-iimg1', { opacity: 0, x: -28 }, { opacity: 1, x: 0, duration: .85, ease: 'power3.out' });
            gsap.fromTo('#p-iimg2', { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: .85, delay: .1, ease: 'power3.out' });
            gsap.to('#p-introText', { opacity: 1, x: 0, duration: .85, delay: .08, ease: 'power3.out' });
          }
        });

        /* ── Counters ── */
        let counted = false;
        ScrollTrigger.create({
          trigger: '#p-statsSec', start: 'top 85%',
          onEnter: () => {
            if (counted) return; counted = true;
            gsap.to('.p-stat', { opacity: 1, y: 0, stagger: .12, duration: .65, ease: 'power3.out' });
            document.querySelectorAll('.p-cnum').forEach(el => {
              const target = +el.dataset.target;
              const obj = { val: 0 };
              gsap.to(obj, { val: target, duration: 2, ease: 'power2.out', onUpdate() { el.textContent = Math.round(obj.val).toLocaleString('en-IN'); } });
            });
          }
        });

        /* ── Process ── */
        ScrollTrigger.create({ trigger: '#p-processSec', start: 'top 80%', onEnter: () => gsap.to('.process-card', { opacity: 1, y: 0, stagger: .1, duration: .8, ease: 'power3.out' }) });

        /* ── Gallery ── */
        ScrollTrigger.create({ trigger: '#p-gallery', start: 'top 85%', onEnter: () => gsap.to('.gitem', { opacity: 1, stagger: .08, duration: .7, ease: 'power3.out' }) });

        /* ── Testimonials ── */
        ScrollTrigger.create({ trigger: '#p-testSec', start: 'top 82%', onEnter: () => gsap.to('.p-tcard', { opacity: 1, y: 0, stagger: .1, duration: .75, ease: 'power3.out' }) });

        /* ── Why ── */
        ScrollTrigger.create({
          trigger: '#p-whySec', start: 'top 80%',
          onEnter: () => {
            gsap.to('.p-why-text', { opacity: 1, y: 0, duration: .9, ease: 'power3.out' });
          }
        });

        /* ── CTA ── */
        ScrollTrigger.create({ trigger: '#p-ctaEl', start: 'top 90%', onEnter: () => gsap.to('#p-ctaEl', { opacity: 1, y: 0, duration: .9, ease: 'power3.out' }) });

        /* ── Section headings ── */
        document.querySelectorAll('.p-section-header').forEach(el => {
          ScrollTrigger.create({ trigger: el, start: 'top 92%', onEnter: () => gsap.fromTo(el, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .75, ease: 'power3.out' }) });
        });
      }

      cleanupRef.current.push(() => ScrollTrigger.getAll().forEach(t => t.kill()));
    });

    return () => {
      cleanupRef.current.forEach(fn => fn());
      cleanupRef.current = [];
    };
  }, []);

  const services = [
    { n: 'Consultation', p: 'at just ₹99' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        /* ── Reset & base ── */
        .p-page *, .p-page *::before, .p-page *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        .p-page {
          font-family: 'Inter', sans-serif;
          background: #f9fafb;
          color: #1a1a1a;
          overflow-x: hidden;
          position: relative;
        }

        /* ── Scroll progress ── */
        #paint-progress { position: fixed; top: 0; left: 0; height: 3px; background: linear-gradient(90deg, #2563eb, #facc15); z-index: 9999; width: 0; pointer-events: none; border-radius: 0 2px 2px 0; }


        /* ── HERO ── */
        .p-hero {
          min-height: 90svh;
          padding: 60px 5vw 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: url(/painting_banner.png) center / cover no-repeat;
          overflow: hidden;
          position: relative;
        }
        /* Full-width dark overlay for readability on mobile */
        .p-hero::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(160deg, rgba(15,8,4,0.88) 0%, rgba(15,8,4,0.72) 60%, rgba(15,8,4,0.5) 100%);
          z-index: 0; pointer-events: none;
        }
        .p-hero > * { position: relative; z-index: 1; }
        .p-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.1); backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.22); border-radius: 100px;
          padding: 8px 16px; font-size: 11px; font-weight: 600; color: #fff;
          margin-bottom: 20px; letter-spacing: .8px; text-transform: uppercase;
          opacity: 0; transform: translateY(14px); width: fit-content;
        }
        .p-hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #2563eb; animation: blink 1.8s ease infinite; }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:.3; } }
        .p-hero h1 {
          font-family: 'Inter', sans-serif;
          font-size: clamp(36px, 9vw, 68px);
          font-weight: 900; line-height: 1.08; letter-spacing: -1.5px;
          color: #fff; margin-bottom: 18px;
        }
        .p-hero h1 em { font-style: italic; color: #facc15; font-weight: 900; }
        .p-line-wrap { overflow: hidden; display: block; }
        .p-line-inner { display: block; transform: translateY(110%); will-change: transform; }
        .p-hero-sub {
          font-size: clamp(14px, 3.5vw, 16px); color: rgba(255,255,255,0.82);
          line-height: 1.7; max-width: 520px; margin-bottom: 28px;
          font-weight: 300; opacity: 0; transform: translateY(18px);
        }

        /* ── Service Selector ── */
        .p-service-selector {
          display: flex; gap: 10px;
          overflow-x: auto; -webkit-overflow-scrolling: touch;
          scrollbar-width: none; padding-bottom: 4px;
          margin-bottom: 28px; opacity: 0; transform: translateY(14px);
        }
        .p-service-selector::-webkit-scrollbar { display: none; }
        .p-sel-btn {
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.18);
          color: #fff; padding: 12px 20px; border-radius: 100px; font-size: 13px;
          cursor: pointer; transition: all .25s ease; backdrop-filter: blur(10px);
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          white-space: nowrap; flex-shrink: 0;
          min-height: 48px; /* touch target */
          font-family: 'DM Sans', sans-serif;
        }
        .p-sel-btn-sub { font-size: 10px; opacity: .6; letter-spacing: .5px; }
        .p-sel-btn:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.3); }
        .p-sel-btn.active { background: #facc15; border-color: #facc15; color: #111; box-shadow: 0 8px 28px rgba(250,204,21,0.45); }
        .p-sel-btn.active .p-sel-btn-sub { opacity: .9; }

        /* ── CTA Actions ── */
        .p-hero-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; opacity: 0; transform: translateY(18px); }
        .p-btn-primary {
          background: #fff; color: #1a1a1a; padding: 14px 26px; border-radius: 100px;
          font-size: 14px; font-weight: 800; text-decoration: none;
          display: inline-flex; align-items: center; gap: 8px;
          position: relative; overflow: hidden; border: none; cursor: pointer;
          transition: color .3s; min-height: 52px;
          font-family: 'Inter', sans-serif;
        }
        .p-btn-primary:hover { background: #2563eb; color: #fff; transform: translateY(-2px); box-shadow: 0 12px 24px rgba(37,99,235,0.25); }
        .p-btn-primary span, .p-btn-primary svg { position: relative; z-index: 1; }
        .p-btn-outline {
          color: #fff; padding: 14px 22px; border-radius: 100px; font-size: 14px;
          text-decoration: none; border: 1px solid rgba(255,255,255,0.35);
          transition: border-color .2s, background .2s; background: none; cursor: pointer;
          min-height: 52px; display: flex; align-items: center;
          font-family: 'Inter', sans-serif;
        }
        .p-btn-outline:hover { border-color: #fff; background: rgba(255,255,255,0.07); }
        .p-hero-rating { display: flex; align-items: center; gap: 8px; margin-top: 24px; opacity: 0; transform: translateY(14px); flex-wrap: wrap; }
        .p-stars { color: #facc15; font-size: 13px; letter-spacing: 2px; }
        .p-hero-rating-text { font-size: 13px; color: rgba(255,255,255,0.7); }

        /* Hero right — only desktop */
        .p-hero-media { display: none; opacity: 0; transform: scale(.96); will-change: transform; }
        @media (min-width: 900px) {
          .p-hero {
            padding: 100px 5vw 80px;
            display: grid; grid-template-columns: 1fr 1.1fr;
            gap: 60px; align-items: center;
          }
          .p-hero::before { background: linear-gradient(90deg, rgba(15,8,4,0.95) 0%, rgba(15,8,4,0.78) 45%, rgba(15,8,4,0.35) 100%); }
          .p-hero-media { display: flex; align-items: center; justify-content: flex-end; height: 100%; }
        }

        /* ── MARQUEE ── */
        .p-marquee-wrap { overflow: hidden; background: linear-gradient(to bottom, #1a1a1a 0%, #111827 100%); padding: 14px 0; border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.04); }
        .p-marquee-track { display: flex; white-space: nowrap; will-change: transform; }
        .p-marquee-item { display: inline-flex; align-items: center; gap: 12px; padding: 0 24px; font-size: 11px; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 2.5px; flex-shrink: 0; }
        .p-mdot { width: 4px; height: 4px; border-radius: 50%; background: #2563eb; flex-shrink: 0; }

        /* ── SERVICES STRIP ── */
        .p-services-strip { padding: 32px 5vw; background: #fff; display: flex; flex-direction: column; position: relative; z-index: 2; max-width: 720px; margin: 0 auto; }
        .p-services-strip::-webkit-scrollbar { display: none; }
        .p-service-item { flex-shrink: 0; padding: 16px; margin-bottom: 12px; border-radius: 18px; border: 1.5px solid #f1f5f9; display: flex; align-items: center; gap: 16px; opacity: 0; transform: translateY(22px); cursor: pointer; transition: all .3s ease; width: 100%; justify-content: space-between; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .p-service-item:last-child { margin-bottom: 0; }
        .p-service-item:hover { border-color: #2563eb; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(37,99,235,0.12); }
        .p-si-img { width: 88px; height: 88px; border-radius: 14px; overflow: hidden; flex-shrink: 0; }
        .p-si-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s; }
        .p-service-item:hover .p-si-img img { transform: scale(1.06); }
        .p-service-info { flex: 1; }
        .p-service-info h3 { font-size: 1.1rem; font-weight: 800; color: #111; margin-bottom: 5px; letter-spacing: -0.01em; }
        .p-service-info p { font-size: 0.88rem; color: #64748b; margin: 0; line-height: 1.5; font-weight: 400; }
        .p-si-chevron { color: #cbd5e1; transition: all 0.25s; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #f8fafc; flex-shrink: 0; }
        .p-service-item:hover .p-si-chevron { background: #2563eb; color: #fff; transform: translateX(2px); }
        @media (min-width: 900px) {
          .p-services-strip { padding: 40px 2rem; }
          .p-services-strip-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        }

        /* ── EYEBROW & SHARED ── */
        .p-eyebrow { font-size: 11px; text-transform: uppercase; letter-spacing: 2.5px; color: #2563eb; font-weight: 800; display: inline-block; margin-bottom: 12px; position: relative; }
        .p-eyebrow::after { content: ''; position: absolute; bottom: -5px; left: 0; width: 20px; height: 2px; background: #2563eb; }
        .p-section-header { text-align: center; margin-bottom: 48px; }
        .p-section-header .p-eyebrow { margin-bottom: 18px; }
        .p-section-header h2 { font-family: 'Inter', sans-serif; font-size: clamp(28px, 5vw, 46px); font-weight: 900; color: #1a1a1a; margin-bottom: 14px; line-height: 1.2; }
        .p-section-header p { color: #666; font-size: 15px; font-weight: 500; max-width: 480px; margin: 0 auto; line-height: 1.7; }
        .p-brush-line { width: 60px; height: 3px; background: linear-gradient(90deg, #2563eb, #facc15); border-radius: 2px; margin: 12px auto 16px; }

        /* ── INTRO ── */
        .p-intro { padding: 80px 5vw; background: #fff; position: relative; }
        .p-intro-inner { display: flex; flex-direction: column; gap: 50px; }
        .p-intro-imgs { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; position: relative; }
        .p-intro-img { border-radius: 20px; overflow: hidden; aspect-ratio: 3/4; position: relative; box-shadow: 0 30px 60px -12px rgba(0,0,0,0.22); transition: transform .5s; }
        .p-intro-img:hover { transform: translateY(-6px); }
        .p-intro-img:nth-child(2) { margin-top: 48px; border: 8px solid #fff; box-shadow: 0 50px 100px -20px rgba(0,0,0,0.3); }
        .p-intro-img-inner { position: absolute; width: 100%; height: 120%; top: -10%; will-change: transform; }
        .p-intro-text p { font-size: 15px; color: #666; line-height: 1.8; margin-bottom: 18px; font-weight: 300; }
        .p-intro-text h2 { font-family: 'Inter', sans-serif; font-size: clamp(26px, 4.5vw, 44px); font-weight: 900; line-height: 1.15; letter-spacing: -.8px; color: #1a1a1a; margin-bottom: 20px; }
        .p-intro-text h2 em { color: #2563eb; font-style: italic; }
        @media (min-width: 860px) {
          .p-intro { padding: 120px 5vw; }
          .p-intro-inner { flex-direction: row; gap: 80px; align-items: center; }
          .p-intro-imgs { flex: 0 0 45%; gap: 18px; }
          .p-intro-text { flex: 1; }
          .p-intro-img:nth-child(2) { margin-top: 80px; margin-left: -40%; border: 10px solid #fff; }
        }

        /* ── STATS ── */
        .p-stats { padding: 80px 5vw; background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%); display: grid; grid-template-columns: 1fr 1fr; position: relative; overflow: hidden; }
        .p-stats > :nth-child(3) { grid-column: span 2; border-top: 1px solid rgba(255,255,255,0.08); border-right: none; }
        .p-stats-glow { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, rgba(96,165,250,0.18), transparent 70%); pointer-events: none; }
        .p-stat { padding: 44px 28px; border-right: 1px solid rgba(255,255,255,0.10); text-align: center; opacity: 0; transform: translateY(22px); position: relative; will-change: transform; }
        .p-stat:nth-child(2) { border-right: none; }
        .p-stat .num { font-family: 'Inter', sans-serif; font-size: clamp(44px, 10vw, 88px); font-weight: 900; color: #fff; line-height: 1; margin-bottom: 12px; letter-spacing: -2px; }
        .p-stat .num .plus { color: #facc15; }
        .p-stat .slabel { font-size: 11px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 2px; font-weight: 600; }
        @media (min-width: 700px) {
          .p-stats { grid-template-columns: repeat(3, 1fr); }
          .p-stats > :nth-child(3) { grid-column: span 1; border-top: none; border-right: none; }
        }

        /* ── PROCESS ── */
        .p-process { padding: 80px 0; background: #fff; position: relative; overflow: hidden; }
        .p-process .p-section-header { padding: 0 5vw; }
        .p-process-grid { display: flex; gap: 20px; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; padding: 8px 5vw 24px; }
        .p-process-grid::-webkit-scrollbar { display: none; }
        .process-card {
          background: rgba(255,255,255,0.85); backdrop-filter: blur(20px);
          border-radius: 22px; padding: 36px 28px; border: 1px solid rgba(255,255,255,0.5);
          position: relative; z-index: 1; overflow: hidden;
          opacity: 0; transform: translateY(28px); will-change: transform;
          transition: all .45s cubic-bezier(.175,.885,.32,1.275);
          min-width: 260px; flex-shrink: 0; flex: 0 0 260px;
        }
        .process-card:last-child { margin-right: 5vw; }
        .process-card:hover { transform: translateY(-12px) scale(1.02); box-shadow: 0 40px 80px -16px rgba(196,130,90,0.2); }
        .process-card::before { content: attr(data-num); position: absolute; right: 16px; top: 12px; font-family: 'Inter', sans-serif; font-size: 72px; font-weight: 900; color: rgba(37,99,235,0.06); line-height: 1; }
        .p-picon { width: 58px; height: 58px; border-radius: 16px; margin-bottom: 22px; display: flex; align-items: center; justify-content: center; transition: all .35s; }
        .process-card:hover .p-picon { transform: scale(1.1) rotate(-5deg); }
        .p-picon svg { width: 26px; height: 26px; fill: none; stroke-width: 1.5; }
        .process-card h3 { font-size: 17px; font-weight: 600; color: #2B2B2B; margin-bottom: 10px; }
        .process-card p { font-size: 13px; color: #8C8679; line-height: 1.65; font-weight: 300; margin: 0; }
        @media (max-width: 768px) {
          .p-process { padding: 40px 0 !important; }
          .p-section-header { margin-bottom: 24px !important; }
          .p-process-grid { padding-top: 0 !important; }
        }
        @media (min-width: 1024px) {
          .p-process-grid { display: grid; grid-template-columns: repeat(4,1fr); overflow: visible; padding: 8px 5vw 0; }
          .process-card { min-width: unset; flex: unset; }
          .process-card:last-child { margin-right: 0; }
        }

        /* ── GALLERY ── */
        .p-gallery { padding: 80px 5vw; background: #f1f5f9; }
        .p-gallery-grid { display: grid; grid-template-columns: 1fr; gap: 14px; margin-top: 48px; }
        .gitem { border-radius: 24px; overflow: hidden; position: relative; opacity: 0; cursor: pointer; height: 280px; box-shadow: 0 4px 24px rgba(0,0,0,0.10); transition: box-shadow .4s, transform .4s; }
        .gitem:hover { transform: translateY(-4px); box-shadow: 0 20px 48px rgba(0,0,0,0.18); }
        .p-gbg { position: absolute; inset: 0; transition: transform 1.3s cubic-bezier(.16,1,.3,1), filter .5s; background-size: cover !important; background-position: center 30% !important; }
        .gitem:hover .p-gbg { transform: scale(1.08); }
        .p-goverlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 100%); transition: opacity .4s; }
        .p-glabel { position: absolute; bottom: 0; left: 0; right: 0; padding: 24px 24px 22px; background: linear-gradient(transparent, rgba(10,10,20,0.92)); transform: translateY(8px); opacity: 0; transition: all .4s cubic-bezier(.16,1,.3,1); }
        .gitem:hover .p-glabel, .gitem:focus .p-glabel { transform: translateY(0); opacity: 1; }
        .p-glabel span { color: #fff; font-size: 16px; font-weight: 700; display: block; letter-spacing: -.01em; }
        .p-glabel p { color: rgba(255,255,255,0.7); font-size: 12px; margin-top: 4px; margin-bottom: 0; display: flex; align-items: center; gap: 4px; }
        .p-g-badge { position: absolute; top: 14px; right: 14px; background: rgba(255,255,255,0.92); backdrop-filter: blur(8px); color: #1a1a1a; padding: 4px 12px; border-radius: 100px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; border: 1px solid rgba(255,255,255,0.5); }
        .p-g-loc-icon { width: 10px; height: 10px; }
        @media (min-width: 640px) {
          .p-gallery-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .gitem:nth-child(1) { grid-column: span 2; height: 360px; }
        }
        @media (min-width: 960px) {
          .p-gallery-grid { grid-template-columns: repeat(3, 1fr); grid-template-rows: 360px 300px; gap: 18px; }
          .gitem { height: auto; }
          .gitem:nth-child(1) { grid-column: span 2; }
          .gitem:nth-child(4) { grid-column: span 2; }
        }

        /* ── TESTIMONIALS ── */
        .p-testimonials { padding: 80px 5vw; background: #FAF8F4; }
        .p-tgrid { display: flex; flex-direction: column; gap: 20px; margin-top: 48px; }
        .p-tcard { background: #fff; border-radius: 22px; padding: 32px; border: 1px solid rgba(0,0,0,0.05); opacity: 0; transform: translateY(24px); transition: all .35s; }
        .p-tcard:hover { transform: translateY(-6px); box-shadow: 0 24px 48px rgba(0,0,0,0.07); }
        .p-tcard-featured { background: #2B2B2B; color: #fff; }
        .p-tcard-featured .p-ttext { color: rgba(255,255,255,0.88); font-size: 16px; }
        .p-tcard-featured .p-tname { color: #fff; }
        .p-tcard-featured .p-trole { color: rgba(255,255,255,0.5); }
        .p-tstars { color: #facc15; font-size: 15px; letter-spacing: 2px; margin-bottom: 16px; }
        .p-ttext { font-size: 14px; color: #555; line-height: 1.8; margin-bottom: 28px; font-weight: 300; font-style: italic; }
        .p-tauthor { display: flex; align-items: center; gap: 14px; }
        .p-tavatar { width: 44px; height: 44px; border-radius: 50%; overflow: hidden; background: #eee; border: 2px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.12); flex-shrink: 0; }
        .p-tname { font-size: 14px; font-weight: 600; color: #2B2B2B; }
        .p-trole { font-size: 11px; color: #8C8679; margin-top: 2px; }
        @media (min-width: 760px) {
          .p-tgrid { display: grid; grid-template-columns: 1fr 1fr; }
          .p-tcard-featured { grid-column: span 2; }
        }
        @media (min-width: 1024px) {
          .p-tgrid { grid-template-columns: 2fr 1fr 1fr; }
          .p-tcard-featured { grid-column: span 1; }
        }

        /* ── WHY ── */
        .p-why { padding: 80px 5vw; background: #fff; }
        .p-why-inner { display: flex; flex-direction: column; gap: 40px; max-width: 1100px; margin: 0 auto; text-align: center; }
        .p-why-text { opacity: 0; transform: translateY(28px); will-change: transform; }
        .p-why-text h2 { font-family: 'Inter', sans-serif; font-size: clamp(28px, 4.5vw, 44px); font-weight: 900; line-height: 1.2; color: #1a1a1a; margin-bottom: 48px; }
        .p-wlist { display: grid; grid-template-columns: 1fr; gap: 32px; text-align: left; }
        .p-witem { display: flex; flex-direction: column; gap: 14px; align-items: center; text-align: center; }
        .p-wdot { width: 44px; height: 44px; border-radius: 12px; background: rgba(196,130,90,0.1); display: flex; align-items: center; justify-content: center; transition: all .3s; }
        .p-witem:hover .p-wdot { background: #C4825A; transform: scale(1.08) rotate(6deg); }
        .p-wdot svg { width: 20px; height: 20px; stroke: #2563eb; fill: none; stroke-width: 1.5; transition: stroke .3s; }
        .p-witem:hover .p-wdot svg { stroke: #fff; }
        .p-wtext h4 { font-size: 15px; font-weight: 700; color: #2B2B2B; margin-bottom: 6px; }
        .p-wtext p { font-size: 14px; color: #777; line-height: 1.6; font-weight: 400; margin: 0; max-width: 260px; }
        
        @media (min-width: 600px) {
          .p-wlist { grid-template-columns: 1fr 1fr; }
        }
        @media (min-width: 900px) {
          .p-why { padding: 120px 5vw; }
          .p-wlist { grid-template-columns: repeat(4, 1fr); gap: 24px; }
        }

        /* ── CTA ── */
        .p-cta-wrap { padding: 0 5vw 80px; background: #fff; }
        #p-ctaEl {
          border-radius: 28px;
          background: linear-gradient(135deg, #1e3a8a 0%, #111 100%);
          padding: 52px 40px;
          display: flex; flex-direction: column; gap: 32px;
          position: relative; overflow: hidden;
          opacity: 0; transform: translateY(28px); will-change: transform;
          box-shadow: 0 40px 80px rgba(0,0,0,0.18);
        }
        #p-ctaEl h2 { font-family: 'Inter', sans-serif; font-size: clamp(28px, 5vw, 52px); font-weight: 900; line-height: 1.1; color: #fff; margin: 0; }
        #p-ctaEl h2 em { color: #facc15; font-style: italic; }
        #p-ctaEl p { font-size: 15px; color: rgba(255,255,255,0.6); margin: 0; }
        .p-cta-btns { display: flex; flex-direction: column; gap: 14px; }
        .p-btn-cta {
          background: #facc15; color: #111; padding: 16px 36px; border-radius: 100px;
          font-size: 15px; font-weight: 800; text-decoration: none;
          display: inline-flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden; border: none; cursor: pointer;
          box-shadow: 0 0 32px rgba(250,204,21,0.35);
          animation: glowPulse 2.2s infinite alternate;
          transition: transform .3s;
          min-height: 54px; font-family: 'Inter', sans-serif;
        }
        @keyframes glowPulse { from { box-shadow: 0 0 16px rgba(250,204,21,0.25); } to { box-shadow: 0 0 44px rgba(250,204,21,0.6); } }
        .p-btn-cta:hover { transform: scale(1.04) translateY(-2px); }
        .p-cta-phone { font-size: 13px; color: rgba(255,255,255,0.38); margin-top: 8px; }
        .p-cta-phone a { color: rgba(255,255,255,0.8); font-weight: 600; text-decoration: none; }
        @media (min-width: 760px) {
          #p-ctaEl { flex-direction: row; align-items: center; justify-content: space-between; padding: 64px 60px; gap: 40px; }
          .p-cta-btns { flex-direction: row; align-items: center; flex-shrink: 0; }
        }



        /* ── MOBILE STICKY CTA ── */
        .mobile-sticky-cta {
          position: fixed; bottom: 0; left: 0; right: 0;
          padding: 12px 16px;
          padding-bottom: calc(12px + env(safe-area-inset-bottom));
          background: rgba(255,255,255,0.97); backdrop-filter: blur(12px);
          border-top: 1px solid rgba(0,0,0,0.07); z-index: 1050;
          display: flex; gap: 10px;
        }
        .mobile-sticky-cta-call {
          flex: 1; background: #facc15; color: #111; padding: 15px 18px; border-radius: 14px;
          display: flex; align-items: center; justify-content: space-between;
          text-decoration: none; cursor: pointer;
          box-shadow: 0 8px 22px rgba(250,204,21,0.35);
          active-transform: scale(0.97); transition: transform .15s;
          font-family: 'Inter', sans-serif;
        }
        .mobile-sticky-cta-call:active { transform: scale(0.97); }
        .mobile-sticky-cta-call:active { transform: scale(0.97); }
        /* Show/hide */
        @media (min-width: 860px) { .mobile-sticky-cta { display: none; } }
        @media (max-width: 859px) { .p-cta-wrap { padding-bottom: calc(80px + env(safe-area-inset-bottom) + 16px); } }

        @media (max-width: 859px) { .p-wa-fab { display: none; } }

        /* ── Misc ── */
        .p-stroke-dec { position: absolute; pointer-events: none; opacity: .08; z-index: 0; }
        @media (prefers-reduced-motion: reduce) {
          .p-hero-badge, .p-line-inner, .p-hero-sub, .p-service-selector, .p-hero-actions, .p-hero-rating, .p-hero-media, .gitem, .process-card, .p-tcard, .p-stat, #p-introText, #p-iimg1, #p-iimg2, .p-why-img-wrap, .p-why-text, #p-ctaEl, .p-service-item { opacity: 1 !important; transform: none !important; }
          * { animation-duration: .01ms !important; transition-duration: .01ms !important; }
        }
      `}</style>

      <div id="paint-progress" />




      <div className="p-page">

        {/* ── HERO ── */}
        <section className="p-hero">
          <div>
            <div className="p-hero-badge">
              <span className="p-hero-badge-dot" />
              Professional Painting Services
            </div>
            <h1>
              <span className="p-line-wrap"><span className="p-line-inner">Colour Your</span></span>
              <span className="p-line-wrap"><em><span className="p-line-inner">Dream Space</span></em></span>
              <span className="p-line-wrap"><span className="p-line-inner">With Precision</span></span>
            </h1>
            <p className="p-hero-sub">Dhoond brings verified painting professionals to your doorstep — interior, exterior &amp; texture painting done right, on time.</p>

            <div className="p-service-selector">
              {services.map(s => (
                <button
                  key={s.n}
                  className={`p-sel-btn${activeService === s.n ? ' active' : ''}`}
                  onClick={() => {
                    setActiveService(s.n);
                    navigate(`?service=${encodeURIComponent(s.n)}&sub=${encodeURIComponent(s.p)}`);
                  }}
                  aria-pressed={activeService === s.n}
                >
                  {s.n}
                  <span className="p-sel-btn-sub">{s.p}</span>
                </button>
              ))}
            </div>

            <div className="p-hero-actions">
              <button onClick={() => navigate(`?service=${encodeURIComponent('Book your Consultation')}&sub=${encodeURIComponent('Talk to an expert')}`)} className="p-btn-primary">
                <span>Book a consultant</span>
              </button>
              <a href="#p-gallery" className="p-btn-outline">View Our Work</a>
            </div>
            <div className="p-hero-rating">
              <div className="p-stars">★★★★★</div>
              <span className="p-hero-rating-text">4.9/5 · <strong style={{ color: '#fff' }}>1,200+</strong> verified reviews</span>
            </div>
          </div>

          {/* Desktop only right panel */}
          <div className="p-hero-media">
            <p style={{ color: '#fff', fontFamily: "'Inter',serif", fontSize: 'clamp(28px,3.8vw,52px)', fontStyle: 'italic', fontWeight: 900, textAlign: 'right', margin: 0, textShadow: '0 8px 32px rgba(0,0,0,0.5)', lineHeight: 1.25 }}>
              "From bare walls<br />to breathtaking rooms"
            </p>
          </div>
        </section>

        {/* ── MARQUEE ── */}
        <div className="p-marquee-wrap" aria-hidden="true">
          <div className="p-marquee-track" id="paint-mtrack">
            {['Interior Painting', 'Exterior Painting', 'Commercial Painting', 'Specialty Coatings', 'Wood Finish', 'Luxury Finishes', 'Wallpaper Install', 'Stencil Art',
              'Interior Painting', 'Exterior Painting', 'Commercial Painting', 'Specialty Coatings', 'Wood Finish', 'Luxury Finishes', 'Wallpaper Install', 'Stencil Art'].map((item, i) => (
                <div key={i} className="p-marquee-item"><span className="p-mdot" />{item}</div>
              ))}
          </div>
        </div>

        {/* ── SERVICES STRIP ── */}
        <div style={{ background: '#fff', paddingTop: '12px', paddingBottom: '8px' }}>
          <div className="p-services-strip" id="p-sstrip" role="list">
            {[
              { img: '/consultation.png', title: 'Book Consultation', sub: 'Talk to an expert — ₹99', filter: 'consultation', badge: 'Popular' },
              { img: '/commercial_painting.jpg', title: 'Commercial Painting', sub: 'Offices, Schools & warehouses', filter: 'commercial', badge: null },
              { img: '/interior.jpg', title: 'Interior Painting', sub: 'Walls, ceilings & trims', filter: 'interior', badge: null },
              { img: '/exterior_painting.webp', title: 'Exterior Painting', sub: 'Weather-resistant finishes', filter: 'exterior', badge: null },
              { img: '/grill_gate.png', title: 'Specialty Coatings', sub: 'Epoxy for Grills, Gates & Doors', filter: 'coatings', badge: null },
            ].map(s => (
              <div key={s.title} className="p-service-item" role="listitem" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => {
                navigate(`?service=${encodeURIComponent(s.title)}&sub=${encodeURIComponent(s.sub)}&filter=${s.filter}`);
              }}>
                <div className="p-si-img">
                  <img src={s.img} alt={s.title} loading="lazy" />
                </div>
                <div className="p-service-info">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {s.title}
                    {s.badge && <span style={{ background: '#facc15', color: '#111', fontSize: '9px', fontWeight: 800, padding: '2px 8px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>{s.badge}</span>}
                  </h3>
                  <p>{s.sub}</p>
                </div>
                <div className="p-si-chevron">
                  <ChevronRight size={18} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── INTRO ── */}
        <section className="p-intro" id="p-introSec">
          <div className="p-intro-inner">
            <div className="p-intro-imgs">
              <div className="p-intro-img" id="p-iimg1">
                <div className="p-intro-img-inner" style={{ background: 'url(/wall2.jpg) center/cover no-repeat' }} />
              </div>
              <div className="p-intro-img" id="p-iimg2">
                <div className="p-intro-img-inner" style={{ background: 'url(/wall3.jpg) center/cover no-repeat' }} />
              </div>
            </div>
            <div className="p-intro-text" id="p-introText" style={{ opacity: 0, transform: 'translateX(28px)' }}>
              <span className="p-eyebrow">Our Story</span>
              <h2>We Make Every Wall Tell A <em>Beautiful</em> Story</h2>
              <p>At Dhoond, we believe your home deserves more than just paint — it deserves craftsmanship. Founded in Nagpur, we've grown into India's fastest-growing home services network.</p>
              <p>Every project is handled by background-checked, trained professionals using premium paints and proven techniques that last for years.</p>

            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="p-stats" id="p-statsSec" aria-label="Our numbers">
          <div className="p-stats-glow" />
          {[
            { target: 1200, label: 'Projects Completed' },
            { target: 950, label: 'Happy Clients' },
            { target: 60, label: 'Expert Painters' },
          ].map(s => (
            <div key={s.label} className="p-stat">
              <div className="num"><span className="p-cnum" data-target={s.target}>0</span><span className="plus">+</span></div>
              <div className="slabel">{s.label}</div>
            </div>
          ))}
        </section>

        {/* ── PROCESS ── */}
        <section className="p-process" id="p-processSec">
          <div className="p-section-header">
            <span className="p-eyebrow">How It Works</span>
            <h2>Painting Made Simple</h2>
            <div className="p-brush-line" />
            <p>From booking to the final coat, we handle everything.</p>
          </div>
          <div className="p-process-grid">
            {[
              { num: '01', color: 'rgba(37,99,235,0.12)', stroke: '#2563eb', icon: <><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M9 7h6M9 11h6M9 15h4" /></>, title: 'Book Online', desc: 'Choose service & pickup time in 60 seconds.' },
              { num: '02', color: 'rgba(56,189,248,0.15)', stroke: '#38bdf8', icon: <><circle cx="12" cy="8" r="5" /><path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2" /></>, title: 'Expert Visit', desc: 'Verified pro assessment, same day.' },
              { num: '03', color: 'rgba(30,58,138,0.12)', stroke: '#1e3a8a', icon: <path d="M3 6l3 1m0 0l-3 9a5 5 0 0 0 6 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5 5 0 0 0 6 0M18 7l3 9m-3-9l-6-2" />, title: 'Premium Painting', desc: 'Top-quality colours, clean application.' },
              { num: '04', color: 'rgba(250,204,21,0.12)', stroke: '#facc15', icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>, title: 'Final Walk', desc: '100% satisfaction guarantee.' },
            ].map(c => (
              <div key={c.num} className="process-card" data-num={c.num}>
                <div className="p-picon" style={{ background: c.color }}>
                  <svg viewBox="0 0 24 24" stroke={c.stroke} fill="none" strokeWidth="1.5">{c.icon}</svg>
                </div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── GALLERY ── */}
        <section id="p-gallery" className="p-gallery">
          <div className="p-section-header">
            <span className="p-eyebrow">Our Portfolio</span>
            <h2>Spaces We've Transformed</h2>
            <div className="p-brush-line" />
            <p style={{ color: '#888', fontSize: '14px', marginTop: '8px' }}>Tap any photo to explore the transformation</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
              {['Before', 'After'].map(v => (
                <button
                  key={v}
                  onClick={() => setGalleryActive(v.toLowerCase())}
                  className={`p-sel-btn${galleryActive === v.toLowerCase() ? ' active' : ''}`}
                  style={{ padding: '10px 24px', minHeight: '42px', fontSize: '13px', fontWeight: 700 }}
                  aria-pressed={galleryActive === v.toLowerCase()}
                >
                  {galleryActive === v.toLowerCase() ? '● ' : ''}{v}
                </button>
              ))}
            </div>
          </div>
          <div className="p-gallery-grid">
            {[
              { bg: 'url(/Gemini_Generated_Image_nixczynixczynixc.png)', title: 'Living Room Makeover', loc: 'Nagpur', tag: 'Luxury', price: '₹18,000' },
              { bg: galleryActive === 'before' ? 'url(/wall2.jpg)' : 'url(/images/interior.jpg)', title: 'Bedroom Retreat', loc: 'Bengaluru, HSR Layout Sector 1', tag: galleryActive === 'before' ? 'Before' : 'After', price: '₹12,000' },
              { bg: 'url(/space.jpg)', title: 'Full Home Painting', loc: 'Bengaluru, Koramangala', tag: 'Elite', price: '₹45,000' },
              { bg: 'url(/exterior_excellence.png)', title: 'Exterior Excellence', loc: 'Nagpur, Ramdaspeth', tag: 'Premium', price: '₹32,000' },
            ].map(g => (
              <div key={g.title} className="gitem" tabIndex={0} role="img" aria-label={`${g.title}, ${g.loc}`}>
                <div className="p-gbg" style={{ background: `${g.bg} center/cover no-repeat`, filter: galleryActive === 'before' ? 'grayscale(0.4) contrast(1.05)' : 'none', transition: 'filter .6s' }} />
                <div className="p-goverlay" />
                <div className="p-g-badge">{g.tag}</div>
                <div className="p-glabel">
                  <span>{g.title}</span>
                  <p>
                    <svg className="p-g-loc-icon" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2"><path d="M12 21s-8-5.5-8-11a8 8 0 1 1 16 0c0 5.5-8 11-8 11z" /><circle cx="12" cy="10" r="2" /></svg>
                    {g.loc} &nbsp;·&nbsp; {g.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="p-testimonials" id="p-testSec">
          <div className="p-section-header">
            <span className="p-eyebrow">Client Love</span>
            <h2>Loved by Thousands</h2>
            <div className="p-brush-line" />
          </div>
          <div className="p-tgrid">
            {[
              { name: 'Hemanth', role: 'HSR Layout, Bengaluru', text: 'Absolutely brilliant painting service! The team arrived on time, covered all furniture, and finished the job ahead of schedule. The walls look flawless!', featured: true },
              { name: 'Rahul Mehta', role: 'Business Owner, Bengaluru', text: 'Good experience overall. The painting team was professional and the work quality was solid. The final finish on our exterior walls is exactly what we wanted.' },
              { name: 'Sunita Kapoor', role: 'House Owner, Nagpur', text: 'Amazing transformation! The painters fixed our long-standing dampness issues and the new interior colors look stunning. Highly recommend for home painting.' },
            ].map(t => (
              <div key={t.name} className={`p-tcard${t.featured ? ' p-tcard-featured' : ''}`}>
                <div className="p-tstars">★★★★★</div>
                <p className="p-ttext">"{t.text}"</p>
                <div className="p-tauthor">
                  <div>
                    <div className="p-tname">{t.name}</div>
                    <div className="p-trole">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHY ── */}
        <section className="p-why" id="p-whySec">
          <div className="p-why-inner">
            <div className="p-why-text">
              <span className="p-eyebrow">Why Dhoond</span>
              <h2>Affordable Painting Without Compromising Quality</h2>
              <div className="p-wlist">
                {[
                  { icon: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l7.78-7.78a5.5 5.5 0 0 0 0-7.78z" />, title: 'Verified Pros', desc: 'Background-checked, trained experts.' },
                  { icon: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>, title: 'On-Time', desc: 'Scheduled visits, zero delays.' },
                  { icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, title: 'Clear Pricing', desc: 'Transparent upfront quotes.' },
                  { icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />, title: 'Post-Job Clean', desc: 'Professional cleanup included.' },
                ].map(w => (
                  <div key={w.title} className="p-witem">
                    <div className="p-wdot"><svg viewBox="0 0 24 24" strokeWidth="1.5">{w.icon}</svg></div>
                    <div className="p-wtext"><h4>{w.title}</h4><p>{w.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="p-cta-wrap">
          <div id="p-ctaEl">
            <div>
              <h2>Transform Your Home<br /><em>Today.</em></h2>
              <p>Premium service that lasts a lifetime.</p>
            </div>
            <div className="p-cta-btns">
              <a href={`tel:${PHONE}`} className="p-btn-cta">Book an Appointment ↗</a>
              <div className="p-cta-phone">Expert support: <a href={`tel:${PHONE}`}>+91 91027 40274</a></div>
            </div>
          </div>
        </section>





      </div>

      {selectedService && (
        <PaintingServiceList
          service={selectedService}
          onClose={() => navigate(location.pathname)}
        />
      )}
    </>
  );
}