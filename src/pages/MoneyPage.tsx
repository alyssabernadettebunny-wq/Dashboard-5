import BillsTracker from '../widgets/BillsTracker'
import BudgetCategories from '../widgets/BudgetCategories'
import SavingsGoals from '../widgets/SavingsGoals'
import SubTabs from '../components/SubTabs'

export default function MoneyPage() {
  return (
    <>
      <img className="page-title-img" src="/Dashboard-5/images/tab-titles/money.png" alt="Money" />
      <SubTabs
        storageKey="money.subtab"
        tabs={[
          {
            key: 'bills',
            label: 'Bills',
            icon: '🧾',
            content: (
              <div className="grid">
                <BillsTracker />
              </div>
            ),
          },
          {
            key: 'budget',
            label: 'Budget',
            icon: '💸',
            content: (
              <div className="grid">
                <BudgetCategories />
              </div>
            ),
          },
          {
            key: 'savings',
            label: 'Savings',
            icon: '🎯',
            content: (
              <div className="grid">
                <SavingsGoals />
              </div>
            ),
          },
        ]}
      />
    </>
  )
}
