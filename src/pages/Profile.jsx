import UserProfile from '../components/UserProfile';

function Profile({ account }) {
  return (
    <div className="container">
      <UserProfile account={account} />
    </div>
  );
}
export default Profile;