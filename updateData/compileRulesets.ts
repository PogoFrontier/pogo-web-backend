import fs from "fs"
import p from "../data/pokemon.json";
import r from "../data/rules.json";
import { isSpeciesAllowed, doesClassDescribePokemon } from "../team/checkTeam"
import { Rule, PriceSetting } from "../types/rule"
import https from 'https'
import { exit } from "process";

let pokemonList: any = p
let rules: any = r;

if(fs.existsSync("./data/pokemonForFormats")){
    fs.rmdirSync("./data/pokemonForFormats", { recursive: true })
}
fs.mkdirSync("./data/pokemonForFormats")

type moveWithRating = {
    moveId: string
    uses: number
}

function isRuleValid (rule: Rule) : string[] {
    let violations = [];

    if (rule.include) {
        for (let inclusion of rule.include) {
            if (inclusion.filterType === "id") {
                for (let id of inclusion.values) {
                    if (!Object.keys(pokemonList).includes(id)) {
                        violations.push("The included pokémon " + id + " doesn't exist.")
                    }
                }
            }
        }
    }

    if (rule.exclude) {
        for (let exclusion of rule.exclude) {
            if (exclusion.filterType === "id") {
                for (let id of exclusion.values) {
                    if (!Object.keys(pokemonList).includes(id)) {
                        violations.push("The excluded pokémon " + id + " doesn't exist.")
                    }
                }
            }
        }
    }

    if (rule.pointLimitOptions) {
        for(let priceClass of rule.pointLimitOptions.prices) {
            for (let id of priceClass.pokemonIds) {
                if (!Object.keys(pokemonList).includes(id)) {
                    violations.push("The pokémon in the priceclass" + priceClass.price + " with the id " + id + " doesn't exist.")
                }
            }
        }
    }

    return violations;
}

for (let ruleName of Object.keys(rules)) {
    let rule: Rule = rules[ruleName];

    // Validate rule
    let violations = isRuleValid(rule);
    if(violations.length) {
        console.error("Rule " + rule.name + " has errors:");
        for(let violation of violations) {
            console.error(violation);
        }
        exit(1);
    }

    const callback = () => {
        // Do we have a team pattern? Then make 6 files, one for each team position
        if(rule.teamPattern) {
            for (let position in rule.teamPattern) {
    
                let listForFormat: any = {}; new Map<string, any>()
                for (let pokemon of Object.keys(pokemonList)) {
                    let speciesId: string = pokemonList[pokemon].speciesId
                    let {
                        isValid: legal
                    } = isSpeciesAllowed({speciesId}, rule, parseInt(position));

                    let pvpokeRanking = pvpokeData.find(ranking => ranking.speciesId === speciesId);
                    let price = rule.pointLimitOptions?.prices.find((priceSetting: PriceSetting) => {
                        return priceSetting.pokemonIds.includes(speciesId)
                    })?.price

                    listForFormat[speciesId] = {
                        legal,
                        dex: pokemonList[pokemon].dex,
                        types: pokemonList[pokemon].types,
                        tags: pokemonList[pokemon].tags
                    }

                    if(legal) {
                        listForFormat[speciesId] = {
                            ...listForFormat[speciesId],
                            speciesName: pokemonList[pokemon].speciesName,
                            price: price,
                            ranking: pvpokeRanking?.rating,
                            moves: pvpokeRanking?.moves,
                            moveset: pvpokeRanking?.moveset
                        }
                    }
                }
    
                let text = JSON.stringify(listForFormat, null, 2);
                fs.writeFileSync(`./data/pokemonForFormats/${ruleName}_${position}.json`, text)
            }
        } else if(rule.classes){
            for (let classObj of rule.classes) {
    
                let listForFormat: any = {}; new Map<string, any>()
                for (let pokemon of Object.keys(pokemonList)) {
                    let speciesId: string = pokemonList[pokemon].speciesId
                    let {
                        isValid: legal
                    } = isSpeciesAllowed({speciesId}, rule, 0);
                    legal = legal && doesClassDescribePokemon(speciesId, classObj)

                    let pvpokeRanking = pvpokeData.find(ranking => ranking.speciesId === speciesId);
                    let price = rule.pointLimitOptions?.prices.find((priceSetting: PriceSetting) => {
                        return priceSetting.pokemonIds.includes(speciesId)
                    })?.price

                    listForFormat[speciesId] = {
                        legal,
                        dex: pokemonList[pokemon].dex,
                        types: pokemonList[pokemon].types,
                        tags: pokemonList[pokemon].tags
                    }

                    if(legal) {
                        listForFormat[speciesId] = {
                            ...listForFormat[speciesId],
                            speciesName: pokemonList[pokemon].speciesName,
                            price: price,
                            ranking: pvpokeRanking?.rating,
                            moves: pvpokeRanking?.moves,
                            moveset: pvpokeRanking?.moveset
                        }
                    }
                }
    
                let text = JSON.stringify(listForFormat, null, 2);
                fs.writeFileSync(`./data/pokemonForFormats/${ruleName}_${classObj.name}.json`, text)
            }
        } else {
            let listForFormat: any = {}; new Map<string, {legal: boolean}>()
            for (let pokemon of Object.keys(pokemonList)) {
                let speciesId: string = pokemonList[pokemon].speciesId
                let {
                    isValid: legal
                } = isSpeciesAllowed({speciesId}, rule, 0);

                let pvpokeRanking = pvpokeData.find(ranking => ranking.speciesId === speciesId);
                let price = rule.pointLimitOptions?.prices.find((priceSetting: PriceSetting) => {
                    return priceSetting.pokemonIds.includes(speciesId)
                })?.price

                listForFormat[speciesId] = {
                    legal,
                    dex: pokemonList[pokemon].dex,
                    types: pokemonList[pokemon].types,
                    tags: pokemonList[pokemon].tags
                }

                if(legal) {
                    listForFormat[speciesId] = {
                        ...listForFormat[speciesId],
                        speciesName: pokemonList[pokemon].speciesName,
                        price: price,
                        ranking: pvpokeRanking?.rating,
                        moves: pvpokeRanking?.moves,
                        moveset: pvpokeRanking?.moveset
                    }
                }
            }
    
            let text = JSON.stringify(listForFormat, null, 2);
            fs.writeFileSync(`./data/pokemonForFormats/${ruleName}.json`, text)
        }
    }

    let pvpokeData: {
        speciesId: string
        rating: number
        moves: {
            fastMoves: moveWithRating[]
            chargedMoves: moveWithRating[]
        },
        moveset: string[]
    }[] = [];

    if(rule.rankingsLink) {
        https.get(rule.rankingsLink, {}, response => {
            let completeString = "";
            response.on("data", (data) => {
                completeString += data.toString();
            })

            response.on("end", () => {
                try{
                    pvpokeData = JSON.parse(completeString);
                    callback();
                } catch(e) {
                    console.error(e);
                    console.log(ruleName);
                }
            })
        })
    } else {
        callback();
    }

    //callback()
}