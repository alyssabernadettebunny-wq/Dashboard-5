import TodaysMeals from '../widgets/TodaysMeals'
import WeeklyMealPlan from '../widgets/WeeklyMealPlan'
import PantryStaples from '../widgets/PantryStaples'
import GroceryList from '../widgets/GroceryList'
import RecipeBox from '../widgets/RecipeBox'
import TakeoutFavorites from '../widgets/TakeoutFavorites'

export default function FoodPage() {
  return (
    <>
      <img className="page-title-img" src="/Dashboard-5/images/tab-titles/food.png" alt="Food" />
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
