"use client";
import { Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";

function SearchInput({ query, setQuery }) {
  const [isFocused, setIsFocused] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isFocused) {
      // Smoothly expand to full width
      gsap.to(containerRef.current, {
        width: "100%",
        duration: 0.5,
        ease: "power3.out",
      });
    } else {
      // Contract to half size when not in use
      gsap.to(containerRef.current, {
        width: "50%",
        duration: 0.5,
        ease: "power3.inOut",
      });
    }
  }, [isFocused]);

  return (
    <div className="flex justify-start w-full">
      <div
        ref={containerRef}
        className="relative h-10 group"
        style={{ width: "50%" }} // Starting state
      >
        {/* 1. THE ICON */}
        {!isFocused && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search
              className={`size-4 transition-colors z-10 ${
                isFocused ? "text-yellow-500" : "text-zinc-500"
              }`}
            />
          </div>
        )}

        {/* 2. THE INPUT */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => !query && setIsFocused(false)}
          placeholder={`${isFocused ? "Search peeps..." : ""}`}
          className="w-full h-full bg-yellow-50 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-zinc-800 placeholder:text-zinc-500 outline-none transition-all shadow-lg px-2 py-1"
        />

        {/* 3. THE X BUTTON */}
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchInput;
