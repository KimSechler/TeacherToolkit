import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuestionOfDay } from "@/lib/questionLibrary";
import { BrowseQuestionsTab } from "./BrowseQuestionsTab";
import { CustomQuestionsTab } from "./CustomQuestionsTab";
import { useQuestionLibraryState } from "./hooks/useQuestionLibraryState";

interface QuestionLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestion: (question: QuestionOfDay) => void;
  className?: string;
}

export default function QuestionLibraryModal({
  isOpen,
  onClose,
  onSelectQuestion,
  className = ""
}: QuestionLibraryModalProps) {
  const [activeTab, setActiveTab] = useState("browse");
  
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedVisualType,
    setSelectedVisualType,
    showFavorites,
    setShowFavorites,
    customQuestions,
    setCustomQuestions,
    questionLists,
    setQuestionLists,
    selectedList,
    setSelectedList,
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    showCreateForm,
    setShowCreateForm,
    editingQuestion,
    setEditingQuestion,
    showListManager,
    setShowListManager,
    newListName,
    setNewListName,
    editingList,
    setEditingList,
    showEmojiPicker,
    setShowEmojiPicker,
    emojiSearchTerm,
    setEmojiSearchTerm,
    selectedEmojiCategory,
    setSelectedEmojiCategory,
    recentlyUsedQuestions,
    setRecentlyUsedQuestions,
    favoritesUpdateTrigger,
    setFavoritesUpdateTrigger,
    privateListForRandom,
    setPrivateListForRandom
  } = useQuestionLibraryState();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-6xl max-h-[90vh] overflow-hidden ${className}`}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Question Library
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Questions</TabsTrigger>
            <TabsTrigger value="custom">Custom Questions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="mt-4">
            <BrowseQuestionsTab
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedDifficulty={selectedDifficulty}
              setSelectedDifficulty={setSelectedDifficulty}
              selectedVisualType={selectedVisualType}
              setSelectedVisualType={setSelectedVisualType}
              showFavorites={showFavorites}
              setShowFavorites={setShowFavorites}
              recentlyUsedQuestions={recentlyUsedQuestions}
              favoritesUpdateTrigger={favoritesUpdateTrigger}
              onSelectQuestion={onSelectQuestion}
              onClose={onClose}
            />
          </TabsContent>
          
          <TabsContent value="custom" className="mt-4">
            <CustomQuestionsTab
              customQuestions={customQuestions}
              setCustomQuestions={setCustomQuestions}
              questionLists={questionLists}
              setQuestionLists={setQuestionLists}
              selectedList={selectedList}
              setSelectedList={setSelectedList}
              formData={formData}
              setFormData={setFormData}
              formErrors={formErrors}
              setFormErrors={setFormErrors}
              showCreateForm={showCreateForm}
              setShowCreateForm={setShowCreateForm}
              editingQuestion={editingQuestion}
              setEditingQuestion={setEditingQuestion}
              showListManager={showListManager}
              setShowListManager={setShowListManager}
              newListName={newListName}
              setNewListName={setNewListName}
              editingList={editingList}
              setEditingList={setEditingList}
              showEmojiPicker={showEmojiPicker}
              setShowEmojiPicker={setShowEmojiPicker}
              emojiSearchTerm={emojiSearchTerm}
              setEmojiSearchTerm={setEmojiSearchTerm}
              selectedEmojiCategory={selectedEmojiCategory}
              setSelectedEmojiCategory={setSelectedEmojiCategory}
              privateListForRandom={privateListForRandom}
              setPrivateListForRandom={setPrivateListForRandom}
              onSelectQuestion={onSelectQuestion}
              onClose={onClose}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 