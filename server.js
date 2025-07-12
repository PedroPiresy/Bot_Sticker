const express = require('express');
const QRCode = require('qrcode');
const app = express();
const port = 3000;

let latestQR = null;

app.get('/', (req, res) => {
    res.send(`
        <h2>QR Code para login no WhatsApp</h2>
        ${latestQR ? `<img src="${latestQR}" />` : '<p>QR ainda não gerado.</p>'}
    `);
});

app.get('/qrcode', (req, res) => {
    if (!latestQR) {
        return res.send('QR Code ainda não gerado.');
    }
    res.send(`
        <html>
            <head><title>QR Code - WhatsApp</title></head>
            <body style="text-align: center; font-family: sans-serif;">
                <h1>Escaneie o QR Code com seu WhatsApp</h1>
                <img src="${latestQR}" />
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
        console.log(`✅ QR Code atualizado! Acesse http://localhost:${port}/qrcode`);
    });
}

app.listen(port, () => {
    console.log(`🖥️ Servidor de QR rodando em: http://localhost:${port}/qrcode`);
});

module.exports = { setQRCode };
