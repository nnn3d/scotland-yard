export const COMMON_TICKETS = ['taxi', 'bus', 'underground'] as const
export type CommonTicket = typeof COMMON_TICKETS[number]

export const TICKETS = [...COMMON_TICKETS, 'black'] as const
export type Ticket = typeof TICKETS[number]

export const MR_X_TICKETS = [...TICKETS, 'double'] as const
export type MrXTicket = typeof MR_X_TICKETS[number]
