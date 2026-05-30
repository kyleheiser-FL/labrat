import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleFirestoreError, OperationType, FirestoreErrorInfo } from './db';
import { auth } from '../firebase';

// Mock the firebase auth module
vi.mock('../firebase', () => {
  return {
    auth: {
      currentUser: null,
    },
    db: {},
  };
});

describe('handleFirestoreError', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    // Suppress console.error during tests since we expect errors to be thrown and logged
    console.error = vi.fn();

    // Reset mock state
    (auth as any).currentUser = null;
  });

  afterEach(() => {
    console.error = originalConsoleError;
    vi.clearAllMocks();
  });

  it('throws an error with serialized JSON payload containing Error instance properties', () => {
    const testError = new Error('Permission denied');
    const opType = OperationType.GET;
    const testPath = 'users/123/metrics';

    let caughtError: Error | null = null;
    try {
      handleFirestoreError(testError, opType, testPath);
    } catch (e) {
      caughtError = e as Error;
    }

    expect(caughtError).toBeDefined();

    const parsedPayload = JSON.parse(caughtError!.message) as FirestoreErrorInfo;
    expect(parsedPayload.error).toBe('Permission denied');
    expect(parsedPayload.operationType).toBe(OperationType.GET);
    expect(parsedPayload.path).toBe(testPath);
    expect(parsedPayload.authInfo).toEqual({
      userId: undefined,
      email: undefined,
      emailVerified: undefined,
      isAnonymous: undefined,
      tenantId: undefined,
      providerInfo: [],
    });

    // Ensure console.error was called with the correct incident payload
    expect(console.error).toHaveBeenCalledWith('Firestore Error Incident:', caughtError!.message);
  });

  it('throws an error with serialized JSON payload containing string error', () => {
    const testError = 'Something went wrong';
    const opType = OperationType.WRITE;
    const testPath = 'users/123/compounds/abc';

    let caughtError: Error | null = null;
    try {
      handleFirestoreError(testError, opType, testPath);
    } catch (e) {
      caughtError = e as Error;
    }

    expect(caughtError).toBeDefined();

    const parsedPayload = JSON.parse(caughtError!.message) as FirestoreErrorInfo;
    expect(parsedPayload.error).toBe('Something went wrong');
    expect(parsedPayload.operationType).toBe(OperationType.WRITE);
    expect(parsedPayload.path).toBe(testPath);
  });

  it('correctly populates authInfo when a user is logged in', () => {
    // Mock a logged in user
    (auth as any).currentUser = {
      uid: 'user-123',
      email: 'test@example.com',
      emailVerified: true,
      isAnonymous: false,
      tenantId: 'tenant-456',
      providerData: [
        {
          providerId: 'google.com',
          email: 'test@example.com',
          uid: 'google-uid',
          displayName: 'Test User',
          phoneNumber: null,
          photoURL: null,
        }
      ],
      displayName: 'Test User',
      phoneNumber: null,
      photoURL: null,
      metadata: {},
      providerId: 'firebase',
      refreshToken: 'token',
      delete: vi.fn(),
      getIdToken: vi.fn(),
      getIdTokenResult: vi.fn(),
      reload: vi.fn(),
      toJSON: vi.fn(),
    } as any;

    const opType = OperationType.DELETE;
    const testPath = 'users/123/notifications/1';

    let caughtError: Error | null = null;
    try {
      handleFirestoreError(new Error('Network error'), opType, testPath);
    } catch (e) {
      caughtError = e as Error;
    }

    expect(caughtError).toBeDefined();

    const parsedPayload = JSON.parse(caughtError!.message) as FirestoreErrorInfo;
    expect(parsedPayload.authInfo).toEqual({
      userId: 'user-123',
      email: 'test@example.com',
      emailVerified: true,
      isAnonymous: false,
      tenantId: 'tenant-456',
      providerInfo: [
        {
          providerId: 'google.com',
          email: 'test@example.com',
        }
      ],
    });
  });

  it('handles null paths', () => {
    let caughtError: Error | null = null;
    try {
      handleFirestoreError(new Error('Unknown error'), OperationType.LIST, null);
    } catch (e) {
      caughtError = e as Error;
    }

    expect(caughtError).toBeDefined();

    const parsedPayload = JSON.parse(caughtError!.message) as FirestoreErrorInfo;
    expect(parsedPayload.path).toBeNull();
  });
});
