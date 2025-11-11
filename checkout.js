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
    // Aguardar sistema de segurança inicializar
    if (!window.SecuritySystem) {
        console.error('Sistema de segurança não carregado!');
        alert('Erro ao carregar página. Por favor, recarregue.');
        return;
    }

    await SecuritySystem.init();
    await loadOrder();
    await loadUserInfo();
    
    // Verificar se usuário está logado
    const currentUser = await SecureStorage.load('exebots_session');
    if (!currentUser || Date.now() > currentUser.expiresAt) {
        alert('Por favor, faça login para continuar.');
        window.location.href = 'auth.html';
    }
});

// ===== CARREGAR PEDIDO =====
async function loadOrder() {
    const cart = await SecureStorage.load('exebots_cart') || [];
    
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        window.location.href = 'index.html';
        return;
    }

    orderData = {
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        orderId: 'EXE-' + Date.now() + '-' + SecuritySystem.generateRandomString(8),
        createdAt: new Date().toISOString()
    };

    renderOrder();
}

// ===== RENDERIZAR PEDIDO =====
function renderOrder() {
    const container = document.getElementById('orderItems');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');

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
}

// ===== CARREGAR INFO DO USUÁRIO =====
async function loadUserInfo() {
    const session = await SecureStorage.load('exebots_session');
    if (!session) return;

    const users = await SecureStorage.load('exebots_users') || [];
    const user = users.find(u => u.email === session.email);

    if (user) {
        document.getElementById('userInfo').innerHTML = `
            <div style="padding: 1rem; background: rgba(0, 255, 136, 0.05); border: 1px solid rgba(0, 255, 136, 0.2); border-radius: 8px;">
                <p style="margin: 0.5rem 0; color: white;"><strong>Nome:</strong> ${SecuritySystem.sanitizeInput(user.name)}</p>
                <p style="margin: 0.5rem 0; color: white;"><strong>Email:</strong> ${SecuritySystem.sanitizeInput(user.email)}</p>
                <p style="margin: 0.5rem 0; color: rgba(255, 255, 255, 0.6); font-size: 0.9rem;">
                    Os produtos serão enviados para este email.
                </p>
            </div>
        `;
    }
}

// ===== SELECIONAR MÉTODO DE PAGAMENTO =====
function selectPayment(method) {
    selectedPaymentMethod = method;

    // Remover seleção anterior
    document.querySelectorAll('.payment-method').forEach(el => {
        el.classList.remove('selected');
    });

    // Esconder todos os detalhes
    document.getElementById('pixDetails').classList.remove('active');
    document.getElementById('paypalButtons').classList.remove('active');

    if (method === 'pix') {
        document.getElementById('pixMethod').classList.add('selected');
        document.getElementById('pixDetails').classList.add('active');
        generatePixCode();
    } else if (method === 'paypal') {
        document.getElementById('paypalMethod').classList.add('selected');
        document.getElementById('paypalButtons').classList.add('active');
        loadPayPalButtons();
    }
}

// ===== GERAR CÓDIGO PIX =====
function generatePixCode() {
    const pixCode = generatePixPayload();
    
    // Exibir código
    document.getElementById('pixCode').textContent = pixCode;
    
    // Gerar QR Code
    generateQRCode(pixCode);
}

// ===== GERAR PAYLOAD PIX (EMV) =====
function generatePixPayload() {
    const amount = orderData.total.toFixed(2);
    
    // Formato simplificado do PIX Copia e Cola
    // Em produção, use uma biblioteca adequada para gerar o payload completo
    const payload = `00020126${getPixKeyField()}52040000530398654${getAmountField(amount)}5802BR59${getName()}60${getCity()}62${getTransactionId()}6304${getCRC()}`;
    
    // Para demonstração, retornamos um payload simplificado
    // IMPORTANTE: Em produção, use uma biblioteca PIX adequada ou API de pagamento
    return `00020126360014BR.GOV.BCB.PIX0114${CheckoutConfig.pixKey}520400005303986540${amount.length}${amount}5802BR5913${CheckoutConfig.pixName}6009${CheckoutConfig.pixCity}62070503***63041D3D`;
}

