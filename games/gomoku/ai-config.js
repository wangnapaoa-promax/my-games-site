// Game configuration settings for advanced Gomoku AI

const aiConfig = {
    boardSize: 15,
    winLength: 5,
    timeLimit: 1000, // time limit for each move in milliseconds
    difficulty: 'hard', // 'easy', 'medium', or 'hard'
    evaluationFunction: 'advanced', // type of evaluation function to use
};

module.exports = aiConfig;