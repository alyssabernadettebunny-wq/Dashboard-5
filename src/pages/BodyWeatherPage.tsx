import CurrentBodyWeather from '../widgets/CurrentBodyWeather'
import MoodEnergyTrend from '../widgets/MoodEnergyTrend'
import SleepStressLog from '../widgets/SleepStressLog'
import CycleTracker from '../widgets/CycleTracker'
import SymptomsCheck from '../widgets/SymptomsCheck'
import MovementStretch from '../widgets/MovementStretch'
import NourishmentHydration from '../widgets/NourishmentHydration'
import RegulationTools from '../widgets/RegulationTools'
import RestRewardPockets from '../widgets/RestRewardPockets'
import HomeComforts from '../widgets/HomeComforts'
import TodaysNotes from '../widgets/TodaysNotes'
import SubTabs from '../components/SubTabs'

export default function BodyWeatherPage() {
  return (
    <>
      <h2 className="page-title">Body Weather</h2>
      <SubTabs
        storageKey="bodyweather.subtab"
        tabs={[
          {
            key: 'overview',
            label: 'Overview',
            icon: '☁️',
            content: (
              <div className="grid">
                <CurrentBodyWeather />
                <MoodEnergyTrend />
                <SleepStressLog />
              </div>
            ),
          },
          {
            key: 'cycle',
            label: 'Cycle & Symptoms',
            icon: '🌙',
            content: (
              <div className="grid">
                <CycleTracker />
                <SymptomsCheck />
              </div>
            ),
          },
          {
            key: 'movement',
            label: 'Movement & Care',
            icon: '🌱',
            content: (
              <div className="grid">
                <MovementStretch />
                <NourishmentHydration />
              </div>
            ),
          },
          {
            key: 'comfort',
            label: 'Comfort',
            icon: '🕯️',
            content: (
              <div className="grid">
                <RegulationTools />
                <RestRewardPockets />
                <HomeComforts />
                <TodaysNotes />
              </div>
            ),
          },
        ]}
      />
    </>
  )
}