function getPixKeyField() {
    const key = CheckoutConfig.pixKey;
    const keyLength = key.length.toString().padStart(2, '0');
    return `0014BR.GOV.BCB.PIX01${keyLength}${key}`;
}

function getAmountField(amount) {
    return `0${amount.length}${amount}`;
}

function getName() {
    const name = CheckoutConfig.pixName.substring(0, 25);
    return `0${name.length}${name}`;
}

function getCity() {
    const city = CheckoutConfig.pixCity.substring(0, 15);
    return `0${city.length}${city}`;
}

function getTransactionId() {
    const txId = orderData.orderId;
    return `05${txId.length}${txId}`;
}

function getCRC() {
    // CRC simplificado - em produção, calcular CRC16 real
    return '1D3D';
}

// ===== GERAR QR CODE =====
function generateQRCode(text) {
    const container = document.getElementById('pixQRCode');
    
    // Usar API pública para gerar QR Code
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(text)}`;
    
    container.innerHTML = `
        <img src="${qrCodeUrl}" alt="QR Code PIX" />
        <p style="color: var(--primary); font-size: 0.9rem; margin-top: 1rem;">
            Valor: R$ ${orderData.total.toFixed(2)}
        </p>
    `;
}

// ===== COPIAR CÓDIGO PIX =====
function copyPixCode() {
    const pixCode = document.getElementById('pixCode').textContent;
    
    navigator.clipboard.writeText(pixCode).then(() => {
        showNotification('Código PIX copiado! Cole no seu app de pagamento.', 'success');
    }).catch(() => {
        // Fallback para navegadores antigos
        const textArea = document.createElement('textarea');
        textArea.value = pixCode;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Código PIX copiado!', 'success');
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

// ===== LEITOR DE QR CODE VIA CÂMERA =====
function openQRScanner() {
    // Criar modal do scanner
    const scannerModal = document.createElement('div');
    scannerModal.id = 'qrScannerModal';
    scannerModal.innerHTML = `
        <div class="qr-scanner-overlay">
            <div class="qr-scanner-container">
                <div class="qr-scanner-header">
                    <h3>📷 Escanear QR Code PIX</h3>
                    <button onclick="closeQRScanner()" class="close-scanner">✕</button>
                </div>
                <div class="qr-scanner-body">
                    <video id="qrVideo" autoplay playsinline></video>
                    <div class="scanner-overlay">
                        <div class="scanner-frame"></div>
                    </div>
                    <p class="scanner-instructions">
                        Posicione o QR Code do PIX dentro do quadrado
                    </p>
                </div>
                <div class="qr-scanner-footer">
                    <button onclick="switchCamera()" class="btn-switch-camera">🔄 Trocar Câmera</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(scannerModal);

    // Adicionar estilos
    addScannerStyles();

    // Iniciar scanner
    startQRScanner();
}

function closeQRScanner() {
    if (qrScanner) {
        qrScanner.stop();
        qrScanner = null;
    }
    const modal = document.getElementById('qrScannerModal');
    if (modal) {
        modal.remove();
    }
}

let currentCamera = 'environment'; // 'user' para frontal, 'environment' para traseira

function switchCamera() {
    currentCamera = currentCamera === 'environment' ? 'user' : 'environment';
    if (qrScanner) {
        qrScanner.stop();
    }
    startQRScanner();
}

function startQRScanner() {
    const video = document.getElementById('qrVideo');
    
    if (!video) return;

    // Configurar câmera
    const constraints = {
        video: {
            facingMode: currentCamera,
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            video.srcObject = stream;
            video.setAttribute('playsinline', true);
            video.play();

            // Iniciar detecção
            requestAnimationFrame(scanQRCode);
        })
        .catch(err => {
            console.error('Erro ao acessar câmera:', err);
            alert('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
            closeQRScanner();
        });
}

function scanQRCode() {
    const video = document.getElementById('qrVideo');
    if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(scanQRCode);
        return;
    }

    // Criar canvas temporário para processar frame
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Tentar detectar QR Code
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
        // QR Code detectado!
        processScannedQR(code.data);
        closeQRScanner();
    } else {
        // Continuar escaneando
        requestAnimationFrame(scanQRCode);
    }
}

