import { useState } from 'react'
import './App.css'
import AuthHero from './components/AuthHero'
import LoginCard from './components/LoginCard'
import DirecteurDashboard from './components/DirecteurDashboard'

function App() {
  const [user, setUser] = useState(null)

  if (user) {
    return <DirecteurDashboard user={user} onLogout={() => setUser(null)} />
  }

  return (
    <main className="auth-page">
      <AuthHero />
      <LoginCard onLoginSuccess={setUser} />
    </main>
  );
}

export default App;
