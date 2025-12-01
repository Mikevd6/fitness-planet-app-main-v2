const USER_KEY = 'user';

const persistUser = (user, token = null) => {
  const data = { ...user, token };
  localStorage.setItem(USER_KEY, JSON.stringify(data));
  return data;
};

export const noviAuthService = {
  isAuthenticated() {
    return Boolean(localStorage.getItem(USER_KEY));
  },

  getCurrentUser() {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  getToken() {
    const stored = this.getCurrentUser();
    return stored?.token || null;
  },

  async login(credentials) {
    const email = credentials?.email || 'gebruiker@fitnessplanet.com';
    const user = { name: email, email };
    const token = 'demo-token';
    persistUser(user, token);
    return { success: true, user, token };
  },

  async register(userData) {
    const user = { name: userData?.name || 'Nieuwe gebruiker' };
    persistUser(user);
    return { success: true, user };
  },

  logout() {
    localStorage.removeItem(USER_KEY);
    return { success: true };
  }
};
