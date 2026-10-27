/* Temporal Replacement */
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
        <h2>You are logged in!</h2>
        <UserButton />
      </Show>
    </div>
  )
}

export default App
