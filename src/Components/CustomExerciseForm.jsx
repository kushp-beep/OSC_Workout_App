import { useState } from "react";

function Unique_exercise_form({ exer, create_exer }) {
  const [name, set_name] = useState("");
  const [main_muscle, set_main_muscle] = useState("");
  const [secondary_muscle, set_secondary_muscles] = useState("");
  const [tracking_type, set_tracking_type] = useState("repetitions");
  const [related_exercise_id, set_related_exercise_id] = useState("");
  const [error, set_error] = useState("");

  function submit(event) {
    event.preventDefault();
    set_error("");

    if (!name.trim() || !main_muscle.trim()) {
      set_error("Enter an exercise name and main muscle.");
      return;
    }

    const related_exercise = exer.find(
      (exer) => exer.id === related_exercise_id
    );

    if (!related_exercise) {
      set_error("Choose a related exercise.");
      return;
    }

    if (!["repetitions", "time", "distance"].includes(tracking_type)) {
      set_error("Choose a valid tracking type.");
      return;
    }

    try {
      const unique_exercise = {
        id: `custom-${crypto.randomUUID()}`,
        name: name.trim(),
        bodyPart: related_exercise.bodyPart,
        target: main_muscle.trim(),
        secondaryMuscles: secondary_muscle
          .split(",")
          .map((muscle) => muscle.trim())
          .filter(Boolean),
        equipment: related_exercise.equipment || "",
        trackingType: tracking_type,
        relatedExerciseId: related_exercise_id,
        relatedExerciseName: related_exercise.name,
        isCustom: true,
      };

      create_exer(unique_exercise);

      set_name("");
      set_main_muscle("");
      set_secondary_muscles("");
      set_tracking_type("repetitions");
      set_related_exercise_id("");
    } catch (err) {
      set_error(
        err.message || "Could not save the exercise. Please try again."
      );
    }
  }

  return (
    <form onSubmit={submit}>
      <h3>Create a Custom Exercise</h3>

      <p>
        <label htmlFor="custom-name">Exercise name</label>
        <br />

        <input
          id="custom-name"
          value={name}
          onChange={(event) => set_name(event.target.value)}
          required
        />
      </p>

      <p>
        <label htmlFor="custom-main-muscle">Main muscle</label>
        <br />

        <input
          id="custom-main-muscle"
          value={main_muscle}
          onChange={(event) => set_main_muscle(event.target.value)}
          required
        />
      </p>

      <p>
        <label htmlFor="custom-secondary-muscles">
          Secondary muscles, separated by commas (optional)
        </label>
        <br />

        <input
          id="custom-secondary-muscles"
          value={secondary_muscle}
          onChange={(event) => set_secondary_muscles(event.target.value)}
        />
      </p>

      <p>
        <label htmlFor="custom-tracking">Tracking type</label>
        <br />

        <select
          id="custom-tracking"
          value={tracking_type}
          onChange={(event) => set_tracking_type(event.target.value)}
        >
          <option value="repetitions">Repetitions</option>
          <option value="time">Time</option>
          <option value="distance">Distance</option>
        </select>
      </p>

      <p>
        <label htmlFor="custom-related">Related exercise</label>
        <br />

        <select
          id="custom-related"
          value={related_exercise_id}
          onChange={(event) => set_related_exercise_id(event.target.value)}
          required
        >
          <option value="">Choose an exercise</option>

          {exer.map((exer) => (
            <option key={exer.id} value={exer.id}>
              {exer.name}
            </option>
          ))}
        </select>
      </p>

      {error && <p role="alert">{error}</p>}

      <button type="submit">Save Custom Exercise</button>
    </form>
  );
}

export default Unique_exercise_form;