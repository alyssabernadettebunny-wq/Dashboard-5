import CreativeProjects from '../widgets/CreativeProjects'
import GoalsDreams from '../widgets/GoalsDreams'
import FunPrompts from '../widgets/FunPrompts'
import TinyCollections from '../widgets/TinyCollections'
import BeautyDeals from '../widgets/BeautyDeals'
import SubTabs from '../components/SubTabs'

export default function SparkPage() {
  return (
    <>
      <img className="page-title-img" src="/Dashboard-5/images/tab-titles/spark.png" alt="Spark" />
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
          {
            key: 'collections',
            label: 'Collections',
            icon: '🎁',
            content: (
              <div className="grid">
                <TinyCollections />
              </div>
            ),
          },
          {
            key: 'beauty',
            label: 'Beauty Deals',
            icon: '💄',
            content: (
              <div className="grid">
                <BeautyDeals />
              </div>
            ),
          },
        ]}
      />
    </>
  )
}
