// ==========================================
// SISTEMA DE CHECKOUT - EXE BOTS
// ==========================================

// ===== CONFIGURAÇÕES =====
const CheckoutConfig = {
    // ADICIONE SUA CHAVE PIX AQUI
    pixKey: '5483c6b6-9c91-45b9-bbcc-dc680d9204f9', // Pode ser email, CPF, CNPJ, telefone ou chave aleatória
    pixKeyType: 'Chave aleatoria', // 'email', 'cpf', 'cnpj', 'phone', 'random'
    pixName: 'Felipe Gomes',
    pixCity: 'Sao Paulo',
    
    // PayPal Client ID
    paypalClientId: 'AYg0Aoko_Dmj3xmmO091kleua6wThmV0PlrQTqdO8J_xwoyRhjNlKJQ2ZfeuTxrByrt-EMX6D5dG5ffJ'
};

// ===== ESTADO DO CHECKOUT =====
let selectedPaymentMethod = null;
let orderData = null;
let qrScanner = null;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔄 Iniciando checkout...');
    
    // Verificar se usuário está logado usando o novo sistema
    if (!window.StorageManager) {
        console.error('❌ StorageManager não carregado!');
        alert('Erro ao carregar página. Por favor, recarregue.');
        return;
    }
    
    console.log('✅ StorageManager disponível');
    
    const session = StorageManager.getSession();
    console.log('Sessão encontrada:', session);
    
    if (!session) {
        console.error('❌ Nenhuma sessão ativa');
        alert('Por favor, faça login para continuar com a compra.');
        window.location.href = 'auth.html';
        return;
    }
    
    console.log('✅ Usuário autenticado:', session.name);

    await loadOrder();
    await loadUserInfo();
});

// ===== CARREGAR PEDIDO =====
async function loadOrder() {
    try {
        // Tentar carregar do SecureStorage (sistema antigo) ou localStorage direto
        let cart = [];
        
        if (window.SecureStorage) {
            cart = await SecureStorage.load('exebots_cart') || [];
        }
        
        // Se não encontrou no SecureStorage, tentar no localStorage direto
        if (cart.length === 0) {
            const localCart = localStorage.getItem('exebots_cart');
            if (localCart) {
                try {
                    cart = JSON.parse(localCart);
                } catch (e) {
                    console.error('Erro ao parsear carrinho do localStorage:', e);
                }
            }
        }
        
        console.log('🛒 Carrinho carregado:', cart);
        
        if (!cart || cart.length === 0) {
            alert('Seu carrinho está vazio!');
            window.location.href = 'index.html';
            return;
        }

        // Garantir que cart é array antes de usar reduce
        if (!Array.isArray(cart)) {
            console.error('❌ Carrinho não é um array:', cart);
            alert('Erro ao carregar carrinho. Por favor, tente novamente.');
            window.location.href = 'index.html';
            return;
        }

        orderData = {
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            orderId: 'EXE-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
            createdAt: new Date().toISOString()
        };

        console.log('📦 Pedido criado:', orderData);
        renderOrder();
    } catch (error) {
        console.error('❌ Erro ao carregar pedido:', error);
        alert('Erro ao carregar carrinho. Por favor, tente novamente.');
        window.location.href = 'index.html';
    }
}

