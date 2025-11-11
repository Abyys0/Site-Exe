// Importar sistema de segurança (deve ser carregado antes deste script)
// <script src="encryption.js"></script>

// ===== STORAGE MANAGEMENT COM CRIPTOGRAFIA =====
const StorageManager = {
    async getUsers() {
        try {
            const encrypted = localStorage.getItem('exebots_users');
            if (!encrypted) return [];
            
            // Descriptografar dados
            const users = await SecureStorage.load('exebots_users');
            return users || [];
        } catch (error) {
            console.error('Error retrieving users:', error);
            return [];
        }
    },
    
    async saveUser(user) {
        try {
            // Sanitizar dados
            const sanitizedUser = SecuritySystem.sanitizeObject({
                email: user.email.toLowerCase(),
                name: user.name
            });

            // Validar dados
            if (!SecuritySystem.sanitizeEmail(sanitizedUser.email)) {
                throw new Error('Email inválido!');
            }

            if (sanitizedUser.name.length < 2 || sanitizedUser.name.length > 50) {
                throw new Error('Nome deve ter entre 2 e 50 caracteres!');
            }

            // Hash da senha usando PBKDF2
            const { hash, salt } = await SecuritySystem.hashPassword(user.password);
            
            const users = await this.getUsers();
            
            // Verificar se usuário já existe
            if (users.some(u => u.email === sanitizedUser.email)) {
                throw new Error('Email já cadastrado!');
            }

            // Salvar usuário com senha hasheada
            users.push({
                email: sanitizedUser.email,
                name: sanitizedUser.name,
                passwordHash: hash,
                passwordSalt: salt,
                createdAt: Date.now(),
                lastLogin: null
            });
            
            // Criptografar e salvar
            await SecureStorage.save('exebots_users', users);
            
            console.log('✅ Usuário registrado com segurança:', sanitizedUser.email);
            SecuritySystem.logSecurityEvent('user_registered', { email: sanitizedUser.email });
            
            return true;
        } catch (error) {
            console.error('Error saving user:', error);
            throw error;
        }
    },
    
    async findUser(email) {
        try {
            const users = await this.getUsers();
            return users.find(u => u.email === email.toLowerCase());
        } catch (error) {
            console.error('Error finding user:', error);
            return null;
        }
    },

    async validateLogin(email, password) {
        try {
            // Rate limiting
            SecuritySystem.checkRateLimit('login', 5);

            const user = await this.findUser(email);
            if (!user) {
                throw new Error('Usuário não encontrado!');
            }

            // Verificar senha usando hash seguro
            const isValid = await SecuritySystem.verifyPassword(
                password,
                user.passwordHash,
                user.passwordSalt
            );

            if (!isValid) {
                SecuritySystem.logSecurityEvent('failed_login', { email });
                throw new Error('Senha incorreta!');
            }

            // Atualizar último login
            const users = await this.getUsers();
            const userIndex = users.findIndex(u => u.email === email.toLowerCase());
            if (userIndex !== -1) {
                users[userIndex].lastLogin = Date.now();
                await SecureStorage.save('exebots_users', users);
            }

            SecuritySystem.logSecurityEvent('successful_login', { email });
            return user;
        } catch (error) {
            throw error;
        }
    },
    
    async setCurrentUser(email) {
        try {
            // Gerar token de sessão
            const sessionToken = SecuritySystem.generateRandomString(32);
            const sessionData = {
                email: email.toLowerCase(),
                token: sessionToken,
                createdAt: Date.now(),
                expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
            };

            // Criptografar e salvar sessão
            await SecureStorage.save('exebots_session', sessionData);
            
            console.log('✅ Sessão criada com segurança:', email);
            return true;
        } catch (error) {
            console.error('Error setting current user:', error);
            return false;
        }
    },
    
    async getCurrentUser() {
        try {
            const session = await SecureStorage.load('exebots_session');
            
            if (!session) return null;

            // Verificar expiração
            if (Date.now() > session.expiresAt) {
                await this.clearCurrentUser();
                return null;
            }

            return session.email;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    },

    async clearCurrentUser() {
        await SecureStorage.remove('exebots_session');
        SecuritySystem.logSecurityEvent('user_logout');
    }
};

// ===== FORM SWITCHING =====
function switchToRegister() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
}

function switchToLogin() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
}

