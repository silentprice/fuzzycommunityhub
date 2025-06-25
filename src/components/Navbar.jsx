import { NavLink } from 'react-router-dom';
import fuzzy from '../assets/fuzzy5.png';
import fuzzy1 from '../assets/fuzzy1.png';
import fuzzy2 from '../assets/fuzzy2.png';
import fuzzy3 from '../assets/fuzzy4.png';

function Navbar() {
  return (
    <nav>
      <div className="container">
        <img src={fuzzy1} className="fuzzy-image" alt="Fuzzy" />
        <img src={fuzzy2} className="fuzzy-image" alt="Fuzzy" />
        <h1>XRP Fuzzy</h1>
        <img src={fuzzy3} className="fuzzy-image" alt="Fuzzy" />
        <img src={fuzzy} className="fuzzy-image" alt="Fuzzy" />
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
            Home
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>
            About
          </NavLink>
          <NavLink to="/community" className={({ isActive }) => (isActive ? 'active' : '')}>
            Community
          </NavLink>
          <NavLink to="/nft-marketplace" className={({ isActive }) => (isActive ? 'active' : '')}>
            NFT Marketplace
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
            Profile
          </NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => (isActive ? 'active' : '')}>
            Leaderboard
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;