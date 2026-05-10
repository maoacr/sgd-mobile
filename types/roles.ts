/**
 * Roles canónicos del sistema SGD.
 */
export type UserRole = 'superadmin' | 'admin_complejo' | 'player' | 'referee';

export type AuthenticatedUser =
  | { role: 'superadmin'; id: string; email: string; name: string }
  | { role: 'admin_complejo'; id: string; email: string; name: string }
  | { role: 'player'; id: string; email: string; name: string }
  | { role: 'referee'; id: string; email: string; name: string };

export function isRole<R extends AuthenticatedUser['role']>(
  user: AuthenticatedUser,
  role: R,
): user is Extract<AuthenticatedUser, { role: R }> {
  return user.role === role;
}