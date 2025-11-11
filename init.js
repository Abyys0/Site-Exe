// ==========================================
// INICIALIZAÇÃO GLOBAL - EXE BOTS
// ==========================================

let systemReady = false;

// Aguardar carregamento completo
window.addEventListener('DOMContentLoaded', async function() {
    try {
        // 1. Inicializar sistema de segurança
        if (window.SecuritySystem) {
            await SecuritySystem.init();
            console.log('%c✅ Sistema de Segurança Carregado', 'color: #00ff88; font-weight: bold;');
        }

        // 2. Marcar sistema como pronto
        systemReady = true;
        
        // 3. Disparar evento customizado
        window.dispatchEvent(new Event('systemReady'));
        
    } catch (error) {
        console.error('Erro ao inicializar sistema:', error);
    }
});

// Helper para aguardar sistema estar pronto
function waitForSystem() {
    return new Promise((resolve) => {
        if (systemReady) {
            resolve();
        } else {
            window.addEventListener('systemReady', resolve, { once: true });
        }
    });
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
