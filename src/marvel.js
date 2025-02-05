import React, { useState, useEffect } from "react";
import moviesData from "./movies.json"; // Import the JSON data

export default function MovieComparison() {
  const [filter, setFilter] = useState("all"); // "all", "movie", "tv"
  const [phase, setPhase] = useState("all"); // "all", "1", "2", "3", "4", "5"
  const [movies, setMovies] = useState([]);
  const [currentComparison, setCurrentComparison] = useState(null);
  const [sortingStack, setSortingStack] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [finalRankings, setFinalRankings] = useState([]);

  // Initialize sorting when filter/phase changes
  useEffect(() => {
    const filteredMovies = moviesData.movies.filter(item => {
      const typeMatch = filter === "all" || item.type === filter;
      const phaseMatch = phase === "all" || item.phase.toString() === phase;
      return typeMatch && phaseMatch;
    });

    // Shuffle movies for initial randomization
    const shuffledMovies = [...filteredMovies].sort(() => Math.random() - 0.5);
    setMovies(shuffledMovies);
    
    // Initialize sorting with full array
    if (shuffledMovies.length > 0) {
      setSortingStack([{ 
        array: shuffledMovies,
        pivot: shuffledMovies[0],
        compared: [],
        higher: [],
        lower: []
      }]);
    }
    setIsComplete(false);
    setFinalRankings([]);
  }, [filter, phase]);

  // Process sorting stack
  useEffect(() => {
    if (sortingStack.length === 0) {
      if (finalRankings.length > 0) {
        setIsComplete(true);
      }
      return;
    }

    const currentSort = sortingStack[sortingStack.length - 1];
    const remainingToCompare = currentSort.array.filter(item => 
      item !== currentSort.pivot && !currentSort.compared.includes(item)
    );

    if (remainingToCompare.length > 0) {
      // Randomly select an item from remaining comparisons
      const randomIndex = Math.floor(Math.random() * remainingToCompare.length);
      const randomComparison = remainingToCompare[randomIndex];
      
      // Randomly decide if pivot should be on left or right
      const shouldSwap = Math.random() > 0.5;
      setCurrentComparison({
        pivot: shouldSwap ? randomComparison : currentSort.pivot,
        comparing: shouldSwap ? currentSort.pivot : randomComparison
      });
    } else {
      // Partition complete, recursively sort sublists
      const newStack = sortingStack.slice(0, -1);
      const sortedLower = currentSort.lower.length > 1 ? [{
        array: currentSort.lower,
        pivot: currentSort.lower[Math.floor(Math.random() * currentSort.lower.length)], // Random pivot
        compared: [],
        higher: [],
        lower: []
      }] : [];
      const sortedHigher = currentSort.higher.length > 1 ? [{
        array: currentSort.higher,
        pivot: currentSort.higher[Math.floor(Math.random() * currentSort.higher.length)], // Random pivot
        compared: [],
        higher: [],
        lower: []
      }] : [];

      setFinalRankings(prev => {
        if (currentSort.lower.length <= 1 && currentSort.higher.length <= 1) {
          return [...prev, ...currentSort.lower, currentSort.pivot, ...currentSort.higher];
        }
        return prev;
      });

      setSortingStack([...newStack, ...sortedLower, ...sortedHigher]);
    }
  }, [sortingStack, finalRankings.length]);

  function handleVote(isHigher) {
    setSortingStack(prev => {
      const current = prev[prev.length - 1];
      const comparing = current.array.find(item => 
        item !== current.pivot && !current.compared.includes(item)
      );

      // Adjust the vote based on whether we swapped the presentation order
      const actualIsHigher = currentComparison.pivot === comparing ? !isHigher : isHigher;

      return [
        ...prev.slice(0, -1),
        {
          ...current,
          compared: [...current.compared, comparing],
          higher: actualIsHigher ? [...current.higher, comparing] : current.higher,
          lower: !actualIsHigher ? [...current.lower, comparing] : current.lower
        }
      ];
    });
  }

  if (!currentComparison && !isComplete) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ 
      textAlign: "center", 
      padding: "20px",
      backgroundColor: "#1a1a1a",
      color: "white",
      minHeight: "100vh"
    }}>
      <h1>Marvel Cinematic Universe Ranking</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)} 
          style={{ 
            marginRight: "10px",
            backgroundColor: "#333",
            color: "white",
            padding: "5px",
            border: "1px solid #444",
            borderRadius: "4px"
          }}
        >
          <option value="all">All Content</option>
          <option value="movie">Movies Only</option>
          <option value="tv">TV Shows Only</option>
        </select>

        <select 
          value={phase} 
          onChange={(e) => setPhase(e.target.value)}
          style={{ 
            backgroundColor: "#333",
            color: "white",
            padding: "5px",
            border: "1px solid #444",
            borderRadius: "4px"
          }}
        >
          <option value="all">All Phases</option>
          <option value="1">Phase 1</option>
          <option value="2">Phase 2</option>
          <option value="3">Phase 3</option>
          <option value="4">Phase 4</option>
          <option value="5">Phase 5</option>
        </select>
      </div>

      {!isComplete ? (
        <>
          <div style={{ marginBottom: "20px", color: "#fff" }}>
            Which do you prefer?
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "40px", margin: "20px 0" }}>
            {[currentComparison.pivot, currentComparison.comparing].map((item) => (
              <div 
                key={item.id}
                onClick={() => handleVote(item === currentComparison.comparing)}
                style={{ 
                  cursor: "pointer", 
                  maxWidth: "300px",
                  backgroundColor: "#333",
                  padding: "15px",
                  borderRadius: "15px",
                  transition: "transform 0.2s, box-shadow 0.2s"
                }}
              >
                <img 
                  src={item.poster}
                  alt={item.title}
                  style={{
                    width: "200px",
                    height: "300px",
                    borderRadius: "10px",
                    transition: "transform 0.2s",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.parentElement.style.boxShadow = "0 6px 12px rgba(0,0,0,0.4)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.parentElement.style.boxShadow = "none";
                  }}
                />
                <h3 style={{ color: "#fff", marginTop: "10px" }}>{item.title}</h3>
                <p style={{ color: "#ccc" }}>({item.year}) - Phase {item.phase}</p>
                <p style={{ color: "#ccc" }}>{item.type === "tv" ? "TV Series" : "Movie"}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <h2 style={{ color: "#fff" }}>Final Rankings</h2>
      )}

      <ul style={{ listStyle: "none", padding: 0, maxWidth: "500px", margin: "0 auto" }}>
        {finalRankings.map((item, index) => (
          <li 
            key={item.title}
            style={{
              padding: "8px",
              margin: "4px 0",
              backgroundColor: index === 0 ? "rgba(255, 215, 0, 0.2)" : 
                             index === 1 ? "rgba(192, 192, 192, 0.2)" : 
                             index === 2 ? "rgba(205, 127, 50, 0.2)" : 
                             "#333",
              borderRadius: "4px",
              color: "#fff"
            }}
          >
            {index + 1}. {item.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
