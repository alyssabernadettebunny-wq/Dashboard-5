import DataExport from '../widgets/DataExport'
import DisplayPreferences from '../widgets/DisplayPreferences'
import ReferenceInfo from '../widgets/ReferenceInfo'
import ThemePicker from '../widgets/ThemePicker'
import CompanionSettings from '../widgets/CompanionSettings'
import AppGuide from '../widgets/AppGuide'
import WhatsNew from '../widgets/WhatsNew'
import FeedbackAnnotation from '../widgets/FeedbackAnnotation'
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
                <ThemePicker />
                <CompanionSettings />
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
          {
            key: 'support',
            label: 'Data & Support',
            icon: '💌',
            content: (
              <div className="grid">
                <AppGuide />
                <WhatsNew />
                <FeedbackAnnotation />
              </div>
            ),
          },
        ]}
      />
    </>
  )
}
