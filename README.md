# 🚀 EXE BOTS - Site de Vendas com Segurança Avançada

## 📋 Sobre o Projeto

Site moderno e profissional para venda de bots de automação para FiveM e MTA, com **sistema de segurança de nível empresarial** implementado.

### ✨ Características Principais

- 🎨 Design cyberpunk/hacker moderno e interativo
- 🔒 Sistema de segurança completo contra ataques
- 🌐 100% responsivo (desktop, tablet, mobile)
- ⚡ Animações avançadas e efeitos visuais
- 🔐 Autenticação segura com criptografia
- 📊 Monitoramento e logs de segurança

---

## 📁 Estrutura do Projeto

```
Exe Site/
├── index.html              # Página principal
├── auth.html               # Página de login/cadastro
├── security-test.html      # Página de testes de segurança
│
├── style.css               # Estilos da página principal
├── auth.css                # Estilos de autenticação
│
├── script.js               # Scripts principais
├── auth.js                 # Scripts de autenticação
├── security.js             # ⭐ SISTEMA DE SEGURANÇA
├── security-examples.js    # Exemplos de uso
│
├── SECURITY.md             # Documentação completa
├── README_SECURITY.md      # Guia rápido
├── SECURITY_CHECKLIST.md   # Checklist de segurança
└── README.md               # Este arquivo
```

---

## 🔒 Sistema de Segurança

### Proteções Implementadas

✅ **Proteção XSS** (Cross-Site Scripting)
- Sanitização automática de inputs
- Content Security Policy (CSP)
- Detecção de padrões maliciosos

✅ **Proteção CSRF** (Cross-Site Request Forgery)
- Tokens únicos por sessão
- Renovação automática
- Validação em todas operações

✅ **Criptografia de Dados**
- SHA-256 para senhas
- Salt único por usuário
- Storage criptografado

✅ **Rate Limiting**
- Máximo 5 tentativas / 15 min
- Bloqueio automático
- Proteção contra brute force

✅ **Validação Rigorosa**
- Email, senha, nome
- Sanitização universal
- Remoção de caracteres perigosos

✅ **Gerenciamento de Sessão**
- Timeout de 30 minutos
- Tokens seguros
- Validação contínua

✅ **Monitoramento**
- Logs de eventos
- Detecção de atividades suspeitas
- Rastreamento completo

✅ **Headers de Segurança**
- CSP, X-Frame-Options
- XSS Protection
- Referrer Policy

---

## 🚀 Como Usar

### 1. Abrir o Site

Basta abrir `index.html` em qualquer navegador moderno:
- Chrome (recomendado)
- Firefox
- Edge
- Safari

### 2. Navegar pelo Site

- **Início**: Apresentação e recursos
- **Produtos**: Bots disponíveis (status: EM BREVE)
- **Entrar**: Sistema de login/cadastro

### 3. Criar uma Conta

1. Clique em "Entrar"
2. Escolha "Criar conta"
3. Preencha os dados:
   - Nome (3-50 caracteres)
   - Email válido
   - Senha forte (8+ caracteres, maiúsculas, minúsculas, números, especiais)
4. Aceite os termos
5. Clique em "Criar Conta"
6. Aguarde a animação de encriptação
7. Aguarde o efeito de buraco negro
8. Seja redirecionado para a loja

### 4. Fazer Login

1. Clique em "Entrar"
2. Digite email e senha
3. (Opcional) Marque "Lembrar-me"
4. Clique em "Entrar"
5. Animações e redirecionamento

### 5. Testar Segurança

Abra `security-test.html` para testar:
- Proteção XSS
- Validação de email
- Força de senha
- Rate limiting
- Criptografia
- Logs de segurança
- Sessões

---

## 📊 Tecnologias Utilizadas

### Frontend
- **HTML5**: Estrutura semântica
- **CSS3**: Animações, gradientes, responsividade
- **JavaScript ES6+**: Lógica e interatividade

### Segurança
- **SHA-256**: Hash de senhas
- **XOR Encryption**: Criptografia de dados
- **CSRF Tokens**: Proteção contra ataques
- **CSP**: Content Security Policy

### Fontes
- **Orbitron**: Títulos e destaques
- **Rajdhana**: Corpo do texto

### Paleta de Cores
- **Primary**: #00ff88 (verde neon)
- **Secondary**: #00d4ff (ciano)
- **Accent**: #ff0080 (pink)
- **Background**: #0a0e27 (azul escuro)

---

## 🎨 Recursos Visuais

### Animações
- ✨ Partículas flutuantes (80 partículas)
- 🖱️ Cursor trail (15 pontos)
- ⌨️ Efeito de digitação no terminal
- 📊 Contadores animados
- 🌀 Efeito de buraco negro
- 🔐 Animação de encriptação
- 🎯 Hover e tilt effects

### Responsividade
- 📱 Mobile (480px)
- 📱 Tablet (768px)
- 💻 Desktop (1024px+)
- 🔄 Landscape mode
- ☝️ Touch optimizado

---

## ⚙️ Configurações

