"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnkiSession } from "./anki-session";
import { AnkiBaskets } from "./anki-baskets";
import { AnkiHistory } from "./anki-history";
import { LayersIcon, Grid2X2, Clock } from "lucide-react";

export function AnkiTabs() {
  const [activeTab, setActiveTab] = useState("session");

  // Clé incrémentale pour forcer le remontage de AnkiSession
  const [sessionKey, setSessionKey] = useState(0);
  const [sessionBasket, setSessionBasket] = useState<string | undefined>();
  const [sessionIds, setSessionIds] = useState<number[] | undefined>();

  /** Lance une session de révision par panier */
  function launchBasket(basket: string) {
    setSessionBasket(basket);
    setSessionIds(undefined);
    setSessionKey((k) => k + 1);
    setActiveTab("session");
  }

  /** Lance une session de révision sur des IDs spécifiques (depuis l'historique) */
  function launchIds(ids: number[]) {
    setSessionIds(ids);
    setSessionBasket(undefined);
    setSessionKey((k) => k + 1);
    setActiveTab("session");
  }

  /** Réinitialise le mode de session (retour à la session normale) */
  function resetSession() {
    setSessionBasket(undefined);
    setSessionIds(undefined);
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-3 w-full rounded-xl h-10">
        <TabsTrigger value="session" className="rounded-lg text-xs flex gap-1.5 items-center">
          <LayersIcon className="h-3.5 w-3.5" />
          Session
        </TabsTrigger>
        <TabsTrigger value="baskets" className="rounded-lg text-xs flex gap-1.5 items-center">
          <Grid2X2 className="h-3.5 w-3.5" />
          Paniers
        </TabsTrigger>
        <TabsTrigger value="history" className="rounded-lg text-xs flex gap-1.5 items-center">
          <Clock className="h-3.5 w-3.5" />
          Historique
        </TabsTrigger>
      </TabsList>

      <TabsContent value="session" className="mt-4">
        <AnkiSession
          key={sessionKey}
          basket={sessionBasket}
          ids={sessionIds}
          onReset={resetSession}
        />
      </TabsContent>

      <TabsContent value="baskets" className="mt-4">
        <AnkiBaskets onLaunch={launchBasket} />
      </TabsContent>

      <TabsContent value="history" className="mt-4">
        <AnkiHistory onLaunch={launchIds} />
      </TabsContent>
    </Tabs>
  );
}
