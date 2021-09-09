export interface User {
    googleId: string
    isGuest: boolean
    ranking?: ELO
    username?: string
}

export type UserInQueue = User & {
    waitingSince: number
}

// Later we should replace this with an object containing numbers for each format
export type ELO = object | number