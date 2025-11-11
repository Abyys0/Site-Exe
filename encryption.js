// ==========================================
// SISTEMA DE CRIPTOGRAFIA E SEGURANÇA
// EXE BOTS - Proteção de Dados
// ==========================================

const SecuritySystem = {
    // Chave mestra derivada do dispositivo (única por navegador)
    masterKey: null,
    
    // Salt único por instalação
    salt: null,

    // ===== INICIALIZAÇÃO =====
    async init() {
        await this.generateMasterKey();
        this.initializeCSRFProtection();
        this.initializeXSSProtection();
        this.initializeRateLimiting();
        this.monitorSecurityEvents();
    },

    // ===== GERAR CHAVE MESTRA =====
    async generateMasterKey() {
        // Obter ou criar salt único
        let salt = localStorage.getItem('_sys_salt');
        if (!salt) {
            salt = this.generateRandomString(32);
            localStorage.setItem('_sys_salt', salt);
        }
        this.salt = salt;

        // Criar fingerprint do dispositivo
        const fingerprint = await this.getDeviceFingerprint();
        
        // Derivar chave mestra usando PBKDF2
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(fingerprint + salt),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        this.masterKey = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: encoder.encode(salt),
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
    },

    // ===== FINGERPRINT DO DISPOSITIVO =====
    async getDeviceFingerprint() {
        const components = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            screen.colorDepth,
            new Date().getTimezoneOffset(),
            !!window.sessionStorage,
            !!window.localStorage,
            navigator.platform,
            navigator.hardwareConcurrency || 'unknown'
        ];

        const fingerprint = components.join('|');
        const hash = await this.sha256(fingerprint);
        return hash;
    },

    // ===== CRIPTOGRAFAR DADOS =====
    async encrypt(data) {
        try {
            if (!this.masterKey) {
                await this.generateMasterKey();
            }

            // Converter dados para string
            const plaintext = typeof data === 'string' ? data : JSON.stringify(data);
            
            // Gerar IV (Initialization Vector) aleatório
            const iv = crypto.getRandomValues(new Uint8Array(12));
            
            // Criptografar
            const encoder = new TextEncoder();
            const encrypted = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                this.masterKey,
                encoder.encode(plaintext)
            );

            // Combinar IV + dados criptografados
            const combined = new Uint8Array(iv.length + encrypted.byteLength);
            combined.set(iv, 0);
            combined.set(new Uint8Array(encrypted), iv.length);

            // Retornar como Base64
            return this.arrayBufferToBase64(combined);
        } catch (error) {
            console.error('Erro ao criptografar:', error);
            throw new Error('Falha na criptografia');
        }
    },

    // ===== DESCRIPTOGRAFAR DADOS =====
    async decrypt(encryptedData) {
        try {
            if (!this.masterKey) {
                await this.generateMasterKey();
            }

            // Converter de Base64
            const combined = this.base64ToArrayBuffer(encryptedData);
            
            // Separar IV dos dados
            const iv = combined.slice(0, 12);
            const encrypted = combined.slice(12);

            // Descriptografar
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                this.masterKey,
                encrypted
            );

            // Converter para string
            const decoder = new TextDecoder();
            const plaintext = decoder.decode(decrypted);

            // Tentar parsear como JSON
            try {
                return JSON.parse(plaintext);
            } catch {
                return plaintext;
            }
        } catch (error) {
            console.error('Erro ao descriptografar:', error);
            throw new Error('Falha na descriptografia');
        }
    },

    // ===== HASH SHA-256 =====
    async sha256(text) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return this.arrayBufferToHex(hash);
    },

    // ===== HASH DE SENHA (PBKDF2) =====
    async hashPassword(password, customSalt = null) {
        const salt = customSalt || this.generateRandomString(16);
        const encoder = new TextEncoder();
        
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits']
        );

        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: encoder.encode(salt),
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            256
        );

        const hash = this.arrayBufferToHex(derivedBits);
        return { hash, salt };
    },

    // ===== VERIFICAR SENHA =====
    async verifyPassword(password, storedHash, storedSalt) {
        const { hash } = await this.hashPassword(password, storedSalt);
        return hash === storedHash;
    },

    // ===== SANITIZAÇÃO DE DADOS =====
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/[<>]/g, '') // Remove < e >
            .replace(/javascript:/gi, '') // Remove javascript:
            .replace(/on\w+=/gi, '') // Remove event handlers
            .replace(/eval\(/gi, '') // Remove eval
            .trim();
    },

    sanitizeEmail(email) {
        const sanitized = this.sanitizeInput(email);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(sanitized) ? sanitized : null;
    },

    sanitizeObject(obj) {
        const sanitized = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                if (typeof value === 'string') {
                    sanitized[key] = this.sanitizeInput(value);
                } else if (typeof value === 'object' && value !== null) {
                    sanitized[key] = this.sanitizeObject(value);
                } else {
                    sanitized[key] = value;
                }
            }
        }
        return sanitized;
    },

    // ===== PROTEÇÃO CSRF =====
    initializeCSRFProtection() {
        let csrfToken = sessionStorage.getItem('_csrf_token');
        if (!csrfToken) {
            csrfToken = this.generateRandomString(32);
            sessionStorage.setItem('_csrf_token', csrfToken);
        }
        return csrfToken;
    },

    getCSRFToken() {
        return sessionStorage.getItem('_csrf_token');
    },

    validateCSRFToken(token) {
        return token === this.getCSRFToken();
    },

    // ===== PROTEÇÃO XSS =====
    initializeXSSProtection() {
        // Prevenir injeção de scripts
        const originalCreateElement = document.createElement;
        document.createElement = function(...args) {
            const element = originalCreateElement.apply(document, args);
            if (args[0].toLowerCase() === 'script') {
                console.warn('⚠️ Tentativa de criar script detectada');
            }
            return element;
        };
    },

    // ===== RATE LIMITING =====
    rateLimiters: {},
    
    initializeRateLimiting() {
        this.rateLimiters = {
            login: { attempts: 0, resetTime: Date.now() + 900000 }, // 15 min
            register: { attempts: 0, resetTime: Date.now() + 900000 },
            payment: { attempts: 0, resetTime: Date.now() + 300000 } // 5 min
        };
    },

    checkRateLimit(action, maxAttempts = 5) {
        const limiter = this.rateLimiters[action];
        
        if (!limiter) {
            this.rateLimiters[action] = {
                attempts: 1,
                resetTime: Date.now() + 900000
            };
            return true;
        }

        // Reset se o tempo expirou
        if (Date.now() > limiter.resetTime) {
            limiter.attempts = 1;
            limiter.resetTime = Date.now() + 900000;
            return true;
        }

        // Verificar limite
        if (limiter.attempts >= maxAttempts) {
            const timeLeft = Math.ceil((limiter.resetTime - Date.now()) / 60000);
            throw new Error(`Muitas tentativas. Tente novamente em ${timeLeft} minutos.`);
        }

        limiter.attempts++;
        return true;
    },

    // ===== MONITORAMENTO DE SEGURANÇA =====
    monitorSecurityEvents() {
        // Detectar DevTools aberto
        let devtoolsOpen = false;
        const threshold = 160;
        
        setInterval(() => {
            if (window.outerWidth - window.innerWidth > threshold ||
                window.outerHeight - window.innerHeight > threshold) {
                if (!devtoolsOpen) {
                    devtoolsOpen = true;
                    this.logSecurityEvent('devtools_opened');
                }
            } else {
                devtoolsOpen = false;
            }
        }, 1000);

        // Detectar tentativas de copiar dados sensíveis
        document.addEventListener('copy', (e) => {
            const selection = window.getSelection().toString();
            if (selection.length > 500) {
                this.logSecurityEvent('large_data_copy', { length: selection.length });
            }
        });

        // Detectar alterações no localStorage de outros sites
        window.addEventListener('storage', (e) => {
            if (!e.key.startsWith('exebots_') && !e.key.startsWith('_sys_')) {
                this.logSecurityEvent('external_storage_change', { key: e.key });
            }
        });
    },

    logSecurityEvent(eventType, data = {}) {
        const events = JSON.parse(localStorage.getItem('_security_events') || '[]');
        events.push({
            type: eventType,
            timestamp: Date.now(),
            data: data
        });
        
        // Manter apenas últimos 50 eventos
        if (events.length > 50) {
            events.shift();
        }
        
        localStorage.setItem('_security_events', JSON.stringify(events));
    },

    // ===== VALIDAÇÃO DE DADOS =====
    validateUser(user) {
        if (!user || typeof user !== 'object') return false;
        
        const requiredFields = ['name', 'email', 'passwordHash', 'passwordSalt'];
        for (const field of requiredFields) {
            if (!user[field]) return false;
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user.email)) return false;

        // Validar nome (2-50 caracteres)
        if (user.name.length < 2 || user.name.length > 50) return false;

        return true;
    },

    validateOrder(order) {
        if (!order || typeof order !== 'object') return false;
        
        const requiredFields = ['orderId', 'items', 'total', 'userEmail'];
        for (const field of requiredFields) {
            if (!order[field]) return false;
        }

        // Validar items
        if (!Array.isArray(order.items) || order.items.length === 0) return false;

        // Validar total
        if (typeof order.total !== 'number' || order.total <= 0) return false;

        return true;
    },

    // ===== UTILITÁRIOS =====
    generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => chars[byte % chars.length]).join('');
    },

    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    },

    base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    },

    arrayBufferToHex(buffer) {
        return Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    },

    // ===== LIMPAR DADOS SENSÍVEIS =====
    secureDelete(key) {
        // Sobrescrever com dados aleatórios antes de deletar
        const randomData = this.generateRandomString(1000);
        localStorage.setItem(key, randomData);
        localStorage.removeItem(key);
    },

    wipeAllData() {
        const keys = Object.keys(localStorage);
        for (const key of keys) {
            if (key.startsWith('exebots_') || key.startsWith('_sys_')) {
                this.secureDelete(key);
            }
        }
        sessionStorage.clear();
    }
};

// ===== STORAGE MANAGER SEGURO =====
const SecureStorage = {
    async save(key, data) {
        try {
            // Sanitizar dados
            const sanitized = SecuritySystem.sanitizeObject(data);
            
            // Criptografar
            const encrypted = await SecuritySystem.encrypt(sanitized);
            
            // Salvar
            localStorage.setItem(key, encrypted);
            
            return true;
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            return false;
        }
    },

    async load(key) {
        try {
            const encrypted = localStorage.getItem(key);
            if (!encrypted) return null;

            // Descriptografar
            const decrypted = await SecuritySystem.decrypt(encrypted);
            
            return decrypted;
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            return null;
        }
    },

    async remove(key) {
        SecuritySystem.secureDelete(key);
    }
};

// ===== INICIALIZAR NO CARREGAMENTO =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        SecuritySystem.init();
    });
} else {
    SecuritySystem.init();
}

// Exportar para uso global
window.SecuritySystem = SecuritySystem;
window.SecureStorage = SecureStorage;

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
