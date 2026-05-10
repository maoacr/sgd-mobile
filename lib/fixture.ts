/**
 * Generates a round-robin fixture (everyone plays everyone).
 * Returns array of match pairs: [{home, away}, ...]
 */
export function generateRoundRobin(teamIds: string[]): Array<{ home: string; away: string }> {
  const n = teamIds.length;
  if (n < 2) return [];

  const matches: Array<{ home: string; away: string }> = [];

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      matches.push({ home: teamIds[i], away: teamIds[j] });
    }
  }

  return matches;
}

/**
 * Generates a single-elimination knockout bracket.
 * Teams are seeded/paired: 1vs8, 4vs5, 3vs6, 2vs7 (example with 8).
 * If odd number of teams, one gets a bye.
 * Returns array of rounds, each with array of matches.
 */
export function generateSingleKnockout(
  teamIds: string[],
  roundNames: string[] = ['Octavos', 'Cuartos', 'Semifinal', 'Final']
): Array<{ round: string; matches: Array<{ home: string | null; away: string | null }> }> {
  const rounds: Array<{ round: string; matches: Array<{ home: string | null; away: string | null }> }> = [];

  // Build bracket - pair first half vs second half in reverse
  const bracketTeams = [...teamIds];
  const numRounds = Math.ceil(Math.log2(teamIds.length));

  for (let r = 0; r < numRounds; r++) {
    const roundMatches: Array<{ home: string | null; away: string | null }> = [];
    const teamsInRound = Math.pow(2, numRounds - r);

    for (let m = 0; m < teamsInRound / 2; m++) {
      const homeIdx = m;
      const awayIdx = teamsInRound - 1 - m;

      roundMatches.push({
        home: bracketTeams[homeIdx] ?? null,
        away: bracketTeams[awayIdx] ?? null,
      });
    }

    rounds.push({
      round: roundNames[r] ?? `Ronda ${r + 1}`,
      matches: roundMatches,
    });

    // For next round, just keep first half (simplified)
    bracketTeams.splice(0, bracketTeams.length / 2);
    if (bracketTeams.length < 2) break;
  }

  return rounds;
}

/** Backwards-compatible alias */
export const generateKnockout = generateSingleKnockout;

/**
 * Generates groups round-robin + knockout from group winners.
 * @param teamIds - array of team IDs
 * @param groupSize - number of teams per group
 */
export function generateGroupsAndKnockout(
  teamIds: string[],
  groupSize: number
): Array<{
  round: string;
  matches: Array<{ home: string | null; away: string | null; group_name?: string }>;
}> {
  // Split into groups
  const groups: string[][] = [];
  for (let i = 0; i < teamIds.length; i += groupSize) {
    groups.push(teamIds.slice(i, i + groupSize));
  }

  const allRounds: Array<{
    round: string;
    matches: Array<{ home: string | null; away: string | null; group_name?: string }>;
  }> = [];

  // Round-robin within each group
  groups.forEach((groupTeams, gi) => {
    const groupName = `Grupo ${String.fromCharCode(65 + gi)}`;
    const groupMatches = generateRoundRobin(groupTeams);
    allRounds.push({
      round: `Grupo ${groupName}`,
      matches: groupMatches.map((m) => ({ home: m.home, away: m.away, group_name: groupName })),
    });
  });

  // Knockout from group winners
  const winners = groups.map((g) => g[0]).filter(Boolean);
  if (winners.length >= 2) {
    const knockoutRounds = generateSingleKnockout(winners, ['Semifinal', 'Final']);
    knockoutRounds.forEach((r) => allRounds.push(r));
  }

  return allRounds;
}

/**
 * Compute standings from finished matches.
 * Pure function — no side effects.
 */
export function computeStandings(matches: any[], teams: any[]) {
  const standings: Record<string, { played: number; won: number; drawn: number; lost: number; goals_for: number; goals_against: number; points: number }> = {};

  teams.forEach((t: any) => {
    standings[t.id] = { played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, points: 0 };
  });

  matches.forEach((m: any) => {
    if (m.status !== 'finished' || !m.match_results) return;
    const home = standings[m.home_team_id];
    const away = standings[m.away_team_id];
    if (!home || !away) return;

    home.played++;
    away.played++;
    home.goals_for += m.match_results.home_score;
    home.goals_against += m.match_results.away_score;
    away.goals_for += m.match_results.away_score;
    away.goals_against += m.match_results.home_score;

    if (m.match_results.home_score > m.match_results.away_score) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (m.match_results.home_score < m.match_results.away_score) {
      away.won++;
      away.points += 3;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
      home.points++;
      away.points++;
    }
  });

  return teams
    .map((t: any) => ({ ...t, ...standings[t.id] }))
    .sort((a: any, b: any) => b.points - a.points || (b.goals_for - b.goals_against) - (a.goals_for - a.goals_against));
}

/**
 * Assigns positions (seedings) to teams based on standings data.
 * Used for bracket seeding.
 */
export function assignSeedings(
  standings: Array<{ teamId: string; points: number; goalDiff: number }>,
  allTeamIds: string[]
): string[] {
  const sorted = [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.goalDiff - a.goalDiff;
  });
  return sorted.map((s) => s.teamId);
}