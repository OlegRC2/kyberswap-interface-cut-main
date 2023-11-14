import { RefObject } from 'react'

import { ColumnCenter } from 'components/Column'
import { RowBetween } from 'components/Row'
import { TAB } from 'pages/SwapV3'
import HeaderRightMenu from 'pages/SwapV3/HeaderRightMenu'
import Tabs from 'pages/SwapV3/Tabs'

export default function Header({
  activeTab,
  setActiveTab,
  swapActionsRef,
}: {
  activeTab: TAB
  setActiveTab: (tab: TAB) => void
  swapActionsRef: RefObject<HTMLDivElement>
}) {
  return (
    <>
      <ColumnCenter gap="sm">
        <RowBetween>
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <HeaderRightMenu activeTab={activeTab} setActiveTab={setActiveTab} swapActionsRef={swapActionsRef} />
        </RowBetween>
      </ColumnCenter>
    </>
  )
}