### Alterar Timeout de Sessão
Edite em `security.js`:
```javascript
SessionManager.sessionTimeout = 30 * 60 * 1000; // 30 minutos
```

### Alterar Limite de Tentativas
Edite em `security.js`:
```javascript
RateLimiter.config = {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000
};
```

### Desabilitar Proteção de Console
Edite em `security.js`:
```javascript
SecurityMonitor.preventDebug(); // Comente esta linha
```

---

## 📝 Dados Armazenados

### LocalStorage
- `exebots_users`: Lista de usuários (criptografado)
- `exebots_current_user`: Email do usuário logado
- `exebots_security_logs`: Logs de segurança (últimos 100)

### SessionStorage
- `exebots_csrf_token`: Token CSRF
- `exebots_session_start`: Timestamp da sessão
- `exebots_session`: Dados da sessão (criptografado)

---

## 🔍 Logs de Segurança

### Ver Logs no Console
```javascript
const logs = JSON.parse(localStorage.getItem('exebots_security_logs'));
console.table(logs);
```

### Tipos de Eventos Registrados
- `LOGIN_SUCCESS` / `LOGIN_FAILED`
- `REGISTER_SUCCESS` / `REGISTER_FAILED`
- `LOGOUT`
- `RATE_LIMIT_EXCEEDED`
- `XSS_ATTEMPT`
- `UNAUTHORIZED_SCRIPT`
- `DEBUGGER_DETECTED`
- `SUSPICIOUS_ACTIVITY`

---

## ⚠️ Avisos Importantes

### ✅ Para Desenvolvimento
Este sistema é **perfeito para desenvolvimento e demonstração**.

### ⚠️ Para Produção
**ATENÇÃO**: Para usar em produção REAL, você DEVE:

1. **Backend Obrigatório**
   - Criar API (Node.js, Python, Java, etc.)
   - Banco de dados real (PostgreSQL, MongoDB)
   - Validações no servidor

2. **Segurança Adicional**
   - HTTPS/SSL obrigatório
   - JWT para autenticação
   - Rate limiting no servidor
   - WAF (Web Application Firewall)

3. **Infraestrutura**
   - Servidor seguro
   - Backup regular
   - Monitoramento 24/7
   - CDN para performance

### ❌ NÃO Use em Produção
- LocalStorage para dados críticos
- Apenas validações frontend
- Sem backend
- Sem HTTPS

---

## 🛠️ Troubleshooting

### Problema: Sessão expira rápido
**Solução**: Aumente o timeout em `security.js`

### Problema: Muitas tentativas bloqueadas
**Solução**: Use `RateLimiter.resetAttempts()` no console

### Problema: Esqueci a senha
**Solução**: Limpe o localStorage:
```javascript
localStorage.removeItem('exebots_users');
```

### Problema: Animações lentas
**Solução**: Reduza número de partículas em `script.js`

### Problema: Erro no console
**Solução**: Certifique-se que `security.js` é carregado ANTES de `script.js` e `auth.js`

---

## 📞 Suporte

### Documentação
- `SECURITY.md` - Documentação completa de segurança
- `README_SECURITY.md` - Guia rápido de segurança
- `SECURITY_CHECKLIST.md` - Checklist completo
- `security-examples.js` - Exemplos de código

### Testes
- Abra `security-test.html` para testar funcionalidades
- Execute testes no console do navegador
- Verifique logs de segurança

### Contato
- Email: security@exebots.com
- Bug Report: [GitHub Issues]
- Suporte: [Discord]

---

## 📜 Licença

© 2025 EXE BOTS - Todos os direitos reservados

---

## 🎯 Roadmap

### Versão Atual: 1.0.0 ✅
- [x] Site completo e responsivo
- [x] Sistema de autenticação
- [x] Segurança avançada
- [x] Documentação completa

### Próximas Versões

#### v1.1.0 (Planejado)
- [ ] Sistema de recuperação de senha
- [ ] Verificação de email
- [ ] 2FA (autenticação dois fatores)
- [ ] reCAPTCHA

#### v2.0.0 (Futuro)
- [ ] Backend completo
- [ ] Banco de dados
- [ ] Pagamentos integrados
- [ ] Dashboard de usuário
- [ ] Sistema de produtos real

---

## 🏆 Agradecimentos

Desenvolvido com ❤️ e muito ☕

**Tecnologias e Inspirações:**
- OWASP Top 10 Security Guidelines
- Modern Web Development Best Practices
- Cyberpunk Design Aesthetics
- User Experience Research

---

## 🔄 Changelog

### v1.0.0 (10/01/2025)
- ✅ Lançamento inicial
- ✅ Site completo e funcional
- ✅ Sistema de segurança implementado
- ✅ Documentação completa
- ✅ Responsividade total
- ✅ Animações e efeitos
- ✅ Autenticação segura

---

**Status**: 🟢 **ATIVO E SEGURO**  
**Versão**: 1.0.0  
**Última Atualização**: 10 de Janeiro de 2025

---

**Desenvolvido por**: Felipe  
**Para**: EXE BOTS  
**Com**: Muito código, café e determinação! 💪
