import React, { useState, useEffect, useMemo } from "react";
import starterExercises from "../Data/starterExercises.json";
import UniqueExerciseForm from "./CustomExerciseForm";

const WorkoutList = ({ onSelectExercise, userFavorites = [] }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("all");
  const [viewTab, setViewTab] = useState("all");
  const [frequentlyUsedIds, setFrequentlyUsedIds] = useState(userFavorites);

  const [unique_exercises, set_unique_exercises] = useState(() => {
    try {
      const saved_exercises = JSON.parse(
        localStorage.getItem("osc-custom-exercises") || "[]"
      );

      if (!Array.isArray(saved_exercises)) return [];

      return saved_exercises.filter(
        (exer) =>
          exer &&
          typeof exer.id === "string" &&
          typeof exer.name === "string"
      );
    } catch {
      return [];
    }
  });

  const all_exercises = useMemo(
    () => [...exercises, ...unique_exercises],
    [exercises, unique_exercises]
  );

  function create_exer(unique_exercise) {
    const duplicate = all_exercises.some(
      (exer) =>
        exer.name.trim().toLowerCase() ===
        unique_exercise.name.trim().toLowerCase()
    );

    if (duplicate) {
      throw new Error("An exercise with this name already exists.");
    }

    const updated_exercises = [...unique_exercises, unique_exercise];

    localStorage.setItem(
      "osc-custom-exercises",
      JSON.stringify(updated_exercises)
    );

    set_unique_exercises(updated_exercises);
  }

  useEffect(() => {
    const controller = new AbortController();

    const fetchExercises = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          "https://exercisedb.p.rapidapi.com/exercises?limit=100",
          {
            method: "GET",
            headers: {
              "X-RapidAPI-Key": process.env.REACT_APP_RAPIDAPI_KEY || "",
              "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("The exercise library returned no exercises.");
        }

        setExercises(data);
        setError(null);
      } catch (err) {
        if (controller.signal.aborted) return;

        setExercises(starterExercises);
        setError(
          `The online exercise library is unavailable (${err.message}). Showing starter exercises.`
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchExercises();

    return () => controller.abort();
  }, []);

  const muscleGroups = useMemo(() => {
    const groups = new Set(
      all_exercises.map((exer) => exer.bodyPart).filter(Boolean)
    );

    return ["all", ...Array.from(groups)];
  }, [all_exercises]);

  const filteredExercises = useMemo(() => {
    return all_exercises.filter((exercise) => {
      if (
        viewTab === "frequently_used" &&
        !frequentlyUsedIds.includes(exercise.id)
      ) {
        return false;
      }

      const matchesMuscle =
        selectedMuscle === "all" ||
        exercise.bodyPart?.toLowerCase() === selectedMuscle.toLowerCase();

      const matchesSearch = exercise.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesMuscle && matchesSearch;
    });
  }, [
    all_exercises,
    viewTab,
    selectedMuscle,
    searchTerm,
    frequentlyUsedIds,
  ]);

  const handleSelect = (exercise) => {
    setFrequentlyUsedIds((previousIds) =>
      previousIds.includes(exercise.id)
        ? previousIds
        : [...previousIds, exercise.id]
    );

    if (onSelectExercise) {
      onSelectExercise(exercise);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">Loading exercise library...</div>
    );
  }

  return (
    <div className="workout-list-container">
      <h2>Workout Exercises</h2>

      {error && <p role="status">{error}</p>}

      <UniqueExerciseForm exer={exercises} create_exer={create_exer} />

      <div className="tab-navigation">
        <button
          type="button"
          className={viewTab === "all" ? "active" : ""}
          onClick={() => setViewTab("all")}
        >
          All Exercises
        </button>

        <button
          type="button"
          className={viewTab === "frequently_used" ? "active" : ""}
          onClick={() => setViewTab("frequently_used")}
        >
          Frequently Used ({frequentlyUsedIds.length})
        </button>
      </div>

      <div className="filter-controls">
        <input
          type="search"
          aria-label="Search exercises"
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <select
          aria-label="Filter by body part"
          value={selectedMuscle}
          onChange={(event) => setSelectedMuscle(event.target.value)}
        >
          <option value="all">All Body Parts</option>

          {muscleGroups
            .filter((muscle) => muscle !== "all")
            .map((muscle) => (
              <option key={muscle} value={muscle}>
                {muscle}
              </option>
            ))}
        </select>
      </div>

      <div className="exercise-grid">
        {filteredExercises.length === 0 ? (
          <p>No exercises match your filters.</p>
        ) : (
          filteredExercises.map((exercise) => (
            <div key={exercise.id} className="exercise-card">
              {exercise.gifUrl && (
                <img
                  src={exercise.gifUrl}
                  alt={exercise.name}
                  loading="lazy"
                />
              )}

              <h3>{exercise.name}</h3>

              <div className="exercise-meta">
                {exercise.isCustom && <p>Custom exercise</p>}

                <p>Body part: {exercise.bodyPart}</p>
                <p>Main muscle: {exercise.target}</p>
                <p>Equipment: {exercise.equipment || "Not specified"}</p>

                {exercise.secondaryMuscles?.length > 0 && (
                  <p>
                    Secondary muscles: {exercise.secondaryMuscles.join(", ")}
                  </p>
                )}

                {exercise.trackingType && (
                  <p>Tracking type: {exercise.trackingType}</p>
                )}

                {exercise.relatedExerciseName && (
                  <p>Related exercise: {exercise.relatedExerciseName}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleSelect(exercise)}
              >
                Add to Routine
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkoutList;