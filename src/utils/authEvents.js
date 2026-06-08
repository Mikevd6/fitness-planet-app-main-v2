export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized';

export const notifyUnauthorized = () => {
  window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
};
