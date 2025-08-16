import React from 'react';
import { useSettingsStore } from '@/hooks/useSettingsStore';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUIConfig } from '@/hooks/useUIConfig';
import { Button } from '../ui/button';
import { configService } from '@/services/configService';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from '../ui/input';

const formSchema = z.object({
  primaryColor: z.string().regex(/^#([0-9a-f]{3}){1,2}$/i, { message: "Invalid hex code" }),
});

export const SettingsContent: React.FC = () => {
  const { settings, updateSetting } = useSettingsStore();
  const { config } = useUIConfig();

 const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      primaryColor: config?.theme.primaryColor || "#3b82f6",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Trigger Netlify build hook here
    console.log("Trigger Netlify build hook with:", values);

    const buildHookUrl = "https://api.netlify.com/build_hooks/68a0a8df1ed23f37aa81f909";

    try {
      const response = await fetch(buildHookUrl, {
        method: "POST",
      });

      if (response.ok) {
        alert("Successfully triggered Netlify build!");
      } else {
        alert("Failed to trigger Netlify build: " + response.statusText);
      }
    } catch (error: any) {
      console.error("Error triggering Netlify build:", error);
      alert("Error triggering Netlify build: " + error.message);
    }
  }

  return (
    <div className="space-y-6 p-4">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="primaryColor">Primary Color</Label>
          <Input id="primaryColor" type="text" placeholder="#3b82f6" {...form.register("primaryColor")} />
        </div>
        <Button type="submit">
          Update Primary Color
        </Button>
      </form>

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

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Remote UI</h3>
        <p className="text-sm text-muted-foreground mb-4">
          UI Version: {config?.version} (Last updated: {config && new Date(config.lastUpdated).toLocaleString()})
        </p>
        <Button onClick={() => configService.forceRefresh()}>
          Force Refresh UI
        </Button>
      </div>
    </div>
  );
};
