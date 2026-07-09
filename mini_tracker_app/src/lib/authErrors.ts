type AuthErrorLike = {
  message?: string;
  code?: string;
  status?: number;
};

function asAuthError(err: unknown): AuthErrorLike {
  if (err && typeof err === 'object') return err as AuthErrorLike;
  return { message: String(err) };
}

export function friendlySignUpError(err: unknown) {
  const { message = '', code = '' } = asAuthError(err);
  const lower = message.toLowerCase();
  const normalizedCode = code.toLowerCase();

  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Network error. Check your connection.';
  }

  if (
    normalizedCode === 'user_already_exists' ||
    normalizedCode === 'email_exists' ||
    lower.includes('already registered') ||
    lower.includes('already been registered')
  ) {
    return 'This email is already in use. Try signing in instead.';
  }

  if (
    normalizedCode === 'email_not_confirmed' ||
    lower.includes('email not confirmed') ||
    lower.includes('not confirmed')
  ) {
    return 'This email needs confirmation. Check your inbox, or turn off email confirmation in Supabase.';
  }

  if (lower.includes('invalid email') || normalizedCode === 'validation_failed') {
    return 'Please enter a valid email address.';
  }

  if (lower.includes('password')) {
    return message;
  }

  return message || 'Sign up failed.';
}

export function friendlySignInError(err: unknown) {
  const { message = '', code = '' } = asAuthError(err);
  const lower = message.toLowerCase();
  const normalizedCode = code.toLowerCase();

  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Network error. Check your connection.';
  }

  if (
    normalizedCode === 'email_not_confirmed' ||
    lower.includes('email not confirmed') ||
    lower.includes('not confirmed')
  ) {
    return 'Please confirm your email first, or disable email confirmation in Supabase Auth settings.';
  }

  if (
    normalizedCode === 'invalid_credentials' ||
    lower.includes('invalid login') ||
    lower.includes('invalid credentials') ||
    lower.includes('wrong password')
  ) {
    return 'Wrong email or password.';
  }

  return message || 'Sign in failed.';
}
