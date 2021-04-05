import { parseId } from '@logux/core'
import { useStore } from 'react-redux'

export function useUserId() {
  return parseId(useStore().client.nodeId).userId
}
