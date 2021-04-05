export const GAME_CONFIG = {
  detectiveStartTickets: {
    taxi: 10,
    bus: 8,
    underground: 4,
  },
  mrXStartTickets: {
    taxi: 4,
    bus: 3,
    underground: 2,
    black: 0,
    double: 2,
  },
  numberOfTurns: 22,
  disclosureMrXTurns: [3, 8, 13, 18, 22],
  minPlayers: 4,
} as const
