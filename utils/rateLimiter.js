const config = require('../config');
const logger = require('./logger');

class RateLimiter {
    constructor() {
        this.requests = new Map(); // userId -> { count, lastRequest, cooldown }
    }

    isAllowed(userId) {
        const now = Date.now();
        const userRequests = this.requests.get(userId);

        if (!userRequests) {
            this.requests.set(userId, {
                count: 1,
                lastRequest: now,
                cooldown: false
            });
            return true;
        }

        // Verifica se está em cooldown
        if (userRequests.cooldown && (now - userRequests.lastRequest) < config.rateLimit.cooldownTime) {
            return false;
        }

        // Reset cooldown se passou o tempo
        if (userRequests.cooldown && (now - userRequests.lastRequest) >= config.rateLimit.cooldownTime) {
            userRequests.cooldown = false;
            userRequests.count = 0;
        }

        // Verifica limite por minuto
        const oneMinuteAgo = now - 60000;
        if (userRequests.lastRequest < oneMinuteAgo) {
            userRequests.count = 1;
            userRequests.lastRequest = now;
            return true;
        }

        // Verifica limite por hora
        const oneHourAgo = now - 3600000;
        if (userRequests.lastRequest < oneHourAgo) {
            userRequests.count = 1;
            userRequests.lastRequest = now;
            return true;
        }

        // Incrementa contador
        userRequests.count++;
        userRequests.lastRequest = now;

        // Verifica limites
        if (userRequests.count > config.rateLimit.maxRequestsPerMinute) {
            userRequests.cooldown = true;
            logger.warn(`Rate limit excedido para usuário ${userId}`, {
                count: userRequests.count,
                limit: config.rateLimit.maxRequestsPerMinute
            });
            return false;
        }

        return true;
    }

    getRemainingTime(userId) {
        const userRequests = this.requests.get(userId);
        if (!userRequests || !userRequests.cooldown) {
            return 0;
        }

        const now = Date.now();
        const remainingTime = config.rateLimit.cooldownTime - (now - userRequests.lastRequest);
        return Math.max(0, Math.ceil(remainingTime / 1000));
    }

    // Limpa requisições antigas (chamado periodicamente)
    cleanup() {
        const now = Date.now();
        const oneHourAgo = now - 3600000;

        for (const [userId, userRequests] of this.requests.entries()) {
            if (userRequests.lastRequest < oneHourAgo) {
                this.requests.delete(userId);
            }
        }
    }
}

// Instância singleton
const rateLimiter = new RateLimiter();

// Limpeza automática a cada 30 minutos
setInterval(() => {
    rateLimiter.cleanup();
}, 30 * 60 * 1000);

module.exports = rateLimiter;
