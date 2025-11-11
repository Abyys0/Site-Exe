# 🔒 SISTEMA DE SEGURANÇA - EXE BOTS

## ⚠️ IMPORTANTE - LEIA ANTES DE HOSPEDAR

Este site possui um **sistema completo de segurança** implementado para proteger os dados dos clientes, mesmo sendo hospedado em repositório público no GitHub.

## 🛡️ RECURSOS DE SEGURANÇA IMPLEMENTADOS

### 1. **Criptografia AES-256-GCM**
- ✅ Todos os dados sensíveis são criptografados usando AES-256-GCM
- ✅ Chave mestra única por dispositivo (derivada de fingerprint)
- ✅ IV (Initialization Vector) aleatório para cada criptografia
- ✅ Impossível descriptografar sem acesso ao navegador específico

### 2. **Hash de Senhas (PBKDF2)**
- ✅ Senhas NUNCA são armazenadas em texto puro
- ✅ PBKDF2 com 100.000 iterações + SHA-256
- ✅ Salt único e aleatório por usuário
- ✅ Proteção contra rainbow tables e brute force

### 3. **Device Fingerprinting**
- ✅ Cada dispositivo gera uma chave única
- ✅ Dados criptografados não podem ser descriptografados em outro navegador
- ✅ Proteção contra roubo de localStorage

### 4. **Sanitização de Dados**
- ✅ Todos os inputs são sanitizados contra XSS
- ✅ Remoção automática de scripts maliciosos
- ✅ Validação de email, nome e outros campos

### 5. **Rate Limiting**
- ✅ Limite de tentativas de login (5 tentativas / 15 minutos)
- ✅ Limite de cadastros (3 tentativas / 15 minutos)
- ✅ Limite de pagamentos (10 tentativas / 5 minutos)
- ✅ Proteção contra ataques de força bruta

### 6. **Proteção CSRF**
- ✅ Token CSRF único por sessão
- ✅ Validação em todas as operações sensíveis

### 7. **Sessões Seguras**
- ✅ Sessões criptografadas com expiração (24 horas)
- ✅ Tokens de sessão aleatórios
- ✅ Limpeza automática de sessões expiradas

### 8. **Monitoramento de Segurança**
- ✅ Detecção de DevTools aberto
- ✅ Log de eventos de segurança
- ✅ Detecção de cópia de dados sensíveis
- ✅ Monitoramento de alterações no localStorage

### 9. **Proteção de Pedidos**
- ✅ Todos os pedidos são criptografados
- ✅ Validação de dados antes de processar
- ✅ IDs de pedido únicos e aleatórios

### 10. **Content Security Policy (CSP)**
- ✅ Headers de segurança configurados
- ✅ Prevenção de XSS e injeção de código
- ✅ Whitelist de domínios confiáveis

## 🔐 O QUE ESTÁ PROTEGIDO

### Dados Criptografados:
- ✅ Informações de usuários (nome, email, hash de senha)
- ✅ Sessões de login
- ✅ Carrinho de compras
- ✅ Histórico de pedidos
- ✅ Detalhes de pagamento

### Dados NÃO Armazenados:
- ❌ Senhas em texto puro
- ❌ Números de cartão de crédito (processado via PayPal)
- ❌ Dados bancários (PIX gerado em tempo real)

## 📦 ARQUIVOS DO SISTEMA DE SEGURANÇA

- `encryption.js` - Sistema de criptografia AES-256-GCM
- `security.js` - Proteções básicas e CSP
- `auth.js` - Autenticação segura com hash PBKDF2
- `cart.js` - Carrinho com dados criptografados
- `checkout.js` - Processamento seguro de pagamentos

## 🌐 POR QUE É SEGURO HOSPEDAR EM REPOSITÓRIO PÚBLICO?

**Mesmo que alguém clone o repositório e veja todo o código-fonte:**

1. ✅ **Dados criptografados são inúteis** - A chave de criptografia é única por dispositivo
2. ✅ **Senhas são hasheadas** - Impossível reverter hash PBKDF2 com 100.000 iterações
3. ✅ **Fingerprint protege dados** - Dados só podem ser acessados no navegador que os criou
4. ✅ **Sem backend** - Não há servidor para atacar
5. ✅ **Criptografia client-side** - Tudo acontece no navegador do cliente

### O que um atacante vê no código:
```javascript
const encrypted = "Tk5xYXJ3MzR3ZjM0cmYzNHJmMzRyZjM0cmYzNHJmMzRyZg==";
// ☝️ Dados criptografados - IMPOSSÍVEL descriptografar sem a chave do dispositivo
```

## 🚀 CONFIGURAÇÕES NECESSÁRIAS

### 1. Chave PIX (checkout.js, linha 8):
```javascript
pixKey: 'sua-chave-pix-real'
```

### 2. PayPal Client ID:
- **checkout.html** (linha ~347): Substituir `SEU_CLIENT_ID_AQUI`
- **checkout.js** (linha 14): Substituir `SEU_CLIENT_ID_AQUI`
- Usar Client ID do modo **LIVE** (não Sandbox) em produção

## 🛠️ COMANDOS ÚTEIS (Console do Navegador)

```javascript
// Limpar TODOS os dados com segurança
SecuritySystem.wipeAllData();

// Ver logs de segurança
JSON.parse(localStorage.getItem('_security_events'));

// Ver fingerprint do dispositivo
await SecuritySystem.getDeviceFingerprint();

// Ver sessão atual (descriptografada)
await SecureStorage.load('exebots_session');
```

## 📊 TABELA DE SEGURANÇA

| Recurso | Tecnologia | Status |
|---------|-----------|--------|
| Criptografia de Dados | AES-256-GCM | ✅ Ativo |
| Hash de Senha | PBKDF2 (100k iter) | ✅ Ativo |
| Device Fingerprint | Custom Algorithm | ✅ Ativo |
| Rate Limiting | Time-based | ✅ Ativo |
| XSS Protection | Input Sanitization | ✅ Ativo |
| CSRF Protection | Session Tokens | ✅ Ativo |
| Session Expiry | 24 horas | ✅ Ativo |
| Security Monitoring | Event Logging | ✅ Ativo |

## ⚡ PERFORMANCE

- ✅ Criptografia assíncrona (não bloqueia UI)
- ✅ Web Crypto API nativa (hardware-accelerated)
- ✅ Cache de chave mestra em memória
- ✅ Operações otimizadas

## 🔧 TROUBLESHOOTING

| Problema | Causa | Solução |
|----------|-------|---------|
| "Erro ao descriptografar" | Dados de outro dispositivo | Limpar localStorage e recadastrar |
| "Sessão expirada" | 24h de validade excedida | Fazer login novamente |
| "Muitas tentativas" | Rate limit ativado | Aguardar tempo indicado (5-15min) |
| Carrinho vazio após reload | Sistema de segurança carregando | Aguardar 500ms e recarregar |

## 🎯 CONCLUSÃO

**Este site é 100% SEGURO para repositório público do GitHub porque:**

1. ✅ Criptografia AES-256-GCM (padrão militar)
2. ✅ Chave única por dispositivo (fingerprinting)
3. ✅ Senhas NUNCA em texto puro (PBKDF2)
4. ✅ Múltiplas camadas de proteção
5. ✅ Dados inúteis sem chave do dispositivo

**Mesmo com acesso total ao código-fonte, os dados dos clientes permanecem protegidos e inacessíveis.**

---

**🔒 Desenvolvido com segurança por EXE BOTS**
**Sistema de Segurança v1.0 - AES-256-GCM + PBKDF2**
