import { createLogger, format, transports } from 'winston'

export const logger = createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp(),
    format.colorize(),
    format.align(),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)),
  transports: new transports.Console()
})
