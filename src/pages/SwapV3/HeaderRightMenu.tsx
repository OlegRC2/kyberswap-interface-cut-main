import { t } from '@lingui/macro'
import { RefObject, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'

import TransactionSettingsIcon from 'components/Icons/TransactionSettingsIcon'
import { MouseoverTooltip } from 'components/Tooltip'
import { TutorialIds } from 'components/Tutorial/TutorialSwap/constant'
import { StyledActionButtonSwapForm } from 'components/swapv2/styleds'
import { Z_INDEXS } from 'constants/styles'
import useMixpanel, { MIXPANEL_TYPE } from 'hooks/useMixpanel'
import useTheme from 'hooks/useTheme'
import { TAB } from 'pages/SwapV3/index'
import useCurrenciesByPage from 'pages/SwapV3/useCurrenciesByPage'
import { useTutorialSwapGuide } from 'state/tutorial/hooks'

const SwapFormActions = styled.div<{ isShowHeaderMenu: boolean }>`
  display: flex;
  align-items: center;
  z-index: ${Z_INDEXS.SWAP_PAGE_HEADER_RIGHT_MENU};
  position: relative;
`

const TransactionSettingsIconWrapper = styled.span`
  line-height: 0;
`

export default function HeaderRightMenu({
  activeTab,
  setActiveTab,
  swapActionsRef,
}: {
  activeTab: TAB
  setActiveTab: (tab: TAB) => void
  swapActionsRef: RefObject<HTMLDivElement>
}) {
  const theme = useTheme()

  const [isShowHeaderMenu, setShowHeaderMenu] = useState(false)

  const { pathname } = useLocation()
  // const isLimitPage = pathname.startsWith(APP_PATHS.LIMIT)
  // const isCrossChainPage = pathname.startsWith(APP_PATHS.CROSS_CHAIN)

  const { currencies } = useCurrenciesByPage()
  const { mixpanelHandler } = useMixpanel(currencies)

  const onToggleActionTab = (tab: TAB) => setActiveTab(activeTab === tab ? TAB.SWAP : tab)

  const onMouseEnterMenu = () => {
    if (isMobile) return
    setShowHeaderMenu(true)
  }
  const onMouseLeaveMenu = () => {
    if (isMobile) return
    setShowHeaderMenu(false)
  }

  const [{ show: showTutorialSwap, stepInfo }] = useTutorialSwapGuide()
  const forceShowMenu = showTutorialSwap && stepInfo?.selector === `#${TutorialIds.BUTTON_SETTING_SWAP_FORM}`
  const isShowMenu = Boolean(isShowHeaderMenu || forceShowMenu)

  return (
    <SwapFormActions
      ref={swapActionsRef}
      onMouseEnter={onMouseEnterMenu}
      onMouseLeave={onMouseLeaveMenu}
      isShowHeaderMenu={isShowMenu}
    >
      <>
        <StyledActionButtonSwapForm
          active={activeTab === TAB.SETTINGS}
          onClick={() => {
            onToggleActionTab(TAB.SETTINGS)
            mixpanelHandler(MIXPANEL_TYPE.SWAP_SETTINGS_CLICK)
          }}
          aria-label="Swap Settings"
        >
          <MouseoverTooltip text={t`Settings`} placement="top" width="fit-content" disableTooltip={isMobile}>
            <TransactionSettingsIconWrapper id={TutorialIds.BUTTON_SETTING_SWAP_FORM}>
              <TransactionSettingsIcon fill={theme.subText} />
            </TransactionSettingsIconWrapper>
          </MouseoverTooltip>
        </StyledActionButtonSwapForm>
      </>
    </SwapFormActions>
  )
}
