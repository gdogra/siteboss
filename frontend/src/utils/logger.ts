interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

class Logger {
  private isDevelopment = process.env.REACT_APP_ENVIRONMENT === 'development';
  private isDebugMode = process.env.REACT_APP_DEBUG === 'true';

  private formatMessage(level: string, message: string, context?: any): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${contextStr}`;
  }

  error(message: string, error?: Error | any, context?: any): void {
    const formattedMessage = this.formatMessage(LOG_LEVELS.ERROR, message, context);
    
    console.error(formattedMessage, error);
    
    // In production, you might want to send errors to a monitoring service
    if (!this.isDevelopment) {
      // Example: Sentry, LogRocket, etc.
      // this.sendToMonitoring('error', message, error, context);
    }
  }

  warn(message: string, context?: any): void {
    if (this.isDevelopment || this.isDebugMode) {
      const formattedMessage = this.formatMessage(LOG_LEVELS.WARN, message, context);
      console.warn(formattedMessage);
    }
  }

  info(message: string, context?: any): void {
    if (this.isDevelopment || this.isDebugMode) {
      const formattedMessage = this.formatMessage(LOG_LEVELS.INFO, message, context);
      console.info(formattedMessage);
    }
  }

  debug(message: string, context?: any): void {
    if (this.isDevelopment && this.isDebugMode) {
      const formattedMessage = this.formatMessage(LOG_LEVELS.DEBUG, message, context);
      console.debug(formattedMessage);
    }
  }

  // Method to send errors to monitoring service (placeholder)
  private sendToMonitoring(level: string, message: string, error?: any, context?: any): void {
    // Implement your monitoring service integration here
    // Example: Sentry.captureException, LogRocket.captureException, etc.
  }
}

export const logger = new Logger();
export default logger;