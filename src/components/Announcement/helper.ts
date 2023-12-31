import { ChainId } from '@kyberswap/ks-sdk-core'

import { AnnouncementTemplatePopup, PopupContentAnnouncement, PopupItemType } from 'components/Announcement/type'
import { TIMES_IN_SECS } from 'constants/index'

const LsKey = 'ack-announcements'
export const getAnnouncementsAckMap = () => JSON.parse(localStorage[LsKey] || '{}')

export const ackAnnouncementPopup = (id: string | number) => {
  const announcementsMap = getAnnouncementsAckMap()
  const entries = Object.entries(announcementsMap).filter(
    // keep only ids that was added in the last 30 days
    ([_, value]) => typeof value === 'number' && Date.now() - value < TIMES_IN_SECS.ONE_DAY * 30 * 1000,
  )
  localStorage.setItem(
    LsKey,
    JSON.stringify({
      ...Object.fromEntries(entries),
      [id]: Date.now(),
    }),
  )
}

export const formatNumberOfUnread = (num: number | undefined) => (num ? (num > 10 ? '10+' : num + '') : null)

export const isPopupCanShow = (
  popupInfo: PopupItemType<PopupContentAnnouncement>,
  chainId: ChainId,
  account: string | undefined,
) => {
  const { templateBody = {}, metaMessageId } = popupInfo.content
  const { endAt, startAt, chainIds = [] } = templateBody as AnnouncementTemplatePopup
  const isRightChain = chainIds.includes(chainId + '')
  const announcementsAckMap = getAnnouncementsAckMap()
  const isRead = announcementsAckMap[metaMessageId]

  const isOwn = popupInfo.account ? account === popupInfo.account : true

  const isExpired = Date.now() < startAt * 1000 || Date.now() > endAt * 1000
  return !isRead && !isExpired && isRightChain && isOwn
}
