export interface Rule {
    name: string,
    maxCP?: number,
    maxLevel: number,
    maxBestBuddy: number,
    allowedPokemon?: Array<string>,
}
