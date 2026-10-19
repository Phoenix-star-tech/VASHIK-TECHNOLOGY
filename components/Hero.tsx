'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Hero() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // Entrance animation timeline
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1.2 } });
    if (labelRef.current) tl.to(labelRef.current, { opacity: 1, y: 0, duration: 1 }, 0.3);
    if (titleRef.current) tl.to(titleRef.current, { opacity: 1, y: 0, duration: 1.3 }, 0.5);
    if (subtitleRef.current) tl.to(subtitleRef.current, { opacity: 1, y: 0, duration: 1.1 }, 0.8);
    if (descRef.current) tl.to(descRef.current, { opacity: 1, y: 0, duration: 1 }, 1.0);
    if (ctaRef.current) tl.to(ctaRef.current, { opacity: 1, y: 0, duration: 1 }, 1.2);
    if (scrollRef.current) tl.to(scrollRef.current, { opacity: 1, duration: 0.8 }, 1.7);

    if (titleRef.current && heroRef.current) {
      gsap.to(titleRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: '10% top',
          end: '80% top',
          scrub: 2,
        },
        scale: 0.97,
        ease: 'none',
      });
    }

    if (scrollRef.current && heroRef.current) {
      gsap.to(scrollRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: '5% top',
          end: '15% top',
          scrub: true,
        },
        opacity: 0,
      });
    }

    // Three.js wireframe hero
    const container = canvasContainerRef.current;
    if (!container || prefersReducedMotion) return;

    // Increased globe size in phone view for enhanced visual impact
    const getScale = (width: number) => {
      if (width <= 380) return 0.52;
      if (width <= 480) return 0.56;
      if (width <= 768) return 0.62;
      return 1.0;
    };

    const getCameraZ = (width: number) => {
      if (width <= 480) return 5.2;
      if (width <= 768) return 5.2;
      return 5.0;
    };

    const isMobile = window.innerWidth <= 768;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / (container.clientHeight || 1),
      0.1,
      100
    );
    camera.position.z = getCameraZ(window.innerWidth);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'low-power',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const icoColor = isMobile ? 0x94a3b8 : 0xcbd5e1;
    const icoOpacity = isMobile ? 0.22 : 0.25;
    const octColor = isMobile ? 0xaab4c8 : 0xe2e8f0;
    const octOpacity = isMobile ? 0.16 : 0.15;
    const dotColor = isMobile ? 0x64748b : 0x94a3b8;
    const dotOpacity = isMobile ? 0.35 : 0.4;

    const icoGeo = new THREE.IcosahedronGeometry(1.8, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: icoColor,
      wireframe: true,
      transparent: true,
      opacity: icoOpacity,
    });
    const ico = new THREE.Mesh(icoGeo, icoMat);

    const octGeo = new THREE.OctahedronGeometry(0.9, 0);
    const octMat = new THREE.MeshBasicMaterial({
      color: octColor,
      wireframe: true,
      transparent: true,
      opacity: octOpacity,
    });
    const oct = new THREE.Mesh(octGeo, octMat);

    const dotsGeo = new THREE.BufferGeometry();
    dotsGeo.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(icoGeo.attributes.position.array.slice(), 3)
    );
    const dots = new THREE.Points(
      dotsGeo,
      new THREE.PointsMaterial({
        color: dotColor,
        size: 0.03,
        transparent: true,
        opacity: dotOpacity,
      })
    );

    // Globe group for unified responsive scaling and position
    const globeGroup = new THREE.Group();
    globeGroup.add(ico);
    globeGroup.add(oct);
    globeGroup.add(dots);

    const initialScale = getScale(window.innerWidth);
    globeGroup.scale.set(initialScale, initialScale, initialScale);
    if (isMobile) {
      globeGroup.position.y = 0.08;
    }
    scene.add(globeGroup);

    gsap.to(container, { opacity: 1, duration: 2, delay: 0.5, ease: 'power1.out' });

    if (heroRef.current) {
      gsap.to(ico.rotation, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 3,
        },
        x: Math.PI * 0.3,
        y: Math.PI * 0.5,
        ease: 'none',
      });
    }

    const mouseTarget = { x: 0, y: 0 };
    const mouseCurrent = { x: 0, y: 0 };

    const onMouseMove = (e: MouseEvent) => {
      mouseTarget.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseTarget.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    let reqId: number;
    const animateThree = () => {
      mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * 0.03;
      mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * 0.03;
      ico.rotation.x += 0.001 + mouseCurrent.y * 0.003;
      ico.rotation.y += 0.0008 + mouseCurrent.x * 0.003;
      oct.rotation.x = -ico.rotation.x * 0.6;
      oct.rotation.y = -ico.rotation.y * 0.8;

      dots.rotation.copy(ico.rotation);

      renderer.render(scene, camera);
      reqId = requestAnimationFrame(animateThree);
    };

    reqId = requestAnimationFrame(animateThree);

    const onResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      const newScale = getScale(window.innerWidth);
      globeGroup.scale.set(newScale, newScale, newScale);
      camera.position.z = getCameraZ(window.innerWidth);
      if (window.innerWidth <= 768) {
        globeGroup.position.y = 0.08;
      } else {
        globeGroup.position.y = 0;
      }
    };
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      octGeo.dispose();
      octMat.dispose();
      dotsGeo.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <section className="hero" id="hero" ref={heroRef}>
      <div
        className="hero__canvas"
        id="hero-canvas"
        ref={canvasContainerRef}
        aria-hidden="true"
      ></div>
      <div className="hero__container">
        <div className="hero__label" id="hero-label" ref={labelRef}>
          <span className="hero__label-dot"></span>
          Engineering the future
        </div>
        <h1 className="hero__title" id="hero-title" ref={titleRef}>
          VASHIK
        </h1>
        <p className="hero__subtitle" id="hero-subtitle" ref={subtitleRef}>
          We build what matters
        </p>
        <p className="hero__description" id="hero-description" ref={descRef}>
          We architect and build the digital infrastructure
          <br className="hide-mobile" />
          that powers ambitious enterprises.
        </p>
        <div className="hero__cta" id="hero-cta" ref={ctaRef}>
          <a href="#services" className="btn btn--primary" data-cursor="button">
            What We Build
          </a>
          <a href="#contact" className="btn btn--ghost" data-cursor="button">
            Get in Touch
          </a>
        </div>
      </div>
      <div className="hero__scroll" id="hero-scroll" ref={scrollRef}>
        <span>Scroll</span>
        <div className="hero__scroll-line"></div>
      </div>
    </section>
  );
}
