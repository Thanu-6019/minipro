export const logger = {
  error: (message: string, context?: any) => {
    console.error(`[ERROR]: ${message}`, context);
  },
  warn: (message: string, context?: any) => {
    console.warn(`[WARN]: ${message}`, context);
  },
  info: (message: string, context?: any) => {
    console.info(`[INFO]: ${message}`, context);
  }
};
