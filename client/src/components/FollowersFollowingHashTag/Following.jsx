import axios from "axios";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import EmptyFollowing from "../../placeholders/FollowersFollowingHashtag/EmptyFollowing";
import UserItemSkeleton from "../../Skeleton/UserItemSkeleton";
import UserItem from "./UserItem";

let timer;
const Following = ({ username, setShowFFHModal }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [loadingFollowing, setLoadingFollowing] = useState(true);
  const [following, setFollowing] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const observerRef = useRef(null);

  const fetchFollowing = async (page, query) => {
    try {
      setLoadingFollowing(true);

      const response = await axios.get(
        `${apiUrl}/api/users/${username}/following`,
        { params: { page, search: query }, withCredentials: true }
      );

      if (page === 1) {
        setFollowing(response.data.following);
      } else {
        setFollowing((prevFollowing) => [
          ...prevFollowing,
          ...response.data.following,
        ]);
      }

      if (page >= response.data.totalPages) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      console.log("response.data --fetchFollowing is ", response.data);
    } catch (error) {
      setFollowing([]);
      console.log("error.message --fetchFollowing is ", error.message);
    } finally {
      setLoadingFollowing(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingFollowing) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 1 }
    );

    const currentObserver = observerRef.current;
    if (currentObserver) {
      observer.observe(currentObserver);
    }

    return () => {
      if (currentObserver) {
        observer.unobserve(currentObserver);
      }
    };
  }, [hasMore, loadingFollowing]);

  useEffect(() => {
    fetchFollowing(page, query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query]);

  useEffect(() => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 1000);
  }, [search]);

  const noFollowing = !loadingFollowing && !query && following.length === 0;
  const noResultsAfterSearch =
    !loadingFollowing && query && following.length === 0;

  if (noFollowing) {
    return <EmptyFollowing username={username} />;
  }

  return (
    <div className="following-container">
      <div className="search-followers-container">
        <input
          type="text"
          className="search-followers"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="clear-search" onClick={() => setSearch("")}>
            &times;
          </button>
        )}
      </div>
      {following.map((user) => (
        <UserItem
          key={user._id}
          user={user}
          setShowFFHModal={setShowFFHModal}
        />
      ))}
      {loadingFollowing && (
        <>
          <UserItemSkeleton />
          <UserItemSkeleton />
          <UserItemSkeleton />
          <UserItemSkeleton />
          <UserItemSkeleton />
          <UserItemSkeleton />
          <UserItemSkeleton />
        </>
      )}
      {noResultsAfterSearch && (
        <div className="no-results">No results found.</div>
      )}
      <div ref={observerRef} className="loading-more-following">
        {loadingFollowing && page !== 1 && (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
};

Following.propTypes = {
  username: PropTypes.string.isRequired,
  setShowFFHModal: PropTypes.func.isRequired,
};

export default Following;
