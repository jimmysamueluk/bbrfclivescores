"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { gamesApi } from "@/lib/api/games";
import { getSocket, joinGameRoom, leaveGameRoom } from "@/lib/socket/client";
import { Game } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trophy, Clock, Settings } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { formatDate } from "@/lib/utils";
import CreateMatchDialog from "@/components/live-scores/CreateMatchDialog";
import NotificationPrompt from "@/components/NotificationPrompt";
import { useRouter } from "next/navigation";

export default function LiveScoresPage() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: games = [], isLoading } = useQuery({
    queryKey: ["games"],
    queryFn: gamesApi.getAll,
    refetchInterval: 10000, // Poll every 10 seconds for mobile reliability
  });

  // Socket.IO real-time updates
  useEffect(() => {
    const socket = getSocket();

    const handleScoreUpdate = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    };

    const handleGameEvent = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    };

    socket.on("score-update", handleScoreUpdate);
    socket.on("game-event", handleGameEvent);

    return () => {
      socket.off("score-update", handleScoreUpdate);
      socket.off("game-event", handleGameEvent);
    };
  }, [queryClient]);

  // Join game rooms for live games to receive socket updates
  useEffect(() => {
    const liveGameIds = games.filter((g) => g.status === "live").map((g) => g.id);
    liveGameIds.forEach((id) => joinGameRoom(id));

    return () => {
      liveGameIds.forEach((id) => leaveGameRoom(id));
    };
  }, [games]);

  const liveGames = games.filter((g) => g.status === "live");
  const todayGames = games.filter((g) => {
    const gameDate = new Date(g.gameDate);
    const today = new Date();
    return gameDate.toDateString() === today.toDateString();
  });
  const upcomingGames = games.filter((g) => {
    const gameDate = new Date(g.gameDate);
    return gameDate > new Date() && g.status === "scheduled";
  });
  const completedGames = games.filter((g) => g.status === "fulltime");

  const tabs = [
    { label: "Live", count: liveGames.length, games: liveGames },
    { label: "Today", count: todayGames.length, games: todayGames },
    { label: "Upcoming", count: upcomingGames.length, games: upcomingGames },
    { label: "Completed", count: completedGames.length, games: completedGames },
  ];

  const canManage = user?.role === "coach" || user?.role === "admin";

  if (isLoading) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 w-16 bg-gray-100 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-8 bg-gray-200 rounded animate-pulse" />
                  <div className="flex-1 space-y-2 flex flex-col items-end">
                    <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 w-16 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Match Centre</h2>
        {canManage && (
          <Button
            className="gap-2 w-full sm:w-auto min-h-[44px]"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4" />
            Create Match
          </Button>
        )}
      </div>

      {/* Create Match Dialog */}
      {showCreateDialog && (
        <CreateMatchDialog onClose={() => setShowCreateDialog(false)} />
      )}

      {/* Notification Prompt */}
      <NotificationPrompt />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-1 px-1">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(index)}
            className={`px-4 sm:px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all min-h-[48px] flex items-center ${
              activeTab === index
                ? "bg-burgundy text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="text-sm sm:text-base">{tab.label}</span>
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === index
                  ? "bg-white/20"
                  : "bg-gray-200"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Games Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {tabs[activeTab].games.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="text-center py-12">
                  <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">
                    No {tabs[activeTab].label.toLowerCase()} matches
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            tabs[activeTab].games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function GameCard({ game }: { game: Game }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isLive = game.status === "live";
  const isCompleted = game.status === "fulltime";
  const canManage = user?.role === "coach" || user?.role === "admin";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-shadow">
        <CardContent className="p-4 sm:p-6">
          {/* Status Badge */}
          <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            {isLive ? (
              <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse-live"></span>
                <span>LIVE {game.gameTime}'</span>
              </div>
            ) : (
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  isCompleted
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {game.status.toUpperCase()}
              </span>
            )}
            {game.competition && (
              <span className="text-xs text-gray-500 truncate max-w-[150px]">{game.competition}</span>
            )}
          </div>

          {/* Score Display */}
          <div className="flex justify-between items-center mb-4 gap-2">
            <div className="flex-1 text-center min-w-0">
              <p className="font-bold text-gray-900 mb-1 text-sm sm:text-base truncate px-1">{game.homeTeamName}</p>
              <motion.p
                key={game.homeScore}
                initial={{ scale: 1.3, color: "#B8860B" }}
                animate={{ scale: 1, color: "#000" }}
                className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-burgundy to-gold bg-clip-text text-transparent"
              >
                {game.homeScore}
              </motion.p>
            </div>

            <div className="px-2 sm:px-4 text-gray-400 font-bold text-sm flex-shrink-0">VS</div>

            <div className="flex-1 text-center min-w-0">
              <p className="font-bold text-gray-900 mb-1 text-sm sm:text-base truncate px-1">{game.awayTeamName}</p>
              <motion.p
                key={game.awayScore}
                initial={{ scale: 1.3, color: "#B8860B" }}
                animate={{ scale: 1, color: "#000" }}
                className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-burgundy to-gold bg-clip-text text-transparent"
              >
                {game.awayScore}
              </motion.p>
            </div>
          </div>

          {/* Match Info */}
          <div className="flex items-center justify-center text-xs sm:text-sm text-gray-600 gap-2">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">{formatDate(game.gameDate)}</span>
          </div>
          {game.venue && (
            <p className="text-center text-xs text-gray-500 mt-1 truncate">{game.venue}</p>
          )}

          {/* Manage Button for Coaches */}
          {canManage && !isCompleted && (
            <div className="mt-4 pt-4 border-t">
              <Button
                onClick={() => router.push(`/protected/match-management/${game.id}`)}
                variant="outline"
                className="w-full min-h-[44px] gap-2 border-burgundy text-burgundy hover:bg-burgundy hover:text-white"
              >
                <Settings className="h-4 w-4" />
                {isLive ? "Manage Live Match" : "Manage Match"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
