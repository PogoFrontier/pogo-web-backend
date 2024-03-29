export interface Rule {
    name: string
    maxCP: number
    maxLevel: number
    maxBestBuddy: number
    maxMega: number
    rankingsLink?: string
    include?: Selector[]
    exclude?: Selector[]
    teamPattern?: SlotRule[]
    flags?: Flags
    advancedOptions?:  AdvancedOptions
    pointLimitOptions?: PointLimitOptions
    classes?: ClassOption[]
    ratingCategory?: string
    unranked?: boolean
}

export type RuleDescription = string | Rule

export interface Selector {
    filterType: "type" | "tag" | "id" | "dex"
    values: string[]
}

export interface SlotRule {
    name?: string
    include?: Selector[]
    exclude?: Selector[]
}

export interface AdvancedOptions {
    movesets: "original" | "mainseries" | "norestrictions"
    switchTimer?: number
    random?: boolean
}

export interface Flags {
    /** If true, you can't use two Pokémon with the same dex number */
    speciesClauseByDex?: boolean
    /** If true, you can't use two Pokémon with the same dex number and form*/
    speciesClauseByForm?: boolean
    /** If true, you can't use two Pokémon that share one type */
    typeClause?: boolean
}

export interface PointLimitOptions {
    maxPoints: number,
    prices: PriceSetting[]
}

export interface PriceSetting {
    pokemonIds: string[],
    price: number
}

export interface ClassOption {
    name: string
    include?: Selector[]
    exclude?: Selector[]
}