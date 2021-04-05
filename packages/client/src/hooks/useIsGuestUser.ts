import { useUserId } from 'hooks/useUserId'
import { GUEST_USER } from 'common/modules/user/redux'

export function useIsGuestUser() {
  return useUserId() === GUEST_USER
}
