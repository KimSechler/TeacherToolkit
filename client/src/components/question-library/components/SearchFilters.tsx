import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, X } from "lucide-react";

interface SearchFiltersProps {
  categories: string[];
  difficulties: string[];
  visualTypes: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (difficulty: string) => void;
  selectedVisualType: string;
  setSelectedVisualType: (type: string) => void;
  showFavorites: boolean;
  setShowFavorites: (show: boolean) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
}

export function SearchFilters({
  categories,
  difficulties,
  visualTypes,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedVisualType,
  setSelectedVisualType,
  showFavorites,
  setShowFavorites,
  hasActiveFilters,
  clearFilters
}: SearchFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filters:</span>
        {hasActiveFilters && (
          <Button onClick={clearFilters} variant="ghost" size="sm" className="h-6 px-2 text-xs">
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Category Filter */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Category</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category} className="text-xs">
                  {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty Filter */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Difficulty</label>
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty} className="text-xs">
                  {difficulty === "all" ? "All Difficulties" : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Visual Type Filter */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Visual Type</label>
          <Select value={selectedVisualType} onValueChange={setSelectedVisualType}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {visualTypes.map((type) => (
                <SelectItem key={type} value={type} className="text-xs">
                  {type === "all" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Favorites Filter */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Favorites</label>
          <Button
            variant={showFavorites ? "default" : "outline"}
            size="sm"
            className="h-8 w-full text-xs"
            onClick={() => setShowFavorites(!showFavorites)}
          >
            {showFavorites ? "Show All" : "Favorites Only"}
          </Button>
        </div>
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedCategory !== "all" && (
            <Badge variant="secondary" className="text-xs">
              Category: {selectedCategory}
            </Badge>
          )}
          {selectedDifficulty !== "all" && (
            <Badge variant="secondary" className="text-xs">
              Difficulty: {selectedDifficulty}
            </Badge>
          )}
          {selectedVisualType !== "all" && (
            <Badge variant="secondary" className="text-xs">
              Type: {selectedVisualType}
            </Badge>
          )}
          {showFavorites && (
            <Badge variant="secondary" className="text-xs">
              Favorites Only
            </Badge>
          )}
        </div>
      )}
    </div>
  );
} 