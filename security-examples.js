// ==========================================
// EXEMPLOS DE USO - SISTEMA DE SEGURANÇA
// ==========================================

// ===== EXEMPLO 1: VALIDAR EMAIL =====
const email = "usuario@exemplo.com";
const isValid = SecurityValidator.validateEmail(email);
console.log(isValid); // true ou false

// ===== EXEMPLO 2: SANITIZAR INPUT =====
const userInput = "<script>alert('XSS')</script>Olá";
const sanitized = SecurityValidator.sanitizeInput(userInput);
console.log(sanitized); // "Olá" (script removido)

// ===== EXEMPLO 3: VALIDAR SENHA =====
const password = "MinhaSenh@123";
const isStrong = SecurityValidator.validatePassword(password);
console.log(isStrong); // true (atende todos requisitos)

// Senhas inválidas:
SecurityValidator.validatePassword("123456"); // false (muito simples)
SecurityValidator.validatePassword("senha"); // false (sem maiúsculas/números)
SecurityValidator.validatePassword("SENHA123"); // false (sem minúsculas)

// ===== EXEMPLO 4: CRIAR HASH DE SENHA =====
async function hashUserPassword() {
    const password = "MinhaSenh@123";
    const salt = CryptoModule.generateSalt();
    const hash = await CryptoModule.hashPassword(password, salt);
    
    console.log('Salt:', salt);
    console.log('Hash:', hash);
    
    // Armazenar salt e hash no banco de dados
    return { salt, hash };
}

// ===== EXEMPLO 5: VERIFICAR TENTATIVAS DE LOGIN =====
try {
    // Isso será registrado e contado
    RateLimiter.recordAttempt('login');
    
    // Fazer login...
    const success = await fazerLogin();
    
    if (success) {
        // Resetar contador após sucesso
        RateLimiter.resetAttempts();
    }
} catch (error) {
    // Erro: "Muitas tentativas! Conta temporariamente bloqueada."
    console.error(error.message);
}

// ===== EXEMPLO 6: VERIFICAR SE ESTÁ BLOQUEADO =====
if (RateLimiter.isBlocked()) {
    alert('Você foi bloqueado temporariamente. Tente novamente mais tarde.');
} else {
    // Continuar com o login
}

// ===== EXEMPLO 7: GERAR TOKEN CSRF =====
const csrfToken = SessionManager.getCSRFToken();
console.log('CSRF Token:', csrfToken);

// Usar em requisições:
fetch('/api/endpoint', {
    method: 'POST',
    headers: {
        'X-CSRF-Token': csrfToken
    }
});

// ===== EXEMPLO 8: VALIDAR SESSÃO =====
if (SessionManager.isSessionValid()) {
    console.log('Sessão válida - usuário autenticado');
} else {
    console.log('Sessão expirada - redirecionar para login');
    window.location.href = 'auth.html';
}

// ===== EXEMPLO 9: CRIAR SESSÃO SEGURA =====
const sessionData = {
    email: 'usuario@exemplo.com',
    name: 'João Silva'
};

const sessionToken = SessionManager.createSecureSession(sessionData);
console.log('Session Token:', sessionToken);

// ===== EXEMPLO 10: DETECTAR XSS =====
const inputs = [
    "Texto normal",
    "<script>alert('XSS')</script>",
    "javascript:alert(1)",
    "<img src=x onerror=alert(1)>"
];

inputs.forEach(input => {
    const hasXSS = XSSProtection.detectXSS(input);
    console.log(`"${input}" tem XSS?`, hasXSS);
});

// ===== EXEMPLO 11: LIMPAR XSS =====
const dangerousInput = "<script>alert('XSS')</script>Olá <b>Mundo</b>";
const cleanInput = XSSProtection.cleanXSS(dangerousInput);
console.log(cleanInput); // "Olá Mundo" (tags removidas)

// ===== EXEMPLO 12: SANITIZAR FORMULÁRIO =====
try {
    const formData = {
        name: "João Silva",
        email: "joao@exemplo.com",
        message: "Mensagem normal"
    };
    
    const sanitized = XSSProtection.sanitizeForm(formData);
    console.log('Dados sanitizados:', sanitized);
    
} catch (error) {
    // Se detectar XSS, lança erro
    console.error('XSS detectado!', error.message);
}

// ===== EXEMPLO 13: ARMAZENAR DADOS CRIPTOGRAFADOS =====
SecureStorage.init();

// Salvar
const userData = { name: 'João', email: 'joao@exemplo.com' };
SecureStorage.setItem('user_data', userData);

// Recuperar
const retrieved = SecureStorage.getItem('user_data');
console.log(retrieved); // { name: 'João', email: 'joao@exemplo.com' }

// ===== EXEMPLO 14: CRIPTOGRAFAR/DESCRIPTOGRAFAR =====
const data = { secret: 'Informação confidencial' };
const key = 'minha-chave-secreta';

// Criptografar
const encrypted = CryptoModule.encryptData(data, key);
console.log('Encrypted:', encrypted);

// Descriptografar
const decrypted = CryptoModule.decryptData(encrypted, key);
console.log('Decrypted:', decrypted);

// ===== EXEMPLO 15: VER LOGS DE SEGURANÇA =====
const logs = JSON.parse(localStorage.getItem('exebots_security_logs') || '[]');
console.table(logs);

// Filtrar por tipo
const loginAttempts = logs.filter(log => log.type === 'LOGIN_FAILED');
console.log('Tentativas de login falhadas:', loginAttempts.length);

// ===== EXEMPLO 16: REGISTRAR EVENTO CUSTOMIZADO =====
RateLimiter.logSecurityEvent('CUSTOM_EVENT', {
    action: 'user_action',
    data: 'Informação relevante',
    timestamp: Date.now()
});