// ===== RENDERIZAR PEDIDO =====
function renderOrder() {
    const container = document.getElementById('orderItems');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');

    if (!container || !subtotalEl || !totalEl) {
        console.error('❌ Elementos do pedido não encontrados!', {
            container: !!container,
            subtotalEl: !!subtotalEl,
            totalEl: !!totalEl
        });
        return;
    }

    let html = '';
    orderData.items.forEach(item => {
        html += `
            <div class="order-item">
                <div class="order-item-info">
                    <h4>${item.name}</h4>
                    <p>Quantidade: ${item.quantity}x</p>
                </div>
                <div class="order-item-price">
                    R$ ${(item.price * item.quantity).toFixed(2)}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    subtotalEl.textContent = `R$ ${orderData.total.toFixed(2)}`;
    totalEl.textContent = `R$ ${orderData.total.toFixed(2)}`;
    
    console.log('✅ Pedido renderizado com sucesso');
}

// ===== CARREGAR INFO DO USUÁRIO =====
async function loadUserInfo() {
    // Usar novo sistema de autenticação
    if (!window.StorageManager) {
        console.warn('⚠️ StorageManager não disponível');
        return;
    }
    
    const session = StorageManager.getSession();
    if (!session) {
        console.warn('⚠️ Sessão não encontrada');
        return;
    }

    const userInfoEl = document.getElementById('userInfo');
    if (!userInfoEl) {
        console.error('❌ Elemento #userInfo não encontrado');
        return;
    }

    userInfoEl.innerHTML = `
        <div style="padding: 1rem; background: rgba(0, 255, 136, 0.05); border: 1px solid rgba(0, 255, 136, 0.2); border-radius: 8px;">
            <p style="margin: 0.5rem 0; color: white;"><strong>Nome:</strong> ${session.name}</p>
            <p style="margin: 0.5rem 0; color: white;"><strong>Email:</strong> ${session.email}</p>
            <p style="margin: 0.5rem 0; color: rgba(255, 255, 255, 0.6); font-size: 0.9rem;">
                Os produtos serão enviados para este email.
            </p>
        </div>
    `;
    
    console.log('✅ Info do usuário carregada');
}

// ===== SELECIONAR MÉTODO DE PAGAMENTO =====
function selectPayment(method) {
    selectedPaymentMethod = method;

    // Remover seleção anterior
    document.querySelectorAll('.payment-method').forEach(el => {
        el.classList.remove('selected');
    });

    // Esconder todos os detalhes
    const pixDetails = document.getElementById('pixDetails');
    const paypalButtons = document.getElementById('paypalButtons');
    
    if (pixDetails) pixDetails.classList.remove('active');
    if (paypalButtons) paypalButtons.classList.remove('active');

    if (method === 'pix') {
        const pixMethod = document.getElementById('pixMethod');
        if (pixMethod) pixMethod.classList.add('selected');
        if (pixDetails) pixDetails.classList.add('active');
        generatePixCode();
    } else if (method === 'paypal') {
        const paypalMethod = document.getElementById('paypalMethod');
        if (paypalMethod) paypalMethod.classList.add('selected');
        if (paypalButtons) paypalButtons.classList.add('active');
        loadPayPalButtons();
    }
}

// ===== GERAR CÓDIGO PIX =====
function generatePixCode() {
    if (!orderData) {
        console.error('❌ orderData não definido ainda!');
        return;
    }
    
    const pixCode = generatePixPayload();
    
    // Exibir código com estilo melhorado
    const pixCodeElement = document.getElementById('pixCode');
    
    if (!pixCodeElement) {
        console.error('❌ Elemento #pixCode não encontrado!');
        return;
    }
    
    pixCodeElement.textContent = pixCode;
    pixCodeElement.style.display = 'block';
    pixCodeElement.style.wordBreak = 'break-all';
    pixCodeElement.style.padding = '1rem';
    pixCodeElement.style.background = 'rgba(0, 0, 0, 0.3)';
    pixCodeElement.style.border = '1px solid rgba(0, 255, 136, 0.3)';
    pixCodeElement.style.borderRadius = '8px';
    pixCodeElement.style.fontSize = '0.75rem';
    pixCodeElement.style.fontFamily = 'monospace';
    pixCodeElement.style.color = 'rgba(255, 255, 255, 0.8)';
    pixCodeElement.style.marginTop = '1rem';
    pixCodeElement.style.maxHeight = '100px';
    pixCodeElement.style.overflowY = 'auto';
    
    // Gerar QR Code
    generateQRCode(pixCode);

}

// ===== GERAR PAYLOAD PIX (EMV) =====
function generatePixPayload() {
    const amount = orderData.total.toFixed(2);
    const pixKey = CheckoutConfig.pixKey;
    const merchantName = CheckoutConfig.pixName.toUpperCase().substring(0, 25);
    const merchantCity = CheckoutConfig.pixCity.toUpperCase().substring(0, 15);
    const txid = orderData.orderId.substring(0, 25);
    
    // Payload PIX usando formato EMV
    let payload = '00020126'; // Payload Format Indicator
    
    // Merchant Account Information
    const pixKeyLength = pixKey.length.toString().padStart(2, '0');
    const merchantAccount = `0014BR.GOV.BCB.PIX01${pixKeyLength}${pixKey}`;
    const merchantAccountLength = merchantAccount.length.toString().padStart(2, '0');
    payload += `${merchantAccountLength}${merchantAccount}`;
    
    payload += '52040000'; // Merchant Category Code
    payload += '5303986'; // Transaction Currency (986 = BRL)
    
    // Transaction Amount
    const amountStr = amount.toString();
    const amountLength = amountStr.length.toString().padStart(2, '0');
    payload += `54${amountLength}${amountStr}`;
    
    payload += '5802BR'; // Country Code
    
    // Merchant Name
    const nameLength = merchantName.length.toString().padStart(2, '0');
    payload += `59${nameLength}${merchantName}`;
    
    // Merchant City
    const cityLength = merchantCity.length.toString().padStart(2, '0');
    payload += `60${cityLength}${merchantCity}`;
    
    // Additional Data Field
    const txidField = `05${txid.length.toString().padStart(2, '0')}${txid}`;
    const additionalDataLength = txidField.length.toString().padStart(2, '0');
    payload += `62${additionalDataLength}${txidField}`;
    
    // CRC16
    payload += '6304';
    const crc = calculateCRC16(payload);
    payload += crc;
    
    return payload;
}

// ===== CALCULAR CRC16 =====
function calculateCRC16(payload) {
    const polynomial = 0x1021;
    let crc = 0xFFFF;
    
    for (let i = 0; i < payload.length; i++) {
        crc ^= (payload.charCodeAt(i) << 8);
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ polynomial;
            } else {
                crc = crc << 1;
            }
        }
    }
    
    crc = crc & 0xFFFF;
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

// ===== GERAR QR CODE =====
function generateQRCode(text) {
    const container = document.getElementById('pixQRCode');
    
    if (!container) {
        console.error('❌ Elemento #pixQRCode não encontrado!');
        return;
    }
    
    if (!orderData) {
        console.error('❌ orderData não definido!');
        return;
    }
    
    // Usar API pública para gerar QR Code com melhor qualidade
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(text)}`;
    
    container.innerHTML = `
        <div style="text-align: center; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
            <h3 style="color: #1e293b; margin-bottom: 1rem; font-size: 1.2rem;">
                📱 Escaneie com seu celular
            </h3>
            <div style="background: white; padding: 1rem; border-radius: 8px; display: inline-block;">
                <img src="${qrCodeUrl}" alt="QR Code PIX" style="display: block; max-width: 100%;" />
            </div>
            <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(16, 185, 129, 0.1); border-radius: 8px;">
                <p style="color: #10b981; font-weight: 600; font-size: 1.1rem; margin: 0;">
                    💰 Valor: R$ ${orderData.total.toFixed(2)}
                </p>
                <p style="color: #64748b; font-size: 0.9rem; margin: 0.5rem 0 0 0;">
                    Abra o app do seu banco e escaneie o QR Code acima
                </p>
            </div>
        </div>
    `;
    
    console.log('✅ QR Code gerado com sucesso');
}

// ===== COPIAR CÓDIGO PIX =====
function copyPixCode() {
    const pixCodeElement = document.getElementById('pixCode');
    const pixCode = pixCodeElement.textContent;
    
    console.log('🔍 Tentando copiar código PIX:', pixCode.substring(0, 50) + '...');
    
    if (!pixCode || pixCode.trim() === '') {
        showNotification('❌ Erro: Código PIX não gerado ainda!', 'error');
        console.error('❌ Elemento #pixCode está vazio!');
        return;
    }
    
    navigator.clipboard.writeText(pixCode).then(() => {
        showNotification('✅ Código PIX copiado! Cole no seu app de pagamento.', 'success');
        console.log('✅ Código PIX copiado com sucesso!');
    }).catch((err) => {
        console.error('❌ Erro ao copiar com clipboard API:', err);
        // Fallback para navegadores antigos
        const textArea = document.createElement('textarea');
        textArea.value = pixCode;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showNotification('✅ Código PIX copiado!', 'success');
            console.log('✅ Código PIX copiado (fallback)!');
        } catch (fallbackErr) {
            showNotification('❌ Erro ao copiar código', 'error');
            console.error('❌ Erro no fallback:', fallbackErr);
        }
        document.body.removeChild(textArea);
    });
}

// ===== CARREGAR BOTÕES PAYPAL =====
function loadPayPalButtons() {
    const container = document.getElementById('paypal-button-container');
    
    // Verificar se PayPal SDK está carregado
    if (typeof paypal === 'undefined') {
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center; background: rgba(255, 0, 128, 0.1); border: 2px solid var(--accent); border-radius: 8px;">
                <p style="color: var(--accent); margin: 0 0 1rem 0;">⚠️ Erro ao carregar PayPal</p>
                <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.9rem; margin: 0;">
                    Por favor, configure o Client ID do PayPal no checkout.html
                </p>
            </div>
        `;
        return;
    }

    // Limpar container
    container.innerHTML = '';

    // Renderizar botões PayPal
    paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    description: `Pedido ${orderData.orderId}`,
                    amount: {
                        currency_code: 'BRL',
                        value: orderData.total.toFixed(2)
                    }
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                processPayment('paypal', details);
            });
        },
        onError: function(err) {
            console.error('Erro no PayPal:', err);
            showNotification('Erro ao processar pagamento. Tente novamente.', 'error');
        }
    }).render('#paypal-button-container');
}

// ===== PROCESSAR PAGAMENTO =====
async function processPayment(method, details = null) {
    try {
        // Rate limiting para pagamentos
        SecuritySystem.checkRateLimit('payment', 10);

        // Obter email do usuário
        const session = await SecureStorage.load('exebots_session');
        if (!session) {
            throw new Error('Sessão inválida');
        }

        // Validar dados do pedido
        if (!SecuritySystem.validateOrder(orderData)) {
            throw new Error('Dados do pedido inválidos');
        }

        // Salvar pedido com criptografia
        const order = {
            ...orderData,
            paymentMethod: method,
            paymentDetails: details,
            status: 'pending',
            paidAt: new Date().toISOString(),
            userEmail: session.email
        };

        // Carregar pedidos existentes
        const orders = await SecureStorage.load('exebots_orders') || [];
        orders.push(order);
        
        // Salvar criptografado
        await SecureStorage.save('exebots_orders', orders);

        // Log de segurança
        SecuritySystem.logSecurityEvent('payment_processed', { 
            orderId: order.orderId,
            method: method,
            total: order.total
        });

        // Limpar carrinho
        await SecureStorage.remove('exebots_cart');

        // Mostrar confirmação
        showConfirmation(order);
    } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        showNotification('Erro ao processar pagamento: ' + error.message, 'error');
    }
}

// ===== MOSTRAR CONFIRMAÇÃO =====
function showConfirmation(order) {
    document.querySelector('.checkout-container').innerHTML = `
        <div style="max-width: 600px; margin: 100px auto; text-align: center; padding: 3rem;">
            <div style="font-size: 5rem; margin-bottom: 1.5rem;">✅</div>
            <h1 style="color: var(--primary); font-size: 2.5rem; margin-bottom: 1rem;">
                Pedido Confirmado!
            </h1>
            <p style="color: rgba(255, 255, 255, 0.8); font-size: 1.2rem; margin-bottom: 2rem;">
                Pedido #${order.orderId}
            </p>
            
            <div style="background: rgba(0, 255, 136, 0.1); border: 2px solid var(--primary); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
                <p style="color: white; margin: 0 0 1rem 0;">
                    Seu pagamento foi confirmado com sucesso!
                </p>
                <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.95rem; margin: 0;">
                    Os detalhes de acesso aos produtos foram enviados para:<br>
                    <strong style="color: var(--primary);">${order.userEmail}</strong>
                </p>
            </div>

            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <a href="index.html" class="btn-primary" style="text-decoration: none; padding: 1rem 2rem; border-radius: 8px;">
                    Voltar à Loja
                </a>
                <a href="#" onclick="window.print(); return false;" class="btn-outline" style="text-decoration: none; padding: 1rem 2rem; border-radius: 8px;">
                    Imprimir Comprovante
                </a>
            </div>
        </div>
    `;
}

// ===== NOTIFICAÇÕES =====
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `cart-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ===== SIMULAR PAGAMENTO PIX (para testes) =====
// REMOVER EM PRODUÇÃO - apenas para demonstração
setTimeout(function() {
    if (selectedPaymentMethod === 'pix') {
        // Adicionar botão de teste
        const pixDetails = document.getElementById('pixDetails');
        if (pixDetails && pixDetails.classList.contains('active')) {
            const testButton = document.createElement('button');
            testButton.className = 'copy-button';
            testButton.style.marginTop = '1rem';
            testButton.style.background = 'var(--accent)';
            testButton.textContent = '🧪 Simular Pagamento (TESTE)';
            testButton.onclick = function() {
                if (confirm('Simular pagamento aprovado? (Apenas para testes)')) {
                    processPayment('pix', { transactionId: 'TEST-' + Date.now() });
                }
            };
            pixDetails.appendChild(testButton);
        }
    }
}, 2000);

// ===== SCANNER DE QR CODE REMOVIDO =====
// Sistema de scanner de câmera foi removido - cliente escaneia o QR Code gerado com o celular dele
// O QR Code PIX é exibido na tela para o cliente escanear com o app do banco

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

