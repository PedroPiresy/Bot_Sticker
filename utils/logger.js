const config = require('../config');

class Logger {
    constructor() {
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };
        this.currentLevel = this.levels[config.logging.level] || this.levels.info;
    }

    formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
        
        if (data) {
            return `${prefix} ${message} ${JSON.stringify(data)}`;
        }
        return `${prefix} ${message}`;
    }

    log(level, message, data = null) {
        if (this.levels[level] <= this.currentLevel) {
            const formattedMessage = this.formatMessage(level, message, data);
            
            if (config.logging.enableConsole) {
                console.log(formattedMessage);
            }
            
            // Aqui poderia ser adicionado logging para arquivo se necessário
            if (config.logging.enableFile) {
                // Implementar logging para arquivo se necessário
            }
        }
    }

    error(message, data = null) {
        this.log('error', message, data);
    }

    warn(message, data = null) {
        this.log('warn', message, data);
    }

    info(message, data = null) {
        this.log('info', message, data);
    }

    debug(message, data = null) {
        this.log('debug', message, data);
    }
}

module.exports = new Logger();