// ===== EXEMPLO 17: VALIDAR FORMULÁRIO COMPLETO =====
async function handleFormSubmit(formData) {
    try {
        // 1. Verificar rate limiting
        if (RateLimiter.isBlocked()) {
            throw new Error('Muitas tentativas!');
        }
        
        // 2. Registrar tentativa
        RateLimiter.recordAttempt('form_submit');
        
        // 3. Validar CSRF
        const csrfToken = SessionManager.getCSRFToken();
        if (!csrfToken) {
            throw new Error('Token CSRF inválido!');
        }
        
        // 4. Detectar XSS
        const sanitizedData = XSSProtection.sanitizeForm(formData);
        
        // 5. Validar email
        if (!SecurityValidator.validateEmail(sanitizedData.email)) {
            throw new Error('Email inválido!');
        }
        
        // 6. Validar senha
        if (!SecurityValidator.validatePassword(sanitizedData.password)) {
            throw new Error('Senha fraca!');
        }
        
        // 7. Criar hash da senha
        const salt = CryptoModule.generateSalt();
        const hashedPassword = await CryptoModule.hashPassword(
            sanitizedData.password, 
            salt
        );
        
        // 8. Armazenar com segurança
        const userData = {
            email: sanitizedData.email,
            password: hashedPassword,
            salt: salt,
            createdAt: Date.now()
        };
        
        SecureStorage.setItem('user', userData);
        
        // 9. Criar sessão
        SessionManager.createSecureSession(userData);
        
        // 10. Reset tentativas
        RateLimiter.resetAttempts();
        
        // 11. Log de sucesso
        RateLimiter.logSecurityEvent('FORM_SUBMIT_SUCCESS', {
            email: userData.email
        });
        
        return true;
        
    } catch (error) {
        // Log de erro
        RateLimiter.logSecurityEvent('FORM_SUBMIT_FAILED', {
            error: error.message
        });
        throw error;
    }
}

// ===== EXEMPLO 18: VERIFICAR FORÇA DA SENHA =====
function checkPasswordStrength(password) {
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    
    const score = Object.values(checks).filter(v => v).length;
    
    if (score === 5) return 'strong';
    if (score >= 3) return 'medium';
    return 'weak';
}

const strength = checkPasswordStrength("MinhaSenh@123");
console.log('Força da senha:', strength); // "strong"

// ===== EXEMPLO 19: IMPLEMENTAR LOGOUT SEGURO =====
function secureLogout() {
    // 1. Limpar dados do usuário
    localStorage.removeItem('exebots_current_user');
    
    // 2. Destruir sessão
    SessionManager.destroySession();
    
    // 3. Limpar storage seguro (opcional)
    // SecureStorage.clear();
    
    // 4. Log do evento
    RateLimiter.logSecurityEvent('LOGOUT', {
        timestamp: Date.now()
    });
    
    // 5. Redirecionar
    window.location.href = 'auth.html';
}

// ===== EXEMPLO 20: MONITORAR ATIVIDADE DO USUÁRIO =====
let activityTimeout;

function resetActivityTimer() {
    clearTimeout(activityTimeout);
    
    activityTimeout = setTimeout(() => {
        // Após 30 minutos de inatividade
        console.log('Usuário inativo - fazendo logout...');
        secureLogout();
    }, 30 * 60 * 1000);
}

// Resetar em qualquer atividade
document.addEventListener('mousemove', resetActivityTimer);
document.addEventListener('keypress', resetActivityTimer);
document.addEventListener('click', resetActivityTimer);

// ===== EXEMPLO 21: INICIALIZAÇÃO COMPLETA =====
document.addEventListener('DOMContentLoaded', function() {
    // 1. Inicializar segurança
    initSecurity();
    
    // 2. Inicializar storage seguro
    SecureStorage.init();
    
    // 3. Verificar sessão
    if (!SessionManager.isSessionValid()) {
        console.log('Sessão inválida - redirecionando...');
        window.location.href = 'auth.html';
        return;
    }
    
    // 4. Verificar autenticação
    const currentUser = localStorage.getItem('exebots_current_user');
    if (currentUser) {
        console.log('Usuário autenticado:', currentUser);
    }
    
    // 5. Adicionar listeners
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            await handleFormSubmit(data);
        });
    });
    
    console.log('✅ Sistema de segurança inicializado!');
});

// ===== EXEMPLO 22: TESTAR SEGURANÇA =====
function runSecurityTests() {
    console.log('🧪 Executando testes de segurança...\n');
    
    // Teste 1: Validação de Email
    console.log('Teste 1: Validação de Email');
    console.assert(SecurityValidator.validateEmail('teste@exemplo.com'), '✅ Email válido');
    console.assert(!SecurityValidator.validateEmail('email_invalido'), '✅ Email inválido detectado');
    
    // Teste 2: Sanitização
    console.log('\nTeste 2: Sanitização');
    const xss = "<script>alert('XSS')</script>";
    console.assert(!SecurityValidator.sanitizeInput(xss).includes('script'), '✅ XSS removido');
    
    // Teste 3: Validação de Senha
    console.log('\nTeste 3: Validação de Senha');
    console.assert(SecurityValidator.validatePassword('Senh@123'), '✅ Senha forte aceita');
    console.assert(!SecurityValidator.validatePassword('123'), '✅ Senha fraca rejeitada');
    
    // Teste 4: Detecção de XSS
    console.log('\nTeste 4: Detecção de XSS');
    console.assert(XSSProtection.detectXSS(xss), '✅ XSS detectado');
    console.assert(!XSSProtection.detectXSS('texto normal'), '✅ Texto normal aceito');
    
    console.log('\n✅ Todos os testes passaram!');
}

// Executar testes (descomente para testar)
// runSecurityTests();
