export const COMMON_TICKETS = ['taxi', 'bus', 'underground'] as const
export type CommonTicket = typeof COMMON_TICKETS[number]

export const BLACK_TICKET = 'black'

export const TICKETS = [...COMMON_TICKETS, BLACK_TICKET] as const
export type Ticket = typeof TICKETS[number]

export const DOUBLE_TICKET = 'double'

export const MR_X_TICKETS = [...TICKETS, DOUBLE_TICKET] as const
export type MrXTicket = typeof MR_X_TICKETS[number]
