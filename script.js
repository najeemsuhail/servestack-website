/* ============================================
   ServeStack POS — Interactions & Animations
   ============================================ */

(function () {
    'use strict';

    // -------- Scroll reveal with IntersectionObserver --------
    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = el.dataset.delay ? parseInt(el.dataset.delay, 10) : 0;
                    el.style.setProperty('--delay', delay + 'ms');
                    // Force reflow so delay applies even on already-visible items
                    void el.offsetWidth;
                    el.classList.add('in-view');
                    io.unobserve(el);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        reveals.forEach((el) => io.observe(el));
    } else {
        reveals.forEach((el) => el.classList.add('in-view'));
    }

    // -------- Sticky nav state --------
    const nav = document.getElementById('nav');
    const onScroll = () => {
        if (window.scrollY > 8) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // -------- Animated counter for dashboard revenue --------
    const dashValue = document.querySelector('.dash-revenue .dash-value');
    if (dashValue) {
        const finalText = dashValue.textContent;
        const finalNum = 184250;
        let started = false;

        const animate = () => {
            if (started) return;
            started = true;
            const duration = 1400;
            const start = performance.now();
            const format = (n) => '₹ ' + Math.round(n).toLocaleString('en-IN');
            const step = (now) => {
                const t = Math.min(1, (now - start) / duration);
                // ease-out-cubic
                const eased = 1 - Math.pow(1 - t, 3);
                const val = finalNum * eased;
                dashValue.textContent = format(val);
                if (t < 1) requestAnimationFrame(step);
                else dashValue.textContent = finalText;
            };
            requestAnimationFrame(step);
        };

        const dashObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animate();
                    dashObserver.disconnect();
                }
            });
        }, { threshold: 0.3 });
        dashObserver.observe(dashValue);
    }

    // -------- Bar chart reveal animation --------
    const bars = document.querySelectorAll('.bar');
    if (bars.length && 'IntersectionObserver' in window) {
        const setHeight = (bar) => {
            const h = bar.style.getPropertyValue('--h');
            bar.style.height = '0%';
            requestAnimationFrame(() => {
                bar.style.transition = 'height 1.1s cubic-bezier(0.22, 1, 0.36, 1)';
                bar.style.height = h;
            });
        };
        const barsObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    bars.forEach((bar, i) => {
                        setTimeout(() => setHeight(bar), i * 90);
                    });
                    barsObserver.disconnect();
                }
            });
        }, { threshold: 0.4 });
        const barsContainer = document.querySelector('.bars');
        if (barsContainer) barsObserver.observe(barsContainer);
    }

    // -------- Smooth scroll for in-page anchors --------
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            if (!href || href === '#' || href.length < 2) return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - 70;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    // -------- Mobile nav toggle (lightweight) --------
    const navToggle = document.getElementById('navToggle');
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            // For simplicity on mobile, just scroll to demo section.
            const demo = document.querySelector('#demo');
            if (demo) demo.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // -------- Subtle parallax for hero blobs --------
    const blobs = document.querySelectorAll('.hero-bg-blob');
    if (blobs.length && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        let ticking = false;
        window.addEventListener('mousemove', (e) => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const cx = (e.clientX / window.innerWidth) - 0.5;
                const cy = (e.clientY / window.innerHeight) - 0.5;
                blobs.forEach((blob, i) => {
                    const depth = (i + 1) * 10;
                    blob.style.transform = `translate(${cx * depth}px, ${cy * depth}px)`;
                });
                ticking = false;
            });
        });
    }

    // -------- Subtle "spark" line draw for revenue card --------
    const spark = document.querySelector('.dash-spark polyline');
    if (spark) {
        const length = spark.getTotalLength ? spark.getTotalLength() : 300;
        spark.style.strokeDasharray = length;
        spark.style.strokeDashoffset = length;
        const sparkObs = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    spark.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(0.22, 1, 0.36, 1)';
                    spark.style.strokeDashoffset = '0';
                    sparkObs.disconnect();
                }
            });
        }, { threshold: 0.4 });
        sparkObs.observe(spark);
    }

})();
