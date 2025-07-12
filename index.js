const { Client, LocalAuth } = require('whatsapp-web.js');
const { stickerFromImage } = require('./commands/stickerFromImage');
const { stickerFromVideo } = require('./commands/stickerFromVideo');
const { isVideoOrGif } = require('./utils/convertToSticker');
const { setQRCode } = require('./server');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    },
});

client.on('qr', (qr) => {
    console.clear();
    const baseUrl = process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000';
    console.log('📱 QR Code gerado!');
    console.log(`🌐 Acesse: ${baseUrl}/qrcode`);
    console.log('📋 Ou acesse a URL raiz para ver o painel completo');
    setQRCode(qr);
});

client.on('ready', () => {
    console.log('🤖 Bot de Figurinhas está pronto e conectado!');
    console.log('✅ WhatsApp Web conectado com sucesso!');
});

client.on('authenticated', () => {
    console.log('🔐 Autenticação realizada com sucesso!');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Falha na autenticação:', msg);
});

client.on('disconnected', (reason) => {
    console.log('🔌 Desconectado:', reason);
});

client.on('message', async (message) => {
    try {
        // Comando de ajuda
        if (message.body.toLowerCase() === '!figurinha') {
            await message.reply(
                '🎨 *BOT DE FIGURINHAS* 🎨\n\n' +
                '📸 *COMO USAR:*\n' +
                '• Envie uma *imagem* para criar figurinha\n' +
                '• Responda com *!figurinha* para ver este menu\n\n' +
                '📋 *FORMATOS SUPORTADOS:*\n' +
                '• ✅ Imagens: JPG, PNG, WEBP\n' +
                '• 🔄 GIFs e Vídeos: *Em breve!*\n\n' +
                '⚠️ *IMPORTANTE:*\n' +
                '• Tamanho máximo: 16MB\n' +
                '• Qualidade otimizada automaticamente\n\n' +
                '🚀 *NOVIDADES EM BREVE:*\n' +
                '• 🎬 Figurinhas animadas (GIF/Vídeo)\n' +
                '• ⏱️ Vídeos até 10 segundos\n' +
                '• 🎯 Crop automático\n\n' +
                '💡 *Dica:* Envie sua imagem agora!'
            );
            return;
        }

        // Processa mídia recebida
        if (message.hasMedia) {
            const media = await message.downloadMedia();
            
            if (media) {
                console.log(`📁 Mídia recebida: ${media.mimetype} de ${message.from}`);
                
                if (media.mimetype.startsWith('image/') && media.mimetype !== 'image/gif') {
                    // Imagem estática
                    await message.reply('⚡ *Processando sua imagem...*\n🎨 Criando figurinha personalizada!');
                    await stickerFromImage(message, media);
                } else if (isVideoOrGif(media.mimetype)) {
                    // Vídeo ou GIF animado - Em breve
                    await message.reply(
                        '🎬 *Figurinhas Animadas - Em Breve!*\n\n' +
                        '🔄 Detectamos que você enviou um GIF/vídeo\n' +
                        '⏳ Esta funcionalidade estará disponível em breve!\n\n' +
                        '📸 *Por enquanto, envie uma imagem* para criar\n' +
                        'sua figurinha estática! 🎨'
                    );
                } else {
                    await message.reply(
                        '❌ *Formato não suportado*\n\n' +
                        '📋 *Formatos aceitos:*\n' +
                        '• ✅ JPG, PNG, WEBP\n' +
                        '• 🔄 GIF/Vídeo (em breve)\n\n' +
                        '💡 *Dica:* Envie uma imagem para criar sua figurinha!'
                    );
                }
            } else {
                await message.reply(
                    '❌ *Erro ao processar mídia*\n\n' +
                    '🔄 Tente novamente ou verifique se:\n' +
                    '• O arquivo não está corrompido\n' +
                    '• O tamanho é menor que 16MB\n' +
                    '• O formato é suportado\n\n' +
                    '💬 Digite *!figurinha* para ver os formatos aceitos'
                );
            }
        }
    } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error);
        await message.reply('❌ Ocorreu um erro interno. Tente novamente em alguns instantes.');
    }
});

// Inicializa o cliente
console.log('🚀 Iniciando Bot de Figurinhas...');
client.initialize();