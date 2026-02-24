"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { gamesApi } from "@/lib/api/games";
import { apiClient } from "@/lib/api/client";
import { getSocket } from "@/lib/socket/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Clock,
  Trophy,
  Target,
  Zap,
  Undo2,
  Edit
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { formatDate } from "@/lib/utils";

export default function MatchManagementPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = parseInt(params.id as string);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [selectedTeam, setSelectedTeam] = useState<"home" | "away">("home");
  const [selectedScoreType, setSelectedScoreType] = useState<"try" | "conversion" | "penalty" | "drop_goal" | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<number>(0);
  const [playerName, setPlayerName] = useState("");
  const [gameTime, setGameTime] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch game data
  const { data: game, isLoading } = useQuery({
    queryKey: ["game", gameId],
    queryFn: () => gamesApi.getById(gameId),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Socket.IO real-time updates
  useEffect(() => {
    const socket = getSocket();

    const handleScoreUpdate = (data: any) => {
      if (data.gameId === gameId) {
        queryClient.invalidateQueries({ queryKey: ["game", gameId] });
      }
    };

    const handleGameEvent = (data: any) => {
      if (data.gameId === gameId) {
        queryClient.invalidateQueries({ queryKey: ["game", gameId] });
      }
    };

    socket.on("score-update", handleScoreUpdate);
    socket.on("game-event", handleGameEvent);

    return () => {
      socket.off("score-update", handleScoreUpdate);
      socket.off("game-event", handleGameEvent);
    };
  }, [gameId, queryClient]);

  // Update game time from live game
  useEffect(() => {
    if (game?.gameTime) {
      setGameTime(game.gameTime);
    }
  }, [game?.gameTime]);

  const handleSelectScore = (scoreType: "try" | "conversion" | "penalty" | "drop_goal", points: number) => {
    setSelectedScoreType(scoreType);
    setSelectedPoints(points);
  };

  const handleSubmitScore = async () => {
    if (!game || !selectedScoreType) {
      alert("Please select a score type first");
      return;
    }

    try {
      setLoading(true);
      await gamesApi.addScore(gameId, {
        team: selectedTeam,
        scoreType: selectedScoreType,
        points: selectedPoints,
        playerName: playerName || undefined,
        gameTime: gameTime || game.gameTime || 0,
      });

      // Clear form after scoring
      setPlayerName("");
      setGameTime(0);
      setSelectedScoreType(null);
      setSelectedPoints(0);

      // Refresh game data
      queryClient.invalidateQueries({ queryKey: ["game", gameId] });
    } catch (err) {
      console.error("Failed to add score:", err);
      alert("Failed to add score. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!game) return;

    try {
      setLoading(true);
      const updateData: any = {
        status,
        gameTime: gameTime || game.gameTime || 0,
      };

      // Set currentHalf based on status
      if (status === "live") {
        updateData.currentHalf = game.status === "halftime" ? 2 : 1;
      }

      console.log("Updating status:", updateData);
      await gamesApi.updateStatus(gameId, updateData);
      queryClient.invalidateQueries({ queryKey: ["game", gameId] });
    } catch (err: any) {
      console.error("Failed to update status:", err);
      const errorMsg = err?.response?.data?.error || err?.message || "Failed to update status. Please try again.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUndoLastScore = async () => {
    if (scoreUpdates.length === 0) {
      alert("No scores to undo");
      return;
    }

    const lastScore = scoreUpdates[scoreUpdates.length - 1];
    const confirmed = window.confirm(
      `Undo ${lastScore.scoreType.toUpperCase()} (${lastScore.points} pts) for ${
        lastScore.team === "home" ? game.homeTeamName : game.awayTeamName
      }?`
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      await apiClient.delete(`/livescores/${gameId}/score/${lastScore.id}`);
      queryClient.invalidateQueries({ queryKey: ["game", gameId] });
    } catch (err: any) {
      console.error("Failed to undo score:", err);
      const errorMsg = err?.response?.data?.error || err?.message || "Failed to undo score.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditScore = async (score: any) => {
    const confirmed = window.confirm(
      `Edit this ${score.scoreType.toUpperCase()}? The original score will be removed and you can re-enter the details.`
    );
    if (!confirmed) return;

    try {
      setLoading(true);

      // Delete the score
      await apiClient.delete(`/livescores/${gameId}/score/${score.id}`);

      // Populate form with score data
      setSelectedTeam(score.team);
      setSelectedScoreType(score.scoreType);
      setSelectedPoints(score.points);
      setPlayerName(score.playerName || "");
      setGameTime(score.gameTime || 0);

      // Refresh game data
      queryClient.invalidateQueries({ queryKey: ["game", gameId] });

      // Scroll to form
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Failed to edit score:", err);
      const errorMsg = err?.response?.data?.error || err?.message || "Failed to edit score.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !game) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy"></div>
      </div>
    );
  }

  // Check if user can manage this game
  const canManage = user?.role === "coach" || user?.role === "admin";
  if (!canManage) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-red-600">You don't have permission to manage this match.</p>
        </CardContent>
      </Card>
    );
  }

  const isLive = game.status === "live";
  const scoreUpdates = game.scoreUpdates || [];
  const gameEvents = game.gameEvents || [];

  // Combine and sort timeline events (newest first at top)
  const timelineEvents = [
    ...scoreUpdates.map((s: any) => ({ ...s, type: 'score', timestamp: s.timestamp || s.createdAt })),
    ...gameEvents.map((e: any) => ({ ...e, type: 'event', timestamp: e.timestamp || e.createdAt }))
  ].sort((a, b) => {
    // Sort by ID (higher ID = more recent) for newest at top
    return (b.id || 0) - (a.id || 0);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/protected/live-scores")}
          className="min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Match Management</h2>
      </div>

      {/* Score Board */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">{formatDate(game.gameDate)}</p>
            {game.competition && (
              <p className="text-xs text-gray-500">{game.competition}</p>
            )}
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="flex-1 text-center">
              <p className="font-bold text-lg sm:text-xl mb-2">{game.homeTeamName}</p>
              <p className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-burgundy to-gold bg-clip-text text-transparent">
                {game.homeScore}
              </p>
            </div>

            <div className="px-4 text-gray-400 font-bold text-xl">VS</div>

            <div className="flex-1 text-center">
              <p className="font-bold text-lg sm:text-xl mb-2">{game.awayTeamName}</p>
              <p className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-burgundy to-gold bg-clip-text text-transparent">
                {game.awayScore}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          {game.status && (
            <div className="text-center">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                game.status === 'live' ? 'bg-red-100 text-red-800' :
                game.status === 'halftime' ? 'bg-yellow-100 text-yellow-800' :
                game.status === 'fulltime' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {game.status.toUpperCase()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Score Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Add Score</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Team Selection - Enhanced with scores and colors */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-center text-gray-700">
              ⚡ Scoring for:
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedTeam("home")}
                className={`relative p-4 rounded-xl border-4 transition-all min-h-[100px] flex flex-col items-center justify-center gap-2 ${
                  selectedTeam === "home"
                    ? "border-burgundy bg-burgundy text-white scale-105 shadow-xl"
                    : "border-gray-300 bg-white text-gray-700 hover:border-burgundy/50"
                }`}
              >
                {selectedTeam === "home" && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    SELECTED
                  </div>
                )}
                <div className={`text-center ${selectedTeam === "home" ? "text-white" : "text-burgundy"}`}>
                  <p className="font-bold text-lg mb-1">{game.homeTeamName}</p>
                  <p className="text-3xl font-black">{game.homeScore}</p>
                  <p className="text-xs mt-1 opacity-80">points</p>
                </div>
              </button>

              <button
                onClick={() => setSelectedTeam("away")}
                className={`relative p-4 rounded-xl border-4 transition-all min-h-[100px] flex flex-col items-center justify-center gap-2 ${
                  selectedTeam === "away"
                    ? "border-gold bg-gold text-white scale-105 shadow-xl"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gold/50"
                }`}
              >
                {selectedTeam === "away" && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    SELECTED
                  </div>
                )}
                <div className={`text-center ${selectedTeam === "away" ? "text-white" : "text-gold-dark"}`}>
                  <p className="font-bold text-lg mb-1">{game.awayTeamName}</p>
                  <p className="text-3xl font-black">{game.awayScore}</p>
                  <p className="text-xs mt-1 opacity-80">points</p>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Score Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Button
              onClick={() => handleSelectScore("try", 5)}
              disabled={loading}
              variant="outline"
              className={`h-24 flex-col gap-2 border-2 transition-all ${
                selectedScoreType === "try"
                  ? "border-burgundy bg-burgundy text-white scale-105 shadow-lg"
                  : "border-burgundy hover:bg-burgundy hover:text-white"
              }`}
            >
              <Trophy className="h-6 w-6" />
              <div className="text-center">
                <div className="text-2xl font-bold">5</div>
                <div className="text-xs">Try</div>
              </div>
            </Button>

            <Button
              onClick={() => handleSelectScore("conversion", 2)}
              disabled={loading}
              variant="outline"
              className={`h-24 flex-col gap-2 border-2 transition-all ${
                selectedScoreType === "conversion"
                  ? "border-gold bg-gold text-white scale-105 shadow-lg"
                  : "border-gold hover:bg-gold hover:text-white"
              }`}
            >
              <Target className="h-6 w-6" />
              <div className="text-center">
                <div className="text-2xl font-bold">2</div>
                <div className="text-xs">Conversion</div>
              </div>
            </Button>

            <Button
              onClick={() => handleSelectScore("penalty", 3)}
              disabled={loading}
              variant="outline"
              className={`h-24 flex-col gap-2 border-2 transition-all ${
                selectedScoreType === "penalty"
                  ? "border-burgundy-light bg-burgundy-light text-white scale-105 shadow-lg"
                  : "border-burgundy-light hover:bg-burgundy-light hover:text-white"
              }`}
            >
              <Zap className="h-6 w-6" />
              <div className="text-center">
                <div className="text-2xl font-bold">3</div>
                <div className="text-xs">Penalty</div>
              </div>
            </Button>

            <Button
              onClick={() => handleSelectScore("drop_goal", 3)}
              disabled={loading}
              variant="outline"
              className={`h-24 flex-col gap-2 border-2 transition-all ${
                selectedScoreType === "drop_goal"
                  ? "border-gold-dark bg-gold-dark text-white scale-105 shadow-lg"
                  : "border-gold-dark hover:bg-gold-dark hover:text-white"
              }`}
            >
              <Trophy className="h-6 w-6" />
              <div className="text-center">
                <div className="text-2xl font-bold">3</div>
                <div className="text-xs">Drop Goal</div>
              </div>
            </Button>
          </div>

          {/* Player Name (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Player (optional)
            </label>
            <Input
              type="text"
              placeholder="Enter player name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="h-12 text-base"
            />
          </div>

          {/* Score Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Time (minutes)
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="0"
                value={gameTime}
                onChange={(e) => setGameTime(parseInt(e.target.value) || 0)}
                className="h-12 text-base text-center"
                min="0"
                max="120"
              />
              <Clock className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </div>
          </div>

          {/* Submit Score Button */}
          <Button
            onClick={handleSubmitScore}
            disabled={loading || !selectedScoreType}
            className="w-full h-14 text-lg font-bold gap-2"
            size="lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Adding Score...
              </>
            ) : (
              <>
                <Trophy className="h-5 w-5" />
                Submit Score
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Score Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl">Match Timeline</CardTitle>
            {scoreUpdates.length > 0 && (
              <Button
                onClick={handleUndoLastScore}
                disabled={loading}
                variant="outline"
                size="sm"
                className="gap-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white min-h-[44px]"
              >
                <Undo2 className="h-4 w-4" />
                Undo Last Score
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {timelineEvents.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No events yet</p>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {timelineEvents.map((event: any, index: number) => (
                  <motion.div
                    key={`${event.type}-${event.id}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-4 rounded-lg border-l-4 ${
                      event.type === 'score'
                        ? event.team === 'home'
                          ? 'border-burgundy bg-burgundy/5'
                          : 'border-gold bg-gold/5'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm bg-gray-900 text-white px-2 py-0.5 rounded">
                            {event.gameTime}'
                          </span>
                          {event.type === 'score' && (
                            <span className="font-semibold text-sm">
                              {event.team === 'home' ? game.homeTeamName : game.awayTeamName}
                            </span>
                          )}
                        </div>

                        {event.type === 'score' ? (
                          <div className="space-y-1">
                            <p className="font-bold text-lg">
                              {event.scoreType.toUpperCase()} - {event.points} points
                            </p>
                            {event.playerName && (
                              <p className="text-sm text-gray-600">
                                Scored by: {event.playerName}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              Score: {event.homeScoreAfter} - {event.awayScoreAfter}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-semibold">{event.eventType}</p>
                            {event.description && (
                              <p className="text-sm text-gray-600">{event.description}</p>
                            )}
                            {event.playerName && (
                              <p className="text-sm text-gray-600">Player: {event.playerName}</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </div>
                        {event.type === 'score' && (
                          <Button
                            onClick={() => handleEditScore(event)}
                            disabled={loading}
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
