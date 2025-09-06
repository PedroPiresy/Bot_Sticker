# 🎨 Bot de Figurinhas WhatsApp

Um bot avançado de WhatsApp para criar figurinhas personalizadas a partir de imagens e vídeos.

## ✨ Funcionalidades

- **Figurinhas Estáticas**: JPG, PNG, WEBP → WebP otimizado
- **Figurinhas Animadas**: MP4, WEBM, AVI, MOV, GIF → WebP animado
- **Rate Limiting**: Proteção contra spam
- **Interface Web**: Dashboard moderno e responsivo
- **Estatísticas**: Monitoramento em tempo real
- **Health Check**: Endpoint para monitoramento

## 🚀 Deploy no Render

### Passo a Passo

1. **Faça push do código para o GitHub**
2. **Acesse [Render.com](https://render.com)**
3. **Clique em "New +" → "Web Service"**
4. **Conecte seu repositório GitHub**
5. **Configure o serviço:**
   - **Name**: `bot-sticker`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free` (ou pago se preferir)

6. **Adicione as variáveis de ambiente:**
   - `NODE_ENV`: `production`
   - `LOG_LEVEL`: `info`

7. **Clique em "Create Web Service"**

### 📱 Como Usar

1. Acesse a URL do seu serviço no Render
2. Escaneie o QR Code com seu WhatsApp
3. Envie imagens ou vídeos para o bot
4. Receba suas figurinhas personalizadas!

### 🔧 Comandos

- `!figurinha` - Menu de ajuda

### 📊 Endpoints

- `/` - Dashboard principal
- `/qrcode` - QR Code para autenticação
- `/stats` - Estatísticas de uso
- `/health` - Health check

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm run dev

# Iniciar em produção
npm start
```

## 📝 Logs

O sistema registra todos os eventos importantes para facilitar o debug e monitoramento.

---

**Nota**: O Render pode ter limitações no plano gratuito. Para uso intensivo, considere um plano pago.