import XRPDisplay from '../components/XRPDisplay';

function Home() {
  return (
    <div className="container mx-auto p-4">
      <div className="bg-blue-500 text-white p-8 rounded-lg text-center">
        <h1 className="text-5xl font-bold mb-4">XRP Fuzzy Community</h1>
        <p className="text-xl">Join the ultimate hub for XRP enthusiasts!</p>
        <button className="mt-4 bg-white text-blue-500 px-6 py-2 rounded-full hover:bg-gray-200">
          Get Started
        </button>
      </div>
      <XRPDisplay />
    </div>
  );
}
export default Home;