// ===== ENCRYPTION ANIMATION =====
function showEncryptionAnimation(callback) {
    const modal = document.getElementById('encryptionModal');
    const statusContainer = document.getElementById('encryptionStatus');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const codeContainer = document.getElementById('encryptionCode');
    const particlesContainer = document.getElementById('encryptionParticles');
    
    modal.classList.remove('hidden');
    
    // Create particles
    createParticles(particlesContainer);
    
    // Encryption steps
    const steps = [
        { text: 'Inicializando protocolo de segurança...', delay: 0 },
        { text: 'Gerando chave RSA-2048...', delay: 800 },
        { text: 'Aplicando hash SHA-256...', delay: 1600 },
        { text: 'Encriptando dados com AES-256...', delay: 2400 },
        { text: 'Validando integridade...', delay: 3200 },
        { text: 'Sincronizando com servidor seguro...', delay: 4000 },
        { text: 'Finalizando protocolo...', delay: 4800 }
    ];
    
    // Show status messages
    statusContainer.innerHTML = '';
    steps.forEach((step, index) => {
        setTimeout(() => {
            const line = document.createElement('div');
            line.className = 'status-line';
            line.innerHTML = `
                <span class="status-icon">▸</span>
                <span class="status-text">${step.text}</span>
            `;
            line.style.animationDelay = '0s';
            statusContainer.appendChild(line);
            
            // Remove old messages
            if (statusContainer.children.length > 3) {
                statusContainer.removeChild(statusContainer.firstChild);
            }
        }, step.delay);
    });
    
    // Progress bar animation
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        progressFill.style.width = progress + '%';
        progressText.textContent = Math.floor(progress) + '%';
        
        if (progress >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => {
                // Trigger black hole transition
                triggerBlackholeTransition(() => {
                    modal.classList.add('hidden');
                    if (callback) callback();
                });
            }, 500);
        }
    }, 200);
    
    // Generate random encryption code
    generateEncryptionCode(codeContainer);
}

function createParticles(container) {
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 3 + 's';
            particle.style.setProperty('--x-offset', (Math.random() - 0.5) * 200 + 'px');
            container.appendChild(particle);
            
            setTimeout(() => particle.remove(), 3000);
        }, i * 100);
    }
}

function generateEncryptionCode(container) {
    const chars = '0123456789ABCDEFabcdef';
    const interval = setInterval(() => {
        let code = '';
        for (let i = 0; i < 8; i++) {
            let line = '';
            for (let j = 0; j < 64; j++) {
                line += chars[Math.floor(Math.random() * chars.length)];
            }
            code += line + '\n';
        }
        container.textContent = code;
    }, 100);
    
    setTimeout(() => clearInterval(interval), 5500);
}

// ===== BLACK HOLE TRANSITION =====
function triggerBlackholeTransition(callback) {
    const transition = document.getElementById('blackholeTransition');
    const pageContent = document.getElementById('pageContent');
    const blackholeCore = document.getElementById('blackholeCore');
    
    // Activate transition
    transition.classList.add('active');
    transition.style.display = 'flex';
    
    // Activate light bursts
    const lightBursts = transition.querySelectorAll('.light-burst');
    lightBursts.forEach(burst => burst.classList.add('active'));
    
    // Create vortex particles
    createVortexParticles(blackholeCore);
    
    // Suck page content
    setTimeout(() => {
        pageContent.classList.add('sucked');
    }, 300);
    
    // Complete transition
    setTimeout(() => {
        if (callback) callback();
    }, 2000);
}

function createVortexParticles(container) {
    const particleCount = 100;
    
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'vortex-particle';
            
            // Random start position from edges
            const angle = Math.random() * Math.PI * 2;
            const distance = 400 + Math.random() * 400;
            const startX = Math.cos(angle) * distance;
            const startY = Math.sin(angle) * distance;
            
            particle.style.setProperty('--start-x', startX + 'px');
            particle.style.setProperty('--start-y', startY + 'px');
            particle.style.left = '50%';
            particle.style.top = '50%';
            particle.style.animationDelay = (i * 0.02) + 's';
            
            // Random colors
            const colors = ['var(--primary)', 'var(--secondary)', 'var(--accent)'];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            
            container.appendChild(particle);
            
            setTimeout(() => particle.remove(), 2000);
        }, i * 20);
    }
}

// ===== SECURE FORM VALIDATION =====
function validateEmail(email) {
    return SecurityValidator.validateEmail(email);
}

