import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Request, Response, NextFunction } from 'express';

const { combine, timestamp, printf, colorize, errors, splat } = winston.format;

// Define log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    splat(),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        logFormat
      )
    }),
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d'
    }),
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d'
    })
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      filename: 'logs/exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m'
    })
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: 'logs/rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m'
    })
  ]
});

// Express request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  next();
};

// Shortcut methods
export const log = {
  info: (message: string, meta?: any) => logger.info(message, meta),
  error: (message: string, meta?: any) => logger.error(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta),
  http: (message: string, meta?: any) => logger.http(message, meta)
};

export default logger;