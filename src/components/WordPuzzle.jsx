import React, { useState, useEffect } from "react";
import WORDS_WITH_HINTS from "./WordsData.jsx"; // Import word-hint pairs

const WordPuzzle = () => {
  // Game state variables
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isPlayOn, setIsPlayOn] = useState(false);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [correctWord, setCorrectWord] = useState("");
  const [scrambledWord, setScrambledWord] = useState("");
  const [message, setMessage] = useState("");
  const [lineColor, setLineColor] = useState("blue");
  const [losses, setLosses] = useState(0);
  const [showRetryButton, setShowRetryButton] = useState(false);
  const [hintText, setHintText] = useState("");
  const [usedWords, setUsedWords] = useState([]); // Tracks used word indexes
  const [currentIndex, setCurrentIndex] = useState(null); // Index of current word
  const [showCongrats, setShowCongrats] = useState(false); // End-of-round message

  // Constants for positioning letters in a circle
  const CIRCLE_SIZE = 260;
  const CENTER = CIRCLE_SIZE / 2;
  const RADIUS = 90;

  // Picks a new unused word randomly from WORDS_WITH_HINTS
  const selectWord = () => {
    const usedSet = new Set(usedWords); // Use Set to prevent duplicates
    const unusedIndexes = WORDS_WITH_HINTS.map((_, i) => i).filter(i => !usedSet.has(i)); // Filter unused
    if (unusedIndexes.length === 0) return null;

    const randomIndex = unusedIndexes[Math.floor(Math.random() * unusedIndexes.length)];
    usedSet.add(randomIndex); // Add selected word to used set
    setUsedWords([...usedSet]); // Update usedWords state
    setCurrentIndex(randomIndex); // Store selected index

    return WORDS_WITH_HINTS[randomIndex].word;
  };

  // Re-selects a word by index (used in Retry)
  const selectWordByIndex = (index) => {
    setCurrentIndex(index);
    setUsedWords((prev) => (prev.includes(index) ? prev : [...prev, index])); // Ensure it's counted
    return WORDS_WITH_HINTS[index].word;
  };

  // Scrambles letters in the word randomly
  const constructScrambledWord = (word) => {
    const shuffled = word.split("");
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.join("");
  };

  // Handles game start logic
  const handleStartGame = () => {
    const usedSet = new Set(); // Reset used word tracking
    const randomIndex = Math.floor(Math.random() * WORDS_WITH_HINTS.length); // First word of round
    usedSet.add(randomIndex);
    setUsedWords([...usedSet]); // Track it as used immediately
    setCurrentIndex(randomIndex);

    const word = WORDS_WITH_HINTS[randomIndex].word;

    // Reset all state
    setIsPlayOn(true);
    setSelectedLetters([]);
    setMessage("");
    setLineColor("blue");
    setTimeLeft(30);
    setIsTimeUp(false);
    setLosses(0);
    setScore(0);
    setShowRetryButton(false);
    setShowCongrats(false);

    // Set word and hint
    setCorrectWord(word);
    setScrambledWord(constructScrambledWord(word));
    const hint = WORDS_WITH_HINTS[randomIndex]?.hint;
    setHintText(hint);
  };

  // Handles a user clicking a letter
  const handleLetterClick = (letter, index) => {
    if (isTimeUp || showRetryButton || showCongrats) return;

    const lastSelected = selectedLetters[selectedLetters.length - 1];
    if (lastSelected && lastSelected.index === index) {
      setSelectedLetters(selectedLetters.slice(0, -1)); // Deselect
      return;
    }

    if (selectedLetters.find((l) => l.index === index)) return; // Prevent reselecting

    const newSelection = [...selectedLetters, { letter, index }];
    setSelectedLetters(newSelection);

    const currentWordAttempt = newSelection.map((item) => item.letter).join("");
    if (currentWordAttempt.length === correctWord.length) {
      if (currentWordAttempt === correctWord) {
        // Correct!
        setLineColor("greenyellow");
        setMessage("Correct Answer!");
        setScore((prev) => prev + timeLeft);
        setTimeout(nextWord, 1500); // Proceed after delay
      } else {
        handleLoss("Wrong Answer!");
      }
    }
  };

  // Handles incorrect answer or time's up
  const handleLoss = (msg) => {
    setLineColor("red");
    setMessage(msg);
    setIsTimeUp(true);
    setShowRetryButton(true);

    const newLosses = losses + 1;
    setLosses(newLosses);

    // End game after 3 losses
    if (newLosses >= 3) {
      setTimeout(() => {
        setMessage("Game Over!");
        setIsPlayOn(false);
        setShowRetryButton(false);
      }, 1500);
    }
  };

  // Loads the next unused word
  const nextWord = () => {
    if (usedWords.length >= WORDS_WITH_HINTS.length) {
      // End of round
      setShowCongrats(true);
      setMessage("");
      setShowRetryButton(false);
      setIsTimeUp(false);
      setSelectedLetters([]);
      setLineColor("blue");
      return;
    }

    // Reset state for new word
    setSelectedLetters([]);
    setMessage("");
    setLineColor("blue");
    setTimeLeft(30);
    setIsTimeUp(false);
    setShowRetryButton(false);

    const word = selectWord(); // Pick new word
    if (word) {
      setCorrectWord(word);
      setScrambledWord(constructScrambledWord(word));
      const hint = WORDS_WITH_HINTS.find((item) => item.word === word)?.hint;
      setHintText(hint);
    }
  };

  // Timer effect
  useEffect(() => {
    if (!isPlayOn || timeLeft <= 0 || isTimeUp || showCongrats) return;
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime === 1) {
          clearInterval(timer);
          handleLoss("Time's Up!");
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer); // Cleanup
  }, [isPlayOn, timeLeft, isTimeUp, losses, showCongrats]);

  // Retry the current word
  const handleRetryClick = () => {
    if (losses < 3 && currentIndex !== null) {
      setSelectedLetters([]);
      setMessage("");
      setLineColor("blue");
      setTimeLeft(30);
      setIsTimeUp(false);
      setShowRetryButton(false);

      const word = selectWordByIndex(currentIndex); // Retry same word
      setCorrectWord(word);
      setScrambledWord(constructScrambledWord(word));
      const hint = WORDS_WITH_HINTS.find((item) => item.word === word)?.hint;
      setHintText(hint);
    }
  };

  // Display hearts based on lives
  const renderHearts = () => {
    return [0, 1, 2].map((idx) => {
      const isLost = losses > 2 - idx;
      return (
        <img
          key={idx}
          className={`heart ${isLost ? "transparent-heart" : ""}`}
          src={isLost ? "images/empty-heart.png" : "images/heart.png"}
          alt="heart"
          width="40"
          height="40"
        />
      );
    });
  };

  // UI rendering
  return (
    <div className="word_scramble">
      {!showCongrats && message && (
        <div className="message">
          <p>{message}</p>
        </div>
      )}

      <div className="content">
        <div className="time-score-container">
          {isPlayOn && (
            <>
              <div className="hearts-score-group">
                <div className="hearts-container">{renderHearts()}</div>
                <div className="score-container">
                  <strong>Score:</strong> {score}
                </div>
              </div>
              <div className="timer-wrapper">
                <div className="progress-bar-container">
                  <div
                    className={`progress-bar-fill ${timeLeft <= 5 ? "danger" : ""}`}
                    style={{ width: `${(timeLeft / 30) * 100}%` }}
                  />
                  <span className="progress-text">{timeLeft}s</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Show Start screen */}
        {!isPlayOn && !showCongrats && (
          <>
            <h1 className="title">
              {"Puzzle Connect".split("").map((char, i) => (
                <span key={i} className={`letter color-${i % 6}`}>
                  {char}
                </span>
              ))}
            </h1>
            <p className="start-hint">
            Solve the riddle and click the letters in the correct order to reveal the mystery word.
            </p>
            <button className="start-game" onClick={handleStartGame}>
              Start Game
            </button>
          </>
        )}

        {/* End of round screen */}
        {showCongrats && (
          <>
            <div className="hint-text">
              Congrats! You finished the game, your score is {score}
            </div>
            <button className="start-game" onClick={handleStartGame}>
              Start Again
            </button>
          </>
        )}

        {/* Hint display */}
        {hintText && isPlayOn && !showCongrats && (
          <div className="hint-text">{hintText}</div>
        )}

        {/* Retry button */}
        {showRetryButton && losses < 3 && !showCongrats && (
          <div className="retry-message">
            <button className="retry-button" onClick={handleRetryClick}>
              Retry
            </button>
          </div>
        )}

        {/* Puzzle circle */}
        {isPlayOn && !showCongrats && (
          <>
            <div className="circle">
              <svg className="lines" width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
                {selectedLetters.length > 1 &&
                  selectedLetters.slice(1).map((curr, index) => {
                    const prev = selectedLetters[index];
                    const anglePrev = (360 / scrambledWord.length) * prev.index;
                    const angleCurr = (360 / scrambledWord.length) * curr.index;
                    const x1 = CENTER + RADIUS * Math.cos((anglePrev * Math.PI) / 180);
                    const y1 = CENTER + RADIUS * Math.sin((anglePrev * Math.PI) / 180);
                    const x2 = CENTER + RADIUS * Math.cos((angleCurr * Math.PI) / 180);
                    const y2 = CENTER + RADIUS * Math.sin((angleCurr * Math.PI) / 180);

                    return (
                      <line
                        key={index}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={lineColor}
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    );
                  })}
              </svg>

              {/* Letter nodes */}
              {scrambledWord.split("").map((letter, index) => {
                const angle = (360 / scrambledWord.length) * index;
                const x = CENTER + RADIUS * Math.cos((angle * Math.PI) / 180);
                const y = CENTER + RADIUS * Math.sin((angle * Math.PI) / 180);

                return (
                  <div
                    key={index}
                    className="circle-letter"
                    style={{ left: `${x}px`, top: `${y}px` }}
                    onClick={() => handleLetterClick(letter, index)}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>

            {/* Selected word preview */}
            <div className="selected-word">
              {selectedLetters.map((l, i) => (
                <span key={i} className="selected-letter">
                  {l.letter}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WordPuzzle;