// Usage:
// import { logger } from './logger';
// logger.info('Message', { context: 'optional' });
// logger.error('Error message', { error });
// logger.debug('Debug message');
// To enable debug mode in browser: localStorage.setItem('debug', 'true');

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function getTimestamp() {
  return new Date().toISOString();
}

function log(level: LogLevel, message: string, context?: Record<string, any>) {
  const base = `[${getTimestamp()}] [${level.toUpperCase()}] ${message}`;
  if (context) {
    if (level === 'error') {
      // Print context as JSON for errors
      console.error(base, JSON.stringify(context));
    } else {
      console.log(base, JSON.stringify(context));
    }
  } else {
    if (level === 'error') {
      console.error(base);
    } else if (level === 'warn') {
      console.warn(base);
    } else if (level === 'debug') {
      if (process.env.NODE_ENV === 'development' || window.localStorage.getItem('debug') === 'true') {
        console.debug(base);
      }
    } else {
      console.log(base);
    }
  }
  // TODO: Integrate with remote log service (e.g., Sentry, LogRocket) if configured
}

export const logger = {
  info: (msg: string, ctx?: Record<string, any>) => log('info', msg, ctx),
  warn: (msg: string, ctx?: Record<string, any>) => log('warn', msg, ctx),
  error: (msg: string, ctx?: Record<string, any>) => log('error', msg, ctx),
  debug: (msg: string, ctx?: Record<string, any>) => log('debug', msg, ctx),
}; 