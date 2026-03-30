import './App.css'
import LandingPage from './LandingPage.jsx'
import Header from './Header.jsx'
import Footer from './Footer.jsx'

function App() {
  return (
    <>
      <div className="app-shell">
        <Header />
        <main className="app-main">
          <LandingPage />
        </main>
        <Footer />
      </div>
    </>
  )
}

export default App
