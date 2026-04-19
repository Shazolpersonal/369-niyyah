/**
 * A centralized logger utility to handle environment-specific logging.
 * In development (__DEV__ is true), it logs detailed information including raw errors and stack traces.
 * In production, it sanitizes logs to avoid exposing sensitive internal information.
 */

export const logger = {
    error: (message: string, ...args: any[]) => {
        if (__DEV__) {
            console.error(message, ...args);
        } else {
            // In production, log only the descriptive message to the console
            // to avoid exposing stack traces or app internal paths.
            console.error(message);
        }
    },
    warn: (message: string, ...args: any[]) => {
        if (__DEV__) {
            console.warn(message, ...args);
        } else {
            console.warn(message);
        }
    },
    log: (message: string, ...args: any[]) => {
        if (__DEV__) {
            console.log(message, ...args);
        }
    },
};

export default logger;
