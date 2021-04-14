export interface Rule {
    maxCP: number
    maxLevel: number
    maxBestBuddy: number
    maxMega: number
    include?: Selector[]
    exclude?: Selector[]
    teamPattern?: SlotRule[]
    flags?: Flags
    advancedOptions?:  AdvancedOptions
}

export type RuleDescription = {
    name: string,
    advancedOptions?:  AdvancedOptions
} | Rule

export interface Selector {
    filterType: "type" | "tag" | "id" | "dex"
    values: string[]
}

export interface SlotRule {
    include?: Selector[]
    exclude?: Selector[]
}

export interface AdvancedOptions {
}

export interface Flags {
    /** If true, you can't use two Pokémon with the same dex number */
    speciesClauseByDex?: boolean
    /** If true, you can't use two Pokémon with the same dex number and form*/
    speciesClauseByForm?: boolean
    /** If true, you can't use two Pokémon that share one type */
    typeClause?: boolean
}