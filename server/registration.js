const API_URL = 'https://novi-backend-api-wgsgz.ondigitalocean.app/api';

export class RegistrationError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const validateRegistration = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new RegistrationError(400, 'Vul het registratieformulier in.');
  }
  const { email, password } = input;
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (cleanEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new RegistrationError(400, 'Vul een geldig e-mailadres in.');
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    throw new RegistrationError(400, 'Kies een wachtwoord van 8 tot 128 tekens.');
  }
  return { email: cleanEmail, password };
};

export const createNoviAccount = async (input, config, fetchImpl = fetch) => {
  const { email, password } = validateRegistration(input);
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'novi-education-project-id': config.projectId
  };

  let login;
  try {
    login = await fetchImpl(`${API_URL}/login`, {
      method: 'POST', headers,
      body: JSON.stringify({ email: config.adminEmail, password: config.adminPassword }),
      signal: AbortSignal.timeout(10000)
    });
  } catch {
    throw new RegistrationError(502, 'De NOVI-API is tijdelijk niet bereikbaar. Probeer het later opnieuw.');
  }

  if (!login.ok) {
    throw new RegistrationError(502, 'Registratie is tijdelijk niet beschikbaar. Neem contact op met de beheerder.');
  }
  const { token } = await login.json();
  if (!token) throw new RegistrationError(502, 'De NOVI-API gaf geen beheerderssessie terug.');

  let users;
  try {
    const response = await fetchImpl(`${API_URL}/users`, {
      method: 'GET',
      headers: { ...headers, Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error('User list unavailable');
    users = await response.json();
  } catch {
    throw new RegistrationError(502, 'Kan bestaande accounts nu niet controleren. Probeer het later opnieuw.');
  }
  if (!Array.isArray(users)) throw new RegistrationError(502, 'De NOVI-API gaf geen gebruikerslijst terug.');
  if (users.some((user) => user.email?.trim().toLowerCase() === email)) {
    throw new RegistrationError(409, 'Dit e-mailadres is al geregistreerd.');
  }

  let created;
  try {
    created = await fetchImpl(`${API_URL}/users`, {
      method: 'POST',
      headers: { ...headers, Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email, password, roles: ['user'] }),
      signal: AbortSignal.timeout(10000)
    });
  } catch {
    throw new RegistrationError(502, 'De NOVI-API is tijdelijk niet bereikbaar. Probeer het later opnieuw.');
  }

  if (created.status === 400 || created.status === 409) {
    throw new RegistrationError(409, 'Dit e-mailadres is al geregistreerd of kan niet worden gebruikt.');
  }
  if (!created.ok) {
    throw new RegistrationError(502, 'Registratie is tijdelijk niet beschikbaar. Probeer het later opnieuw.');
  }

  const account = await created.json();
  return { email: account.email || email };
};
