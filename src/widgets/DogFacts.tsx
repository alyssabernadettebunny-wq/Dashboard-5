import Card from '../components/Card'

const FRENCHIE_FACTS = [
  "French Bulldogs can't swim well due to their heavy heads and short snouts — always supervise water time.",
  'Frenchies are prone to overheating because of their short snouts (brachycephalic) — keep them cool in summer.',
  'French Bulldog "bat ears" are a breed hallmark and help with their expressive communication.',
  "French Bulldogs are one of the only breeds that can't naturally give birth without assistance most of the time.",
  'French Bulldogs snore, snort, and grunt more than most breeds because of their short airways — it’s normal, but worth mentioning to the vet if it gets worse.',
  'Puppies like Misa need extra nap time — up to 18-20 hours a day is normal for young pups.',
  'A Frenchie’s "bratty" streak often comes from being smart and stubborn — mental enrichment helps burn that energy.',
  'Frenchies were originally bred as miniature bulldogs for lace workers in 19th-century England.',
  'French Bulldogs can’t regulate their body temperature well, so they’re prone to both overheating and getting cold easily.',
  'Frenchies are known for "talking back" with grumbles and grunts when they disagree with something.',
  'Many Frenchies love to burrow under blankets — it’s a comfort behavior, not just a quirk.',
  'French Bulldogs are prone to skin fold irritation and need their wrinkles cleaned regularly.',
  'Frenchies typically can’t jump very high due to their compact, heavy build.',
  'A Frenchie’s "zoomies" burn off pent-up energy fast since they tire quickly on long walks.',
  'French Bulldogs are prone to flatulence due to how much air they swallow while eating.',
  'Frenchies often sleep on their backs with legs splayed out — it helps them cool down.',
  'French Bulldogs are highly people-oriented and don’t do well left alone for long stretches.',
  'A Frenchie’s bark is often low-pitched and infrequent compared to other small breeds.',
  'French Bulldog puppies go through a "fear period" around 8-11 weeks where new experiences feel bigger.',
  'Frenchies are prone to eye issues due to their prominent, round eyes — regular checks help.',
  'French Bulldogs came in fashion partly because of their compact size, ideal for city apartment life.',
  'Frenchies often "smile" by pulling their lips back — it’s usually a happy, relaxed expression.',
  'French Bulldog tails are naturally short and often screw-shaped or straight, never docked.',
  'Frenchies can be surprisingly stubborn during training and do best with short, reward-based sessions.',
  'French Bulldogs are prone to hiccups, which usually pass on their own within a few minutes.',
  'A Frenchie’s coat needs minimal grooming, but their skin folds need daily attention.',
  'French Bulldogs often prefer human laps over dog beds, no matter how big they get.',
  'Frenchies can be picky eaters and food-motivated at the same time — worth watching portions.',
  'French Bulldog ears start floppy as puppies and usually stand up fully by 4-6 months.',
  'Frenchies bond deeply with their people and often pick a "favorite" person in the house.',
]

const MALTIPOO_FACTS = [
  'Maltipoos are a Maltese x Poodle mix, bred to be small, affectionate companion dogs.',
  "Maltipoos often inherit the Poodle's low-shedding coat, making them popular with allergy-sensitive owners.",
  'Both Frenchies and Maltipoos are prone to separation anxiety and do best with lots of companionship.',
  'Maltipoos are highly food-motivated, which makes training easier but overfeeding easy too.',
  'Maltipoos are quick learners and tend to pick up on their owner’s emotional state easily.',
  'Both breeds do best with consistent, gentle routines rather than big schedule changes.',
  'Maltipoo coats can range from curly like a Poodle to wavy like a Maltese, depending on the mix.',
  'Maltipoos are prone to dental crowding since they have small mouths — regular teeth checks matter.',
  'Maltipoos often love water play, taking more after their Poodle side than most small breeds.',
  'A Maltipoo’s coat usually needs brushing every couple of days to prevent matting.',
  'Maltipoos are known for being especially gentle and well-suited to calm households.',
  'Maltipoos can be prone to "small dog syndrome" if boundaries aren’t set early and consistently.',
  'Maltipoos often enjoy puzzle toys since they’re smart and get bored without mental stimulation.',
  'Maltipoos are prone to tear staining around the eyes, which is usually just cosmetic.',
  'A Maltipoo’s ideal weight is usually between 5-20 lbs depending on the specific parent breeds.',
  'Maltipoos tend to be cautious around new people at first, then warm up quickly once comfortable.',
  'Maltipoos often "shadow" their favorite person from room to room throughout the day.',
  'Maltipoos are prone to low blood sugar as puppies, so regular small meals matter early on.',
  'Maltipoos usually have a lifespan of 10-15 years with proper care.',
  'Maltipoos can be sensitive to loud noises and benefit from a predictable, calm environment.',
  'Maltipoo puppies are born with darker coats that often lighten as they mature.',
  'Maltipoos are considered hypoallergenic-leaning, though no dog is 100% allergen-free.',
  'Maltipoos often enjoy short, gentle walks over long high-energy outings.',
  'Maltipoos can be prone to luxating patella (knee slipping) — a vet can check this easily.',
  'Maltipoos are known to be excellent lap dogs, happy to nap for hours with their person.',
  'A Maltipoo’s curly coat traps less loose hair around the house compared to straight-coated breeds.',
  'Maltipoos often do well in multi-pet households when introduced slowly and gently.',
  'Maltipoos can startle easily, so calm, predictable handling builds their confidence over time.',
  'Maltipoos are prone to overheating in direct sun due to their dense coats — shade and water help.',
  'Maltipoos often "talk" with soft whines or grumbles rather than frequent barking.',
]

const SET_SIZE = 3
const NUM_SETS = 10

function dayOfYear() {
  return Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
}

function todaysSet(facts: string[]) {
  const setIndex = dayOfYear() % NUM_SETS
  const start = (setIndex * SET_SIZE) % facts.length
  const picked: string[] = []
  for (let i = 0; i < SET_SIZE; i++) {
    picked.push(facts[(start + i) % facts.length])
  }
  return picked
}

export default function DogFacts() {
  const frenchieFacts = todaysSet(FRENCHIE_FACTS)
  const maltipooFacts = todaysSet(MALTIPOO_FACTS)

  return (
    <Card icon="🐚" title="Breed Facts" surface="mint">
      <div className="two-col">
        <div className="mini-profile">
          <div className="name">Frenchie Facts</div>
          <ul className="c-list">
            {frenchieFacts.map((f, i) => (
              <li key={i} className="c-list-item" style={{ alignItems: 'flex-start' }}>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mini-profile">
          <div className="name">Maltipoo Facts</div>
          <ul className="c-list">
            {maltipooFacts.map((f, i) => (
              <li key={i} className="c-list-item" style={{ alignItems: 'flex-start' }}>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}
