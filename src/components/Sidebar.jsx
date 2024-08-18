import { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "../styles/Sidebar.css";
import CreatePostModal from "./CreatePost/CreatePostModal";
import SettingsModal from "./SettingsModal";

const Sidebar = () => {
  const { currentUser } = useContext(AuthContext);
  const [createPostModal, setCreatePostModal] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  return (
    <div className="sidebar-container">
      <div className="sidebar-item-container">
        <NavLink to="/" className="sidebar-item">
          <i className="uil uil-estate"></i>
          <h3>Home</h3>
        </NavLink>
        <NavLink to="/search" className="sidebar-item sidebar-item-search">
          <i className="uil uil-search"></i>
          <h3>Search</h3>
        </NavLink>
        <NavLink to="/explore" className="sidebar-item">
          <i className="uil uil-compass"></i>
          <h3>Explore</h3>
        </NavLink>
        <NavLink to="/reels" className="sidebar-item sidebar-item-reels">
          <i className="uil uil-film"></i>
          <h3>Reels</h3>
        </NavLink>
        <NavLink to="/messages" className="sidebar-item">
          <i className="uil uil-envelope-alt">
            <small className="notification-count">6</small>
          </i>
          <h3>Messages</h3>
        </NavLink>
        <NavLink
          to="/notifications"
          className="sidebar-item sidebar-item-notifications"
        >
          <i className="uil uil-bell">
            <small className="notification-count">9+</small>
          </i>
          <h3>Notifications</h3>
        </NavLink>
        <NavLink
          to="/bookmarks"
          className="sidebar-item sidebar-item-bookmarks"
        >
          <i className="uil uil-bookmark"></i>
          <h3>Bookmarks</h3>
        </NavLink>
        <div
          className="sidebar-item sidebar-item-create-post"
          onClick={() => setCreatePostModal(true)}
        >
          <i className="uil uil-plus-circle"></i>
          <h3>Create Post</h3>
        </div>
        <div className="sidebar-item" onClick={() => setSettingsModal(true)}>
          <i className="uil uil-setting"></i>
          <h3>Settings</h3>
        </div>
        <NavLink to={`/${currentUser.userName}`} className="sidebar-item">
          {currentUser.profilePicture ? (
            <div className="user-profile-picture">
              <img src={currentUser.profilePicture} alt="user profile" />
            </div>
          ) : (
            <div className="user-profile-logo">
              <span>{currentUser.fullName[0]}</span>
            </div>
          )}
          <h3>Profile</h3>
        </NavLink>
      </div>
      <div
        className="create-post-button"
        onClick={() => setCreatePostModal(true)}
      >
        Create Post
      </div>
      {createPostModal && (
        <CreatePostModal
          modalShown={createPostModal}
          setModalShown={setCreatePostModal}
        />
      )}
      {settingsModal && (
        <SettingsModal
          modalShown={settingsModal}
          setModalShown={setSettingsModal}
        />
      )}
    </div>
  );
};

export default Sidebar;

// 1. Analytics
// 2. Theme
// 3. Settings
