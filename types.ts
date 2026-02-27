// Represents a banned champion
export interface BannedChampion {
    pickTurn: number;
    championId: number;
    teamId: number;
}

// Represents the observer information
export interface Observer {
    encryptionKey: string;
}

// Represents the perks/runes of a participant
export interface Perks {
    perkIds: number[];
    perkStyle: number;
    perkSubStyle: number;
}

// Represents a participant in the game
export interface CurrentGameParticipant {
    championId: number;
    perks: Perks;
    profileIconId: number;
    bot: boolean;
    teamId: number;
    puuid: string;
    spell1Id: number;
    spell2Id: number;
    gameCustomizationObjects: GameCustomizationObject[];
}

// Represents game customizations
export interface GameCustomizationObject {
    category: string;
    content: string;
}

// Represents the live game info
export interface CurrentGameInfo {
    gameId: number;
    gameType: string;
    gameStartTime: number;
    mapId: number;
    gameLength: number;
    platformId: string;
    gameMode: string;
    bannedChampions: BannedChampion[];
    gameQueueConfigId: number;
    observers: Observer;
    participants: CurrentGameParticipant[]
}
export interface NoGameInfo{
    httpStatus:number,
    errorCode:string,
    message:string,
    implementationDetails:string;
}
export interface LeagueEntryDTO {
  leagueId: string;
  puuid: string;
  queueType: string;
  tier: string;
  rank: string; // Division within tier (e.g. I, II, III, IV)
  leaguePoints: number;
  wins: number;
  losses: number;
  hotStreak: boolean;
  veteran: boolean;
  freshBlood: boolean;
  inactive: boolean;
  miniSeries?: {
    progress: string;  // e.g. "WLL" (Win/Loss history in promos)
    target: number;
    wins: number;
    losses: number;
  };
}

export interface AccountDTO{
    puuid:	string,
    gameName:	string,
    tagLine:	string
}

export interface CurrentUser {
  name: string;
  tag: string;
  puuid: string;
  channelId: string;
  inGame: boolean;
  currentGameId?: string;
  lastMatchId?: string;
}