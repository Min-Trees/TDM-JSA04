/* =====================================================
   TDM-JSA04 - Web Advance Landing Page Scripts
   Professional Interactive Features
   ===================================================== */

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initSmoothScroll();
    initHeaderScroll();
    initMobileMenu();
    initBackToTop();
    initCounterAnimation();
    initScrollReveal();
    initNavActiveState();
});

/* =====================================================
   Theme Toggle (Dark/Light Mode)
   ===================================================== */
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    const icon = themeToggle.querySelector('i');
    
    // Check for saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    document.documentElement.setAttribute('data-theme', initialTheme);
    updateThemeIcon(initialTheme);
    
    // Toggle theme
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
    
    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
}

/* =====================================================
   Smooth Scroll for Navigation
   ===================================================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const mobileNav = document.getElementById('mobileNav');
                if (mobileNav) {
                    mobileNav.classList.remove('active');
                }
            }
        });
    });
}

/* =====================================================
   Header Scroll Effects
   ===================================================== */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    function updateHeader() {
        const currentScrollY = window.scrollY;
        
        // Add shadow when scrolled
        if (currentScrollY > 50) {
            header.style.boxShadow = 'var(--shadow-md)';
        } else {
            header.style.boxShadow = 'none';
        }
        
        // Hide/show header based on scroll direction
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    });
}

/* =====================================================
   Mobile Menu Toggle
   ===================================================== */
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    
    if (!mobileMenuBtn || !mobileNav) return;
    
    mobileMenuBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenuBtn.contains(e.target) && !mobileNav.contains(e.target)) {
            mobileNav.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        }
    });
}

/* =====================================================
   Back to Top Button
   ===================================================== */
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/* =====================================================
   Counter Animation
   ===================================================== */
function initCounterAnimation() {
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length === 0) return;
    
    const animateCounter = (element) => {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
                if (target === 100) {
                    element.textContent = '100+';
                }
            }
        };
        
        updateCounter();
    };
    
    // Use Intersection Observer to trigger animation when visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

/* =====================================================
   Scroll Reveal Animation
   ===================================================== */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.project-card, .curriculum-card, .stat-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    revealElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease';
        observer.observe(element);
    });
}

/* =====================================================
   Navigation Active State
   ===================================================== */
function initNavActiveState() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (sections.length === 0 || navLinks.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' });
    
    sections.forEach(section => observer.observe(section));
}

/* =====================================================
   Typing Animation (Optional Enhancement)
   ===================================================== */
function initTypingAnimation() {
    const codeElement = document.querySelector('.code-body code');
    if (!codeElement) return;
    
    const originalHTML = codeElement.innerHTML;
    const text = codeElement.textContent;
    codeElement.innerHTML = '';
    
    let i = 0;
    const speed = 20;
    
    function typeWriter() {
        if (i < originalHTML.length) {
            codeElement.innerHTML = originalHTML.substring(0, i + 1);
            i++;
            setTimeout(typeWriter, speed);
        }
    }
    
    // Start typing when code window is visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                typeWriter();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(codeElement.closest('.code-window'));
}

/* =====================================================
   Parallax Effect for Hero Shapes
   ===================================================== */
function initParallax() {
    const shapes = document.querySelectorAll('.floating-code');
    
    window.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 10;
            const xMove = (x - 0.5) * speed;
            const yMove = (y - 0.5) * speed;
            
            shape.style.transform = `translate(${xMove}px, ${yMove}px)`;
        });
    });
}

/* =====================================================
   Project Card Hover Effect
   ===================================================== */
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.querySelector('.card-glow').style.opacity = '0.05';
    });
    
    card.addEventListener('mouseleave', function() {
        this.querySelector('.card-glow').style.opacity = '0';
    });
});

/* =====================================================
   Preloader (Optional)
   ===================================================== */
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Initialize parallax after load
    if (window.innerWidth > 768) {
        initParallax();
    }
});

/* =====================================================
   Console Easter Egg
   ===================================================== */
console.log(`
%c TDM-JSA04 - Web Advance 
%c Giảng viên: Nguyễn Phạm Minh Trí
%c Năm học: 2026

🎓 Chào mừng bạn đến với lớp TDM-JSA04!
📚 Khóa học Web Development Advance
💻 HTML5 | CSS3 | JavaScript | JSON

Made with ❤️ by TDM Training Center
`, 
'color: #6366f1; font-size: 20px; font-weight: bold;',
'color: #10b981; font-size: 14px;',
'color: #94a3b8; font-size: 12px;'
);
