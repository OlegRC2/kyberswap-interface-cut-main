import { ChainId } from '@kyberswap/ks-sdk-core'
import * as Sentry from '@sentry/react'
import { Suspense, lazy, useEffect } from 'react'
import { isMobile } from 'react-device-detect'
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { useNetwork, usePrevious } from 'react-use'
import styled from 'styled-components'

import snow from 'assets/images/snow.png'
import Popups from 'components/Announcement/Popups'
import AppHaveUpdate from 'components/AppHaveUpdate'
import ErrorBoundary from 'components/ErrorBoundary'
import Footer from 'components/Footer/Footer'
import Header from 'components/Header'
import Loader from 'components/LocalLoader'
import Snowfall from 'components/Snowflake/Snowfall'
import Web3ReactManager from 'components/Web3ReactManager'
import { ENV_LEVEL } from 'constants/env'
import { APP_PATHS } from 'constants/index'
import { CLASSIC_NOT_SUPPORTED, NETWORKS_INFO, SUPPORTED_NETWORKS } from 'constants/networks'
import { ENV_TYPE } from 'constants/type'
import { useActiveWeb3React } from 'hooks'
// import { useAutoLogin } from 'hooks/useLogin'
import { useGlobalMixpanelEvents } from 'hooks/useMixpanel'
// import useSessionExpiredGlobal from 'hooks/useSessionExpire'
import { useSyncNetworkParamWithStore } from 'hooks/web3/useSyncNetworkParamWithStore'
import { RedirectPathToSwapV3Network } from 'pages/SwapV3/redirects'
import { useHolidayMode } from 'state/user/hooks'

// test page for swap only through elastic
// const ElasticSwap = lazy(() => import('./ElasticSwap'))
const SwapV2 = lazy(() => import('./SwapV2'))
const SwapV3 = lazy(() => import('./SwapV3'))
// const PartnerSwap = lazy(() => import('./PartnerSwap'))
// const Bridge = lazy(() => import('./Bridge'))
const Pools = lazy(() => import('./Pools'))
const MyPool = lazy(() => import('./MyPool'))

const PoolFinder = lazy(() => import('./PoolFinder'))
// const ElasticRemoveLiquidity = lazy(() => import('pages/RemoveLiquidityProAmm'))
const RedirectCreatePool = lazy(() => import('pages/CreatePool/RedirectCreatePool'))

// const RedirectElasticCreatePool = lazy(() => import('pages/AddLiquidityV2/RedirectElasticCreatePool'))

const AddLiquidity = lazy(() => import('pages/AddLiquidity'))
// const ElasticIncreaseLiquidity = lazy(() => import('pages/IncreaseLiquidity'))

const RemoveLiquidity = lazy(() => import('pages/RemoveLiquidity'))

const Icons = lazy(() => import('./Icons'))

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
  z-index: 3;
`

const BodyWrapper = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  width: 100%;
  align-items: center;
  min-height: calc(100vh - 148px);
  flex: 1;
  z-index: 1;
`

const preloadImages = () => {
  const imageList: string[] = SUPPORTED_NETWORKS.map(chainId => [NETWORKS_INFO[chainId].icon])
    .flat()
    .filter(Boolean) as string[]

  imageList.forEach(image => {
    if (image) {
      new Image().src = image
    }
  })
}

const SwapPage = () => {
  const { chainId } = useActiveWeb3React()
  useSyncNetworkParamWithStore()
  return chainId === ChainId.SOLANA ? <SwapV2 /> : <SwapV3 />
}

const RedirectWithNetworkPrefix = () => {
  const { networkInfo } = useActiveWeb3React()
  const location = useLocation()

  return (
    <Navigate
      to={{
        ...location,
        pathname: `/${networkInfo.route}${location.pathname}`,
      }}
      replace
    />
  )
}

const RedirectWithNetworkSuffix = () => {
  const { networkInfo } = useActiveWeb3React()
  const location = useLocation()

  return (
    <Navigate
      to={{
        ...location,
        pathname: `${location.pathname}/${networkInfo.route}`,
      }}
      replace
    />
  )
}

