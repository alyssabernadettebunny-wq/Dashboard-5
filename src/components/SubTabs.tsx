import { useState, type ReactNode } from 'react'
import './subtabs.css'

interface SubTab {
  key: string
  label: string
  icon: string
  content: ReactNode
}

export default function SubTabs({ tabs, storageKey }: { tabs: SubTab[]; storageKey: string }) {
  const [active, setActive] = useState(() => sessionStorage.getItem(storageKey) || tabs[0].key)

  function selectTab(key: string) {
    setActive(key)
    sessionStorage.setItem(storageKey, key)
  }

  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0]

  return (
    <>
      <div className="subtab-strip">
        <img className="subtab-bow" src="/Dashboard-5/images/subtab-heart.png" alt="" />
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`subtab-tab ${activeTab.key === tab.key ? 'active' : ''}`}
            onClick={() => selectTab(tab.key)}
          >
            {tab.label}
            {activeTab.key === tab.key && <span className="subtab-heart">♡</span>}
          </button>
        ))}
      </div>
      <div className="subtab-panel">{activeTab.content}</div>
    </>
  )
}
