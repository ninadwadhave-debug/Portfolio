// Register GSAP Plugin
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    html.setAttribute('data-theme', savedTheme);

    if(themeToggle){
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            initParticles(newTheme === 'dark');
        });
    }

    // 2. GSAP Animations
    function initAnimations() {
        // Hero Reveal
        gsap.from('.gsap-reveal', {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: 'power3.out'
        });

        // Section Headers
        gsap.utils.toArray('.section-header').forEach(header => {
            gsap.from(header, {
                scrollTrigger: { trigger: header, start: 'top 85%' },
                y: 30, opacity: 0, duration: 1
            });
        });

        // Timeline Items
        gsap.utils.toArray('.timeline-content').forEach((item, i) => {
            gsap.from(item, {
                scrollTrigger: { trigger: item, start: 'top 85%' },
                x: i % 2 === 0 ? -50 : 50,
                opacity: 0, duration: 0.8
            });
        });

        // Skills Stagger (Fixed)
        ScrollTrigger.batch(".skill-item", {
            start: "top 90%",
            onEnter: batch => gsap.to(batch, {opacity: 1, y: 0, stagger: 0.15, overwrite: true}),
            onLeave: batch => gsap.set(batch, {opacity: 1}),
            onEnterBack: batch => gsap.to(batch, {opacity: 1, y: 0, stagger: 0.15, overwrite: true}),
        });
        gsap.set(".skill-item", {y: 30, opacity: 0});
    }

    // Initialize Animations
    initAnimations();

    // 3. 3D Tilt Effect
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });

    // 4. Custom Cursor
    const cursor = document.querySelector('.cursor-glow');
    window.addEventListener('mousemove', (e) => {
        gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
    });

    // 5. Particle System
    const canvas = document.getElementById('particles-canvas');
    if(canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray;
        function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
        window.addEventListener('resize', () => { resizeCanvas(); initParticles(html.getAttribute('data-theme') === 'dark'); });
        resizeCanvas();

        class Particle {
            constructor(isDark) {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.color = isDark ? 'rgba(10, 255, 194, ' : 'rgba(13, 148, 136, ';
            }
            update() {
                this.x += this.speedX; this.y += this.speedY;
                if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
                if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
            }
            draw() {
                ctx.fillStyle = this.color + '0.5)';
                ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
            }
        }
        function initParticles(isDark) {
            particlesArray = [];
            const count = (canvas.width * canvas.height) / 15000;
            for (let i = 0; i < count; i++) particlesArray.push(new Particle(isDark));
        }
        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update(); particlesArray[i].draw();
                for (let j = i; j < particlesArray.length; j++) {
                    const dx = particlesArray[i].x - particlesArray[j].x;
                    const dy = particlesArray[i].y - particlesArray[j].y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = particlesArray[i].color + (0.1 - dist/1200) + ')';
                        ctx.lineWidth = 1;
                        ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                        ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animateParticles);
        }
        initParticles(true);
        animateParticles();
    }
});
