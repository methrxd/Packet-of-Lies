export const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,32}$/;

export function validateUsername(username: string) {
  return USERNAME_PATTERN.test(username);
}

export function validateStrongPassword(password: string) {
  if (password.length < 12) {
    return false;
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  return hasUpper && hasLower && hasNumber && hasSymbol;
}
