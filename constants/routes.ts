export const Routes = {
  auth: {
    signIn: '/(auth)/sign-in' as const,
    signUp: '/(auth)/sign-up' as const,
    verifyEmail: '/(auth)/verify-email' as const,
  },

  player: {
    root: '/(player)' as const,
    teams: '/(player)/teams' as const,
    matches: '/(player)/matches' as const,
    tournaments: '/(player)/tournaments' as const,
    bookings: '/(player)/bookings' as const,
  },

  admin: {
    root: '/(admin)' as const,
    venues: '/(admin)/venues' as const,
    bookings: '/(admin)/bookings' as const,
    calendar: '/(admin)/calendar' as const,
  },

  superadmin: {
    root: '/(superadmin)' as const,
    tournaments: '/(superadmin)/(tournaments)' as const,
    users: '/(superadmin)/(users)' as const,
    settings: '/(superadmin)/(settings)' as const,
  },

  team: {
    root: '/(team)' as const,
    roster: '/(team)/(roster)' as const,
    matches: '/(team)/(matches)' as const,
    calendar: '/(team)/(calendar)' as const,
    settings: '/(team)/(settings)' as const,
  },

  drawer: {
    profile: '/(drawer)/profile' as const,
    notifications: '/(drawer)/notifications' as const,
    settings: '/(drawer)/settings' as const,
  },
} as const;