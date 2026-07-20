import CreativeProjects from '../widgets/CreativeProjects'
import GoalsDreams from '../widgets/GoalsDreams'
import FunPrompts from '../widgets/FunPrompts'
import SubTabs from '../components/SubTabs'

export default function SparkPage() {
  return (
    <>
      <h2 className="page-title">Spark</h2>
      <SubTabs
        storageKey="spark.subtab"
        tabs={[
          {
            key: 'projects',
            label: 'Projects',
            icon: '🎨',
            content: (
              <div className="grid">
                <CreativeProjects />
              </div>
            ),
          },
          {
            key: 'goals',
            label: 'Goals',
            icon: '🌟',
            content: (
              <div className="grid">
                <GoalsDreams />
              </div>
            ),
          },
          {
            key: 'fun',
            label: 'Fun',
            icon: '🎲',
            content: (
              <div className="grid">
                <FunPrompts />
              </div>
            ),
          },
        ]}
      />
    </>
  )
}
