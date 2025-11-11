// ===== PARTICLE SYSTEM =====
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particles');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 80;
        
        this.resize();
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    init() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach((particle, i) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(0, 255, 136, ${particle.opacity})`;
            this.ctx.fill();
            
            // Draw connections
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = particle.x - p2.x;
                const dy = particle.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(0, 255, 136, ${0.2 * (1 - distance / 150)})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// ===== MATRIX RAIN EFFECT =====
class MatrixRain {
    constructor() {
        this.element = document.getElementById('matrixBg');
        this.characters = '01';
        this.drops = [];
        this.fontSize = 14;
        this.columns = Math.floor(window.innerWidth / this.fontSize);
        
        this.init();
        setInterval(() => this.draw(), 50);
        
        window.addEventListener('resize', () => this.init());
    }
    
    init() {
        this.columns = Math.floor(window.innerWidth / this.fontSize);
        this.drops = [];
        for (let i = 0; i < this.columns; i++) {
            this.drops[i] = Math.random() * -100;
        }
    }
    
    draw() {
        let content = '';
        for (let i = 0; i < this.columns; i++) {
            const char = this.characters[Math.floor(Math.random() * this.characters.length)];
            const x = i * this.fontSize;
            const y = this.drops[i] * this.fontSize;
            
            if (y > 0 && y < window.innerHeight) {
                content += `<span style="position: absolute; left: ${x}px; top: ${y}px; color: rgba(0, 255, 136, ${Math.random() * 0.5});">${char}</span>`;
            }
            
            if (y > window.innerHeight && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            this.drops[i]++;
        }
        this.element.innerHTML = content;
    }
}

// ===== COUNTER ANIMATION =====
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + (target === 99 ? '.9' : '+');
    }, 16);
}

// ===== SCROLL ANIMATIONS =====
function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                if (entry.target.classList.contains('stat-number')) {
                    animateCounter(entry.target);
                }
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.feature-card, .product-card, .stat-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// ===== SMOOTH SCROLL =====
function smoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== NAVBAR SCROLL EFFECT =====
function navbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.background = 'rgba(10, 14, 39, 0.95)';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.background = 'rgba(10, 14, 39, 0.8)';
            navbar.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
}

// ===== TERMINAL TYPING ANIMATION =====
function terminalTyping() {
    const terminal = document.querySelector('.terminal-body');
    if (!terminal) return; // Verificar se elemento existe
    
    const lines = terminal.querySelectorAll('.terminal-line');
    
    lines.forEach((line, index) => {
        line.style.opacity = '0';
        setTimeout(() => {
            line.style.opacity = '1';
            line.style.animation = 'slideIn 0.3s ease';
        }, index * 300);
    });
}

// ===== CURSOR TRAIL EFFECT =====
class CursorTrail {
    constructor() {
        this.dots = [];
        this.mouse = { x: 0, y: 0 };
        this.dotCount = 15;
        
        this.init();
        this.animate();
        
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }
    
    init() {
        for (let i = 0; i < this.dotCount; i++) {
            const dot = document.createElement('div');
            dot.className = 'cursor-dot';
            dot.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: rgba(0, 255, 136, ${1 - i / this.dotCount});
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                transition: all 0.1s ease;
            `;
            document.body.appendChild(dot);
            this.dots.push({
                element: dot,
                x: 0,
                y: 0
            });
        }
    }
    
    animate() {
        let x = this.mouse.x;
        let y = this.mouse.y;
        
        this.dots.forEach((dot, index) => {
            dot.x += (x - dot.x) * 0.3;
            dot.y += (y - dot.y) * 0.3;
            
            dot.element.style.left = dot.x + 'px';
            dot.element.style.top = dot.y + 'px';
            
            x = dot.x;
            y = dot.y;
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// ===== PRODUCT CARD TILT EFFECT =====
function productCardTilt() {
    const cards = document.querySelectorAll('.product-card');
    if (cards.length === 0) return; // Verificar se elementos existem
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

// ===== GLITCH EFFECT ON HOVER =====
function glitchEffect() {
    const glitchElements = document.querySelectorAll('.product-title, .feature-title');
    if (glitchElements.length === 0) return; // Verificar se elementos existem
    
    glitchElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.style.animation = 'glitch 0.3s ease';
            setTimeout(() => {
                element.style.animation = '';
            }, 300);
        });
    });
}

// ===== STATS PULSE ANIMATION =====
function statsPulse() {
    const stats = document.querySelectorAll('.stat-number');
    if (stats.length === 0) return; // Verificar se elementos existem
    
    setInterval(() => {
        stats.forEach(stat => {
            stat.style.animation = 'pulse 1s ease';
            setTimeout(() => {
                stat.style.animation = '';
            }, 1000);
        });
    }, 5000);
}

// ===== LOADING ANIMATION =====
function pageLoad() {
    document.body.style.opacity = '0';
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.5s ease';
            document.body.style.opacity = '1';
        }, 100);
    });
}

// ===== BUTTON RIPPLE EFFECT =====
function buttonRipple() {
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                left: ${x}px;
                top: ${y}px;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// Add ripple animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(-10px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes glitch {
        0% { transform: translate(0); }
        20% { transform: translate(-2px, 2px); }
        40% { transform: translate(-2px, -2px); }
        60% { transform: translate(2px, 2px); }
        80% { transform: translate(2px, -2px); }
        100% { transform: translate(0); }
    }
