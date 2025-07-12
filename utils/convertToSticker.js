const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

// Função para converter imagens estáticas
async function convertToSticker(buffer) {
    return await sharp(buffer)
        .resize(512, 512, { fit: 'contain' })
        .webp()
        .toBuffer();
}

// Função para converter vídeos e GIFs animados
async function convertVideoToSticker(buffer, mimetype) {
    const tempInputPath = path.join(__dirname, `temp_input_${Date.now()}.${getFileExtension(mimetype)}`);
    const tempOutputPath = path.join(__dirname, `temp_output_${Date.now()}.webp`);

    try {
        // Salva o buffer temporariamente
        await writeFile(tempInputPath, buffer);

        // Converte para WebP animado usando FFmpeg
        await new Promise((resolve, reject) => {
            ffmpeg(tempInputPath)
                .outputOptions([
                    '-vcodec libwebp',
                    '-vf scale=512:512:force_original_aspect_ratio=decrease:flags=lanczos,pad=512:512:-1:-1:color=transparent',
                    '-loop 0',
                    '-preset default',
                    '-an',
                    '-vsync 0',
                    '-t 10' // Limita a 10 segundos
                ])
                .output(tempOutputPath)
                .on('end', resolve)
                .on('error', reject)
                .run();
        });

        // Lê o arquivo convertido
        const convertedBuffer = fs.readFileSync(tempOutputPath);
        
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
            console.error('Erro ao limpar arquivos temporários:', cleanupError);
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