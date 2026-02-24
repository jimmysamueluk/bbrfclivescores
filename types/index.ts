export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "player" | "coach" | "admin";
  position?: string;
  teamId?: number;
  team?: Team;
}

export interface Team {
  id: number;
  name: string;
  ageGroup?: string;
}

export interface Game {
  id: number;
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeTeamName: string;
  awayTeamName: string;
  gameDate: string;
  venue: string | null;
  competition: string | null;
  status: "scheduled" | "live" | "halftime" | "fulltime" | "cancelled";
  homeScore: number;
  awayScore: number;
  currentHalf: number;
  gameTime: number;
  homeTeam?: Team | null;
  awayTeam?: Team | null;
  createdBy: {
    id: number;
    firstName: string;
    lastName: string;
    role: string;
  };
  scoreUpdates?: ScoreUpdate[];
  gameEvents?: GameEvent[];
}

export interface ScoreUpdate {
  id: number;
  team: "home" | "away";
  scoreType: "try" | "conversion" | "penalty" | "drop_goal";
  points: number;
  playerName: string | null;
  gameTime: number;
  timestamp: string;
  updatedBy: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface GameEvent {
  id: number;
  eventType: string;
  team: "home" | "away" | null;
  playerName: string | null;
  description: string | null;
  gameTime: number;
  timestamp: string;
  createdBy: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
