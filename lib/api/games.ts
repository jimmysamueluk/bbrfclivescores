import { apiClient } from "./client";
import { Game } from "@/types";

export const gamesApi = {
  getAll: async (): Promise<Game[]> => {
    const response = await apiClient.get<Game[]>("/livescores");
    return response.data;
  },

  getById: async (id: number): Promise<Game> => {
    const response = await apiClient.get<Game>(`/livescores/${id}`);
    return response.data;
  },

  create: async (data: {
    homeTeamId: string;
    awayTeamId: string;
    homeTeamName: string;
    awayTeamName: string;
    gameDate: string;
    venue?: string;
    competition?: string;
  }): Promise<Game> => {
    const response = await apiClient.post<Game>("/livescores", data);
    return response.data;
  },

  updateStatus: async (
    id: number,
    data: { status: string; currentHalf?: number; gameTime?: number }
  ): Promise<Game> => {
    const response = await apiClient.patch<Game>(
      `/livescores/${id}/status`,
      data
    );
    return response.data;
  },

  addScore: async (
    id: number,
    data: {
      team: "home" | "away";
      scoreType: "try" | "conversion" | "penalty" | "drop_goal";
      points: number;
      playerName?: string;
      gameTime: number;
    }
  ) => {
    const response = await apiClient.post(`/livescores/${id}/score`, data);
    return response.data;
  },

  addEvent: async (
    id: number,
    data: {
      eventType: string;
      team?: "home" | "away";
      playerName?: string;
      description?: string;
      gameTime: number;
    }
  ) => {
    const response = await apiClient.post(`/livescores/${id}/event`, data);
    return response.data;
  },
};