`;
document.head.appendChild(style);

// ===== PARALLAX SCROLL EFFECT =====
function parallaxScroll() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.terminal-window, .hero-visual');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// ===== INITIALIZE ALL =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize particle system
    new ParticleSystem();
    
    // Initialize matrix rain (commented out for better performance, uncomment if desired)
    // new MatrixRain();
    
    // Initialize cursor trail
    new CursorTrail();
    
    // Initialize animations
    pageLoad();
    smoothScroll();
    navbarScroll();
    observeElements();
    terminalTyping();
    productCardTilt();
    glitchEffect();
    statsPulse();
    buttonRipple();
    parallaxScroll();
    
    // Animate stats on load
    setTimeout(() => {
        document.querySelectorAll('.stat-number').forEach(stat => {
            animateCounter(stat);
        });
    }, 500);
});

// ===== MOBILE MENU TOGGLE =====
function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    const navActions = document.getElementById('navActions');
    const toggle = document.getElementById('mobileMenuToggle');
    
    navMenu.classList.toggle('active');
    navActions.classList.toggle('active');
    toggle.classList.toggle('active');
}

// Close mobile menu when clicking on links
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const navMenu = document.getElementById('navMenu');
            const navActions = document.getElementById('navActions');
            const toggle = document.getElementById('mobileMenuToggle');
            
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navActions.classList.remove('active');
                toggle.classList.remove('active');
            }
        });
    });
});

// ===== PERFORMANCE OPTIMIZATION =====
// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize scroll events
window.addEventListener('scroll', debounce(() => {
    // Your scroll code here
}, 10));

// ===== EASTER EGG: KONAMI CODE =====
let konamiCode = [];
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.keyCode);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        document.body.style.animation = 'rainbow 2s linear infinite';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
    }
});

const rainbowStyle = document.createElement('style');
rainbowStyle.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(rainbowStyle);

// ===== SECURITY INITIALIZATION =====
// Verificar se módulo de segurança está carregado
if (typeof initSecurity === 'function') {
    // Já será inicializado pelo security.js
    console.log('%c🔒 Security Module Loaded', 'color: #00ff88; font-weight: bold;');
} else {
    console.warn('⚠️ Security module not loaded! Include security.js before script.js');
}

// Proteger contra console manipulation
(function() {
    // Detectar tentativas de manipular o console
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    
    // Não sobrescrever completamente, apenas monitorar
    console.log = function(...args) {
        originalLog.apply(console, args);
    };
    
    console.warn = function(...args) {
        originalWarn.apply(console, args);
    };
    
    console.error = function(...args) {
        originalError.apply(console, args);
    };
})();

// Verificar autenticação em páginas protegidas
function checkPageAccess() {
    const currentPage = window.location.pathname;
    const protectedPages = ['/dashboard.html', '/account.html', '/admin.html'];
    
    if (protectedPages.some(page => currentPage.includes(page))) {
        const currentUser = localStorage.getItem('exebots_current_user');
        
        if (!currentUser) {
            console.warn('Acesso negado - redirecionando para login');
            window.location.href = 'auth.html';
        } else if (typeof SessionManager !== 'undefined' && !SessionManager.isSessionValid()) {
            console.warn('Sessão expirada - redirecionando para login');
            localStorage.removeItem('exebots_current_user');
            window.location.href = 'auth.html';
        }
    }
}

// Executar verificação ao carregar
checkPageAccess();

// ===== VERIFICAR USUÁRIO LOGADO =====
async function checkUserLogin() {
    const userInfo = document.getElementById('userInfo');
    const guestButtons = document.getElementById('guestButtons');
    
    if (!userInfo || !guestButtons) return;

    try {
        // Aguardar carregamento do sistema de segurança
        if (!window.SecureStorage) {
            console.warn('Sistema de segurança não carregado ainda');
            return;
        }

        // Buscar sessão criptografada
        const session = await SecureStorage.load('exebots_session');
        
        if (session && Date.now() < session.expiresAt) {
            // Buscar dados do usuário
            const users = await SecureStorage.load('exebots_users') || [];
            const user = users.find(u => u.email === session.email);
            
            if (user) {
                // Sanitizar e mostrar informações do usuário
                const safeName = SecuritySystem.sanitizeInput(user.name);
                document.getElementById('userName').textContent = `Olá, ${safeName}`;
                userInfo.style.display = 'flex';
                guestButtons.style.display = 'none';
                
                console.log('%c✓ Usuário logado com segurança: ' + safeName, 'color: #00ff88; font-weight: bold;');
            } else {
                // Usuário não encontrado, limpar sessão
                await SecureStorage.remove('exebots_session');
            }
        } else {
            // Sessão expirada, limpar
            if (session) {
                await SecureStorage.remove('exebots_session');
            }
        }
    } catch (error) {
        console.error('Erro ao verificar login:', error);
    }
}

// Função de logout
async function logout() {
    try {
        // Limpar sessão criptografada
        await SecureStorage.remove('exebots_session');
        
        // Log de segurança
        SecuritySystem.logSecurityEvent('user_logout');
        
        // Redirecionar
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        window.location.reload();
    }
}

// Executar ao carregar
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(checkUserLogin, 500);
});
document.head.appendChild(rainbowStyle);

// ==========================================
//        __
//       / _)
//  .-^^^-/ /
// __/       /
//<__.|_|-|_|
//
// Abbys
// Se você viu isso... já é tarde demais.
// ==========================================
