import React, { useState, useEffect } from "react";
import moviesData from "./movies.json"; // Import the JSON data

export default function MovieComparison() {
  const [filter, setFilter] = useState("all"); // "all", "movie", "tv"
  const [phase, setPhase] = useState("all"); // "all", "1", "2", "3", "4", "5"
  const [movies, setMovies] = useState([]);
  const [currentPair, setCurrentPair] = useState(null);
  const [lists, setLists] = useState([]); // Array of sorted sublists
  const [isComplete, setIsComplete] = useState(false);
  const [finalRankings, setFinalRankings] = useState([]);
  const [totalComparisons, setTotalComparisons] = useState(0);
  const [completedComparisons, setCompletedComparisons] = useState(0);

  // Initialize when filter/phase changes
  useEffect(() => {
    const filteredMovies = moviesData.movies.filter(item => {
      const typeMatch = filter === "all" || item.type === filter;
      const phaseMatch = phase === "all" || item.phase.toString() === phase;
      return typeMatch && phaseMatch;
    });

    // Create initial lists of size 1
    const initialLists = filteredMovies
      .sort(() => Math.random() - 0.5) // Shuffle initially
      .map(movie => [movie]);
    
    setLists(initialLists);
    setMovies(filteredMovies);
    setIsComplete(false);
    setFinalRankings([]);
    setTotalComparisons(Math.ceil(filteredMovies.length * Math.log2(filteredMovies.length)));
    setCompletedComparisons(0);
  }, [filter, phase]);

  // Process lists
  useEffect(() => {
    if (lists.length === 0) return;
    
    if (lists.length === 1) {
      setFinalRankings(lists[0]);
      setIsComplete(true);
      return;
    }

    // If we have an odd number of lists, keep the last one for next round
    const evenLists = lists.length % 2 === 0 ? lists : lists.slice(0, -1);
    const remainingList = lists.length % 2 === 0 ? [] : [lists[lists.length - 1]];

    // Find two lists to merge
    const list1 = evenLists[0];
    const list2 = evenLists[1];

    if (!currentPair && list1 && list2) {
      // Start comparing from the tops of both lists
      setCurrentPair({
        item1: list1[0],
        item2: list2[0],
        list1: list1,
        list2: list2,
        merged: [],
        remainingLists: evenLists.slice(2).concat(remainingList)
      });
    }
  }, [lists, currentPair]);

  function handleVote(preferFirst) {
    if (!currentPair) return;

    setCompletedComparisons(prev => prev + 1);

    const { item1, item2, list1, list2, merged, remainingLists } = currentPair;
    const newMerged = [...merged, preferFirst ? item1 : item2];
    const newList1 = preferFirst ? list1.slice(1) : list1;
    const newList2 = preferFirst ? list2 : list2.slice(1);

    if (newList1.length === 0) {
      // List1 is empty, add remaining items from list2
      const completedMerge = [...newMerged, ...newList2];
      if (remainingLists.length === 0) {
        setLists([completedMerge]);
      } else {
        setLists([completedMerge, ...remainingLists]);
      }
      setCurrentPair(null);
    } else if (newList2.length === 0) {
      // List2 is empty, add remaining items from list1
      const completedMerge = [...newMerged, ...newList1];
      if (remainingLists.length === 0) {
        setLists([completedMerge]);
      } else {
        setLists([completedMerge, ...remainingLists]);
      }
      setCurrentPair(null);
    } else {
      // Continue merging
      setCurrentPair({
        item1: newList1[0],
        item2: newList2[0],
        list1: newList1,
        list2: newList2,
        merged: newMerged,
        remainingLists
      });
    }
  }

  if (!currentPair && !isComplete) {
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

          {/* Progress Bar */}
          <div style={{ 
            maxWidth: "500px", 
            margin: "0 auto 20px auto",
            padding: "10px"
          }}>
            <div style={{ 
              marginBottom: "10px",
              color: "#ccc",
              fontSize: "14px"
            }}>
              Remaining Comparisons: {totalComparisons - completedComparisons}
            </div>
            <div style={{
              width: "100%",
              height: "10px",
              backgroundColor: "#333",
              borderRadius: "5px",
              overflow: "hidden"
            }}>
              <div style={{
                width: `${(completedComparisons / totalComparisons) * 100}%`,
                height: "100%",
                backgroundColor: "#e62429",
                transition: "width 0.3s ease-in-out"
              }} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "40px", margin: "20px 0" }}>
            {[currentPair.item1, currentPair.item2].map((item) => (
              <div 
                key={item.id}
                onClick={() => handleVote(item === currentPair.item1)}
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
        <>
          <h2 style={{ color: "#fff", marginBottom: "30px" }}>Final Rankings</h2>
          <ul style={{ listStyle: "none", padding: 0, maxWidth: "500px", margin: "0 auto" }}>
            {finalRankings.map((item, index) => (
              <li 
                key={item.title}
                style={{
                  padding: "12px",
                  margin: "8px 0",
                  backgroundColor: index === 0 ? "rgba(255, 215, 0, 0.2)" : 
                                 index === 1 ? "rgba(192, 192, 192, 0.2)" : 
                                 index === 2 ? "rgba(205, 127, 50, 0.2)" : 
                                 "#333",
                  borderRadius: "4px",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px"
                }}
              >
                <img 
                  src={item.poster}
                  alt={item.title}
                  style={{
                    width: "40px",
                    height: "60px",
                    borderRadius: "4px"
                  }}
                />
                <div style={{ textAlign: "left", flex: 1 }}>
                  <div>{index + 1}. {item.title}</div>
                  <div style={{ fontSize: "0.8em", color: "#ccc" }}>
                    {item.year} - Phase {item.phase} - {item.type === "tv" ? "TV Series" : "Movie"}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
