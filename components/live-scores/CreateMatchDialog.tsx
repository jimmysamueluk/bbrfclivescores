"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { gamesApi } from "@/lib/api/games";
import { X } from "lucide-react";

interface CreateMatchDialogProps {
  onClose: () => void;
}

export default function CreateMatchDialog({ onClose }: CreateMatchDialogProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    homeTeamName: "",
    awayTeamName: "",
    gameDate: "",
    venue: "",
    competition: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.homeTeamName || !formData.awayTeamName || !formData.gameDate) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await gamesApi.create({
        homeTeamId: `team-${Date.now()}-home`,
        awayTeamId: `team-${Date.now()}-away`,
        homeTeamName: formData.homeTeamName,
        awayTeamName: formData.awayTeamName,
        gameDate: new Date(formData.gameDate).toISOString(),
        venue: formData.venue || undefined,
        competition: formData.competition || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ["games"] });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create match");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl sm:text-2xl">Create New Match</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Home Team <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Bannockburn RFC"
                value={formData.homeTeamName}
                onChange={(e) =>
                  setFormData({ ...formData, homeTeamName: e.target.value })
                }
                className="h-11 sm:h-10"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Away Team <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Opposition Team"
                value={formData.awayTeamName}
                onChange={(e) =>
                  setFormData({ ...formData, awayTeamName: e.target.value })
                }
                className="h-11 sm:h-10"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Match Date & Time <span className="text-red-500">*</span>
              </label>
              <Input
                type="datetime-local"
                value={formData.gameDate}
                onChange={(e) =>
                  setFormData({ ...formData, gameDate: e.target.value })
                }
                className="h-11 sm:h-10"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Venue</label>
              <Input
                type="text"
                placeholder="Stadium name"
                value={formData.venue}
                onChange={(e) =>
                  setFormData({ ...formData, venue: e.target.value })
                }
                className="h-11 sm:h-10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Competition
              </label>
              <Input
                type="text"
                placeholder="League, Cup, etc."
                value={formData.competition}
                onChange={(e) =>
                  setFormData({ ...formData, competition: e.target.value })
                }
                className="h-11 sm:h-10"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 min-h-[44px]"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 min-h-[44px]"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Match"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
