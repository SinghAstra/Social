import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import FollowersFollowingHashTagModal from "../components/FollowersFollowingHashTag/FollowersFollowingHashTagModal";
import AuthContext from "../context/AuthContext";
import ProfilePageSkeleton from "../skeleton/ProfilePageSkeleton";
import "../styles/ProfilePage.css";
import PageNotFound from "./PageNotFound";

const ProfilePage = () => {
  const { username } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [showFFHModal, setShowFFHModal] = useState(false);
  const [initialTab, setInitialTab] = useState("followers");
  const [isFollowing, setIsFollowing] = useState(false);
  const isCurrentUser = currentUser?.userName === username;
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/users/${username}`, {
          withCredentials: true,
        });
        console.log("response.data --fetchUserProfile is ", response.data);
        setUser(response.data);
        setIsFollowing(response.data.followers.includes(currentUser._id));
        setError(null);
      } catch (err) {
        console.log("err --fetchUserProfile is ", err);
        setError("User not found");
        setUser(null);
      }
    };

    fetchUserProfile();
  }, [apiUrl, currentUser._id, username]);

  useEffect(() => {
    if (user) {
      const prevTitle = document.title;
      document.title = `${user.fullName} (@${user.userName}) • Social UI`;
      return () => (document.title = prevTitle);
    }
  }, [user]);

  if (error) {
    return <PageNotFound />;
  }

  if (!user) {
    return <ProfilePageSkeleton />;
  }

  const openModal = (tab) => {
    setInitialTab(tab);
    setShowFFHModal(true);
  };

  const handleToggleFollow = async () => {
    try {
      setIsFollowing((prev) => !prev);
      await axios.get(`${apiUrl}/api/users/${username}/toggle-follow`, {
        withCredentials: true,
      });
    } catch (error) {
      console.log("error --handleToggleFollow", error);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        {user.profilePicture ? (
          <div className="profile-picture">
            <img
              src={user.profilePicture}
              alt="Profile"
              className="profile-picture-img"
            />
          </div>
        ) : (
          <div className="profile-picture-logo">
            <span>{user.fullName[0]}</span>
          </div>
        )}
        <div className="profile-info">
          <div className="profile-username">
            <h1>{user.userName}</h1>
            {isCurrentUser ? (
              <button className="edit-profile-button">Edit Profile</button>
            ) : isFollowing ? (
              <button className="following-button" onClick={handleToggleFollow}>
                Following
              </button>
            ) : (
              <button className="follow-button" onClick={handleToggleFollow}>
                Follow
              </button>
            )}
          </div>
          <div className="profile-stats">
            <span className="posts-count">
              <strong>{user.postCount}</strong> posts
            </span>
            <span
              className="followers-count"
              onClick={() => {
                openModal("followers");
              }}
            >
              <strong>{user.followers.length}</strong> followers
            </span>
            <span
              className="following-count"
              onClick={() => {
                openModal("following");
              }}
            >
              <strong>{user.following.length}</strong> following
            </span>
          </div>
          <div className="profile-bio">
            <strong>{user.fullName}</strong>
            {user.bio && <p>{user.bio}</p>}
            {user.website && (
              <a href={user.website} className="profile-website">
                {user.website}
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="profile-navigation">
        <NavLink to={`/${user.userName}`} className="nav-link" end>
          <i className="uil uil-table"></i>
          <h3>Posts</h3>
        </NavLink>
        <NavLink to={`/${user.userName}/feed`} className="nav-link">
          <i className="uil uil-newspaper"></i>
          <h3>Feed</h3>
        </NavLink>
        <NavLink to={`/${user.userName}/saved`} className="nav-link">
          <i className="uil uil-bookmark"></i>
          <h3>Saved</h3>
        </NavLink>
        <NavLink to={`/${user.userName}/tagged`} className="nav-link">
          <i className="uil uil-tag"></i>
          <h3>Tagged</h3>
        </NavLink>
      </div>
      <div className="profile-content">
        <Outlet />
      </div>
      {showFFHModal && (
        <FollowersFollowingHashTagModal
          username={username}
          initialTab={initialTab}
          setShowFFHModal={setShowFFHModal}
        />
      )}
    </div>
  );
};

export default ProfilePage;
