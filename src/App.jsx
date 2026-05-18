import { useState } from 'react'
import Sidebar from './components/Sidebar'
import DashboardPage from './pages/DashboardPage'
import UsersPage from './pages/UsersPage'
import RoutePage from './pages/RoutePage'
import MissionPage from './pages/MissionPage'
import VerificationPage from './pages/VerificationPage'
import RewardsPage from './pages/RewardsPage'
import './App.css'
import HomePage from './pages/HomePage'

function App() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [loggedIn, setLoggedIn] = useState(false)

  if (!loggedIn) {
    return <HomePage onLogin={() => { setLoggedIn(true); setActiveSection('dashboard') }} />
  }

  return (
    <div className="app-shell">
      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} onLogout={() => setLoggedIn(false)} />
      <main className="main-panel">
        {activeSection === 'users' ? <UsersPage /> : activeSection === 'routes' ? <RoutePage /> : activeSection === 'missions' ? <MissionPage /> : activeSection === 'verification' ? <VerificationPage /> : activeSection === 'rewards' ? <RewardsPage /> : <DashboardPage />}
      </main>
    </div>
  )
}

export default App