function processScannedQR(data) {
    // Verificar se é um código PIX válido
    if (data.startsWith('00020126')) {
        showNotification('QR Code PIX detectado! Processando pagamento...', 'success');
        
        // Extrair valor do QR Code (se possível)
        const match = data.match(/5303986540(\d+)(\d+\.\d{2})/);
        const amount = match ? parseFloat(match[2]) : null;

        // Simular pagamento
        setTimeout(() => {
            if (confirm(`Confirmar pagamento de R$ ${amount ? amount.toFixed(2) : orderData.total.toFixed(2)} via PIX?`)) {
                processPayment('pix', { 
                    transactionId: 'QR-' + Date.now(),
                    qrCode: data,
                    scannedAmount: amount
                });
            }
        }, 1000);
    } else {
        showNotification('QR Code inválido. Por favor, escaneie um código PIX válido.', 'error');
    }
}

function addScannerStyles() {
    if (document.getElementById('qrScannerStyles')) return;

    const styles = document.createElement('style');
    styles.id = 'qrScannerStyles';
    styles.textContent = `
        .qr-scanner-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }

        .qr-scanner-container {
            background: rgba(20, 20, 35, 0.95);
            border: 2px solid var(--primary);
            border-radius: 16px;
            max-width: 500px;
            width: 90%;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 255, 136, 0.3);
        }

        .qr-scanner-header {
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(255, 0, 128, 0.1));
            border-bottom: 1px solid var(--primary);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .qr-scanner-header h3 {
            margin: 0;
            color: var(--primary);
            font-size: 1.3rem;
        }

        .close-scanner {
            background: rgba(255, 0, 128, 0.2);
            border: 1px solid var(--accent);
            color: var(--accent);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            font-size: 1.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .close-scanner:hover {
            background: var(--accent);
            color: white;
            transform: rotate(90deg);
        }

        .qr-scanner-body {
            position: relative;
            padding: 1rem;
            background: #000;
        }

        #qrVideo {
            width: 100%;
            height: auto;
            border-radius: 8px;
            display: block;
        }

        .scanner-overlay {
            position: absolute;
            top: 1rem;
            left: 1rem;
            right: 1rem;
            bottom: 3.5rem;
            pointer-events: none;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .scanner-frame {
            width: 250px;
            height: 250px;
            border: 3px solid var(--primary);
            border-radius: 16px;
            position: relative;
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
            animation: scannerPulse 2s ease-in-out infinite;
        }

        .scanner-frame::before,
        .scanner-frame::after {
            content: '';
            position: absolute;
            width: 20px;
            height: 20px;
            border: 3px solid var(--primary);
        }

        .scanner-frame::before {
            top: -3px;
            left: -3px;
            border-right: none;
            border-bottom: none;
        }

        .scanner-frame::after {
            top: -3px;
            right: -3px;
            border-left: none;
            border-bottom: none;
        }

        .scanner-instructions {
            color: var(--primary);
            text-align: center;
            margin: 1rem 0 0.5rem 0;
            font-size: 0.9rem;
            text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
        }

        .qr-scanner-footer {
            padding: 1rem;
            background: rgba(20, 20, 35, 0.8);
            border-top: 1px solid rgba(0, 255, 136, 0.2);
        }

        .btn-switch-camera {
            width: 100%;
            padding: 0.8rem;
            background: rgba(0, 255, 136, 0.1);
            border: 1px solid var(--primary);
            color: var(--primary);
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        .btn-switch-camera:hover {
            background: var(--primary);
            color: #000;
            transform: scale(1.02);
        }

        @keyframes scannerPulse {
            0%, 100% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 20px var(--primary); }
            50% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 40px var(--primary); }
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @media (max-width: 768px) {
            .qr-scanner-container {
                width: 95%;
                margin: 1rem;
            }

            .scanner-frame {
                width: 200px;
                height: 200px;
            }
        }
    `;
    document.head.appendChild(styles);
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

