import type { Metadata } from "next";
import { gamesData } from "../data";
import GameDetailClient from "@/components/GameDetailClient";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const game = gamesData[params.slug as keyof typeof gamesData];
  
  if (!game) return { title: "Game Not Found | Warriors Arena" };

  return {
    title: `${game.title.en} in Cairo | Warriors Arena Heliopolis`,
    description: game.description.en,
    openGraph: {
      title: `${game.title.en} - Warriors Arena`,
      description: game.tagline.en,
      images: ['/og-image.jpg'],
    },
  };
}

export default function GamePage({ params }: { params: { slug: string } }) {
  return <GameDetailClient slug={params.slug} />;
}
