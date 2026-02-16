export type GameType = 'chest' | 'lastplayer';

export interface GameConfig {
  id: GameType;
  name: string;
  description: string;
  icon: string;
  route: string;
}

export const AVAILABLE_GAMES: GameConfig[] = [
  {
    id: 'chest',
    name: 'Magic Chest Game',
    description: 'Open chests to earn coins and legendary swords',
    icon: '🎁',
    route: '/'
  },
  {
    id: 'lastplayer',
    name: 'Last Player Game',
    description: 'Be the last player standing to win the pot',
    icon: '🏆',
    route: '/lastplayer'
  }
];

export const getGameConfig = (id: GameType): GameConfig | undefined => {
  return AVAILABLE_GAMES.find(game => game.id === id);
};
