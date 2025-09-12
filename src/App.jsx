import "./App.scss";
import React, { useState, useEffect } from "react";
import Experience from "./Experience/Experience";

// Loading Screen Component
const LoadingScreen = ({ onEnter }) => {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 5000; // 6 seconds

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);

      setProgress(newProgress);

      if (newProgress >= 100) {
        setIsLoaded(true);
      } else {
        requestAnimationFrame(updateProgress);
      }
    };

    requestAnimationFrame(updateProgress);
  }, []);

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <h1 className="loading-title">Demo Emotional Experiences</h1>

        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-text">{Math.round(progress)}%</span>
        </div>

        {isLoaded && (
          <div className="audio-options">
            <div className="button-container">
              <button
                className="enter-button with-audio"
                onClick={() => onEnter(true)}
              >
                Enter with Audio
              </button>
              <button
                className="enter-button without-audio"
                onClick={() => onEnter(false)}
              >
                Enter without Audio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const handleEnter = (audioEnabled) => {
    setSoundEnabled(audioEnabled);
    setHasEntered(true);
  };

  return (
    <>
      {!hasEntered && <LoadingScreen onEnter={handleEnter} />}
      <Experience soundEnabled={soundEnabled} />
    </>
  );
}

export default App;
