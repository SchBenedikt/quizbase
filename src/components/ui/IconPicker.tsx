"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  BarChart3, PieChart, TrendingUp, Target, Zap, Star, Heart, ThumbsUp, 
  MessageSquare, Users, Lightbulb, Rocket, Trophy, Flag, Bookmark, 
  CheckCircle, Clock, Calendar, FileText, Globe, Music, Camera, Gamepad2, 
  Book, Briefcase, Coffee, Pizza, Plane, Home, ShoppingBag, Dumbbell 
} from "lucide-react";

interface IconPickerProps {
  selectedIcon?: string;
  onIconChange: (icon: string) => void;
  className?: string;
}

// List of available icons for surveys
const SURVEY_ICONS = [
  { name: "BarChart3", component: BarChart3, label: "Analytics" },
  { name: "PieChart", component: PieChart, label: "Pie Chart" },
  { name: "TrendingUp", component: TrendingUp, label: "Trending" },
  { name: "Target", component: Target, label: "Target" },
  { name: "Zap", component: Zap, label: "Energy" },
  { name: "Star", component: Star, label: "Star" },
  { name: "Heart", component: Heart, label: "Heart" },
  { name: "ThumbsUp", component: ThumbsUp, label: "Thumbs Up" },
  { name: "MessageSquare", component: MessageSquare, label: "Chat" },
  { name: "Users", component: Users, label: "Team" },
  { name: "Lightbulb", component: Lightbulb, label: "Idea" },
  { name: "Rocket", component: Rocket, label: "Rocket" },
  { name: "Trophy", component: Trophy, label: "Trophy" },
  { name: "Flag", component: Flag, label: "Flag" },
  { name: "Bookmark", component: Bookmark, label: "Bookmark" },
  { name: "CheckCircle", component: CheckCircle, label: "Success" },
  { name: "Clock", component: Clock, label: "Time" },
  { name: "Calendar", component: Calendar, label: "Calendar" },
  { name: "FileText", component: FileText, label: "Document" },
  { name: "Globe", component: Globe, label: "Global" },
  { name: "Music", component: Music, label: "Music" },
  { name: "Camera", component: Camera, label: "Camera" },
  { name: "Gamepad2", component: Gamepad2, label: "Gaming" },
  { name: "Book", component: Book, label: "Education" },
  { name: "Briefcase", component: Briefcase, label: "Business" },
  { name: "Coffee", component: Coffee, label: "Coffee" },
  { name: "Pizza", component: Pizza, label: "Food" },
  { name: "Plane", component: Plane, label: "Travel" },
  { name: "Home", component: Home, label: "Home" },
  { name: "ShoppingBag", component: ShoppingBag, label: "Shopping" },
  { name: "Dumbbell", component: Dumbbell, label: "Fitness" }
];

export function IconPicker({ selectedIcon, onIconChange, className }: IconPickerProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-sm font-medium">Icon</div>
      <div className="flex flex-wrap gap-1">
        {SURVEY_ICONS.slice(0, 12).map(({ name, component: Component, label }) => (
          <button
            key={name}
            type="button"
            onClick={() => onIconChange(name)}
            className={cn(
              "p-2 rounded border transition-all hover:bg-muted hover:border-primary",
              selectedIcon === name ? "border-primary bg-primary/10" : "border-border"
            )}
            title={label}
          >
            <Component className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  );
}

// Component to display the selected icon
export function SurveyIcon({ iconName, className }: { iconName?: string; className?: string }) {
  const iconData = SURVEY_ICONS.find(i => i.name === iconName);
  const IconComponent = iconData?.component || BarChart3;
  
  return <IconComponent className={cn("h-4 w-4", className)} />;
}

// Helper function to get Lucide icon component
export function getSurveyIconComponent(iconName?: string) {
  if (!iconName) return BarChart3;
  const found = SURVEY_ICONS.find(i => i.name === iconName);
  return found?.component || BarChart3;
}
