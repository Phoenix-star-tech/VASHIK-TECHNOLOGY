/* ============================================
   DEEP — Premium Interactivity Engine
   ============================================
   Systems:
   1. Performance detection & reduced-motion
   2. Custom trailing cursor
   3. Three.js wireframe hero
   4. GSAP scroll animations + cinematic transitions
   5. Card tilt micro-interactions
   6. Parallax depth layers
   7. Scroll-speed awareness
   ============================================ */

(function () {
    'use strict';

    /* =========================================
       CONFIGURATION
       ========================================= */
    const CONFIG = {
        isMobile: false,
        isLowEnd: false,
        prefersReducedMotion: false,
        supportsHover: true,
        cursorLag: 0.15,
        cursorRingLag: 0.08,
        threeEnabled: true,
    };

    /* =========================================
       PERFORMANCE DETECTION
       ========================================= */
    function detectCapabilities() {
        CONFIG.isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry/i.test(navigator.userAgent)
            || window.matchMedia('(hover: none) and (pointer: coarse)').matches;
        CONFIG.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        CONFIG.supportsHover = window.matchMedia('(hover: hover)').matches;
        const cores = navigator.hardwareConcurrency || 4;
        const memory = navigator.deviceMemory || 8;
        CONFIG.isLowEnd = cores < 4 || memory < 4;
        CONFIG.threeEnabled = !CONFIG.isLowEnd && !CONFIG.prefersReducedMotion;
    }

    /* =========================================
       GLOBAL STATE
       ========================================= */
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const cursorPos = { x: mouse.x, y: mouse.y };
    const ringPos = { x: mouse.x, y: mouse.y };

    /* =========================================
       INIT
       ========================================= */
    document.addEventListener('DOMContentLoaded', () => {
        detectCapabilities();

        if (CONFIG.prefersReducedMotion) {
            initNavigation();
            initSmoothScroll();
            initEmailLink();
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        initNavigation();
        initCursor();
        initHeroEntrance();
        initScrollAnimations();
        initCinematicSections();
        initParallaxLayers();
        initCardTilt();
        initFoundersSlider();
        initSmoothScroll();
        initEmailLink();

        if (CONFIG.threeEnabled && typeof THREE !== 'undefined') {
            initThreeHero();
        }

        startRenderLoop();
    });


    /* =========================================
       1. CUSTOM TRAILING CURSOR
       ========================================= */
    function initCursor() {
        if (CONFIG.isMobile || !CONFIG.supportsHover) return;
        const cursor = document.getElementById('cursor');
        document.body.style.cursor = 'none';

        document.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        }, { passive: true });

        document.querySelectorAll('[data-cursor]').forEach(el => {
            const type = el.getAttribute('data-cursor');
            el.addEventListener('mouseenter', () => { cursor.className = `cursor cursor--${type}`; });
            el.addEventListener('mouseleave', () => { cursor.className = 'cursor'; });
        });

        document.addEventListener('mouseleave', () => cursor.classList.add('cursor--hidden'));
        document.addEventListener('mouseenter', () => cursor.classList.remove('cursor--hidden'));

        cursor._dot = cursor.querySelector('.cursor__dot');
        cursor._ring = cursor.querySelector('.cursor__ring');
    }

    function updateCursor() {
        if (CONFIG.isMobile || !CONFIG.supportsHover) return;
        const cursor = document.getElementById('cursor');
        if (!cursor || !cursor._dot) return;

        cursorPos.x += (mouse.x - cursorPos.x) * CONFIG.cursorLag;
        cursorPos.y += (mouse.y - cursorPos.y) * CONFIG.cursorLag;
        ringPos.x += (mouse.x - ringPos.x) * CONFIG.cursorRingLag;
        ringPos.y += (mouse.y - ringPos.y) * CONFIG.cursorRingLag;

        cursor._dot.style.transform = `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0) translate(-50%, -50%)`;
        cursor._ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;
    }


    /* =========================================
       2. THREE.JS WIREFRAME HERO
       ========================================= */
    function initThreeHero() {
        const container = document.getElementById('hero-canvas');
        if (!container) return;

        // Scale everything down on mobile so the globe fits the smaller viewport
        const s = CONFIG.isMobile ? 0.55 : 1;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
        camera.position.z = CONFIG.isMobile ? 6 : 5;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !CONFIG.isMobile, powerPreference: 'low-power' });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.isMobile ? 1 : 1.5));
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        // Wireframe geometries — scaled by s on mobile, different colors per device
        const icoColor = CONFIG.isMobile ? 0x94a3b8 : 0xcbd5e1;
        const icoOpacity = CONFIG.isMobile ? 0.18 : 0.25;
        const octColor = CONFIG.isMobile ? 0xaab4c8 : 0xe2e8f0;
        const octOpacity = CONFIG.isMobile ? 0.13 : 0.15;
        const ringColor = CONFIG.isMobile ? 0x94a3b8 : 0xe2e8f0;
        const ringOpacity = CONFIG.isMobile ? 0.10 : 0.10;
        const dotColor = CONFIG.isMobile ? 0x64748b : 0x94a3b8;
        const dotOpacity = CONFIG.isMobile ? 0.30 : 0.40;

        const icoGeo = new THREE.IcosahedronGeometry(1.8 * s, 1);
        const icoMat = new THREE.MeshBasicMaterial({ color: icoColor, wireframe: true, transparent: true, opacity: icoOpacity });
        const ico = new THREE.Mesh(icoGeo, icoMat);
        scene.add(ico);

        const octGeo = new THREE.OctahedronGeometry(0.9 * s, 0);
        const octMat = new THREE.MeshBasicMaterial({ color: octColor, wireframe: true, transparent: true, opacity: octOpacity });
        const oct = new THREE.Mesh(octGeo, octMat);
        scene.add(oct);

        const ringGeo = new THREE.TorusGeometry(2.5 * s, 0.01, 8, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: ringColor, transparent: true, opacity: ringOpacity });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        scene.add(ring);

        const dotsGeo = new THREE.BufferGeometry();
        dotsGeo.setAttribute('position', new THREE.Float32BufferAttribute(icoGeo.attributes.position.array.slice(), 3));
        const dots = new THREE.Points(dotsGeo, new THREE.PointsMaterial({ color: dotColor, size: 0.03 * s, transparent: true, opacity: dotOpacity }));
        scene.add(dots);

        gsap.to(container, { opacity: 1, duration: 2, delay: 0.5, ease: 'power1.out' });

        gsap.to(ico.rotation, {
            scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 3 },
            x: Math.PI * 0.3, y: Math.PI * 0.5, ease: 'none'
        });

        const mouseTarget = { x: 0, y: 0 }, mouseCurrent = { x: 0, y: 0 };
        document.addEventListener('mousemove', (e) => {
            mouseTarget.x = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseTarget.y = (e.clientY / window.innerHeight - 0.5) * 2;
        }, { passive: true });

        (function animateThree() {
            if (!CONFIG.threeEnabled) return;
            mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * 0.03;
            mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * 0.03;
            ico.rotation.x += 0.001 + mouseCurrent.y * 0.003;
            ico.rotation.y += 0.0008 + mouseCurrent.x * 0.003;
            oct.rotation.x = -ico.rotation.x * 0.6;
            oct.rotation.y = -ico.rotation.y * 0.8;
            ring.rotation.x = Math.PI / 2 + Math.sin(Date.now() * 0.0003) * 0.1;
            ring.rotation.z += 0.0003;
            dots.rotation.copy(ico.rotation);
            renderer.render(scene, camera);
            requestAnimationFrame(animateThree);
        })();

        window.addEventListener('resize', () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }, { passive: true });
    }


    /* =========================================
       3. HERO ENTRANCE
       ========================================= */
    function initHeroEntrance() {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1.2 } });
        tl.to('#hero-label', { opacity: 1, y: 0, duration: 1 }, 0.4);
        tl.to('#hero-title', { opacity: 1, y: 0, duration: 1.4 }, 0.6);
        tl.to('#hero-subtitle', { opacity: 1, y: 0, duration: 1.2 }, 1.0);
        tl.to('#hero-description', { opacity: 1, y: 0, duration: 1 }, 1.3);
        tl.to('#hero-cta', { opacity: 1, y: 0, duration: 1 }, 1.6);
        tl.to('#hero-scroll', { opacity: 1, duration: 0.8 }, 2.2);

        gsap.to('#hero-title', {
            scrollTrigger: { trigger: '#hero', start: '10% top', end: '80% top', scrub: 2 },
            scale: 0.97, ease: 'none'
        });
        gsap.to('#hero-scroll', {
            scrollTrigger: { trigger: '#hero', start: '5% top', end: '15% top', scrub: true },
            opacity: 0
        });
    }


    /* =========================================
       4. CINEMATIC SECTION TRANSITIONS
       ========================================= */
    function initCinematicSections() {
        document.querySelectorAll('.section--cinematic').forEach(section => {
            gsap.to(section, {
                scrollTrigger: { trigger: section, start: 'top 90%', end: 'top 45%', scrub: 1.5 },
                opacity: 1, scale: 1, filter: 'blur(0px)', ease: 'none'
            });
        });
    }


    /* =========================================
       5. SCROLL ANIMATIONS
       ========================================= */
    function initScrollAnimations() {
        function reveal(trigger, target, opts = {}) {
            gsap.fromTo(target, { opacity: 0, y: opts.y || 16 }, {
                scrollTrigger: { trigger, start: 'top 72%', toggleActions: 'play none none none' },
                opacity: 1, y: 0, duration: opts.duration || 1, delay: opts.delay || 0, ease: 'power2.out'
            });
        }

        reveal('#about', '#about .section__label', { y: 12, duration: 0.9 });
        reveal('#about', '#about .section__title', { y: 18, duration: 1.2, delay: 0.1 });
        reveal('#about', '.about__text', { y: 20, duration: 1.1, delay: 0.2 });
        reveal('#about', '.founders', { y: 24, duration: 1.1, delay: 0.35 });

        gsap.utils.toArray('.stat').forEach((stat, i) => {
            gsap.fromTo(stat, { opacity: 0, y: 15 }, {
                scrollTrigger: { trigger: '#about', start: 'top 65%', toggleActions: 'play none none none' },
                opacity: 1, y: 0, duration: 1, delay: 0.4 + i * 0.15, ease: 'power2.out'
            });
        });

        reveal('#services', '#services .section__label', { y: 12, duration: 0.9 });
        reveal('#services', '#services .section__title', { y: 18, duration: 1.2, delay: 0.1 });
        reveal('#services', '#services .section__desc', { y: 14, duration: 1, delay: 0.15 });

        // Customer Journey
        gsap.fromTo('#journey-steps', { opacity: 0, y: 20 }, {
            scrollTrigger: { trigger: '#journey-steps', start: 'top 85%', toggleActions: 'play none none none' },
            opacity: 1, y: 0, duration: 1.1, ease: 'power2.out'
        });

        // Pricing Table
        gsap.fromTo('#packages-table', { opacity: 0, y: 24 }, {
            scrollTrigger: { trigger: '#packages-table', start: 'top 85%', toggleActions: 'play none none none' },
            opacity: 1, y: 0, duration: 1.2, delay: 0.1, ease: 'power3.out'
        });

        // Addons section
        reveal('#services-addons', '#addons-title', { y: 16, duration: 1 });
        reveal('#services-addons', '#addons-desc', { y: 14, duration: 1, delay: 0.1 });
        gsap.fromTo('#addons-grid', { opacity: 0, y: 20 }, {
            scrollTrigger: { trigger: '#addons-grid', start: 'top 85%', toggleActions: 'play none none none' },
            opacity: 1, y: 0, duration: 1.1, delay: 0.15, ease: 'power2.out'
        });

        // Free Support banner
        gsap.fromTo('.free-support__card', { opacity: 0, y: 20, scale: 0.98 }, {
            scrollTrigger: { trigger: '#free-support', start: 'top 82%', toggleActions: 'play none none none' },
            opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out'
        });

        // Support Plans
        reveal('#support-plans', '#support-plans-title', { y: 16, duration: 1 });
        reveal('#support-plans', '#support-plans-desc', { y: 14, duration: 1, delay: 0.1 });

        gsap.utils.toArray('.support-card').forEach((card, i) => {
            gsap.fromTo(card, { opacity: 0, y: 24 }, {
                scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
                opacity: 1, y: 0, duration: 1.1, delay: i * 0.12, ease: 'power3.out'
            });
        });

        // Projects
        reveal('#services-projects', '#projects-title', { y: 16, duration: 1 });
        reveal('#services-projects', '#projects-desc', { y: 14, duration: 1, delay: 0.1 });

        gsap.utils.toArray('.project-card').forEach((card, i) => {
            gsap.fromTo(card, { opacity: 0, y: 30, scale: 0.98 }, {
                scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
                opacity: 1, y: 0, scale: 1, duration: 1.1, delay: (i % 2) * 0.12, ease: 'power3.out'
            });
        });

        reveal('#experience', '#exp-label', { y: 12, duration: 0.9 });
        reveal('#experience', '#exp-title', { y: 18, duration: 1.2, delay: 0.1 });

        gsap.utils.toArray('.pillar').forEach((pillar, i) => {
            gsap.fromTo(pillar, { opacity: 0, x: -20 }, {
                scrollTrigger: {
                    trigger: pillar, start: 'top 82%', toggleActions: 'play none none none',
                    onEnter: () => pillar.classList.add('is-active')
                },
                opacity: 1, x: 0, duration: 1.2, delay: i * 0.2, ease: 'power3.out'
            });
        });

        reveal('#contact', '#contact .section__label', { y: 12, duration: 0.9 });
        reveal('#contact', '#contact .section__title', { y: 18, duration: 1.2, delay: 0.1 });
        reveal('#contact', '#contact .section__desc', { y: 14, duration: 1, delay: 0.2 });
        reveal('#contact', '.contact__actions', { y: 16, duration: 1, delay: 0.3 });
    }


    /* =========================================
       6. PARALLAX DEPTH LAYERS
       ========================================= */
    function initParallaxLayers() {
        if (!CONFIG.isMobile) {
            const layers = document.querySelectorAll('.parallax-layer');
            document.addEventListener('mousemove', (e) => {
                const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
                const mx = (e.clientX - cx) / cx, my = (e.clientY - cy) / cy;
                layers.forEach(layer => {
                    const d = parseFloat(layer.getAttribute('data-depth')) || 0.1;
                    gsap.to(layer, { x: mx * d * 30, y: my * d * 20, duration: 1.2, ease: 'power2.out', overwrite: 'auto' });
                });
            }, { passive: true });
        }

        [{ el: '#px-shape-1', y: -40 }, { el: '#px-shape-2', y: -60 },
        { el: '#px-shape-3', y: -30 }, { el: '#px-shape-4', y: -50 }].forEach(s => {
            const el = document.querySelector(s.el);
            if (el) gsap.to(el, { scrollTrigger: { trigger: '#experience', start: 'top bottom', end: 'bottom top', scrub: 3 }, y: s.y, ease: 'none' });
        });

        gsap.to('#marquee-track', {
            scrollTrigger: { trigger: '#marquee', start: 'top bottom', end: 'bottom top', scrub: 3 },
            x: -80, ease: 'none'
        });
    }


    /* =========================================
       8. FOUNDERS SLIDER
       ========================================= */
    function initFoundersSlider() {
        const cards = document.querySelectorAll('.founder-card');
        const dots = document.querySelectorAll('.founders__dot');
        const wrap = document.getElementById('founders');
        if (!cards.length) return;

        let current = 0;
        let timer = null;
        const INTERVAL = 4000;

        function goTo(index) {
            cards[current].classList.remove('is-active');
            dots[current].classList.remove('is-active');
            current = (index + cards.length) % cards.length;
            cards[current].classList.add('is-active');
            dots[current].classList.add('is-active');
        }

        function start() {
            if (timer) clearInterval(timer);
            timer = setInterval(() => goTo(current + 1), INTERVAL);
        }

        // Init first card
        cards[0].classList.add('is-active');

        // Dot clicks
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                goTo(parseInt(dot.getAttribute('data-index'), 10));
                start(); // reset timer on manual nav
            });
        });

        // Pause on hover
        if (wrap) {
            wrap.addEventListener('mouseenter', () => { if (timer) clearInterval(timer); });
            wrap.addEventListener('mouseleave', () => start());
        }

        start();
    }


    /* =========================================
       CARD TILT
       ========================================= */
    function initCardTilt() {
        if (CONFIG.isMobile || !CONFIG.supportsHover) return;

        document.querySelectorAll('[data-tilt]').forEach(card => {
            const shine = document.createElement('div');
            shine.classList.add('card__shine');
            card.appendChild(shine);
            let raf = null, hovering = false;

            card.addEventListener('mouseenter', () => { hovering = true; });
            card.addEventListener('mousemove', (e) => {
                if (!hovering) return;
                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => {
                    const r = card.getBoundingClientRect();
                    const x = e.clientX - r.left, y = e.clientY - r.top;
                    const tiltX = ((y - r.height / 2) / (r.height / 2)) * -4;
                    const tiltY = ((x - r.width / 2) / (r.width / 2)) * 4;
                    card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-3px)`;
                    card.style.boxShadow = `${-tiltY * 1.5}px ${-tiltX * 1.5 + 12}px 40px rgba(15,23,42,0.06)`;
                    card.style.setProperty('--mouse-x', (x / r.width * 100) + '%');
                    card.style.setProperty('--mouse-y', (y / r.height * 100) + '%');
                });
            });
            card.addEventListener('mouseleave', () => {
                hovering = false;
                if (raf) cancelAnimationFrame(raf);
                gsap.to(card, { rotateX: 0, rotateY: 0, y: 0, boxShadow: '0 0 0 rgba(15,23,42,0)', duration: 0.6, ease: 'power2.out', clearProps: 'transform,boxShadow' });
            });
        });
    }


    /* =========================================
       NAVIGATION
       ========================================= */
    function initNavigation() {
        const nav = document.getElementById('nav');
        const toggle = document.getElementById('nav-toggle');
        const links = document.getElementById('nav-links');

        window.addEventListener('scroll', () => {
            nav.classList.toggle('nav--scrolled', window.scrollY > 50);
        }, { passive: true });

        toggle.addEventListener('click', () => {
            toggle.classList.toggle('is-open');
            links.classList.toggle('is-open');
        });

        document.querySelectorAll('.nav__link').forEach(link => {
            link.addEventListener('click', () => {
                toggle.classList.remove('is-open');
                links.classList.remove('is-open');
            });
        });
    }


    /* =========================================
       SMOOTH ANCHOR SCROLLING
       ========================================= */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const id = anchor.getAttribute('href');
                if (id === '#') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
                const el = document.querySelector(id);
                if (el) {
                    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
                }
            });
        });
    }


    /* =========================================
       EMAIL LINK HANDLING
       ========================================= */
    function initEmailLink() {
        const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
        emailLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const email = link.getAttribute('href').replace('mailto:', '');
                
                // If desktop (not mobile), open Gmail compose in the browser directly
                if (!CONFIG.isMobile) {
                    e.preventDefault();
                    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, '_blank');
                }
                // If mobile, standard mailto: behavior will fire and open the native mail application
            });
        });
    }


    /* =========================================
       RENDER LOOP
       ========================================= */
    function startRenderLoop() {
        (function tick() {
            updateCursor();
            requestAnimationFrame(tick);
        })();
    }

})();
