// ===== SISTEMA DE AUTENTICAÇÃO RECONSTRUÍDO - EXE CODES =====

// ===== STORAGE MANAGER SIMPLIFICADO =====
const StorageManager = {
    USERS_KEY: 'execodes_users_v2',
    SESSION_KEY: 'execodes_session_v2',
    
    // Obter todos os usuários
    getUsers() {
        try {
            const data = localStorage.getItem(this.USERS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            return [];
        }
    },
    
    // Salvar usuários
    saveUsers(users) {
        try {
            localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
            return true;
        } catch (error) {
            console.error('Erro ao salvar usuários:', error);
            return false;
        }
    },
    
    // Buscar usuário por email
    findUser(email) {
        const users = this.getUsers();
        return users.find(u => u.email.toLowerCase() === email.toLowerCase());
    },
    
    // Registrar novo usuário
    registerUser(userData) {
        try {
            const users = this.getUsers();
            
            // Verificar se email já existe
            const emailLower = userData.email.toLowerCase().trim();
            const exists = users.some(u => u.email.toLowerCase() === emailLower);
            
            if (exists) {
                throw new Error('Email já cadastrado!');
            }
            
            // Criar novo usuário
            const newUser = {
                id: Date.now().toString(),
                email: emailLower,
                name: userData.name.trim(),
                password: this.hashPassword(userData.password),
                createdAt: new Date().toISOString(),
                lastLogin: null
            };
            
            users.push(newUser);
            this.saveUsers(users);
            
            console.log('✅ Usuário cadastrado com sucesso:', emailLower);
            return newUser;
        } catch (error) {
            console.error('Erro ao registrar:', error);
            throw error;
        }
    },
    
    // Validar login
    validateLogin(email, password) {
        try {
            const user = this.findUser(email);
            
            if (!user) {
                throw new Error('Usuário não encontrado!');
            }
            
            const hashedPassword = this.hashPassword(password);
            
            if (user.password !== hashedPassword) {
                throw new Error('Senha incorreta!');
            }
            
            // Atualizar último login
            user.lastLogin = new Date().toISOString();
            const users = this.getUsers();
            const index = users.findIndex(u => u.email === user.email);
            if (index !== -1) {
                users[index] = user;
                this.saveUsers(users);
            }
            
            return user;
        } catch (error) {
            console.error('Erro ao validar login:', error);
            throw error;
        }
    },
    
    // Hash simples de senha (em produção use bcrypt ou similar)
    hashPassword(password) {
        // Simple hash - em produção usar biblioteca de criptografia
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    },
    
    // Criar sessão
    createSession(user) {
        const session = {
            userId: user.id,
            email: user.email,
            name: user.name,
            createdAt: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
        };
        
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        return session;
    },
    
    // Obter sessão atual
    getSession() {
        try {
            const data = localStorage.getItem(this.SESSION_KEY);
            if (!data) return null;
            
            const session = JSON.parse(data);
            
            // Verificar se expirou
            if (Date.now() > session.expiresAt) {
                this.clearSession();
                return null;
            }
            
            return session;
        } catch (error) {
            console.error('Erro ao buscar sessão:', error);
            return null;
        }
    },
    
    // Limpar sessão
    clearSession() {
        localStorage.removeItem(this.SESSION_KEY);
    },
    
    // Verificar se usuário está logado
    isLoggedIn() {
        return this.getSession() !== null;
    }
};

// ===== FUNÇÕES DE UI =====

// Alternar entre login e cadastro
function switchToRegister() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
}

function switchToLogin() {
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
}

// Mostrar notificação
function showNotification(message, type = 'error') {
    // Remover notificação existente
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        background: type === 'error' ? '#ef4444' : '#10b981',
        color: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        zIndex: '10000',
        fontWeight: '600',
        animation: 'slideIn 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Validar email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validar senha
function validatePassword(password) {
    return password.length >= 6;
}

// ===== HANDLE REGISTER =====
function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    
    // Validações
    if (!name || name.length < 2) {
        showNotification('Nome deve ter pelo menos 2 caracteres!', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Email inválido!', 'error');
        return;
    }
    
    if (!validatePassword(password)) {
        showNotification('Senha deve ter pelo menos 6 caracteres!', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('As senhas não coincidem!', 'error');
        return;
    }
    
    try {
        // Registrar usuário
        const user = StorageManager.registerUser({
            name: name,
            email: email,
            password: password
        });
        
        // Criar sessão automaticamente
        StorageManager.createSession(user);
        
        // Mostrar sucesso
        showNotification('Cadastro realizado com sucesso!', 'success');
        
        // Redirecionar após 1 segundo
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// ===== HANDLE LOGIN =====
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    // Validações
    if (!validateEmail(email)) {
        showNotification('Email inválido!', 'error');
        return;
    }
    
    if (!password) {
        showNotification('Digite sua senha!', 'error');
        return;
    }
    
    try {
        // Validar login
        const user = StorageManager.validateLogin(email, password);
        
        // Criar sessão
        StorageManager.createSession(user);
        
        // Mostrar sucesso
        showNotification('Login realizado com sucesso!', 'success');
        
        // Redirecionar após 1 segundo
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// ===== LOGOUT =====
function logout() {
    StorageManager.clearSession();
    showNotification('Logout realizado!', 'success');
    setTimeout(() => {
        window.location.href = 'auth.html';
    }, 1000);
}

// ===== VERIFICAR AUTENTICAÇÃO =====
function checkAuth() {
    // Não executar na página de auth
    if (window.location.pathname.includes('auth.html')) {
        return;
    }
    
    const session = StorageManager.getSession();
    
    if (!session) {
        // Não logado - redirecionar para auth (exceto se já estiver lá)
        window.location.href = 'auth.html';
        return;
    }
    
    // Atualizar UI com informações do usuário
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    const guestButtons = document.getElementById('guestButtons');
    
    if (userInfo && userName) {
        userName.textContent = `Olá, ${session.name}`;
        userInfo.style.display = 'flex';
        if (guestButtons) {
            guestButtons.style.display = 'none';
        }
    }
}

// ===== ADICIONAR ESTILOS DE ANIMAÇÃO =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .hidden {
        display: none !important;
    }
`;
document.head.appendChild(style);

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação (se não estiver na página auth)
    checkAuth();
    
    console.log('%c🔐 Sistema de Autenticação EXE CODES Ativo', 'color: #3b82f6; font-size: 14px; font-weight: bold;');
    console.log('%c✓ Sistema reconstruído e otimizado', 'color: #10b981; font-size: 12px;');
});

// ===== FUNÇÕES GLOBAIS =====
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
window.switchToRegister = switchToRegister;
window.switchToLogin = switchToLogin;
window.logout = logout;
window.StorageManager = StorageManager;
