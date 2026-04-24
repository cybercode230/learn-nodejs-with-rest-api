import chalk from "chalk";

export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
}

class Logger {
  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    let coloredLevel = level.toString();

    switch (level) {
      case LogLevel.INFO:
        coloredLevel = chalk.blue(level);
        break;
      case LogLevel.WARN:
        coloredLevel = chalk.yellow(level);
        break;
      case LogLevel.ERROR:
        coloredLevel = chalk.red(level);
        break;
      case LogLevel.DEBUG:
        coloredLevel = chalk.magenta(level);
        break;
    }

    return `[${chalk.gray(timestamp)}] [${coloredLevel}] ${message}`;
  }

  info(message: string) {
    console.log(this.formatMessage(LogLevel.INFO, message));
  }

  warn(message: string) {
    console.warn(this.formatMessage(LogLevel.WARN, message));
  }

  error(message: string, error?: any) {
    console.error(this.formatMessage(LogLevel.ERROR, message));
    if (error) {
      if (error.stack) {
        console.error(chalk.red(error.stack));
      } else {
        console.error(chalk.red(JSON.stringify(error, null, 2)));
      }
    }
  }

  debug(message: string) {
    console.log(this.formatMessage(LogLevel.DEBUG, message));
  }
}

export const logger = new Logger();
