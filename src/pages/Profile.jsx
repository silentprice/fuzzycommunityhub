// src/pages/Profile.jsx
import { Component } from 'react';
import UserProfile from '../components/UserProfile';

class ProfileErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="container">
          <div className="hero">
            <p className="error" style={{ color: 'red' }}>
              Error: {this.state.error.message}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Profile({ account }) {
  console.log('Profile page rendered, account prop:', account);
  return (
    <ProfileErrorBoundary>
      <div className="container">
        <div className="hero">
          <h1>Profile</h1>
          {!account ? (
            <p>Please sign in to view your profile.</p>
          ) : (
            <UserProfile account={account} />
          )}
        </div>
      </div>
    </ProfileErrorBoundary>
  );
}

export default Profile;