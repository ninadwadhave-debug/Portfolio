// Register GSAP Plugin
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Preloader Animation
    const preloader = document.querySelector('.preloader');
    const progressBar = document.querySelector('.loader-progress');
    
    // Simulate loading
    let width = 0;
    const interval = setInterval(() => {
        width += Math.random() * 10;
        if (width > 100) width = 100;
        progressBar.style.width = width + '%';
        
        if (width === 100) {
            clearInterval(interval);
            setTimeout(() => {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                    initAnimations(); // Start site animations
                }, 500);
            }, 500);
        }
    }, 100);

    // 2. Typewriter Effect
    const typeText = ["Phenotypic Plasticity.", "Biological Data.", "Computational Models."];
    const typeElement = document.querySelector('.typewriter');
    let typeIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        if (!typeElement) return;
        const current = typeText[typeIndex];
        if (isDeleting) {
            typeElement.textContent = current.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typeElement.textContent = current.substring(0, charIndex + 1);
            charIndex++;
        }

        if (!isDeleting && charIndex === current.length) {
            isDeleting = true;
            setTimeout(type, 2000);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            typeIndex = (typeIndex + 1) % typeText.length;
            setTimeout(type, 500);
        } else {
            setTimeout(type, isDeleting ? 100 : 150);
        }
    }
    type();

    // 3. Theme Toggle
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
            
            // Refresh particles color
            initParticles(newTheme === 'dark');
        });
    }

    // 4. GSAP Animations (FIXED SKILLS SECTION)
    function initAnimations() {
        // Hero Elements Reveal
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
                scrollTrigger: {
                    trigger: header,
                    start: 'top 85%', // Trigger slightly earlier
                },
                y: 30,
                opacity: 0,
                duration: 1
            });
        });

        // Timeline Items
        gsap.utils.toArray('.timeline-content').forEach((item, i) => {
            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                },
                x: i % 2 === 0 ? -50 : 50,
                opacity: 0,
                duration: 0.8,
                ease: 'power2.out'
            });
        });

        // --- FIXED SKILLS ANIMATION ---
        // We use .batch here to ensure they appear even if scroll is fast
        ScrollTrigger.batch(".skill-item", {
            start: "top 90%",
            onEnter: batch => gsap.to(batch, {opacity: 1, y: 0, stagger: 0.15, overwrite: true}),
            onLeave: batch => gsap.set(batch, {opacity: 1}), // Safety fallback
            onEnterBack: batch => gsap.to(batch, {opacity: 1, y: 0, stagger: 0.15, overwrite: true}),
        });
        
        // Set initial state for skills (Hidden but ready to reveal)
        gsap.set(".skill-item", {y: 30, opacity: 0});

        // Counter Animation
        const counter = document.querySelector('.counter');
        if(counter) {
            gsap.to(counter, {
                innerText: 3,
                duration: 2,
                snap: { innerText: 1 },
                scrollTrigger: {
                    trigger: '.achievements-wrapper',
                    start: 'top 85%'
                }
            });
        }
    }

    // 5. 3D Tilt Effect for Cards
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -5; // Subtle tilt
            const rotateY = ((x - centerX) / centerX) * 5;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });

    // 6. Custom Cursor & Scroll Progress
    const cursor = document.querySelector('.cursor-glow');
    const scrollBar = document.querySelector('.scroll-progress-bar');
    
    window.addEventListener('mousemove', (e) => {
        gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1,
            ease: 'power2.out'
        });
    });

    window.addEventListener('scroll', () => {
        // Scroll Progress
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if(scrollBar) scrollBar.style.width = scrolled + '%';

        // Navbar & ScrollToTop
        const navbar = document.querySelector('.navbar');
        const toTop = document.getElementById('scrollToTop');
        
        if (winScroll > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');

        if(toTop) {
            if (winScroll > 500) toTop.classList.add('visible');
            else toTop.classList.remove('visible');
        }
    });

    const toTopBtn = document.getElementById('scrollToTop');
    if(toTopBtn){
        toTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 7. Particle System
    const canvas = document.getElementById('particles-canvas');
    if(canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', () => {
            resizeCanvas();
            initParticles(html.getAttribute('data-theme') === 'dark');
        });
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
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
                if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
            }
            draw() {
                ctx.fillStyle = this.color + '0.5)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles(isDark) {
            particlesArray = [];
            const count = (canvas.width * canvas.height) / 15000;
            for (let i = 0; i < count; i++) {
                particlesArray.push(new Particle(isDark));
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();
                
                // Connect particles
                for (let j = i; j < particlesArray.length; j++) {
                    const dx = particlesArray[i].x - particlesArray[j].x;
                    const dy = particlesArray[i].y - particlesArray[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 120) {
                        ctx.beginPath();
                        const opacity = 0.1 - distance/1200;
                        ctx.strokeStyle = particlesArray[i].color + opacity + ')';
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
    
    // Mobile Menu
    const burger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if(burger) {
        burger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if(navLinks) navLinks.classList.remove('active');
        });
    });
});