import React from 'react';
import { useSettingsStore } from '@/hooks/useSettingsStore';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const SettingsContent: React.FC = () => {
  const { settings, updateSetting } = useSettingsStore();

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <Label htmlFor="voice-select">Voice</Label>
        <Select
          value={settings.voice}
          onValueChange={(value) => updateSetting('voice', value)}
        >
          <SelectTrigger id="voice-select" className="w-full">
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Ember">Ember</SelectItem>
            <SelectItem value="Breeze">Breeze</SelectItem>
            <SelectItem value="Cove">Cove</SelectItem>
            <SelectItem value="Juniper">Juniper</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="bg-conversations">Background Conversations</Label>
          <p className="text-xs text-muted-foreground">
            Allow conversations to run in the background.
          </p>
        </div>
        <Switch
          id="bg-conversations"
          checked={settings.backgroundConversations}
          onCheckedChange={(checked) => updateSetting('backgroundConversations', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="autocomplete">Autocomplete</Label>
        <Switch
          id="autocomplete"
          checked={settings.autocomplete}
          onCheckedChange={(checked) => updateSetting('autocomplete', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="trending-searches">Trending Searches</Label>
        <Switch
          id="trending-searches"
          checked={settings.trendingSearches}
          onCheckedChange={(checked) => updateSetting('trendingSearches', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="follow-up">Follow-up Suggestions</Label>
        <Switch
          id="follow-up"
          checked={settings.followUpSuggestions}
          onCheckedChange={(checked) => updateSetting('followUpSuggestions', checked)}
        />
      </div>
    </div>
  );
};
