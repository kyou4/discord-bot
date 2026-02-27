import { riotApi } from "./riotservice.js";
import { TextChannel, EmbedBuilder } from "discord.js";
import type { AccountDTO } from "./types.js";

interface RankData {
  lp: number;
  tier: string;
  rank: string;
}

export class LpStore {
  private dataMap: Map<string, RankData> = new Map();

  getPrevious(puuid: string): RankData | null {
    return this.dataMap.get(puuid) ?? null;
  }

  set(puuid: string, data: RankData) {
    this.dataMap.set(puuid, data);
  }
}

const lpStore = new LpStore();


const TIER_COLORS: Record<string, number> = {
  IRON: 0x5c5c5c,
  BRONZE: 0x8c5a3c,
  SILVER: 0x7b8f9e,
  GOLD: 0xdaa520,
  PLATINUM: 0x00b4ab,
  EMERALD: 0x50c878,
  DIAMOND: 0xb9f2ff,
  MASTER: 0x9932cc,
  GRANDMASTER: 0xff4444,
  CHALLENGER: 0x00bfff,
};

export async function pollUserLp(account: AccountDTO, channel: TextChannel) {
  const userEntries = await riotApi.getUserInfo(account);

  if (!userEntries || userEntries.length === 0) {
  console.log(`No user entry for ${account.gameName}`);
  return;
  }

  const soloQ = userEntries.find(entry => entry.queueType === "RANKED_SOLO_5x5");

  if (!soloQ) return;

  const previous = lpStore.getPrevious(soloQ.puuid);
  const current: RankData = {
    lp: soloQ.leaguePoints,
    tier: soloQ.tier,
    rank: soloQ.rank,
  };

  const color = TIER_COLORS[current.tier] ?? 0x5865f2;

 
  if (!previous) {
    lpStore.set(soloQ.puuid, current);

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`Now Tracking: ${account.gameName}#${account.tagLine}`)
      .addFields(
        { name: "Rank", value: `${current.tier} ${current.rank}`, inline: true },
        { name: "LP", value: `${current.lp}`, inline: true },
      )
      .setTimestamp();

    await channel.send({ embeds: [embed] });
    return;
  }

  
  const lpChanged = current.lp !== previous.lp;
  const rankChanged = current.tier !== previous.tier || current.rank !== previous.rank;

  if (!lpChanged && !rankChanged) return;


  lpStore.set(soloQ.puuid, current);

 
  const diff = current.lp - previous.lp;
  const sign = diff > 0 ? "+" : "";

 
  let title: string;
  let description: string;

  if (rankChanged && current.tier !== previous.tier) {
   
    const promoted = getTierValue(current.tier) > getTierValue(previous.tier);
    title = promoted ? "PROMOTED" : "DEMOTED";
    description = `${previous.tier} ${previous.rank} → ${current.tier} ${current.rank}`;
  } else if (rankChanged) {
   
    const promoted = getRankValue(current.rank) > getRankValue(previous.rank);
    title = promoted ? "Division Up" : "Division Down";
    description = `${previous.tier} ${previous.rank} → ${current.tier} ${current.rank}`;
  } else {
  
    title = diff > 0 ? "LP Gained" : "LP Lost";
    description = `${previous.lp} LP → ${current.lp} LP (${sign}${diff})`;
  }

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`${account.gameName}#${account.tagLine}`)
    .setDescription(`**${title}**\n${description}`)
    .addFields(
      { name: "Current Rank", value: `${current.tier} ${current.rank}`, inline: true },
      { name: "Current LP", value: `${current.lp}`, inline: true },
    )
    .setTimestamp();

  await channel.send({ embeds: [embed] });
}

function getTierValue(tier: string): number {
  const tiers = ["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "EMERALD", "DIAMOND", "MASTER", "GRANDMASTER", "CHALLENGER"];
  return tiers.indexOf(tier);
}

function getRankValue(rank: string): number {
  const ranks = ["IV", "III", "II", "I"];
  return ranks.indexOf(rank);
}