/**
 * File: logger.ts
 * What it is doing: Provides a custom, color-coded logging utility.
 * Responsibility: Formatting log messages with timestamps and severity levels, and outputting them to the console.
 * Outcomes: Standardizes console output across the application, making debugging and monitoring easier.
 */
import chalk from "chalk";

// Define supported log severity levels
export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
}

class Logger {
  // Helper to format the message with a timestamp and colored prefix
  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    let coloredLevel = level.toString();

    // Apply specific colors based on the log level using chalk
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

    // Return the assembled log string
    return `[${chalk.gray(timestamp)}] [${coloredLevel}] ${message}`;
  }

  // Log standard informational messages
  info(message: string) {
    console.log(this.formatMessage(LogLevel.INFO, message));
  }

  // Log warnings that don't halt execution
  warn(message: string) {
    console.warn(this.formatMessage(LogLevel.WARN, message));
  }

  // Log critical errors, optionally including stack traces or detailed objects
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

  // Log debug information for development purposes
  debug(message: string) {
    console.log(this.formatMessage(LogLevel.DEBUG, message));
  }
}

// Export a singleton instance of the logger
export const logger = new Logger();

