import { startEscalationCron } from './cron';

let initialized = false;

export function initializeApp() {
  if (!initialized && process.env.NODE_ENV !== 'test') {
    startEscalationCron();
    initialized = true;
    console.log('Application initialized');
  }
}

// Auto-initialize on import
if (typeof window === 'undefined') {
  initializeApp();
}
