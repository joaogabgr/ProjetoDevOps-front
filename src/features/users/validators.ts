/** CPF com dígitos verificadores válidos; aceita com ou sem pontuação. */
export function isValidCpf(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  const check = (length: number) => {
    const sum = digits
      .slice(0, length)
      .split('')
      .reduce((total, digit, index) => total + Number(digit) * (length + 1 - index), 0);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return check(9) === Number(digits[9]) && check(10) === Number(digits[10]);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** CPF, e-mail e senha conferidos antes de enviar (RF5). */
export function credentialErrors(
  values: { email: string; cpf: string; password: string },
  mode: 'create' | 'edit',
): Partial<Record<'email' | 'cpf' | 'password', string>> {
  const found: Partial<Record<'email' | 'cpf' | 'password', string>> = {};
  if (!isValidEmail(values.email)) found.email = 'Informe um e-mail válido.';
  if (mode === 'create') {
    if (!isValidCpf(values.cpf)) found.cpf = 'Informe um CPF válido.';
    if (values.password.length < 8 || values.password.length > 72) found.password = 'A senha deve ter de 8 a 72 caracteres.';
  }
  return found;
}
