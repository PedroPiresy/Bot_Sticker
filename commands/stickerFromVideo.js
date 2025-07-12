const { MessageMedia } = require('whatsapp-web.js');
const { convertVideoToSticker } = require('../utils/convertToSticker');

async function stickerFromVideo(message, media) {
    const buffer = Buffer.from(media.data, 'base64');

    try {
        // Envia mensagem de processamento
        const processingMessage = await message.reply('🎬 Convertendo para figurinha animada... Aguarde!');
        
        const webpBuffer = await convertVideoToSticker(buffer, media.mimetype);
        const sticker = new MessageMedia('image/webp', webpBuffer.toString('base64'));

        await message.reply(sticker, undefined, { sendMediaAsSticker: true });
        
        // Remove a mensagem de processamento após sucesso
        try {
            await processingMessage.delete();
        } catch (deleteError) {
            console.log('Não foi possível deletar mensagem de processamento');
        }
        
    } catch (err) {
        console.error('Erro ao converter vídeo para figurinha:', err);
        
        let errorMessage = '❌ Erro ao criar figurinha animada.';
        
        if (err.message.includes('Duration')) {
            errorMessage += ' O vídeo pode ser muito longo (máximo 10 segundos).';
        } else if (err.message.includes('size')) {
            errorMessage += ' O arquivo pode ser muito grande.';
        } else {
            errorMessage += ' Tente com um arquivo menor ou diferente.';
        }
        
        await message.reply(errorMessage);
    }
}

module.exports = { stickerFromVideo };