const RoutesWithNetworkPrefix = () => {
  const { network } = useParams()
  const { networkInfo, chainId } = useActiveWeb3React()
  const location = useLocation()

  useSyncNetworkParamWithStore()

  if (!network) {
    return <Navigate to={`/${networkInfo.route}${location.pathname}`} replace />
  }

  if (network === NETWORKS_INFO[ChainId.SOLANA].route) {
    return <Navigate to="/" />
  }

  const chainInfoFromParam = SUPPORTED_NETWORKS.find(chain => NETWORKS_INFO[chain].route === network)
  if (!chainInfoFromParam) {
    return <Navigate to={'/'} replace />
  }

  return (
    <Routes>
      {!CLASSIC_NOT_SUPPORTED[chainId] && (
        <>
          <Route
            path={`${APP_PATHS.CLASSIC_CREATE_POOL}/:currencyIdA?/:currencyIdB?`}
            element={<RedirectCreatePool />}
          />
          <Route
            path={`${APP_PATHS.CLASSIC_ADD_LIQ}/:currencyIdA/:currencyIdB?/:pairAddress?`}
            element={<AddLiquidity />}
          />
          <Route
            path={`${APP_PATHS.CLASSIC_REMOVE_POOL}/:currencyIdA/:currencyIdB/:pairAddress`}
            element={<RemoveLiquidity />}
          />
        </>
      )}

      {/* {!ELASTIC_NOT_SUPPORTED[chainId] && (
        <>
          <Route
            path={`${APP_PATHS.ELASTIC_CREATE_POOL}/:currencyIdA?/:currencyIdB?/:feeAmount?`}
            element={<RedirectElasticCreatePool />}
          />
          <Route
            path={`${APP_PATHS.ELASTIC_INCREASE_LIQ}/:currencyIdA?/:currencyIdB?/:feeAmount?/:tokenId?`}
            element={<ElasticIncreaseLiquidity />}
          />
          <Route path={`${APP_PATHS.ELASTIC_REMOVE_POOL}/:tokenId`} element={<ElasticRemoveLiquidity />} />
        </>
      )} */}

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  const { account, chainId, networkInfo } = useActiveWeb3React()
  const { pathname } = useLocation()
  // useAutoLogin()
  const { online } = useNetwork()
  const prevOnline = usePrevious(online)
  // useSessionExpiredGlobal()

  useEffect(() => {
    if (prevOnline === false && online && account) {
      // refresh page when network back to normal to prevent some issues: ex: stale data, ...
      window.location.reload()
    }
  }, [online, prevOnline, account])

  useEffect(() => {
    preloadImages()
  }, [])

  useEffect(() => {
    if (account) {
      Sentry.setUser({ id: account })
    }
  }, [account])

  useEffect(() => {
    if (chainId) {
      Sentry.setTags({
        chainId: chainId,
        network: networkInfo.name,
      })
    }
  }, [chainId, networkInfo.name])

  useGlobalMixpanelEvents()
  // const showFooter = !pathname.includes(APP_PATHS.ABOUT) && !pathname.includes(APP_PATHS.PARTNER_SWAP)
  const [holidayMode] = useHolidayMode()

  const snowflake = new Image()
  snowflake.src = snow

  return (
    <ErrorBoundary>
      <AppHaveUpdate />
      <AppWrapper>
        {/* <ModalsGlobal /> */}
        {/* <ElasticLegacyNotice /> */}
        {/* <TopBanner /> */}
        <HeaderWrapper>
          <Header />
        </HeaderWrapper>
        <Suspense fallback={<Loader />}>
          {holidayMode && (
            <Snowfall
              speed={[0.5, 1]}
              wind={[-0.5, 0.25]}
              snowflakeCount={isMobile ? 13 : 31}
              images={[snowflake]}
              radius={[5, 15]}
            />
          )}

          <BodyWrapper>
            <Popups />
            <Web3ReactManager>
              <Routes>
                {/* From react-router-dom@6.5.0, :fromCurrency-to-:toCurrency no long works, need to manually parse the params */}
                <Route path={`${APP_PATHS.SWAP}/:network/:currency?`} element={<SwapPage />} />
                {/* <Route path={`${APP_PATHS.PARTNER_SWAP}`} element={<PartnerSwap />} /> */}
                {/* {CHAINS_SUPPORT_CROSS_CHAIN.includes(chainId) && (
                  <Route path={`${APP_PATHS.CROSS_CHAIN}`} element={<SwapV3 />} />
                )} */}

                {/* {isSupportLimitOrder(chainId) && (
                  <Route path={`${APP_PATHS.LIMIT}/:network/:currency?`} element={<SwapPage />} />
                )} */}

                <Route path={`${APP_PATHS.FIND_POOL}`} element={<PoolFinder />} />

                <>
                  {/* Pools Routes  */}
                  <Route path={`${APP_PATHS.POOLS}`} element={<RedirectWithNetworkSuffix />} />
                  <Route path={`${APP_PATHS.POOLS}/:network/:currencyIdA?/:currencyIdB?`} element={<Pools />} />
                </>

                <>
                  {/* My Pools Routes */}
                  <Route path={`${APP_PATHS.MY_POOLS}`} element={<RedirectWithNetworkSuffix />} />
                  <Route path={`${APP_PATHS.MY_POOLS}/:network`} element={<MyPool />} />
                </>

                <>
                  {/* These are old routes and will soon be deprecated - Check: RoutesWithNetworkParam */}
                  {/* <Route path={`${APP_PATHS.ELASTIC_CREATE_POOL}/*`} element={<RedirectWithNetworkPrefix />} />
                  <Route path={`${APP_PATHS.ELASTIC_INCREASE_LIQ}/*`} element={<RedirectWithNetworkPrefix />} />
                  <Route path={`${APP_PATHS.ELASTIC_REMOVE_POOL}/*`} element={<RedirectWithNetworkPrefix />} /> */}

                  <Route path={`${APP_PATHS.CLASSIC_CREATE_POOL}/*`} element={<RedirectWithNetworkPrefix />} />
                  <Route path={`${APP_PATHS.CLASSIC_ADD_LIQ}/*`} element={<RedirectWithNetworkPrefix />} />
                  <Route path={`${APP_PATHS.CLASSIC_REMOVE_POOL}/*`} element={<RedirectWithNetworkPrefix />} />
                </>

                {/* <Route path={`${APP_PATHS.KYBERAI}`} element={<Navigate to={APP_PATHS.KYBERAI_ABOUT} replace />} />
                <Route path={`${APP_PATHS.KYBERAI}`} element={<Navigate to={APP_PATHS.KYBERAI_ABOUT} replace />} /> */}

                {/* <Route path={`${APP_PATHS.BRIDGE}`} element={<Bridge />} /> */}
                {ENV_LEVEL === ENV_TYPE.LOCAL && <Route path="/icons" element={<Icons />} />}

                {/* <Route path={`elastic-swap`} element={<ElasticSwap />} /> */}

                <Route path={`/:network/*`} element={<RoutesWithNetworkPrefix />} />

                <Route path="*" element={<RedirectPathToSwapV3Network />} />
              </Routes>
            </Web3ReactManager>
          </BodyWrapper>
          <Footer />
          {/* {!showFooter && <div style={{ marginBottom: '4rem' }} />} */}
        </Suspense>
      </AppWrapper>
    </ErrorBoundary>
  )
}
