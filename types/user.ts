export interface User {
    googleId: string
    ranking: ELO
}

export type UserInQueue = User & {
    waitingSince: Date
}

// Later we should replace this with an object containing numbers for each format
export type ELO = number