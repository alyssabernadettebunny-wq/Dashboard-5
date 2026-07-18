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

export default function BodyWeatherPage() {
  return (
    <>
      <h2 className="page-title">Body Weather</h2>
      <div className="grid">
        <CurrentBodyWeather />
        <MoodEnergyTrend />
        <SleepStressLog />
        <CycleTracker />
        <SymptomsCheck />
        <MovementStretch />
        <NourishmentHydration />
        <RegulationTools />
        <RestRewardPockets />
        <HomeComforts />
        <TodaysNotes />
      </div>
    </>
  )
}
