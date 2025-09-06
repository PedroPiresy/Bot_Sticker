const logger = require('./logger');

class Stats {
    constructor() {
        this.stats = {
            totalStickers: 0,
            imageStickers: 0,
            videoStickers: 0,
            totalUsers: new Set(),
            dailyStats: {},
            errors: 0,
            startTime: new Date()
        };
    }

    recordSticker(userId, type) {
        this.stats.totalStickers++;
        this.stats.totalUsers.add(userId);
        
        if (type === 'image') {
            this.stats.imageStickers++;
        } else if (type === 'video') {
            this.stats.videoStickers++;
        }

        // Estatísticas diárias
        const today = new Date().toDateString();
        if (!this.stats.dailyStats[today]) {
            this.stats.dailyStats[today] = {
                stickers: 0,
                users: new Set()
            };
        }
        this.stats.dailyStats[today].stickers++;
        this.stats.dailyStats[today].users.add(userId);

        logger.info('Estatística registrada', { 
            userId, 
            type, 
            totalStickers: this.stats.totalStickers 
        });
    }

    recordError() {
        this.stats.errors++;
        logger.warn('Erro registrado nas estatísticas', { 
            totalErrors: this.stats.errors 
        });
    }

    getStats() {
        const uptime = Date.now() - this.stats.startTime.getTime();
        const uptimeHours = Math.floor(uptime / (1000 * 60 * 60));
        const uptimeMinutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));

        return {
            totalStickers: this.stats.totalStickers,
            imageStickers: this.stats.imageStickers,
            videoStickers: this.stats.videoStickers,
            totalUsers: this.stats.totalUsers.size,
            errors: this.stats.errors,
            uptime: `${uptimeHours}h ${uptimeMinutes}m`,
            dailyStats: Object.keys(this.stats.dailyStats).map(date => ({
                date,
                stickers: this.stats.dailyStats[date].stickers,
                users: this.stats.dailyStats[date].users.size
            })).slice(-7) // Últimos 7 dias
        };
    }

    getHealthStatus() {
        const stats = this.getStats();
        const errorRate = stats.totalStickers > 0 ? (stats.errors / stats.totalStickers) * 100 : 0;
        
        let status = 'healthy';
        if (errorRate > 10) {
            status = 'warning';
        }
        if (errorRate > 25) {
            status = 'critical';
        }

        return {
            status,
            uptime: stats.uptime,
            totalStickers: stats.totalStickers,
            totalUsers: stats.totalUsers,
            errorRate: errorRate.toFixed(2),
            lastUpdate: new Date().toISOString()
        };
    }
}

module.exports = new Stats();
