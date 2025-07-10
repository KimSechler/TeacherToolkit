import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Grid3X3, Sparkles } from "lucide-react";
import { getSmartEmojiSuggestions, getEmojiCategories, getEmojisByCategory } from "@/lib/emoji-suggestions";

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  answerText?: string;
  placeholder?: string;
  className?: string;
}

// Fuzzy search function
function fuzzySearch(searchTerm: string, text: string): boolean {
  const search = searchTerm.toLowerCase();
  const target = text.toLowerCase();
  let searchIndex = 0;
  
  for (let i = 0; i < target.length && searchIndex < search.length; i++) {
    if (target[i] === search[searchIndex]) {
      searchIndex++;
    }
  }
  
  return searchIndex === search.length;
}

export default function EmojiPicker({
  value,
  onChange,
  answerText = "",
  placeholder = "Choose emoji",
  className = ""
}: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showFullPicker, setShowFullPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get smart suggestions based on answer text
  const smartSuggestions = getSmartEmojiSuggestions(answerText, 8);
  const categories = getEmojiCategories();
  
  // Enhanced search with fuzzy matching
  const filteredEmojis = searchTerm 
    ? categories.flatMap(category => 
        getEmojisByCategory(category).filter(emoji => 
          fuzzySearch(searchTerm, emoji) || 
          fuzzySearch(searchTerm, category)
        )
      )
    : [];

  // Remove duplicates from filtered emojis
  const uniqueFilteredEmojis = Array.from(new Set(filteredEmojis));

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`h-10 w-10 p-0 text-lg ${className}`}
            onClick={() => setIsOpen(true)}
          >
            {value || "😊"}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="start">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Choose Emoji
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Smart Suggestions */}
              {answerText && smartSuggestions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Smart Suggestions
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Based on "{answerText}"
                    </span>
                  </div>
                  <div className="grid grid-cols-8 gap-1">
                    {smartSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-lg hover:bg-blue-50"
                        onClick={() => {
                          onChange(suggestion.emoji);
                          setIsOpen(false);
                        }}
                      >
                        {suggestion.emoji}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search emojis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-3 py-2 text-sm"
                />
              </div>

              {/* Search Results */}
              {searchTerm && (
                <div className="space-y-2">
                  <Badge variant="outline" className="text-xs">
                    Search Results ({uniqueFilteredEmojis.length})
                  </Badge>
                  <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                    {uniqueFilteredEmojis.slice(0, 32).map((emoji, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-lg hover:bg-gray-50"
                        onClick={() => {
                          onChange(emoji);
                          setIsOpen(false);
                          setSearchTerm("");
                        }}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Tabs */}
              {!searchTerm && (
                <Tabs defaultValue={categories[0]} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    {categories.slice(0, 4).map((category) => (
                      <TabsTrigger key={category} value={category} className="text-xs">
                        {category}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {categories.slice(0, 4).map((category) => (
                    <TabsContent key={category} value={category} className="mt-2">
                      <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                        {getEmojisByCategory(category).slice(0, 32).map((emoji, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-lg hover:bg-gray-50"
                            onClick={() => {
                              onChange(emoji);
                              setIsOpen(false);
                            }}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}

              {/* Browse All Button */}
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    setIsOpen(false);
                    setShowFullPicker(true);
                  }}
                >
                  <Grid3X3 className="w-3 h-3 mr-2" />
                  Browse All Emojis
                </Button>
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>

      {/* Full Emoji Picker Dialog */}
      <Dialog open={showFullPicker} onOpenChange={setShowFullPicker}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Grid3X3 className="w-5 h-5 text-purple-600" />
              Full Emoji Picker
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Enhanced Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search all emojis with fuzzy matching..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-3 text-base"
              />
            </div>

            {/* Search Results or Categories */}
            {searchTerm ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Search Results ({uniqueFilteredEmojis.length})
                  </Badge>
                </div>
                <div className="grid grid-cols-12 gap-2 max-h-96 overflow-y-auto">
                  {uniqueFilteredEmojis.map((emoji, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="h-12 w-12 p-0 text-2xl hover:bg-gray-50 hover:scale-110 transition-transform"
                      onClick={() => {
                        onChange(emoji);
                        setShowFullPicker(false);
                        setSearchTerm("");
                      }}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <Tabs defaultValue={categories[0]} className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category} className="text-sm">
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {categories.map((category) => (
                  <TabsContent key={category} value={category} className="mt-4">
                    <div className="grid grid-cols-12 gap-2 max-h-96 overflow-y-auto">
                      {getEmojisByCategory(category).map((emoji, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="h-12 w-12 p-0 text-2xl hover:bg-gray-50 hover:scale-110 transition-transform"
                          onClick={() => {
                            onChange(emoji);
                            setShowFullPicker(false);
                          }}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 