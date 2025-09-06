const express = require('express');
const QRCode = require('qrcode');
const config = require('./config');
const logger = require('./utils/logger');
const stats = require('./utils/stats');
const app = express();
const port = config.server.port;

let latestQR = null;

app.get('/', (req, res) => {
    const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bot de Figurinhas WhatsApp</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #333;
                }
                .container {
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    padding: 40px;
                    max-width: 500px;
                    width: 90%;
                    text-align: center;
                }
                .logo {
                    font-size: 3rem;
                    margin-bottom: 20px;
                }
                h1 { 
                    color: #25D366; 
                    margin-bottom: 10px;
                    font-size: 2rem;
                }
                .subtitle {
                    color: #666;
                    margin-bottom: 30px;
                    font-size: 1.1rem;
                }
                .qr-container { 
                    margin: 30px 0;
                    padding: 20px;
                    border-radius: 15px;
                    background: #f8f9fa;
                }
                .status { 
                    padding: 20px; 
                    border-radius: 15px; 
                    margin: 20px 0;
                    transition: all 0.3s ease;
                }
                .waiting { 
                    background: linear-gradient(135deg, #fff3cd, #ffeaa7);
                    color: #856404;
                    border: 2px solid #ffeaa7;
                }
                .ready { 
                    background: linear-gradient(135deg, #d4edda, #a8e6cf);
                    color: #155724;
                    border: 2px solid #a8e6cf;
                }
                img { 
                    max-width: 100%; 
                    height: auto; 
                    border-radius: 10px;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                    margin: 20px 0;
                }
                .instructions {
                    background: #e3f2fd;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                    text-align: left;
                }
                .instructions h3 {
                    color: #1976d2;
                    margin-bottom: 15px;
                }
                .instructions ol {
                    padding-left: 20px;
                }
                .instructions li {
                    margin: 8px 0;
                    line-height: 1.5;
                }
                .features {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 15px;
                    margin: 30px 0;
                }
                .feature {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 10px;
                    border-left: 4px solid #25D366;
                }
                .feature-icon {
                    font-size: 1.5rem;
                    margin-bottom: 5px;
                }
                .loading {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #25D366;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .footer {
                    margin-top: 30px;
                    color: #666;
                    font-size: 0.9rem;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">🎨</div>
                <h1>Bot de Figurinhas</h1>
                <p class="subtitle">Transforme suas imagens e vídeos em figurinhas personalizadas</p>
                
                <div class="qr-container">
                    ${latestQR ? 
                        `<div class="status waiting">
                            <h2>📱 Escaneie o QR Code</h2>
                            <img src="${latestQR}" alt="QR Code" />
                            <div class="instructions">
                                <h3>📋 Como conectar:</h3>
                                <ol>
                                    <li>Abra o WhatsApp no seu celular</li>
                                    <li>Toque no menu (três pontos)</li>
                                    <li>Selecione "Aparelhos conectados"</li>
                                    <li>Toque em "Conectar um aparelho"</li>
                                    <li>Escaneie este QR Code</li>
                                </ol>
                            </div>
                        </div>` : 
                        `<div class="status waiting">
                            <h2>⏳ Aguardando QR Code...</h2>
                            <div class="loading"></div>
                            <p>O QR Code será gerado em alguns segundos.</p>
                        </div>`
                    }
                </div>
                
                <div class="features">
                    <div class="feature">
                        <div class="feature-icon">📸</div>
                        <strong>Imagens</strong><br>
                        JPG, PNG, WEBP
                    </div>
                    <div class="feature">
                        <div class="feature-icon">🎬</div>
                        <strong>Vídeos</strong><br>
                        MP4, WEBM, GIF
                    </div>
                    <div class="feature">
                        <div class="feature-icon">⚡</div>
                        <strong>Rápido</strong><br>
                        Processamento otimizado
                    </div>
                    <div class="feature">
                        <div class="feature-icon">🎨</div>
                        <strong>Qualidade</strong><br>
                        Alta resolução
                    </div>
                </div>
                
                <div class="footer">
                    <p>💡 <strong>Dica:</strong> Envie uma imagem ou vídeo para o bot no WhatsApp!</p>
                    <p>Digite <code>!figurinha</code> para ver o menu de ajuda</p>
                </div>
            </div>
            
            <script>
                // Auto-refresh para atualizar o QR Code
                if (!${!!latestQR}) {
                    setTimeout(() => {
                        location.reload();
                    }, 3000);
                }
            </script>
        </body>
        </html>
    `);
});

app.get('/qrcode', (req, res) => {
    if (!latestQR) {
        return res.send(`
            <html>
                <head>
                    <title>Bot de Figurinhas - Aguardando QR</title>
                    <meta http-equiv="refresh" content="3">
                </head>
                <body style="text-align: center; font-family: sans-serif;">
                    <h1>⏳ QR Code ainda não foi gerado</h1>
                    <p>Aguarde alguns segundos... A página será atualizada automaticamente.</p>
                </body>
            </html>
        `);
    }
    res.send(`
        <html>
            <head>
                <title>QR Code - WhatsApp Bot</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                    h1 { color: #25D366; }
                    img { max-width: 100%; height: auto; border: 2px solid #ccc; margin: 20px 0; }
                    .instructions { max-width: 500px; margin: 0 auto; text-align: left; }
                </style>
            </head>
            <body>
                <h1>📱 Escaneie o QR Code com seu WhatsApp</h1>
                <img src="${latestQR}" alt="QR Code WhatsApp" />
                <div class="instructions">
                    <h3>📋 Como conectar:</h3>
                    <ol>
                        <li>Abra o WhatsApp no seu celular</li>
                        <li>Toque no menu (três pontos) no canto superior direito</li>
                        <li>Selecione "Aparelhos conectados"</li>
                        <li>Toque em "Conectar um aparelho"</li>
                        <li>Escaneie este QR Code</li>
                    </ol>
                </div>
            </body>
        </html>
    `);
});

function setQRCode(qrString) {
    QRCode.toDataURL(qrString, (err, url) => {
        if (err) {
            console.error('Erro ao gerar QR Code:', err);
            return;
        }
        latestQR = url;
        const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;
        console.log(`✅ QR Code atualizado! Acesse: ${baseUrl}/qrcode`);
    });
}

// Health check endpoint
app.get('/health', (req, res) => {
    const health = stats.getHealthStatus();
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'warning' ? 200 : 503;
    
    res.status(statusCode).json(health);
});

// Stats endpoint
app.get('/stats', (req, res) => {
    res.json(stats.getStats());
});

// API endpoint para estatísticas em tempo real
app.get('/api/stats', (req, res) => {
    const statsData = stats.getStats();
    res.json({
        ...statsData,
        timestamp: new Date().toISOString()
    });
});

app.listen(port, config.server.host, () => {
    const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;
    logger.info('Servidor iniciado', { port, host: config.server.host });
    console.log(`🖥️ Servidor rodando em: ${baseUrl}`);
    console.log(`📱 QR Code disponível em: ${baseUrl}/qrcode`);
    console.log(`📊 Estatísticas disponíveis em: ${baseUrl}/stats`);
    console.log(`❤️ Health check disponível em: ${baseUrl}/health`);
});

module.exports = { setQRCode };