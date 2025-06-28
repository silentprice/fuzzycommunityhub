import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Community from './pages/Community';
import Profile from './pages/Profile';
import UserProfile from './components/UserProfile';
import NFTMarketplace from './pages/NFTMarketplace';
import Leaderboard from './pages/Leaderboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  const [account, setAccount] = useState(null);

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<Home account={account} setAccount={setAccount} />} />
            <Route path="/about" element={<About />} />
            <Route path="/community" element={<Community />} />
            <Route path="/profile" element={<Profile account={account} />} />
            <Route path="/profile/:wallet" element={<Profile account={account} />} />
            <Route path="/nft-marketplace" element={<NFTMarketplace />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
