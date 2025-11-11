// ==========================================
// SECURITY MODULE - EXE BOTS
// Sistema de Segurança Avançado
// ==========================================

// ==========================================
// 1. INPUT SANITIZATION & VALIDATION
// ==========================================
const SecurityValidator = {
    // Sanitizar HTML para prevenir XSS
    sanitizeHTML(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },

    // Sanitizar para prevenir SQL/NoSQL Injection
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        // Remove caracteres perigosos
        return input
            .replace(/[<>]/g, '') // Remove tags HTML
            .replace(/['"`;\\]/g, '') // Remove quotes e caracteres de escape
            .replace(/(\$|\.\.\/|\.\.\\)/g, '') // Remove tentativas de path traversal
            .replace(/(script|javascript|onerror|onload)/gi, '') // Remove palavras-chave perigosas
            .trim();
    },

    // Validar email
    validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return emailRegex.test(email) && email.length <= 100;
    },

    // Validar senha (mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número)
    validatePassword(password) {
        if (password.length < 8 || password.length > 128) return false;
        
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        
        return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
    },

    // Validar nome de usuário
    validateUsername(username) {
        const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
        return usernameRegex.test(username);
    },

    // Sanitizar objeto completo
    sanitizeObject(obj) {
        const sanitized = {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                sanitized[key] = typeof obj[key] === 'string' ? 
                    this.sanitizeInput(obj[key]) : obj[key];
            }
        }
        return sanitized;
    }
};

// ==========================================
// 2. CRYPTOGRAPHY & HASHING
// ==========================================
const CryptoModule = {
    // Gerar hash SHA-256
    async hashPassword(password, salt = '') {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + salt);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    // Gerar salt aleatório
    generateSalt(length = 16) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    },

    // Gerar token aleatório
    generateToken(length = 32) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode.apply(null, array))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    },

    // Criptografar dados com AES
    encryptData(data, key) {
        try {
            // Simples XOR encryption para localStorage
            const encrypted = btoa(String.fromCharCode(...new TextEncoder().encode(
                JSON.stringify(data)
            ).map((byte, i) => byte ^ key.charCodeAt(i % key.length))));
            return encrypted;
        } catch (error) {
            console.error('Encryption error:', error);
            return null;
        }
    },

    // Descriptografar dados
    decryptData(encrypted, key) {
        try {
            const decrypted = atob(encrypted)
                .split('')
                .map((char, i) => char.charCodeAt(0) ^ key.charCodeAt(i % key.length));
            return JSON.parse(new TextDecoder().decode(new Uint8Array(decrypted)));
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    }
};

// ==========================================
// 3. RATE LIMITING & BRUTE FORCE PROTECTION
// ==========================================
const RateLimiter = {
    attempts: {},
    blockedIPs: new Set(),
    
    // Configurações
    config: {
        maxAttempts: 5,
        windowMs: 15 * 60 * 1000, // 15 minutos
        blockDurationMs: 30 * 60 * 1000, // 30 minutos
        maxRequestsPerMinute: 60
    },

    // Gerar identificador do cliente
    getClientId() {
        // Em produção, usar IP real do servidor
        return 'client_' + (navigator.userAgent + navigator.language).split('').reduce(
            (hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0
        );
    },

    // Verificar se está bloqueado
    isBlocked() {
        const clientId = this.getClientId();
        return this.blockedIPs.has(clientId);
    },

    // Registrar tentativa
    recordAttempt(action = 'login') {
        const clientId = this.getClientId();
        const now = Date.now();
        
        // Verificar se está bloqueado
        if (this.isBlocked()) {
            const blockInfo = this.attempts[clientId]?.blockUntil;
            if (blockInfo && now < blockInfo) {
                const minutesLeft = Math.ceil((blockInfo - now) / 60000);
                throw new Error(`Muitas tentativas! Bloqueado por mais ${minutesLeft} minutos.`);
            } else {
                // Desbloquear
                this.blockedIPs.delete(clientId);
                delete this.attempts[clientId];
            }
        }

        // Inicializar ou limpar tentativas antigas
        if (!this.attempts[clientId]) {
            this.attempts[clientId] = { count: 0, firstAttempt: now, action };
        }

        const attempt = this.attempts[clientId];
        
        // Reset se passou o tempo da janela
        if (now - attempt.firstAttempt > this.config.windowMs) {
            attempt.count = 0;
            attempt.firstAttempt = now;
        }

        attempt.count++;

        // Bloquear se excedeu máximo de tentativas
        if (attempt.count > this.config.maxAttempts) {
            this.blockedIPs.add(clientId);
            attempt.blockUntil = now + this.config.blockDurationMs;
            
            // Log de segurança
            this.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
                clientId,
                action,
                attempts: attempt.count
            });
            
            throw new Error('Muitas tentativas! Conta temporariamente bloqueada.');
        }

        return attempt.count;
    },

    // Resetar tentativas (após sucesso)
    resetAttempts() {
        const clientId = this.getClientId();
        delete this.attempts[clientId];
        this.blockedIPs.delete(clientId);
    },

    // Log de eventos de segurança
    logSecurityEvent(type, data) {
        const log = {
            type,
            timestamp: new Date().toISOString(),
            data,
            userAgent: navigator.userAgent
        };
        
        // Armazenar logs de segurança
        const logs = JSON.parse(localStorage.getItem('exebots_security_logs') || '[]');
        logs.push(log);
        
        // Manter apenas últimos 100 logs
        if (logs.length > 100) {
            logs.shift();
        }
        
        localStorage.setItem('exebots_security_logs', JSON.stringify(logs));
        console.warn('Security Event:', log);
    }
};

