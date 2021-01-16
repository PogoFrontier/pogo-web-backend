import { Move } from "../types/room";
import { TeamMember } from "../types/team";

const bonusMultiplier = 1.3;

const types = new Array(
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.625, 0.390625, 1, 1, 0.625, 1, 1],// Normal
  [1, 0.625, 0.625, 1, 1.6, 1.6, 1, 1, 1, 1, 1, 1.6, 0.625, 1, 0.625, 1, 1.6, 1, 1],// Fire
  [1, 1.6, 0.625, 1, 0.625, 1, 1, 1, 1.6, 1, 1, 1, 1.6, 1, 0.625, 1, 1, 1, 1],// Water
  [1, 1, 1.6, 0.625, 0.625, 1, 1, 1, 0.390625, 1.6, 1, 1, 1, 1, 0.625, 1, 1, 1, 1],// Electric
  [1, 0.625, 1.6, 1, 0.625, 1, 1, 0.625, 1.6, 0.625, 1, 0.625, 1.6, 1, 0.625, 1, 0.625, 1, 1],// Grass
  [1, 0.625, 0.625, 1, 1.6, 0.625, 1, 1, 1.6, 1.6, 1, 1, 1, 1, 1.6, 1, 0.625, 1, 1],// Ice
  [1.6, 1, 1, 1, 1, 1.6, 1, 0.625, 1, 0.625, 0.625, 0.625, 1.6, 0.390625, 1, 1.6, 1.6, 0.625, 1],// Fighting
  [1, 1, 1, 1, 1.6, 1, 1, 0.625, 0.625, 1, 1, 1, 0.625, 0.625, 1, 1, 0.390625, 1.6, 1],// Poison
  [1, 1.6, 1, 1.6, 0.625, 1, 1, 1.6, 1, 0.390625, 1, 0.625, 1.6, 1, 1, 1, 1.6, 1, 1],// Ground
  [1, 1, 1, 0.625, 1.6, 1, 1.6, 1, 1, 1, 1, 1.6, 0.625, 1, 1, 1, 0.625, 1, 1],// Flying
  [1, 1, 1, 1, 1, 1, 1.6, 1.6, 1, 1, 0.625, 1, 1, 1, 1, 0.390625, 0.625, 1, 1],// Psychic
  [1, 0.625, 1, 1, 1.6, 1, 0.625, 0.625, 1, 0.625, 1.6, 1, 1, 0.625, 1, 1.6, 0.625, 0.625, 1],// Bug
  [1, 1.6, 1, 1, 1, 1.6, 0.625, 1, 0.625, 1.6, 1, 1.6, 1, 1, 1, 1, 0.625, 1, 1],// Rock
  [0.390625, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.6, 1, 1, 1.6, 1, 0.625, 1, 1, 1],// Ghost
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.6, 1, 0.625, 0.390625, 1],// Dragon
  [1, 1, 1, 1, 1, 1, 0.625, 1, 1, 1, 1.6, 1, 1, 1.6, 1, 0.625, 1, 0.625, 1],// Dark
  [1, 0.625, 0.625, 0.625, 1, 1.6, 1, 1, 1, 1, 1, 1, 1.6, 1, 1, 1, 0.625, 1.6, 1],// Steel
  [1, 0.625, 1, 1, 1, 1, 1.6, 0.625, 1, 1, 1, 1, 1, 1, 1.6, 1.6, 0.625, 1, 1],// Fairy
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);// None
  
const type_name: { [key: string]: number } = {
  "normal": 0,
  "fire": 1,
  "water": 2,
  "electric": 3,
  "grass": 4,
  "ice": 5,
  "fighting": 6,
  "poison": 7,
  "ground": 8,
  "flying": 9,
  "psychic": 10,
  "bug": 11,
  "rock": 12,
  "ghost": 13,
  "dragon": 14,
  "dark": 15,
  "steel": 16,
  "fairy": 17
};

function getMultiplier(attackerTypes: string[], defenderTypes: string[], moveType: string): number {
  let mult = 1;
  for (const type of defenderTypes) {
    if (type_name[type] && type_name[moveType]) {
      mult *= types[type_name[moveType]][type_name[type]]
    }
  }
  if (attackerTypes.findIndex(x => x === moveType) > -1) {  //STAB
    mult *= 1.2;
  }
  return mult;
}

export function calcDamage(attacker: TeamMember, defender: TeamMember, move: Move, chargeMult?: number): number {
  const mult = getMultiplier(attacker.types, defender.types, move.type);
  const charge = chargeMult ? chargeMult : 1
  const damage = Math.floor(0.5 * (attacker.current!.atk / defender.current!.def) * move.power * mult * charge * bonusMultiplier) + 1;
  return Math.max(defender.current!.hp - damage, 0);
}