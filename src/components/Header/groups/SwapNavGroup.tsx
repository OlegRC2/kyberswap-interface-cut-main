import { Trans } from '@lingui/macro'
import { Repeat } from 'react-feather'
import { useLocation } from 'react-router-dom'
import { useMedia } from 'react-use'
import { Flex } from 'rebass'
import styled from 'styled-components'

import { TutorialIds } from 'components/Tutorial/TutorialSwap/constant'
import { APP_PATHS } from 'constants/index'
import { useActiveWeb3React } from 'hooks'
import { useTutorialSwapGuide } from 'state/tutorial/hooks'

import { DropdownTextAnchor, StyledNavLink } from '../styleds'
import NavGroup from './NavGroup'

const IconWrapper = styled.div`
  flex: 0 0 16px;
  display: flex;
  width: 16px;
  height: 16px;
  align-items: center;
`

const SwapNavGroup = () => {
  const { networkInfo } = useActiveWeb3React()
  const { pathname } = useLocation()
  const upTo420 = useMedia('(max-width: 420px)')

  const [{ show: isShowTutorial = false, stepInfo }] = useTutorialSwapGuide()

  const isActive = [APP_PATHS.SWAP].some(path => pathname.includes(path))

  return (
    <NavGroup
      dropdownAlign={upTo420 ? 'right' : 'left'}
      isActive={isActive}
      forceOpen={isShowTutorial && stepInfo?.selector === `#${TutorialIds.BRIDGE_LINKS}`}
      anchor={
        <DropdownTextAnchor>
          <Trans>Swap</Trans>
        </DropdownTextAnchor>
      }
      dropdownContent={
        <Flex flexDirection={'column'} id={TutorialIds.BRIDGE_LINKS} minWidth={'250px'}>
          <StyledNavLink
            id={`swapv2-nav-link`}
            to={`${APP_PATHS.SWAP}/${networkInfo.route}`}
            style={{ flexDirection: 'column' }}
          >
            <Flex alignItems="center" sx={{ gap: '12px' }}>
              <IconWrapper>
                <Repeat size={16} />
              </IconWrapper>
              <Trans>Swap</Trans>
            </Flex>
          </StyledNavLink>
        </Flex>
      }
    />
  )
}

export default SwapNavGroup
