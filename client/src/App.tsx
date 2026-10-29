/* Temporal Replacement */
import UserApiTest from "./UserApiTest";
import SavedFoodApiTest from "./SavedFoodApiTest";
import GoalApiTest from "./GoalApiTest";
import MealApiTest from "./MealApiTest";
import DailyRecordApiTest from "./DailyRecordApiTest";

import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/react'

function App() {
  return (
    <div>
      <h1>Welcome to CalTrack!</h1>
      <p>Track your meals, calories, and nutrition goals.</p>

      <Show when="signed-out">
        <SignInButton />
        <SignUpButton />
      </Show>

      <Show when="signed-in">
        <UserButton />
        <MealApiTest />
        <GoalApiTest />
        <SavedFoodApiTest />
        <UserApiTest />
        <DailyRecordApiTest />
      </Show>
    </div>
  )
}

export default App
