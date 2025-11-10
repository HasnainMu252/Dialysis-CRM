import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Slider.css"; // make sure to create this file for styles

function Slider() {
  const subtitles = [
    "Managing appointments efficiently",
    "Tracking patient records accurately",
    "Optimizing staff scheduling",
    "Improving overall patient care",
  ];

  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = subtitles[index];
    let timer;

    if (isDeleting) {
      timer = setTimeout(() => {
        setText(currentText.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      }, 40);
    } else {
      timer = setTimeout(() => {
        setText(currentText.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 80);
    }

    if (!isDeleting && charIndex === currentText.length) {
      setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setIndex((index + 1) % subtitles.length);
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, index, subtitles]);

  return (
    <div className="row container-fluid p-5 slide d-flex flex-column align-items-center justify-content-center text-center">
      <div>
        <p className="slide-title fw-bold display-5 text-light mb-2">
          Streamline Your Dialysis Operations
        </p>
      </div>

      <div>
        <p className="slide-subtitle fs-4 text-light">
          {text}
          <span className="blinking-cursor">|</span>
        </p>
      </div>

      <div className="slider-btn my-2 ">
        <button className="btn btn-primary text-light fw-semibold m-2 px-4 py-3 rounded-3">
          Quick Patient Intake
        </button>
        <button className="btn btn-outline-light fw-semibold  m-2 px-4 py-3 rounded-3">
          View Schedule
        </button>
      </div>
    </div>
  );
}

export default Slider;
