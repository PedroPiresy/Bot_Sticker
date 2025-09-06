module.exports = {
    // Configurações do WhatsApp
    whatsapp: {
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
        }
    },

    // Configurações do servidor
    server: {
        port: process.env.PORT || 3000,
        host: '0.0.0.0'
    },

    // Configurações de figurinhas
    sticker: {
        maxSize: 512, // Tamanho máximo em pixels
        quality: 80,  // Qualidade do WebP (0-100)
        maxFileSize: 16 * 1024 * 1024, // 16MB em bytes
        maxVideoDuration: 10, // Duração máxima de vídeo em segundos
        supportedImageFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        supportedVideoFormats: ['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/quicktime', 'image/gif']
    },

    // Configurações de rate limiting
    rateLimit: {
        maxRequestsPerMinute: 10,
        maxRequestsPerHour: 100,
        cooldownTime: 30000 // 30 segundos em ms
    },

    // Mensagens do bot
    messages: {
        help: `🎨 *BOT DE FIGURINHAS* 🎨

📸 *COMO USAR:*
• Envie uma *imagem* para criar figurinha
• Envie um *vídeo/GIF* para figurinha animada
• Responda com *!figurinha* para ver este menu

📋 *FORMATOS SUPORTADOS:*
• ✅ Imagens: JPG, PNG, WEBP
• 🎬 Vídeos: MP4, WEBM, AVI, MOV
• 🔄 GIFs animados

⚠️ *LIMITES:*
• Tamanho máximo: 16MB
• Vídeos: até 10 segundos
• Qualidade otimizada automaticamente

💡 *Dica:* Envie sua mídia agora!`,

        processing: {
            image: '⚡ *Processando sua imagem...*\n🎨 Criando figurinha personalizada!',
            video: '🎬 *Convertendo para figurinha animada...*\n⏳ Aguarde, isso pode levar alguns segundos!'
        },

        errors: {
            unsupportedFormat: `❌ *Formato não suportado*

📋 *Formatos aceitos:*
• ✅ JPG, PNG, WEBP
• 🎬 MP4, WEBM, AVI, MOV
• 🔄 GIFs animados

💡 *Dica:* Envie uma mídia suportada!`,

            fileTooLarge: `❌ *Arquivo muito grande*

⚠️ *Limites:*
• Tamanho máximo: 16MB
• Vídeos: até 10 segundos

💡 *Dica:* Reduza o tamanho do arquivo e tente novamente!`,

            processingError: `❌ *Erro ao processar mídia*

🔄 Tente novamente ou verifique se:
• O arquivo não está corrompido
• O tamanho é menor que 16MB
• O formato é suportado

💬 Digite *!figurinha* para ver os formatos aceitos`,

            rateLimit: `⏳ *Muitas requisições!*

🛑 Você está fazendo muitas requisições.
⏰ Aguarde alguns segundos antes de tentar novamente.

💡 *Dica:* O bot tem limites para evitar spam!`
        }
    },

    // Configurações de logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        enableConsole: true,
        enableFile: false
    }
};
