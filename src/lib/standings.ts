import { Match } from "@/types";
import { Group } from "@/lib/constants";

export interface TeamStats {
    team: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gf: number;
    ga: number;
    gd: number;
    points: number;
}

export function calculateGroupStandings(matches: Match[], group: Group): TeamStats[] {
    const groupMatches = matches.filter(m => (m as any).group === group && m.status === 'finished');
    const stats: Record<string, TeamStats> = {};

    // thorough initialization of all teams in the group would be better if we had a "Groups" constant map
    // For now, we'll build it dynamically from the matches played or scheduled in that group
    // Ideally, we should initialize with 0 for all teams even if they haven't played.
    // I will scan all matches (even non-finished) to find the teams in this group.

    const allGroupMatches = matches.filter(m => (m as any).group === group);
    allGroupMatches.forEach(m => {
        if (!stats[m.homeTeam]) stats[m.homeTeam] = initialStats(m.homeTeam);
        if (!stats[m.awayTeam]) stats[m.awayTeam] = initialStats(m.awayTeam);
    });

    // Calculate stats from finished matches
    groupMatches.forEach(m => {
        if (m.homeScore === undefined || m.awayScore === undefined) return;

        const home = stats[m.homeTeam];
        const away = stats[m.awayTeam];

        home.played += 1;
        away.played += 1;
        home.gf += m.homeScore;
        away.gf += m.awayScore;
        home.ga += m.awayScore;
        away.ga += m.homeScore;
        home.gd = home.gf - home.ga;
        away.gd = away.gf - away.ga;

        if (m.homeScore > m.awayScore) {
            home.won += 1;
            home.points += 3;
            away.lost += 1;
        } else if (m.homeScore < m.awayScore) {
            away.won += 1;
            away.points += 3;
            home.lost += 1;
        } else {
            home.drawn += 1;
            home.points += 1;
            away.drawn += 1;
            away.points += 1;
        }
    });

    // Convert to array and sort
    // Sort Order: Points > GD > GF > Head-to-Head (simplified to name for MVP if needed, but normally GD is first tiebreaker in FIFA)
    return Object.values(stats).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.gd !== a.gd) return b.gd - a.gd;
        if (b.gf !== a.gf) return b.gf - a.gf;
        return a.team.localeCompare(b.team);
    });
}

function initialStats(team: string): TeamStats {
    return {
        team,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0
    };
}
