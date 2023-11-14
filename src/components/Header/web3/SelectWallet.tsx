import { Trans } from '@lingui/macro'
import { darken, lighten } from 'polished'
import { useMemo } from 'react'
import { Activity } from 'react-feather'
import { useMedia } from 'react-use'
import styled from 'styled-components'

import { ButtonLight } from 'components/Button'
import WalletModal from 'components/Header/web3/WalletModal'
import Loader from 'components/Loader'
import { RowBetween } from 'components/Row'
import { TutorialIds } from 'components/Tutorial/TutorialSwap/constant'
import { useActiveWeb3React } from 'hooks'
import useENSName from 'hooks/useENSName'
import useMixpanel, { MIXPANEL_TYPE } from 'hooks/useMixpanel'
import useTheme from 'hooks/useTheme'
import { useNetworkModalToggle, useWalletModalToggle } from 'state/application/hooks'
import { isTransactionRecent, newTransactionsFirst, useAllTransactions } from 'state/transactions/hooks'
import { TransactionDetails } from 'state/transactions/type'
import { MEDIA_WIDTHS } from 'theme'
import { shortenAddress } from 'utils'

const Web3StatusGeneric = styled.button`
  ${({ theme }) => theme.flexRowNoWrap}
  width: fit-content;
  align-items: center;
  padding: 10px 12px;
  border-radius: 999px;
  cursor: pointer;
  user-select: none;
  :focus {
    outline: none;
  }
`
const Web3StatusError = styled(Web3StatusGeneric)`
  background-color: ${({ theme }) => theme.red1};
  border: 1px solid ${({ theme }) => theme.red1};
  color: ${({ theme }) => theme.white};
  font-weight: 500;
  :hover,
  :focus {
    background-color: ${({ theme }) => darken(0.1, theme.red1)};
  }
`

const Web3StatusConnected = styled(Web3StatusGeneric)<{ pending?: boolean }>`
  background-color: ${({ pending, theme }) => (pending ? theme.primary : theme.background)};
  border: 1px solid ${({ pending, theme }) => (pending ? theme.primary : theme.background)};
  color: ${({ pending, theme }) => (pending ? theme.white : theme.subText)};
  font-weight: 500;
  :hover,
  :focus {
    background-color: ${({ pending, theme }) =>
      pending ? darken(0.05, theme.primary) : lighten(0.05, theme.background)};
    border: 1px solid ${({ theme }) => theme.primary};
  }
`

const Text = styled.p`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0.25rem 0 0.5rem;
  font-size: 1rem;
  width: fit-content;
  font-weight: 500;
`

const NetworkIcon = styled(Activity)`
  margin-left: 0.25rem;
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
`

const AccountElement = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 999px;
  white-space: nowrap;
  width: fit-content;
  cursor: pointer;
  pointer-events: auto;
  height: 42px;
`

function Web3StatusInner() {
  const { chainId, account, walletKey, isEVM, isWrongNetwork } = useActiveWeb3React()
  const { mixpanelHandler } = useMixpanel()
  const uptoMedium = useMedia(`(max-width: ${MEDIA_WIDTHS.upToMedium}px)`)
  // const { signIn } = useLogin()
  const { ENSName } = useENSName(isEVM ? account ?? undefined : undefined)
  const theme = useTheme()

  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs: TransactionDetails[] = allTransactions
      ? (Object.values(allTransactions)?.flat().filter(Boolean) as TransactionDetails[])
      : []
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pendingLength = sortedRecentTransactions.filter(tx => !tx.receipt).length

  const hasPendingTransactions = !!pendingLength
  const toggleWalletModal = useWalletModalToggle()
  const toggleNetworkModal = useNetworkModalToggle()

  if (isWrongNetwork) {
    return (
      <Web3StatusError onClick={toggleNetworkModal}>
        <NetworkIcon />
        <Text>
          <Trans>Wrong Network</Trans>
        </Text>
      </Web3StatusError>
    )
  }
  if (account) {
    return (
      <Web3StatusConnected
        id={TutorialIds.BUTTON_ADDRESS_WALLET}
        data-testid="web3-status-connected"
        onClick={() => {
          toggleWalletModal()
          mixpanelHandler(MIXPANEL_TYPE.WUI_WALLET_CLICK)
        }}
        pending={hasPendingTransactions}
      >
        {hasPendingTransactions ? (
          <RowBetween>
            <Text>
              <Trans>{pendingLength} Pending</Trans>
            </Text>{' '}
            <Loader stroke="white" />
          </RowBetween>
        ) : (
          <>
            <Text>{ENSName || shortenAddress(chainId, account, uptoMedium ? 2 : undefined)}</Text>
          </>
        )}
      </Web3StatusConnected>
    )
  }
  return (
    <ButtonLight
      onClick={toggleWalletModal}
      padding="10px 12px"
      id={TutorialIds.BUTTON_CONNECT_WALLET}
      data-testid="button-connect-wallet"
    >
      <Trans>Connect</Trans>
    </ButtonLight>
  )
}

export default function SelectWallet() {
  return (
    <AccountElement>
      <Web3StatusInner />
      <WalletModal />
    </AccountElement>
  )
}