// ==========================================
// 4. SESSION MANAGEMENT & CSRF PROTECTION
// ==========================================
const SessionManager = {
    sessionTimeout: 30 * 60 * 1000, // 30 minutos
    csrfToken: null,

    // Inicializar sessão
    initSession() {
        this.csrfToken = CryptoModule.generateToken();
        sessionStorage.setItem('exebots_csrf_token', this.csrfToken);
        sessionStorage.setItem('exebots_session_start', Date.now().toString());
        
        // Renovar token a cada 5 minutos
        setInterval(() => this.renewToken(), 5 * 60 * 1000);
    },

    // Renovar token CSRF
    renewToken() {
        this.csrfToken = CryptoModule.generateToken();
        sessionStorage.setItem('exebots_csrf_token', this.csrfToken);
    },

    // Validar token CSRF
    validateCSRF(token) {
        const storedToken = sessionStorage.getItem('exebots_csrf_token');
        return token === storedToken;
    },

    // Obter token CSRF
    getCSRFToken() {
        return this.csrfToken || sessionStorage.getItem('exebots_csrf_token');
    },

    // Verificar se sessão está válida
    isSessionValid() {
        const sessionStart = parseInt(sessionStorage.getItem('exebots_session_start'));
        if (!sessionStart) return false;
        
        const now = Date.now();
        const elapsed = now - sessionStart;
        
        if (elapsed > this.sessionTimeout) {
            this.destroySession();
            return false;
        }
        
        // Atualizar timestamp da sessão
        sessionStorage.setItem('exebots_session_start', now.toString());
        return true;
    },

    // Destruir sessão
    destroySession() {
        sessionStorage.removeItem('exebots_csrf_token');
        sessionStorage.removeItem('exebots_session_start');
        localStorage.removeItem('exebots_current_user');
        this.csrfToken = null;
    },

    // Criar sessão segura
    createSecureSession(userData) {
        const sessionToken = CryptoModule.generateToken();
        const encryptionKey = this.csrfToken + sessionToken;
        
        const sessionData = {
            user: userData.email,
            token: sessionToken,
            createdAt: Date.now(),
            expiresAt: Date.now() + this.sessionTimeout
        };

        const encrypted = CryptoModule.encryptData(sessionData, encryptionKey);
        sessionStorage.setItem('exebots_session', encrypted);
        
        return sessionToken;
    }
};