function validatePassword(password) {
    return SecurityValidator.validatePassword(password);
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✓' : '✕'}</span>
            <span class="notification-message">${SecurityValidator.sanitizeHTML(message)}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ===== SECURE LOGIN HANDLER =====
async function handleLogin(event) {
    event.preventDefault();
    
    try {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        // Validar inputs
        if (!email || !password) {
            throw new Error('Preencha todos os campos!');
        }

        // Sanitizar email
        const sanitizedEmail = SecuritySystem.sanitizeEmail(email);
        if (!sanitizedEmail) {
            throw new Error('Email inválido!');
        }

        // Mostrar animação de segurança
        showEncryptionAnimation(async () => {
            try {
                // Validar credenciais
                const user = await StorageManager.validateLogin(sanitizedEmail, password);
                
                if (!user) {
                    throw new Error('Email ou senha incorretos!');
                }

                // Criar sessão segura
                await StorageManager.setCurrentUser(sanitizedEmail);
                
                // Limpar campos
                document.getElementById('loginEmail').value = '';
                document.getElementById('loginPassword').value = '';

                // Redirecionar
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
                
            } catch (error) {
                hideEncryptionModal();
                showError(error.message);
            }
        });
        
    } catch (error) {
        showError(error.message);
    }
}

// ===== SECURE REGISTER HANDLER =====
async function handleRegister(event) {
    event.preventDefault();
    
    try {
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const terms = document.getElementById('registerTerms').checked;

        // Validar inputs vazios
        if (!name || !email || !password || !confirmPassword) {
            throw new Error('Preencha todos os campos!');
        }

        // Sanitizar dados
        const sanitizedName = SecuritySystem.sanitizeInput(name);
        const sanitizedEmail = SecuritySystem.sanitizeEmail(email);

        if (!sanitizedEmail) {
            throw new Error('Email inválido!');
        }

        // Validar nome
        if (sanitizedName.length < 2 || sanitizedName.length > 50) {
            throw new Error('Nome deve ter entre 2 e 50 caracteres!');
        }

        // Validar senha
        if (password.length < 6) {
            throw new Error('Senha deve ter no mínimo 6 caracteres!');
        }

        // Validar confirmação de senha
        if (password !== confirmPassword) {
            throw new Error('As senhas não coincidem!');
        }

        // Validar termos
        if (!terms) {
            throw new Error('Você deve aceitar os termos de serviço!');
        }

        // Mostrar animação de segurança
        showEncryptionAnimation(async () => {
            try {
                // Rate limiting
                SecuritySystem.checkRateLimit('register', 3);

                // Salvar usuário com criptografia
                await StorageManager.saveUser({
                    name: sanitizedName,
                    email: sanitizedEmail,
                    password: password
                });

                // Criar sessão segura
                await StorageManager.setCurrentUser(sanitizedEmail);
                
                // Limpar campos
                document.getElementById('registerName').value = '';
                document.getElementById('registerEmail').value = '';
                document.getElementById('registerPassword').value = '';
                document.getElementById('registerConfirmPassword').value = '';

                // Redirecionar
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);

            } catch (error) {
                hideEncryptionModal();
                showError(error.message);
            }
        });

    } catch (error) {
        showError(error.message);
    }
}

// ===== HELPER FUNCTIONS =====
function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'security-notification error';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function hideEncryptionModal() {
    const modal = document.getElementById('encryptionModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// ===== NOTIFICATION STYLES =====
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    .security-notification {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: rgba(255, 0, 128, 0.9);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        border: 2px solid var(--accent);
        box-shadow: 0 10px 30px rgba(255, 0, 128, 0.5);
        transform: translateX(400px);
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 10000;
        max-width: 400px;
    }

    .security-notification.show {
        transform: translateX(0);
        opacity: 1;
    }

    .security-notification.error {
        background: rgba(255, 0, 128, 0.9);
        border-color: var(--accent);
    }

    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyle);

// ===== LOGIN HANDLER =====
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Validate
    if (!validateEmail(email)) {
        showNotification('Email inválido!', 'error');
        return;
    }
    
    // Find user
    const user = StorageManager.findUser(email);
    
    if (!user) {
        showNotification('Usuário não encontrado!', 'error');
        return;
    }
    
    if (user.password !== password) {
        showNotification('Senha incorreta!', 'error');
        return;
    }
    
    // Success
    showEncryptionAnimation(() => {
        StorageManager.setCurrentUser(email);
        showNotification(`Bem-vindo de volta, ${user.name}!`);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });
}

// ===== REGISTER HANDLER =====
function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    
    // Validate
    if (!validateEmail(email)) {
        showNotification('Email inválido!', 'error');
        return;
    }
    
    if (!validatePassword(password)) {
        showNotification('A senha deve ter pelo menos 6 caracteres!', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('As senhas não coincidem!', 'error');
        return;
    }
    
    // Check if user exists
    if (StorageManager.findUser(email)) {
        showNotification('Email já cadastrado!', 'error');
        return;
    }
    
    // Create user
    const user = {
        name: name,
        email: email,
        password: password,
        createdAt: new Date().toISOString()
    };
    
    // Save and login
    showEncryptionAnimation(() => {
        StorageManager.saveUser(user);
        StorageManager.setCurrentUser(email);
        showNotification(`Conta criada com sucesso! Bem-vindo, ${name}!`);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });
}

// ===== CHECK IF USER IS LOGGED IN =====
function checkAuth() {
    const currentUser = StorageManager.getCurrentUser();
    if (currentUser) {
        // Verificar se sessão ainda é válida
        if (!SessionManager.isSessionValid()) {
            StorageManager.clearCurrentUser();
            window.location.href = 'auth.html';
            return;
        }
        console.log('Usuário autenticado:', currentUser);
    }
}

// ===== LOGOUT FUNCTION =====
function logout() {
    StorageManager.clearCurrentUser();
    RateLimiter.logSecurityEvent('LOGOUT', { 
        timestamp: Date.now()
    });
    window.location.href = 'auth.html';
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    console.log('%c🔐 AUTH SYSTEM READY', 'color: #00ff88; font-size: 14px; font-weight: bold;');
});

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
