import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Volume2, VolumeX, Sparkles, Zap, Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AttendanceSettings;
  onSettingsChange: (settings: AttendanceSettings) => void;
  currentTheme?: any;
  currentQuestion?: any;
}

export interface AttendanceSettings {
  soundEnabled: boolean;
  confettiEnabled: boolean;
  animationsEnabled: boolean;
  visualEffectsEnabled: boolean;
  autoSaveEnabled: boolean;
  showProgressBar: boolean;
  // Space-specific settings
  starfieldEnabled: boolean;
  nebulaEffectsEnabled: boolean;
  cosmicParticlesEnabled: boolean;
}

const defaultSettings: AttendanceSettings = {
  soundEnabled: true,
  confettiEnabled: true,
  animationsEnabled: true,
  visualEffectsEnabled: true,
  autoSaveEnabled: true,
  showProgressBar: true,
  starfieldEnabled: true,
  nebulaEffectsEnabled: true,
  cosmicParticlesEnabled: true,
};

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  currentTheme,
  currentQuestion
}: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<AttendanceSettings>(settings);

  const handleSettingChange = (key: keyof AttendanceSettings, value: boolean) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(defaultSettings);
    onSettingsChange(defaultSettings);
  };

  const SettingItem = ({ 
    key, 
    label, 
    description, 
    value, 
    onChange, 
    icon: Icon 
  }: {
    key: keyof AttendanceSettings;
    label: string;
    description: string;
    value: boolean;
    onChange: (value: boolean) => void;
    icon: any;
  }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-gray-600" />
        <div>
          <Label className="text-sm font-medium">{label}</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <HelpCircle className="w-4 h-4 text-gray-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <Switch
        checked={value}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-blue-600"
      />
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Attendance Tracker Settings
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings Panel */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preferences</h3>
            
            <SettingItem
              key="soundEnabled"
              label="Sound Effects"
              description="Play cute sounds when students move to answer zones and when interactions occur"
              value={localSettings.soundEnabled}
              onChange={(value) => handleSettingChange('soundEnabled', value)}
              icon={localSettings.soundEnabled ? Volume2 : VolumeX}
            />

            <SettingItem
              key="confettiEnabled"
              label="Confetti Animation"
              description="Show colorful confetti when students answer questions correctly"
              value={localSettings.confettiEnabled}
              onChange={(value) => handleSettingChange('confettiEnabled', value)}
              icon={Sparkles}
            />

            <SettingItem
              key="animationsEnabled"
              label="Student Animations"
              description="Add bounce, wiggle, and floating animations to student characters"
              value={localSettings.animationsEnabled}
              onChange={(value) => handleSettingChange('animationsEnabled', value)}
              icon={Zap}
            />

            <SettingItem
              key="visualEffectsEnabled"
              label="Visual Effects"
              description="Enable glassmorphism, shadows, and theme-specific visual enhancements"
              value={localSettings.visualEffectsEnabled}
              onChange={(value) => handleSettingChange('visualEffectsEnabled', value)}
              icon={Eye}
            />

            <SettingItem
              key="autoSaveEnabled"
              label="Auto Save"
              description="Automatically save attendance data as students respond"
              value={localSettings.autoSaveEnabled}
              onChange={(value) => handleSettingChange('autoSaveEnabled', value)}
              icon={Sparkles}
            />

            <SettingItem
              key="showProgressBar"
              label="Progress Bar"
              description="Show a progress bar indicating how many students have responded"
              value={localSettings.showProgressBar}
              onChange={(value) => handleSettingChange('showProgressBar', value)}
              icon={Eye}
            />

            {/* Space-specific settings */}
            {currentTheme?.id === 'space' && (
              <>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">🚀 Space Theme Settings</h4>
                </div>
                
                <SettingItem
                  key="starfieldEnabled"
                  label="Starfield Background"
                  description="Show animated twinkling stars in the background"
                  value={localSettings.starfieldEnabled}
                  onChange={(value) => handleSettingChange('starfieldEnabled', value)}
                  icon={Sparkles}
                />

                <SettingItem
                  key="nebulaEffectsEnabled"
                  label="Nebula Effects"
                  description="Show colorful nebula clouds and cosmic effects"
                  value={localSettings.nebulaEffectsEnabled}
                  onChange={(value) => handleSettingChange('nebulaEffectsEnabled', value)}
                  icon={Eye}
                />

                <SettingItem
                  key="cosmicParticlesEnabled"
                  label="Cosmic Particles"
                  description="Show floating space debris and cosmic particles"
                  value={localSettings.cosmicParticlesEnabled}
                  onChange={(value) => handleSettingChange('cosmicParticlesEnabled', value)}
                  icon={Zap}
                />
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex-1">
                Save Settings
              </Button>
              <Button onClick={handleReset} variant="outline">
                Reset to Default
              </Button>
            </div>
          </div>

          {/* Live Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Live Preview</h3>
            
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="p-4">
                <div className="text-center mb-4">
                  <Badge variant="secondary" className="mb-2">
                    Mini Tracker Preview
                  </Badge>
                  <h4 className="text-sm font-medium text-gray-700">
                    {currentQuestion?.text || "What's your favorite color?"}
                  </h4>
                </div>

                {/* Mini Answer Zones */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {['Red', 'Blue'].map((answer, index) => (
                    <div
                      key={answer}
                      className={`p-2 rounded-lg text-center text-xs font-medium transition-all duration-300 ${
                        localSettings.visualEffectsEnabled
                          ? 'bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 shadow-sm'
                          : 'bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {answer}
                    </div>
                  ))}
                </div>

                {/* Mini Students */}
                <div className="grid grid-cols-3 gap-2">
                  {['👤', '👤', '👤'].map((emoji, index) => (
                    <div
                      key={index}
                      className={`text-center transition-all duration-300 ${
                        localSettings.animationsEnabled ? 'hover:scale-110' : ''
                      }`}
                    >
                      <div className={`text-lg ${localSettings.animationsEnabled ? 'animate-pulse' : ''}`}>
                        {emoji}
                      </div>
                      <div className="text-xs text-gray-600">Student {index + 1}</div>
                    </div>
                  ))}
                </div>

                {/* Progress Bar Preview */}
                {localSettings.showProgressBar && (
                  <div className="mt-4">
                    <div className="text-xs text-gray-600 mb-1">Progress: 2/3 students</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: '67%' }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Effects Preview */}
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                  {localSettings.soundEnabled && <span>🔊</span>}
                  {localSettings.confettiEnabled && <span>🎉</span>}
                  {localSettings.animationsEnabled && <span>✨</span>}
                  {localSettings.visualEffectsEnabled && <span>🌟</span>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 