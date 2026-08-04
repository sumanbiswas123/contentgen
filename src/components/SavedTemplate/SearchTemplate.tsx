import React, { useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { IoCloseCircle } from "react-icons/io5";
import axios from "axios";

interface TemplateSearchProps {
  onContentChange: (data: any, query: string, status?: boolean) => void;
  currentPage: number;
  pageSize: number;
  searchValue: string;
  onChange: (val: string) => void;
  onClear: () => void;
}

const TemplateSearch: React.FC<TemplateSearchProps> = React.memo(({ onContentChange, pageSize, searchValue, onChange, onClear }) => {
  const [resultsCount, setResultsCount] = useState<number | null>(null);
  const [isSearching, setSearching] = useState(false);
  const [lastSearchedQuery, setLastSearchedQuery] = useState("");

  const triggerSearch = (query: string = searchValue) => {
    setSearching(true);
    axios
      .get(
        `${process.env.REACT_APP_SERVER_URL || 'http://10.215.56.196:9000'}/templates?page=1&pageSize=${pageSize}&search=${encodeURIComponent(query)}`
      )
      .then((res) => {
        onContentChange(res.data, query);
        setResultsCount(res.data.totalItems);
        setSearching(false);
        setLastSearchedQuery(query);
      })
      .catch((err) => {
        console.error("Search failed:", err.message);
        onContentChange(err, query, false);
        setResultsCount(0);
        setSearching(false);
        setLastSearchedQuery(query);
      });
  };

  const handleClear = () => {
    onChange("");
    setResultsCount(null);
    setLastSearchedQuery("");
    onClear();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (val === "") {
      handleClear();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerSearch();
    }
  };

  return (
    <div className="template-search-inplace-wrapper">
      <div className="template-search-input-box">
        <IoIosSearch className="template-search-icon" />
        <input
          type="text"
          className="template-search-input"
          placeholder="Search PM ID, country..."
          value={searchValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        {searchValue && (
          <button
            type="button"
            className="template-search-clear-btn"
            onClick={handleClear}
            title="Clear search"
          >
            <IoCloseCircle />
          </button>
        )}
        <button
          type="button"
          className="template-search-btn"
          onClick={() => triggerSearch()}
          disabled={isSearching}
        >
          {isSearching ? "..." : "Search"}
        </button>
      </div>
      {isSearching ? (
        <div className="template-search-status">Searching...</div>
      ) : lastSearchedQuery && resultsCount !== null ? (
        <div className="template-search-status">
          {resultsCount > 0 ? `${resultsCount} found` : "No templates found"}
        </div>
      ) : null}
    </div>
  );
});

export default TemplateSearch;



