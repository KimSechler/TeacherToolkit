import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Edit, Trash2, Copy } from "lucide-react";

interface GamePreviewProps {
  game: {
    id: number;
    title: string;
    description?: string;
    template: string;
    theme: string;
    content: any;
    isActive: boolean;
  };
  onEdit: (game: any) => void;
  onDelete: (gameId: number) => void;
  onDeploy: (gameId: number) => void;
}

export default function GamePreview({ game, onEdit, onDelete, onDeploy }: GamePreviewProps) {
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      await onDeploy(game.id);
    } finally {
      setIsDeploying(false);
    }
  };

  const getThemeColors = (theme: string) => {
    const themes = {
      halloween: "from-orange-400 to-red-500",
      space: "from-purple-400 to-indigo-600",
      jungle: "from-green-400 to-emerald-600",
      ocean: "from-blue-400 to-cyan-600",
      default: "from-gray-400 to-gray-600",
    };
    return themes[theme as keyof typeof themes] || themes.default;
  };

  const getThemeEmoji = (theme: string) => {
    const emojis = {
      halloween: "🎃",
      space: "🚀",
      jungle: "🌴",
      ocean: "🌊",
      default: "🎮",
    };
    return emojis[theme as keyof typeof emojis] || emojis.default;
  };

  const renderGameContent = () => {
    if (game.template === "multiple_choice") {
      return (
        <div className={`bg-gradient-to-r ${getThemeColors(game.theme)} rounded-lg p-6 text-white`}>
          <div className="text-center mb-4">
            <div className="text-2xl mb-2">{getThemeEmoji(game.theme)}</div>
            <h5 className="text-lg font-bold">{game.title}</h5>
            <p className="text-sm opacity-90">
              {game.content?.questions?.[0]?.text || "Sample question"}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {(game.content?.questions?.[0]?.options || ["Option 1", "Option 2", "Option 3", "Option 4"]).map((option: string, index: number) => (
              <Button
                key={index}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 p-3 h-auto"
              >
                <span className="text-lg mr-2">{getThemeEmoji(game.theme)}</span>
                <span className="text-sm">{option}</span>
              </Button>
            ))}
          </div>
        </div>
      );
    }
    
    if (game.template === "drag_drop") {
      return (
        <div className={`bg-gradient-to-r ${getThemeColors(game.theme)} rounded-lg p-6 text-white`}>
          <div className="text-center mb-4">
            <div className="text-2xl mb-2">{getThemeEmoji(game.theme)}</div>
            <h5 className="text-lg font-bold">{game.title}</h5>
            <p className="text-sm opacity-90">Drag and drop to match</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-sm opacity-80">Items:</p>
              {(game.content?.items || ["Item 1", "Item 2"]).map((item: string, index: number) => (
                <div key={index} className="bg-white/20 p-2 rounded text-sm">
                  {item}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-sm opacity-80">Drop zones:</p>
              {(game.content?.zones || ["Zone 1", "Zone 2"]).map((zone: string, index: number) => (
                <div key={index} className="border-2 border-white/30 border-dashed p-2 rounded text-sm">
                  {zone}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`bg-gradient-to-r ${getThemeColors(game.theme)} rounded-lg p-6 text-white text-center`}>
        <div className="text-2xl mb-2">{getThemeEmoji(game.theme)}</div>
        <h5 className="text-lg font-bold">{game.title}</h5>
        <p className="text-sm opacity-90">{game.description || "Game preview"}</p>
      </div>
    );
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{game.title}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={game.isActive ? "default" : "secondary"}>
              {game.isActive ? "Active" : "Draft"}
            </Badge>
            <Badge variant="outline">{game.template}</Badge>
          </div>
        </div>
        {game.description && (
          <p className="text-sm text-gray-600">{game.description}</p>
        )}
      </CardHeader>
      
      <CardContent>
        {renderGameContent()}
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{game.theme}</Badge>
            <span className="text-sm text-gray-500">
              {game.content?.questions?.length || 0} questions
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(game)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(game.id)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
            <Button
              size="sm"
              onClick={handleDeploy}
              disabled={isDeploying}
              className="bg-green-600 hover:bg-green-700"
            >
              {isDeploying ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isDeploying ? "Deploying..." : "Deploy"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
