const { Client, LocalAuth } = require('whatsapp-web.js');
const { stickerFromImage } = require('./commands/stickerFromImage');
const { stickerFromVideo } = require('./commands/stickerFromVideo');
const { isVideoOrGif } = require('./utils/convertToSticker');
const { setQRCode } = require('./server');
const config = require('./config');
const logger = require('./utils/logger');
const rateLimiter = require('./utils/rateLimiter');
const stats = require('./utils/stats');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: config.whatsapp.puppeteer
});

client.on('qr', (qr) => {
    console.clear();
    const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${config.server.port}`;
    logger.info('QR Code gerado para autenticação');
    console.log('📱 QR Code gerado!');
    console.log(`🌐 Acesse: ${baseUrl}/qrcode`);
    console.log('📋 Ou acesse a URL raiz para ver o painel completo');
    setQRCode(qr);
});

client.on('ready', () => {
    logger.info('Bot de Figurinhas conectado e pronto');
    console.log('🤖 Bot de Figurinhas está pronto e conectado!');
    console.log('✅ WhatsApp Web conectado com sucesso!');
});

client.on('authenticated', () => {
    logger.info('Autenticação realizada com sucesso');
    console.log('🔐 Autenticação realizada com sucesso!');
});

client.on('auth_failure', (msg) => {
    logger.error('Falha na autenticação', { message: msg });
    console.error('❌ Falha na autenticação:', msg);
});

client.on('disconnected', (reason) => {
    logger.warn('Bot desconectado', { reason });
    console.log('🔌 Desconectado:', reason);
});

client.on('message', async (message) => {
    try {
        const userId = message.from;
        
        // Verifica rate limiting
        if (!rateLimiter.isAllowed(userId)) {
            const remainingTime = rateLimiter.getRemainingTime(userId);
            logger.warn('Rate limit excedido', { userId, remainingTime });
            await message.reply(config.messages.errors.rateLimit);
            return;
        }

        // Comando de ajuda
        if (message.body.toLowerCase() === '!figurinha') {
            await message.reply(config.messages.help);
            logger.info('Comando de ajuda enviado', { userId });
            return;
        }

        // Processa mídia recebida
        if (message.hasMedia) {
            const media = await message.downloadMedia();
            
            if (media) {
                logger.info('Mídia recebida', { 
                    userId, 
                    mimetype: media.mimetype,
                    size: media.data.length 
                });
                
                // Verifica tamanho do arquivo
                if (media.data.length > config.sticker.maxFileSize) {
                    await message.reply(config.messages.errors.fileTooLarge);
                    logger.warn('Arquivo muito grande', { 
                        userId, 
                        size: media.data.length,
                        maxSize: config.sticker.maxFileSize 
                    });
                    return;
                }
                
                if (config.sticker.supportedImageFormats.includes(media.mimetype)) {
                    // Imagem estática
                    await message.reply(config.messages.processing.image);
                    await stickerFromImage(message, media);
                    stats.recordSticker(userId, 'image');
                    logger.info('Figurinha de imagem criada', { userId, mimetype: media.mimetype });
                } else if (isVideoOrGif(media.mimetype)) {
                    // Vídeo ou GIF animado
                    await message.reply(config.messages.processing.video);
                    await stickerFromVideo(message, media);
                    stats.recordSticker(userId, 'video');
                    logger.info('Figurinha animada criada', { userId, mimetype: media.mimetype });
                } else {
                    await message.reply(config.messages.errors.unsupportedFormat);
                    stats.recordError();
                    logger.warn('Formato não suportado', { userId, mimetype: media.mimetype });
                }
            } else {
                await message.reply(config.messages.errors.processingError);
                stats.recordError();
                logger.error('Erro ao baixar mídia', { userId });
            }
        }
    } catch (error) {
        stats.recordError();
        logger.error('Erro ao processar mensagem', { 
            userId: message.from, 
            error: error.message,
            stack: error.stack 
        });
        console.error('❌ Erro ao processar mensagem:', error);
        await message.reply('❌ Ocorreu um erro interno. Tente novamente em alguns instantes.');
    }
});

// Inicializa o cliente
logger.info('Iniciando Bot de Figurinhas');
console.log('🚀 Iniciando Bot de Figurinhas...');
client.initialize();