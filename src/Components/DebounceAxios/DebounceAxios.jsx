/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import axios from 'axios';
import 'daisyui';

// Separate Search Input Component
const SearchInput = ({ value, onChange }) => (
  <input 
    type="text"
    placeholder="Search for products..." 
    className="input input-bordered w-full mb-4"
    value={value}
    onChange={onChange}
  />
);

// Separate Suggestions List Component
const SuggestionsList = ({ suggestions }) => (
  <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full">
    {suggestions.map((product) => (
      <li key={product.id} className="py-2 px-4 border-b">
        {product.title}
      </li>
    ))}
  </ul>
);

const App = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  let cancelTokenSource = axios.CancelToken.source();

  const debounceTimeout = 500;

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    
    const timerId = setTimeout(() => {
      fetchSuggestions(query);
    }, debounceTimeout);

    return () => {
      clearTimeout(timerId);
      cancelTokenSource.cancel("Operation canceled due to new input.");
      cancelTokenSource = axios.CancelToken.source();
    };
  }, [query]);

  const fetchSuggestions = async (searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `https://everyhuman.com.au/products.json?limit=5&page=1&q=${searchTerm}`,
        { cancelToken: cancelTokenSource.token }
      );
      setSuggestions(response.data.products);
    } catch (error) {
      if (!axios.isCancel(error)) {
        setError("Failed to fetch products.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Product Search Using Axios</h1>
      
      <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} />

      {/* Suggestion List */}
      {!loading && suggestions.length > 0 && <SuggestionsList suggestions={suggestions} />}
      
      {/* Loading Spinner */}
      {loading && <div className="text-center"><span className="loading loading-spinner loading-lg"></span></div>}

      {/* Error Message */}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default App;
