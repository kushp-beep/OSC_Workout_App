import { useState } from "react";
import Timer from "./Timer";
import WorkoutList from "./WorkoutList";

function Session() {
  const [routine, set_routine] = useState([]);

  function add_exercise(exer) {
    set_routine((previous_routine) => {
      if (previous_routine.some((item) => item.id === exer.id)) {
        return previous_routine;
      }

      return [...previous_routine, exer];
    });
  }

  function remove_exercise(id) {
    set_routine((previous_routine) =>
      previous_routine.filter((exer) => exer.id !== id)
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Workout Session</h1>

      <Timer />

      <section aria-labelledby="routine-heading">
        <h2 id="routine-heading">Your Routine</h2>

        {routine.length === 0 ? (
          <p>Add an exercise from the library below.</p>
        ) : (
          routine.map((exer) => (
            <div key={exer.id}>
              <h3>{exer.name}</h3>
              <p>Main muscle: {exer.target}</p>

              {exer.trackingType && (
                <p>Tracking type: {exer.trackingType}</p>
              )}

              <button
                type="button"
                onClick={() => remove_exercise(exer.id)}
              >
                Remove from Routine
              </button>
            </div>
          ))
        )}
      </section>

      <WorkoutList onSelectExercise={add_exercise} />
    </div>
  );
}

export default Session;