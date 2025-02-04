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
      setCurrentComparison({
        pivot: currentSort.pivot,
        comparing: remainingToCompare[0]
      });
    } else {
      // Partition complete, recursively sort sublists
      const newStack = sortingStack.slice(0, -1);
      const sortedLower = currentSort.lower.length > 1 ? [{
        array: currentSort.lower,
        pivot: currentSort.lower[0],
        compared: [],
        higher: [],
        lower: []
      }] : [];
      const sortedHigher = currentSort.higher.length > 1 ? [{
        array: currentSort.higher,
        pivot: currentSort.higher[0],
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

      return [
        ...prev.slice(0, -1),
        {
          ...current,
          compared: [...current.compared, comparing],
          higher: isHigher ? [...current.higher, comparing] : current.higher,
          lower: !isHigher ? [...current.lower, comparing] : current.lower
        }
      ];
    });
  }

  if (!currentComparison && !isComplete) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Marvel Cinematic Universe Ranking</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ marginRight: "10px" }}>
          <option value="all">All Content</option>
          <option value="movie">Movies Only</option>
          <option value="tv">TV Shows Only</option>
        </select>

        <select value={phase} onChange={(e) => setPhase(e.target.value)}>
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
          <div style={{ marginBottom: "20px" }}>
            Which do you prefer?
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "40px", margin: "20px 0" }}>
            {[currentComparison.pivot, currentComparison.comparing].map((item) => (
              <div 
                key={item.id}
                onClick={() => handleVote(item === currentComparison.comparing)}
                style={{ cursor: "pointer", maxWidth: "300px" }}
              >
                <img 
                  src={item.poster}
                  alt={item.title}
                  style={{
                    width: "200px",
                    height: "300px",
                    borderRadius: "10px",
                    transition: "transform 0.2s",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                />
                <h3>{item.title}</h3>
                <p>({item.year}) - Phase {item.phase}</p>
                <p>{item.type === "tv" ? "TV Series" : "Movie"}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <h2>Final Rankings</h2>
      )}

      <ul style={{ listStyle: "none", padding: 0, maxWidth: "500px", margin: "0 auto" }}>
        {finalRankings.map((item, index) => (
          <li 
            key={item.title}
            style={{
              padding: "8px",
              margin: "4px 0",
              backgroundColor: index === 0 ? "#ffd700" : 
                             index === 1 ? "#c0c0c0" : 
                             index === 2 ? "#cd7f32" : 
                             "transparent",
              borderRadius: "4px"
            }}
          >
            {index + 1}. {item.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
