import { Currency } from '@kyberswap/ks-sdk-core'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Flex } from 'rebass'
import styled from 'styled-components'

import { ReactComponent as RoutingIcon } from 'assets/svg/routing-icon.svg'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import TokenWarningModal from 'components/TokenWarningModal'
import { TutorialIds } from 'components/Tutorial/TutorialSwap/constant'
import GasPriceTrackerPanel from 'components/swapv2/GasPriceTrackerPanel'
import LiquiditySourcesPanel from 'components/swapv2/LiquiditySourcesPanel'
import { PairSuggestionHandle } from 'components/swapv2/PairSuggestion'
import SettingsPanel from 'components/swapv2/SwapSettingsPanel'
import TokenInfoTab from 'components/swapv2/TokenInfo'
import { Container, InfoComponentsWrapper, PageWrapper, SwapFormWrapper, highlight } from 'components/swapv2/styleds'
import { APP_PATHS } from 'constants/index'
import { useActiveWeb3React } from 'hooks'
import { useAllTokens, useIsLoadedTokenDefault } from 'hooks/Tokens'
import useParsedQueryString from 'hooks/useParsedQueryString'
import useTheme from 'hooks/useTheme'
import { BodyWrapper } from 'pages/AppBody'
import Header from 'pages/SwapV3/Header'
import useCurrenciesByPage from 'pages/SwapV3/useCurrenciesByPage'
import useTokenNotInDefault from 'pages/SwapV3/useTokenNotInDefault'
import { useLimitActionHandlers } from 'state/limit/hooks'
import { Field } from 'state/swap/actions'
import { useDefaultsFromURLSearch, useSwapActionHandlers } from 'state/swap/hooks'
import { useTutorialSwapGuide } from 'state/tutorial/hooks'
import { DetailedRouteSummary } from 'types/route'

import PopulatedSwapForm from './PopulatedSwapForm'

// const TradeRouting = lazy(() => import('components/TradeRouting'))

// const LiveChart = lazy(() => import('components/LiveChart'))

export const InfoComponents = ({ children }: { children: ReactNode[] }) => {
  return children.filter(Boolean).length ? <InfoComponentsWrapper>{children}</InfoComponentsWrapper> : null
}

export enum TAB {
  SWAP = 'swap',
  INFO = 'info',
  SETTINGS = 'settings',
  GAS_PRICE_TRACKER = 'gas_price_tracker',
  LIQUIDITY_SOURCES = 'liquidity_sources',
  LIMIT = 'limit',
  CROSS_CHAIN = 'cross_chain',
}

export const isSettingTab = (tab: TAB) =>
  [TAB.INFO, TAB.SETTINGS, TAB.GAS_PRICE_TRACKER, TAB.LIQUIDITY_SOURCES].includes(tab)

export const AppBodyWrapped = styled(BodyWrapper)`
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  padding: 16px;
  margin-top: 0;

  &[data-highlight='true'] {
    animation: ${({ theme }) => highlight(theme)} 2s 2 alternate ease-in-out;
  }
`

export const SwitchLocaleLinkWrapper = styled.div`
  margin-bottom: 30px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  margin-bottom: 0px;
`}
`

export const RoutingIconWrapper = styled(RoutingIcon)`
  height: 27px;
  width: 27px;
  margin-right: 10px;
  path {
    fill: ${({ theme }) => theme.subText} !important;
  }
