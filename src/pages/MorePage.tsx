import DataExport from '../widgets/DataExport'
import DisplayPreferences from '../widgets/DisplayPreferences'
import ReferenceInfo from '../widgets/ReferenceInfo'
import SubTabs from '../components/SubTabs'

export default function MorePage() {
  return (
    <>
      <h2 className="page-title">More</h2>
      <SubTabs
        storageKey="more.subtab"
        tabs={[
          {
            key: 'settings',
            label: 'Settings',
            icon: '⚙️',
            content: (
              <div className="grid">
                <DisplayPreferences />
                <DataExport />
              </div>
            ),
          },
          {
            key: 'reference',
            label: 'Reference',
            icon: '📇',
            content: (
              <div className="grid">
                <ReferenceInfo />
              </div>
            ),
          },
        ]}
      />
    </>
  )
}
