import TodaysMeals from '../widgets/TodaysMeals'
import WeeklyMealPlan from '../widgets/WeeklyMealPlan'
import PantryStaples from '../widgets/PantryStaples'
import GroceryList from '../widgets/GroceryList'
import RecipeBox from '../widgets/RecipeBox'
import TakeoutFavorites from '../widgets/TakeoutFavorites'

export default function FoodPage() {
  return (
    <>
      <h2 className="page-title">Food</h2>
      <div className="grid">
        <TodaysMeals />
        <WeeklyMealPlan />
        <PantryStaples />
        <GroceryList />
        <RecipeBox />
        <TakeoutFavorites />
      </div>
    </>
  )
}
