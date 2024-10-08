import PropTypes from "prop-types";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const EmptyFollowers = ({ username }) => {
  const { currentUser } = useContext(AuthContext);
  const isCurrentUser = currentUser.userName === username;

  return (
    <div className="empty-followers">
      <div className="icon">
        <img src="/group.png" alt="followers" />
      </div>
      {isCurrentUser ? (
        <p>You&#039;ll see your followers here.</p>
      ) : (
        <p>This account has no followers.</p>
      )}
    </div>
  );
};

EmptyFollowers.propTypes = {
  username: PropTypes.string.isRequired,
};

export default EmptyFollowers;