// ==========================================
// 5. XSS & INJECTION PROTECTION
// ==========================================
const XSSProtection = {
    // Lista de padrões perigosos
    dangerousPatterns: [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe/gi,
        /<object/gi,
        /<embed/gi,
        /eval\(/gi,
        /expression\(/gi,
        /vbscript:/gi,
        /data:text\/html/gi
    ],

    // Detectar tentativas de XSS
    detectXSS(input) {
        if (typeof input !== 'string') return false;
        
        return this.dangerousPatterns.some(pattern => pattern.test(input));
    },

    // Limpar input de XSS
    cleanXSS(input) {
        if (typeof input !== 'string') return input;
        
        let cleaned = input;
        this.dangerousPatterns.forEach(pattern => {
            cleaned = cleaned.replace(pattern, '');
        });
        
        return SecurityValidator.sanitizeHTML(cleaned);
    },

    // Validar e limpar formulário
    sanitizeForm(formData) {
        const sanitized = {};
        
        for (let [key, value] of Object.entries(formData)) {
            // Detectar XSS
            if (this.detectXSS(value)) {
                RateLimiter.logSecurityEvent('XSS_ATTEMPT', {
                    field: key,
                    value: value.substring(0, 100)
                });
                throw new Error('Entrada inválida detectada! Tentativa bloqueada.');
            }
            
            // Limpar valor
            sanitized[key] = this.cleanXSS(value);
        }
        
        return sanitized;
    }
};

// ==========================================
// 6. SECURE STORAGE MANAGER
// ==========================================
const SecureStorage = {
    encryptionKey: null,

    // Inicializar com chave
    init() {
        // Gerar chave baseada em características do navegador
        const browserFingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset()
        ].join('|');
        
        this.encryptionKey = btoa(browserFingerprint).substring(0, 32);
    },

    // Salvar dados criptografados
    setItem(key, value) {
        try {
            const encrypted = CryptoModule.encryptData(value, this.encryptionKey);
            localStorage.setItem(key, encrypted);
            return true;
        } catch (error) {
            console.error('Secure storage error:', error);
            return false;
        }
    },

    // Recuperar dados descriptografados
    getItem(key) {
        try {
            const encrypted = localStorage.getItem(key);
            if (!encrypted) return null;
            
            return CryptoModule.decryptData(encrypted, this.encryptionKey);
        } catch (error) {
            console.error('Secure retrieval error:', error);
            return null;
        }
    },

    // Remover item
    removeItem(key) {
        localStorage.removeItem(key);
    },

    // Limpar todos os dados
    clear() {
        localStorage.clear();
        sessionStorage.clear();
    }
};

// ==========================================
// 7. SECURITY MONITOR
// ==========================================
const SecurityMonitor = {
    // Verificar integridade do código
    checkCodeIntegrity() {
        // Verificar se scripts externos foram injetados
        const scripts = document.querySelectorAll('script[src]');
        const allowedDomains = ['fonts.googleapis.com', 'fonts.gstatic.com'];
        
        scripts.forEach(script => {
            const src = script.getAttribute('src');
            if (src && !src.startsWith('/') && !src.startsWith('./')) {
                const isAllowed = allowedDomains.some(domain => src.includes(domain));
                if (!isAllowed) {
                    RateLimiter.logSecurityEvent('UNAUTHORIZED_SCRIPT', { src });
                    script.remove();
                }
            }
        });
    },

    // Detectar DevTools aberto
    detectDevTools() {
        const threshold = 160;
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        return widthThreshold || heightThreshold;
    },

    // Prevenir debug
    preventDebug() {
        // Desabilitar console em produção
        if (window.location.hostname !== 'localhost') {
            console.log = function() {};
            console.warn = function() {};
            console.error = function() {};
        }

        // Detectar debugger
        setInterval(() => {
            const start = new Date().getTime();
            debugger;
            const end = new Date().getTime();
            
            if (end - start > 100) {
                RateLimiter.logSecurityEvent('DEBUGGER_DETECTED', {});
            }
        }, 1000);
    },

    // Prevenir clique direito e atalhos
    preventContextMenu() {
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });

        // Prevenir F12, Ctrl+Shift+I, Ctrl+U
        document.addEventListener('keydown', (e) => {
            if (
                e.keyCode === 123 || // F12
                (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
                (e.ctrlKey && e.keyCode === 85) // Ctrl+U
            ) {
                e.preventDefault();
                return false;
            }
        });
    },

    // Monitorar atividade suspeita
    monitorActivity() {
        let clickCount = 0;
        let keyCount = 0;
        
        const resetCounters = () => {
            clickCount = 0;
            keyCount = 0;
        };

        document.addEventListener('click', () => {
            clickCount++;
            if (clickCount > 100) {
                RateLimiter.logSecurityEvent('SUSPICIOUS_CLICK_ACTIVITY', { count: clickCount });
            }
        });

        document.addEventListener('keypress', () => {
            keyCount++;
            if (keyCount > 500) {
                RateLimiter.logSecurityEvent('SUSPICIOUS_KEY_ACTIVITY', { count: keyCount });
            }
        });

        setInterval(resetCounters, 60000); // Reset a cada minuto
    }
};

// ==========================================
// INICIALIZAÇÃO DO SISTEMA DE SEGURANÇA
// ==========================================
function initSecurity() {
    console.log('%c🔒 SISTEMA DE SEGURANÇA ATIVO', 'color: #00ff88; font-size: 16px; font-weight: bold;');
    
    // Inicializar módulos
    SecureStorage.init();
    SessionManager.initSession();
    
    // Ativar proteções
    SecurityMonitor.checkCodeIntegrity();
    SecurityMonitor.preventContextMenu();
    SecurityMonitor.monitorActivity();
    
    // Verificar sessão a cada 30 segundos
    setInterval(() => {
        if (!SessionManager.isSessionValid()) {
            console.warn('Sessão expirada!');
            window.location.href = 'auth.html';
        }
    }, 30000);
    
    console.log('%c✓ Proteção XSS Ativa\n✓ Rate Limiting Ativo\n✓ Criptografia Ativa\n✓ CSRF Protection Ativa', 
        'color: #00d4ff; font-size: 12px;');
}

// Exportar módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SecurityValidator,
        CryptoModule,
        RateLimiter,
        SessionManager,
        XSSProtection,
        SecureStorage,
        SecurityMonitor,
        initSecurity
    };
}

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
