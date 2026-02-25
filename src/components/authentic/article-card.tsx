"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface ArticleCardProps {
  id: number;
  title: string;
  source: string;
  level: string;
  savedAt: string;
  isRead: boolean;
  content: string;
  onClick: () => void;
}

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-green-100 text-green-800 border-green-200",
  A2: "bg-blue-100 text-blue-800 border-blue-200",
  B1: "bg-orange-100 text-orange-800 border-orange-200",
  B2: "bg-purple-100 text-purple-800 border-purple-200",
};

export function ArticleCard({
  title,
  source,
  level,
  savedAt,
  isRead,
  content,
  onClick,
}: ArticleCardProps) {
  const date = new Date(savedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });

  const preview = content.substring(0, 120).trim();

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isRead ? "opacity-60" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm leading-snug line-clamp-2">
            {title}
          </h3>
          {isRead && (
            <span className="text-xs text-green-600 shrink-0 mt-0.5">✓ Lu</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-2">
        <p className="text-xs text-muted-foreground line-clamp-2">{preview}…</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-xs ${LEVEL_COLORS[level] ?? ""}`}
            >
              {level}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              {source}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
      </CardContent>
    </Card>
  );
}
