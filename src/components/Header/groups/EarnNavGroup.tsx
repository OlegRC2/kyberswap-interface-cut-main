import { Trans } from '@lingui/macro'
import { useLocation } from 'react-router-dom'
import { useMedia } from 'react-use'
import { Flex } from 'rebass'

import Icon from 'components/Icons/Icon'
import { TutorialIds } from 'components/Tutorial/TutorialSwap/constant'
import { APP_PATHS } from 'constants/index'
import { useActiveWeb3React } from 'hooks'

import { DropdownTextAnchor, StyledNavLink } from '../styleds'
import NavGroup from './NavGroup'

const EarnNavGroup = () => {
  const { isEVM, networkInfo } = useActiveWeb3React()
  const upTo420 = useMedia('(max-width: 420px)')
  const { pathname } = useLocation()
  // const isActive = [APP_PATHS.POOLS, APP_PATHS.FARMS, APP_PATHS.MY_POOLS].some(path => pathname.includes(path))
  const isActive = [APP_PATHS.POOLS, APP_PATHS.MY_POOLS].some(path => pathname.includes(path))

  if (!isEVM) {
    return null
  }

  return (
    <NavGroup
      dropdownAlign={upTo420 ? 'right' : 'left'}
      id={TutorialIds.EARNING_LINKS}
      isActive={isActive}
      anchor={
        <DropdownTextAnchor data-testid="earn-menu">
          <Trans>Earn</Trans>
        </DropdownTextAnchor>
      }
      dropdownContent={
        <Flex
          sx={{
            flexDirection: 'column',
          }}
        >
          <StyledNavLink
            id="pools-nav-link"
            data-testid="pools-nav-link"
            to={`${APP_PATHS.POOLS}/${networkInfo.route}`}
            style={{ width: '100%' }}
          >
            <Flex sx={{ gap: '12px' }} alignItems="center">
              <Icon id="liquid" size={16} />
              <Trans>Pools</Trans>
            </Flex>
          </StyledNavLink>

          <StyledNavLink
            id="my-pools-nav-link"
            data-testid="my-pools-nav-link"
            to={`${APP_PATHS.MY_POOLS}/${networkInfo.route}`}
          >
            <Flex sx={{ gap: '12px' }} alignItems="center">
              <Icon id="liquid-outline" size={16} />
              <Trans>My Pools</Trans>
            </Flex>
          </StyledNavLink>
        </Flex>
      }
    />
  )
}

export default EarnNavGroup
