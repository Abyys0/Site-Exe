// ==========================================
// SISTEMA DE CARRINHO DE COMPRAS - EXE BOTS
// ==========================================

// ===== CARRINHO DE COMPRAS =====
const ShoppingCart = {
    items: [],

    // Inicializar carrinho do localStorage
    init: async function() {
        try {
            if (window.SecureStorage) {
                const saved = await SecureStorage.load('exebots_cart');
                if (saved && Array.isArray(saved)) {
                    this.items = saved;
                }
            }
        } catch (error) {
            console.error('Erro ao carregar carrinho:', error);
        }
        this.updateCartCount();
    },

    // Adicionar item ao carrinho
    addItem: async function(id, name, price) {
        // Sanitizar dados
        const sanitizedName = SecuritySystem.sanitizeInput(name);
        
        // Verificar se item já existe
        const existingItem = this.items.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.items.push({
                id: SecuritySystem.sanitizeInput(id),
                name: sanitizedName,
                price: parseFloat(price),
                quantity: 1
            });
        }

        await this.save();
        this.updateCartCount();
        this.showNotification(`${sanitizedName} adicionado ao carrinho!`, 'success');
    },

    // Remover item do carrinho
    removeItem: async function(id) {
        const index = this.items.findIndex(item => item.id === id);
        if (index > -1) {
            const itemName = this.items[index].name;
            this.items.splice(index, 1);
            await this.save();
            this.updateCartCount();
            this.showNotification(`${itemName} removido do carrinho!`, 'info');
            this.renderCart();
        }
    },

    // Atualizar quantidade
    updateQuantity: async function(id, quantity) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.quantity = Math.max(1, quantity);
            await this.save();
            this.renderCart();
        }
    },

    // Calcular total
    getTotal: function() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    // Salvar no localStorage com criptografia
    save: async function() {
        try {
            if (window.SecureStorage) {
                await SecureStorage.save('exebots_cart', this.items);
            }
        } catch (error) {
            console.error('Erro ao salvar carrinho:', error);
        }
    },

    // Atualizar contador do carrinho
    updateCartCount: function() {
        const count = this.items.reduce((total, item) => total + item.quantity, 0);
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? 'inline-block' : 'none';
        }
    },

    // Limpar carrinho
    clear: async function() {
        this.items = [];
        await this.save();
        this.updateCartCount();
    },

    // Renderizar carrinho
    renderCart: function() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        if (!cartItems) return;

        if (this.items.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-cart-icon">🛒</div>
                    <p>Seu carrinho está vazio</p>
                    <button class="btn-primary" onclick="closeCart()">Continuar Comprando</button>
                </div>
            `;
            if (cartTotal) cartTotal.textContent = 'R$ 0,00';
            return;
        }

        let html = '';
        this.items.forEach(item => {
            html += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p class="cart-item-price">R$ ${item.price.toFixed(2)}</p>
                    </div>
                    <div class="cart-item-controls">
                        <button onclick="ShoppingCart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="ShoppingCart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                    <div class="cart-item-total">
                        R$ ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button class="cart-item-remove" onclick="ShoppingCart.removeItem('${item.id}')">🗑️</button>
                </div>
            `;
        });

        cartItems.innerHTML = html;
        
        if (cartTotal) {
            cartTotal.textContent = `R$ ${this.getTotal().toFixed(2)}`;
        }
    },

    // Notificação
    showNotification: function(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `cart-notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// ===== FUNÇÕES GLOBAIS =====
function addToCart(id, name, price) {
    ShoppingCart.addItem(id, name, price);
}

function openCart() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.style.display = 'flex';
        ShoppingCart.renderCart();
    } else {
        // Se modal não existe, criar
        createCartModal();
        setTimeout(() => openCart(), 100);
    }
}

function closeCart() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function proceedToCheckout() {
    try {
        // Verificar se usuário está logado
        const session = await SecureStorage.load('exebots_session');
        
        if (!session || Date.now() > session.expiresAt) {
            alert('Por favor, faça login para continuar com a compra.');
            window.location.href = 'auth.html';
            return;
        }

        if (ShoppingCart.items.length === 0) {
            alert('Seu carrinho está vazio!');
            return;
        }

        // Redirecionar para checkout
        window.location.href = 'checkout.html';
    } catch (error) {
        console.error('Erro ao verificar checkout:', error);
        alert('Erro ao processar. Por favor, faça login novamente.');
        window.location.href = 'auth.html';
    }
}

// ===== CRIAR MODAL DO CARRINHO =====
function createCartModal() {
    const modal = document.createElement('div');
    modal.id = 'cartModal';
    modal.className = 'cart-modal';
    modal.innerHTML = `
        <div class="cart-modal-content">
            <div class="cart-header">
                <h2>🛒 Seu Carrinho</h2>
                <button class="cart-close" onclick="closeCart()">✕</button>
            </div>
            <div class="cart-body" id="cartItems"></div>
            <div class="cart-footer">
                <div class="cart-total">
                    <span>Total:</span>
                    <span id="cartTotal">R$ 0,00</span>
                </div>
                <button class="btn-checkout" onclick="proceedToCheckout()">
                    Finalizar Compra →
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Fechar ao clicar fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeCart();
        }
    });
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        ShoppingCart.init();
        createCartModal();
    }, 500);
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
