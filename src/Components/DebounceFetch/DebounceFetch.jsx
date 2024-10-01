/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
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

  // Declare AbortController for canceling the previous request
  let abortController = new AbortController();

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
      abortController.abort(); // Cancel the previous fetch request
      abortController = new AbortController(); // Create a new abort controller for the next request
    };
  }, [query]);

  const fetchSuggestions = async (searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      
      // Make a fetch request with the AbortController signal
      const response = await fetch(
        `https://everyhuman.com.au/products.json?limit=5&page=1&q=${searchTerm}`,
        { signal: abortController.signal }
      );

      // Check if the response is ok (status in the range 200–299)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSuggestions(data.products);

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        setError('Failed to fetch products.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Product Search Using Fetch</h1>
      
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
