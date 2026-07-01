import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';

const USER_POOL_ID = import.meta.env.VITE_USER_POOL_ID || '';
const CLIENT_ID = import.meta.env.VITE_USER_POOL_CLIENT_ID || '';

let userPool: CognitoUserPool | null = null;
try {
  if (USER_POOL_ID && CLIENT_ID) {
    userPool = new CognitoUserPool({
      UserPoolId: USER_POOL_ID,
      ClientId: CLIENT_ID,
    });
  }
} catch (e) {
  console.warn('Cognito not configured:', e);
}

export interface AuthUser {
  email: string;
  sub: string;
}

export function signUp(email: string, password: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!userPool) {
      reject(new Error('Authentication not configured. Please set VITE_USER_POOL_ID and VITE_USER_POOL_CLIENT_ID.'));
      return;
    }

    const attributes = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
    ];

    userPool.signUp(email, password, attributes, [], (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

export function confirmSignUp(email: string, code: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!userPool) {
      reject(new Error('Authentication not configured.'));
      return;
    }

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

export function signIn(email: string, password: string): Promise<CognitoUserSession> {
  return new Promise((resolve, reject) => {
    if (!userPool) {
      reject(new Error('Authentication not configured. Please set VITE_USER_POOL_ID and VITE_USER_POOL_CLIENT_ID.'));
      return;
    }

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session) => {
        resolve(session);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}

export function signOut(): void {
  if (!userPool) return;
  const currentUser = userPool.getCurrentUser();
  if (currentUser) {
    currentUser.signOut();
  }
}

export function getCurrentSession(): Promise<CognitoUserSession | null> {
  return new Promise((resolve) => {
    if (!userPool) {
      resolve(null);
      return;
    }

    const currentUser = userPool.getCurrentUser();
    if (!currentUser) {
      resolve(null);
      return;
    }

    currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) {
        resolve(null);
        return;
      }
      resolve(session);
    });
  });
}

export function getIdToken(): Promise<string | null> {
  return new Promise((resolve) => {
    if (!userPool) {
      resolve(null);
      return;
    }

    const currentUser = userPool.getCurrentUser();
    if (!currentUser) {
      resolve(null);
      return;
    }

    currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) {
        resolve(null);
        return;
      }
      resolve(session.getIdToken().getJwtToken());
    });
  });
}

export function getCurrentUser(): AuthUser | null {
  if (!userPool) return null;
  const currentUser = userPool.getCurrentUser();
  if (!currentUser) return null;

  return {
    email: currentUser.getUsername(),
    sub: '',
  };
}
