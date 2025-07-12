const express = require('express');
const QRCode = require('qrcode');
const app = express();
const port = process.env.PORT || 3000;

let latestQR = null;

app.get('/', (req, res) => {
    const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;
    res.send(`
        <html>
            <head>
                <title>Bot de Figurinhas WhatsApp</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                    h1 { color: #25D366; }
                    .qr-container { margin: 20px auto; max-width: 400px; }
                    .status { padding: 10px; margin: 10px; border-radius: 5px; }
                    .waiting { background: #fff3cd; color: #856404; }
                    .ready { background: #d4edda; color: #155724; }
                    img { max-width: 100%; height: auto; border: 2px solid #ccc; }
                </style>
            </head>
            <body>
            
                <h1>🤖 Bot de Figurinhas WhatsApp</h1>
                <div class="qr-container">
                    ${latestQR ? 
                        `<div class="status waiting">
                            <h2>📱 Escaneie o QR Code com seu WhatsApp</h2>
                            <img src="${latestQR}" alt="QR Code" />
                            <p>Abra o WhatsApp > Menu > Aparelhos conectados > Conectar um aparelho</p>
                        </div>` : 
                        `<div class="status waiting">
                            <h2>⏳ Aguardando QR Code...</h2>
                            <p>O QR Code será gerado em alguns segundos.</p>
                        </div>`
                    }
                </div>
                <script>
                    // Auto-refresh para atualizar o QR Code
                    setTimeout(() => {
                        if (!${!!latestQR}) {
                            location.reload();
                        }
                    }, 3000);
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

app.listen(port, '0.0.0.0', () => {
    const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;
    console.log(`🖥️ Servidor rodando em: ${baseUrl}`);
    console.log(`📱 QR Code disponível em: ${baseUrl}/qrcode`);
});

module.exports = { setQRCode };