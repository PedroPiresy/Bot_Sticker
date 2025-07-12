const { MessageMedia } = require('whatsapp-web.js');
const { convertToSticker } = require('../utils/convertToSticker');

async function stickerFromImage(message, media) {
    const buffer = Buffer.from(media.data, 'base64');

    try {
        const webpBuffer = await convertToSticker(buffer);
        const sticker = new MessageMedia('image/webp', webpBuffer.toString('base64'));

        await message.reply(sticker, undefined, { sendMediaAsSticker: true });
    } catch (err) {
        console.error('Erro ao converter para figurinha:', err);
        await message.reply('❌ Erro ao criar figurinha. Tente novamente.');
    }
}

module.exports = { stickerFromImage };