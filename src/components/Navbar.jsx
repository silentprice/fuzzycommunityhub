import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between">
        <h1 className="text-white text-2xl">XRP Fuzzy</h1>
        <div className="space-x-4">
          <NavLink to="/" className="text-white hover:text-gray-300">Home</NavLink>
          <NavLink to="/about" className="text-white hover:text-gray-300">About</NavLink>
          <NavLink to="/community" className="text-white hover:text-gray-300">Community</NavLink>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;