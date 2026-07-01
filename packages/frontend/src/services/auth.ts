import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';

const USER_POOL_ID = import.meta.env.VITE_USER_POOL_ID || '';
const CLIENT_ID = import.meta.env.VITE_USER_POOL_CLIENT_ID || '';
const DEMO_MODE = !USER_POOL_ID || !CLIENT_ID;

let userPool: CognitoUserPool | null = null;
try {
  if (USER_POOL_ID && CLIENT_ID) {
    userPool = new CognitoUserPool({
      UserPoolId: USER_POOL_ID,
      ClientId: CLIENT_ID,
    });
  }
} catch (e) {
  console.warn('Cognito not configured, running in demo mode:', e);
}

export interface AuthUser {
  email: string;
  sub: string;
}

// Demo mode session mock
const DEMO_SESSION_KEY = 'demo_session';

function getDemoSession(): boolean {
  return localStorage.getItem(DEMO_SESSION_KEY) === 'true';
}

function setDemoSession(email: string): void {
  localStorage.setItem(DEMO_SESSION_KEY, 'true');
  localStorage.setItem('demo_email', email);
}

function clearDemoSession(): void {
  localStorage.removeItem(DEMO_SESSION_KEY);
  localStorage.removeItem('demo_email');
}

// Mock CognitoUserSession for demo mode
class MockIdToken {
  decodePayload() {
    return { email: localStorage.getItem('demo_email') || 'demo@example.com', sub: 'demo-user-123' };
  }
  getJwtToken() {
    return 'demo-jwt-token';
  }
}

class MockSession {
  isValid() { return true; }
  getIdToken() { return new MockIdToken(); }
}

export function signUp(email: string, password: string): Promise<void> {
  if (DEMO_MODE) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    if (!userPool) {
      reject(new Error('Authentication not configured.'));
      return;
    }

    const attributes = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
    ];

    userPool.signUp(email, password, attributes, [], (err) => {
      if (err) { reject(err); return; }
      resolve();
    });
  });
}

export function confirmSignUp(email: string, code: string): Promise<void> {
  if (DEMO_MODE) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    if (!userPool) {
      reject(new Error('Authentication not configured.'));
      return;
    }

    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
    cognitoUser.confirmRegistration(code, true, (err) => {
      if (err) { reject(err); return; }
      resolve();
    });
  });
}

export function signIn(email: string, password: string): Promise<any> {
  if (DEMO_MODE) {
    setDemoSession(email);
    return Promise.resolve(new MockSession());
  }

  return new Promise((resolve, reject) => {
    if (!userPool) {
      reject(new Error('Authentication not configured.'));
      return;
    }

    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session) => { resolve(session); },
      onFailure: (err) => { reject(err); },
    });
  });
}

export function signOut(): void {
  if (DEMO_MODE) {
    clearDemoSession();
    return;
  }
  if (!userPool) return;
  const currentUser = userPool.getCurrentUser();
  if (currentUser) { currentUser.signOut(); }
}

export function getCurrentSession(): Promise<any> {
  if (DEMO_MODE) {
    if (getDemoSession()) {
      return Promise.resolve(new MockSession());
    }
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    if (!userPool) { resolve(null); return; }
    const currentUser = userPool.getCurrentUser();
    if (!currentUser) { resolve(null); return; }
    currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) { resolve(null); return; }
      resolve(session);
    });
  });
}

export function getIdToken(): Promise<string | null> {
  if (DEMO_MODE) {
    if (getDemoSession()) return Promise.resolve('demo-jwt-token');
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    if (!userPool) { resolve(null); return; }
    const currentUser = userPool.getCurrentUser();
    if (!currentUser) { resolve(null); return; }
    currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) { resolve(null); return; }
      resolve(session.getIdToken().getJwtToken());
    });
  });
}

export function getCurrentUser(): AuthUser | null {
  if (DEMO_MODE) {
    if (getDemoSession()) {
      return { email: localStorage.getItem('demo_email') || 'demo@example.com', sub: 'demo-user-123' };
    }
    return null;
  }
  if (!userPool) return null;
  const currentUser = userPool.getCurrentUser();
  if (!currentUser) return null;
  return { email: currentUser.getUsername(), sub: '' };
}

export function isDemoMode(): boolean {
  return DEMO_MODE;
}
