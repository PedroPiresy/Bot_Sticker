const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const config = require('../config');
const logger = require('./logger');

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

// Função para converter imagens estáticas
async function convertToSticker(buffer) {
    try {
        logger.debug('Iniciando conversão de imagem para figurinha');
        
        const result = await sharp(buffer)
            .resize(config.sticker.maxSize, config.sticker.maxSize, { 
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 } // Fundo transparente
            })
            .webp({ 
                quality: config.sticker.quality,
                effort: 6 // Melhor qualidade
            })
            .toBuffer();
            
        logger.debug('Conversão de imagem concluída', { 
            originalSize: buffer.length, 
            finalSize: result.length 
        });
        
        return result;
    } catch (error) {
        logger.error('Erro ao converter imagem', { error: error.message });
        throw error;
    }
}

// Função para converter vídeos e GIFs animados
async function convertVideoToSticker(buffer, mimetype) {
    const tempInputPath = path.join(__dirname, `temp_input_${Date.now()}.${getFileExtension(mimetype)}`);
    const tempOutputPath = path.join(__dirname, `temp_output_${Date.now()}.webp`);

    try {
        logger.debug('Iniciando conversão de vídeo/GIF para figurinha animada');
        
        // Salva o buffer temporariamente
        await writeFile(tempInputPath, buffer);

        // Converte para WebP animado usando FFmpeg
        await new Promise((resolve, reject) => {
            ffmpeg(tempInputPath)
                .outputOptions([
                    '-vcodec libwebp',
                    `-vf scale=${config.sticker.maxSize}:${config.sticker.maxSize}:force_original_aspect_ratio=decrease:flags=lanczos,pad=${config.sticker.maxSize}:${config.sticker.maxSize}:-1:-1:color=transparent`,
                    '-loop 0',
                    '-preset default',
                    '-an',
                    '-vsync 0',
                    `-t ${config.sticker.maxVideoDuration}`, // Limita duração
                    `-quality ${config.sticker.quality}` // Qualidade
                ])
                .output(tempOutputPath)
                .on('end', () => {
                    logger.debug('Conversão de vídeo concluída');
                    resolve();
                })
                .on('error', (error) => {
                    logger.error('Erro na conversão de vídeo', { error: error.message });
                    reject(error);
                })
                .run();
        });

        // Lê o arquivo convertido
        const convertedBuffer = fs.readFileSync(tempOutputPath);
        
        logger.debug('Conversão de vídeo finalizada', { 
            originalSize: buffer.length, 
            finalSize: convertedBuffer.length 
        });
        
        // Remove arquivos temporários
        await unlink(tempInputPath);
        await unlink(tempOutputPath);

        return convertedBuffer;
    } catch (error) {
        // Limpa arquivos temporários em caso de erro
        try {
            await unlink(tempInputPath);
            await unlink(tempOutputPath);
        } catch (cleanupError) {
            logger.error('Erro ao limpar arquivos temporários', { error: cleanupError.message });
        }
        throw error;
    }
}

function getFileExtension(mimetype) {
    const mimeToExt = {
        'video/mp4': 'mp4',
        'video/webm': 'webm',
        'video/avi': 'avi',
        'video/mov': 'mov',
        'video/quicktime': 'mov',
        'image/gif': 'gif',
        'video/gif': 'gif'
    };
    return mimeToExt[mimetype] || 'mp4';
}

function isVideoOrGif(mimetype) {
    return mimetype.startsWith('video/') || mimetype === 'image/gif';
}

module.exports = { 
    convertToSticker, 
    convertVideoToSticker, 
    isVideoOrGif 
};