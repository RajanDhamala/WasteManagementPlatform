import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

const ChessBoard = () => {
  const [game, setGame] = useState(new Chess());
  const [evaluation, setEvaluation] = useState(""); // Store Stockfish evaluation
  const [bestMove, setBestMove] = useState(""); // Best move recommended by Stockfish
  const [playerTurn, setPlayerTurn] = useState("white"); // White starts first
  const [highlightedSquares, setHighlightedSquares] = useState({});
  const [worker, setWorker] = useState(null); // Stockfish worker

  // Dynamically load Stockfish
  useEffect(() => {
    const loadStockfishScript = () => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/stockfish@2.0.0/stockfish.js";
      script.onload = () => {
        // Create Stockfish engine once the script is loaded
        const engine = Stockfish();
        engine.onmessage = (event) => {
          const message = event.data;
          if (message.includes("eval")) {
            const evalValue = message.split(" ")[1];
            setEvaluation(evalValue); // Update evaluation score
          }
          if (message.includes("bestmove")) {
            const move = message.split(" ")[1];
            setBestMove(move); // Set best move suggested by Stockfish
            highlightMove(move); // Highlight the best move on the board
          }
        };
        setWorker(engine);
      };
      document.body.appendChild(script); // Add the script tag to the body
    };

    loadStockfishScript(); // Call the function to load Stockfish

    return () => {
      if (worker) {
        worker.postMessage("quit"); // Gracefully stop Stockfish when component unmounts
      }
    };
  }, [worker]);

  // Highlight the move on the chessboard
  const highlightMove = (move) => {
    const from = move.slice(0, 2);
    const to = move.slice(2, 4);
    setHighlightedSquares({
      [from]: { backgroundColor: "rgba(255, 255, 0, 0.5)" },
      [to]: { backgroundColor: "rgba(255, 255, 0, 0.5)" },
    });
  };

  // Evaluate position using Stockfish
  const evaluatePosition = (fen) => {
    if (worker) {
      worker.postMessage(`position fen ${fen}`);
      worker.postMessage("go depth 15"); // You can change the depth for more precision
    }
  };

  // Handle white's move
  const handleWhiteMove = (move) => {
    const newGame = new Chess(game.fen());
    newGame.move(move);
    setGame(newGame);
    setPlayerTurn("black");
    evaluatePosition(newGame.fen()); // Evaluate after white's move
  };

  // Handle black's move (AI move)
  const handleBlackMove = () => {
    const newGame = new Chess(game.fen());
    if (bestMove) {
      newGame.move(bestMove); // Make the move suggested by Stockfish
      setGame(newGame);
      setPlayerTurn("white");
      evaluatePosition(newGame.fen()); // Evaluate after black's move
    }
  };

  // Handle the move from the user
  const onMove = (move) => {
    if (playerTurn === "white") {
      handleWhiteMove(move);
    }
  };

  // Reset the game
  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setEvaluation("");
    setBestMove("");
    setPlayerTurn("white");
    setHighlightedSquares({});
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">♟ Chess with Stockfish</h1>

      {/* Game Info */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 w-full max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Game Info</h2>
        <p><strong>Player Turn:</strong> {playerTurn === "white" ? "White" : "Black (AI)"}</p>
        <p><strong>Evaluation:</strong> {evaluation || "No evaluation yet"}</p>
        <p><strong>Best Move:</strong> {bestMove || "Waiting for AI move"}</p>
      </div>

      {/* Chessboard */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onMove}
          customSquareStyles={highlightedSquares}
          boardWidth={500}
        />
      </div>

      {/* Reset Button */}
      <div className="flex gap-4 mb-6">
        <button
          className="bg-red-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-red-700"
          onClick={resetGame}
        >
          Reset Game
        </button>
      </div>
    </div>
  );
};

export default ChessBoard;
