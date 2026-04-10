export interface User {
  email: string;
  displayName?: string;
}

type AuthCallback = (user: User | null) => void;

const STORAGE_KEY = "swishti-local-user";

const listeners = new Set<AuthCallback>();

function readStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

let currentUser: User | null = readStoredUser();

function persistUser(user: User | null) {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore storage failures
  }
}

function emit(user: User | null) {
  currentUser = user;
  persistUser(user);
  listeners.forEach((listener) => listener(user));
}

function makeUser(email: string): User {
  return { email };
}

export async function signup(email: string, password: string) {
  try {
    if (!email || !password) throw new Error("Please fill in all fields");
    const user = makeUser(email);
    emit(user);
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : "Signup failed" };
  }
}

export async function login(email: string, password: string) {
  try {
    if (!email || !password) throw new Error("Please fill in all fields");
    const user = makeUser(email);
    emit(user);
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : "Login failed" };
  }
}

export async function logout() {
  try {
    emit(null);
    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Logout failed" };
  }
}

export function subscribeToAuthChanges(callback: AuthCallback) {
  listeners.add(callback);
  callback(currentUser);
  return () => {
    listeners.delete(callback);
  };
}
