// utils/authEvents.ts - Global auth event system for force logout from anywhere in the app

type AuthEventListener = (reason?: string) => void;

let logoutListeners: AuthEventListener[] = [];

export const authEvents = {
  addLogoutListener(listener: AuthEventListener) {
    logoutListeners.push(listener);
    return () => {
      logoutListeners = logoutListeners.filter(l => l !== listener);
    };
  },
  emitLogout(reason?: string) {
    logoutListeners.forEach(listener => listener(reason));
  },
};