`

export default function Swap() {
  const { chainId } = useActiveWeb3React()
  // const isShowLiveChart = useShowLiveChart()
  // const isShowTradeRoutes = useShowTradeRoutes()
  const qs = useParsedQueryString<{ highlightBox: string }>()
  const [{ show: isShowTutorial = false }] = useTutorialSwapGuide()
  const [routeSummary, setRouteSummary] = useState<DetailedRouteSummary>()

  const { pathname } = useLocation()

  const refSuggestPair = useRef<PairSuggestionHandle>(null)

  const [showingPairSuggestionImport, setShowingPairSuggestionImport] = useState<boolean>(false) // show modal import when click pair suggestion

  const shouldHighlightSwapBox = qs.highlightBox === 'true'

  const isSwapPage = pathname.startsWith(APP_PATHS.SWAP)

  const getDefaultTab = useCallback(() => TAB.SWAP, [isSwapPage])

  const [activeTab, setActiveTab] = useState<TAB>(getDefaultTab())

  const { onSelectPair: onSelectPairLimit } = useLimitActionHandlers()

  useEffect(() => {
    setActiveTab(getDefaultTab())
  }, [getDefaultTab])

  useDefaultsFromURLSearch()

  const theme = useTheme()

  const { onCurrencySelection, onUserInput } = useSwapActionHandlers()
  const { currencies, currencyIn, currencyOut } = useCurrenciesByPage()

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens()
  const importTokensNotInDefault = useTokenNotInDefault()

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput],
  )

  // reset if they close warning without tokens in params
  const handleDismissTokenWarning = useCallback(() => {
    if (showingPairSuggestionImport) {
      setShowingPairSuggestionImport(false)
    }
  }, [showingPairSuggestionImport])

  const handleConfirmTokenWarning = useCallback(
    (tokens: Currency[]) => {
      handleDismissTokenWarning()
      if (showingPairSuggestionImport) {
        refSuggestPair.current?.onConfirmImportToken() // callback from children
      }
    },
    [onSelectPairLimit, showingPairSuggestionImport, handleDismissTokenWarning],
  )

  const onSelectSuggestedPair = useCallback(
    (fromToken: Currency | undefined, toToken: Currency | undefined, amount?: string) => {
      if (fromToken) onCurrencySelection(Field.INPUT, fromToken)
      if (toToken) onCurrencySelection(Field.OUTPUT, toToken)
      if (amount) handleTypeInput(amount)
    },
    [handleTypeInput, onCurrencySelection, onSelectPairLimit],
  )

  const isLoadedTokenDefault = useIsLoadedTokenDefault()

  const onBackToSwapTab = () => setActiveTab(getDefaultTab())

  const isShowModalImportToken =
    isLoadedTokenDefault && importTokensNotInDefault.length > 0 && showingPairSuggestionImport

  // const tradeRouteComposition = useMemo(() => {
  //   return getTradeComposition(chainId, routeSummary?.parsedAmountIn, undefined, routeSummary?.route, defaultTokens)
  // }, [chainId, defaultTokens, routeSummary])
  const swapActionsRef = useRef(null)

  return (
    <>
      <TokenWarningModal
        isOpen={isShowModalImportToken}
        tokens={importTokensNotInDefault}
        onConfirm={handleConfirmTokenWarning}
      />
      <PageWrapper>
        <Container>
          <SwapFormWrapper isShowTutorial={isShowTutorial}>
            <Header activeTab={activeTab} setActiveTab={setActiveTab} swapActionsRef={swapActionsRef} />

            <AppBodyWrapped
              data-highlight={shouldHighlightSwapBox}
              id={TutorialIds.SWAP_FORM}
              style={[TAB.INFO, TAB.LIMIT].includes(activeTab) ? { padding: 0 } : undefined}
            >
              {isSwapPage && (
                <PopulatedSwapForm
                  onSelectSuggestedPair={onSelectSuggestedPair}
                  routeSummary={routeSummary}
                  setRouteSummary={setRouteSummary}
                  goToSettingsView={() => setActiveTab(TAB.SETTINGS)}
                  hidden={activeTab !== TAB.SWAP}
                />
              )}
              {activeTab === TAB.INFO && <TokenInfoTab currencies={currencies} onBack={onBackToSwapTab} />}
              {activeTab === TAB.SETTINGS && (
                <SettingsPanel
                  isSwapPage={isSwapPage}
                  onBack={onBackToSwapTab}
                  onClickLiquiditySources={() => setActiveTab(TAB.LIQUIDITY_SOURCES)}
                  onClickGasPriceTracker={() => setActiveTab(TAB.GAS_PRICE_TRACKER)}
                  swapActionsRef={swapActionsRef}
                />
              )}
              {activeTab === TAB.GAS_PRICE_TRACKER && (
                <GasPriceTrackerPanel onBack={() => setActiveTab(TAB.SETTINGS)} />
              )}
              {activeTab === TAB.LIQUIDITY_SOURCES && (
                <LiquiditySourcesPanel onBack={() => setActiveTab(TAB.SETTINGS)} />
              )}
            </AppBodyWrapped>
          </SwapFormWrapper>

          {/* <InfoComponents>
            {isShowLiveChart && (
              <LiveChartWrapper>
                <Suspense
                  fallback={
                    <Skeleton
                      height="100%"
                      baseColor={theme.background}
                      highlightColor={theme.buttonGray}
                      borderRadius="1rem"
                    />
                  }
                >
                  <LiveChart currencies={currencies} enableProChart={isSwapPage} />
                </Suspense>
              </LiveChartWrapper>
            )}
            {isShowTradeRoutes && isSwapPage && (
              <RoutesWrapper isOpenChart={isShowLiveChart}>
                <Flex flexDirection="column" width="100%">
                  <Flex alignItems={'center'}>
                    <RoutingIconWrapper />
                    <Text fontSize={20} fontWeight={500} color={theme.subText}>
                      <Trans>Your trade route</Trans>
                    </Text>
                  </Flex>
                  <Suspense
                    fallback={
                      <Skeleton
                        height="100px"
                        baseColor={theme.background}
                        highlightColor={theme.buttonGray}
                        borderRadius="1rem"
                      />
                    }
                  >
                    <TradeRouting
                      tradeComposition={tradeRouteComposition}
                      currencyIn={currencyIn}
                      currencyOut={currencyOut}
                      inputAmount={routeSummary?.parsedAmountIn}
                      outputAmount={routeSummary?.parsedAmountOut}
                    />
                  </Suspense>
                </Flex>
              </RoutesWrapper>
            )}
          </InfoComponents> */}
        </Container>
        <Flex justifyContent="center">
          <SwitchLocaleLinkWrapper>
            <SwitchLocaleLink />
          </SwitchLocaleLinkWrapper>
        </Flex>
      </PageWrapper>
    </>
  )
}
