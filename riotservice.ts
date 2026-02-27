import "dotenv/config";
import type { AccountDTO, CurrentGameInfo, LeagueEntryDTO } from "./types.js";




export class RiotApiService {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error("Missing RIOT_API_KEY");
    this.apiKey = apiKey;
  }
  async getSummoner(puuid:string):Promise<AccountDTO>{
    const accountRes = await fetch(
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}`,
      { headers: { "X-Riot-Token": this.apiKey } }
    );
    const account = await accountRes.json() as AccountDTO
    return account;
  }
  async getAccount(gameName: string, tagLine: string):Promise<AccountDTO>{
    const accountRes = await fetch(
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      { headers: { "X-Riot-Token": this.apiKey } }
    );
    let account = await accountRes.json() as AccountDTO
    return account;
  }
  async getLiveGame(account:AccountDTO):Promise<CurrentGameInfo> {
    const liveGameRes = await fetch(
      `https://na1.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${account.puuid}`,
      { headers: { "X-Riot-Token": this.apiKey } }
    );
    return await liveGameRes.json() as CurrentGameInfo
  }
  async getUserInfo(account:AccountDTO):Promise<LeagueEntryDTO[]>{
    const userInfoRes = await fetch(
      `https://na1.api.riotgames.com/lol/league/v4/entries/by-puuid/${account.puuid}`,
      { headers: { "X-Riot-Token": this.apiKey } }
    );
    return await userInfoRes.json() as LeagueEntryDTO[];
  }
  async getUserLp(user:LeagueEntryDTO[]){
    return user[0]?.leaguePoints;
  }
}
export const riotApi = new RiotApiService(process.env.RIOT_API_KEY!)