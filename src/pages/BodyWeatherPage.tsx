import CurrentBodyWeather from '../widgets/CurrentBodyWeather'
import MoodEnergyTrend from '../widgets/MoodEnergyTrend'
import RestRewardPockets from '../widgets/RestRewardPockets'
import HomeComforts from '../widgets/HomeComforts'

export default function BodyWeatherPage() {
  return (
    <>
      <h2 className="page-title">Body Weather</h2>
      <div className="grid">
        <CurrentBodyWeather />
        <MoodEnergyTrend />
        <RestRewardPockets />
        <HomeComforts />
      </div>
    </>
  )
}
