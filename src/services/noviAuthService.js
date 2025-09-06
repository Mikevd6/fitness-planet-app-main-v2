// Simple localStorage-backed auth service used by AuthContext
const USER_KEY = 'novi_auth_user';
const TOKEN_KEY = 'novi_auth_token';

class NoviAuthService {
	isAuthenticated() {
		try {
			const token = localStorage.getItem(TOKEN_KEY);
			const user = localStorage.getItem(USER_KEY);
			return Boolean(token || user);
		} catch {
			return false;
		}
	}

	getCurrentUser() {
		try {
			const raw = localStorage.getItem(USER_KEY);
			return raw ? JSON.parse(raw) : null;
		} catch {
			return null;
		}
	}

	getToken() {
		try {
			return localStorage.getItem(TOKEN_KEY);
		} catch {
			return null;
		}
	}

	async login({ email, password }) {
		// Simulate async auth; accept any non-empty credentials
		if (!email || !password) {
			throw new Error('Invalid credentials');
		}

		const user = { email, name: email.split('@')[0] };
		const token = 'demo-token';
		localStorage.setItem(USER_KEY, JSON.stringify(user));
		localStorage.setItem(TOKEN_KEY, token);
		// Also set legacy keys used by other services/interceptors
		localStorage.setItem('user', JSON.stringify(user));
		localStorage.setItem('token', token);

		return { success: true, user, token };
	}

	async register(userData) {
		if (!userData?.email || !userData?.password) {
			throw new Error('Invalid registration data');
		}
		// No-op persistence for demo
		return { success: true, message: 'Registered successfully' };
	}

	logout() {
		try {
			localStorage.removeItem(USER_KEY);
			localStorage.removeItem(TOKEN_KEY);
		localStorage.removeItem('user');
		localStorage.removeItem('token');
		} catch {
			// ignore
		}
	}
}

export const noviAuthService = new NoviAuthService();

