import React, { Fragment, useState, useEffect, useReducer } from 'react';
import axios from 'axios'
import './App.css';

// A reducer hook returns a state object & a function (dispatch) to alter the state object
// dispatch takes an action which has a type and option payload
// all this is used in the actual reducer function to distill a new state from prev state, action's option payload and type
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    default:
      throw new Error();
  }
};

const useDataAPI = (initialUrl, initialData) => {
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  })

  useEffect(() => {
    let didCancel = false;

    const fetchData = async () => {
      dispatch({ type: 'FETCH_INIT' });

      try {
        const result = await axios(
          // Couples both states to only fetch articles that are specified by the query in the input field
          url,
        );

        if (!didCancel) {
          dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
        }

      } catch (error) {
        if (!didCancel) {
          dispatch({ type: 'FETCH_FAILURE' })
        }
      }
    };
    // Second argument can be used to define all the variables (allocated in this array) on which the hook depends
    // If one of the variables changes, the hook runs again
    // If the array with the variables is empty, it doesnt run when updating the component, because it doesn't have to watch any variables
    fetchData();
    return () => {
      didCancel = true;
    }
  }, [url]);

  return [state, setUrl];
};

function UserCard({ data }) {
  return (
    <div className="card">
      <div className="userinfo">
        <p className="username">{data.login}</p>
        <p>ID: {data.id}</p>
        <p>{data.location}</p>
        <p><img className="avatar" src={data.avatar_url} alt="user avator icon"></img></p>
      </div>
      <div className="userstats">
        <p><a href={data.html_url}>{data.html_url}</a></p>
        <p><a href={data.repos_url}>{data.repos_url}</a></p>
        <p>Followers: {data.followers}</p>
        <p>Following: {data.following}</p>
      </div>

    </div>
  );
}

function App() {
  const [query, setQuery] = useState('Search User');
  const [{ isLoading, isError, data }, doFetch] = useDataAPI(
    'https://api.github.com/users/pjr94',
    { hits: [] },
  );
 // Fragment is a way of grouping elements to return without adding a new node to DOM (like <div> does)
   
  return (
    <div>
      <form
        className="form"
        onSubmit={event => {
         doFetch(`https://api.github.com/users/${query}`);
          event.preventDefault();
        }}>
        <input
          type="text"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />

        <button type="submit">
          Search
        </button>
      </form>

      {isError && <div className="error">Something went wrong...</div>}

      {isLoading ? (
        <div>Loading...</div>
      ) : (
          <UserCard data={data} />
        )}
    </div>

  );
}

export default App;
