const Vocabulary = ({ vocabulary }) => {
  // Group vocabulary by category
  const groupedVocabulary = vocabulary.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  // Function to get difficulty color
  const getDifficultyColor = (level) => {
    switch (level) {
      case "easy":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "hard":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {Object.entries(groupedVocabulary).map(([category, words]) => (
        <div key={category} className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-blue-600 pb-2 mb-6">
            {category}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {words
              .slice()
              .sort((a, b) => {
                const order = { easy: 1, medium: 2, hard: 3 };
                return order[b.difficulty] - order[a.difficulty];
              })
              .map((word, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200 relative"
                >
                  {/* Difficulty indicator */}
                  {word.difficulty && (
                    <div
                      className={`absolute top-1 right-1 w-4 h-4 rounded-full ${getDifficultyColor(
                        word.difficulty
                      )} border-2 border-white`}
                      title={`Difficulty: ${word.difficulty}`}
                    >
                      {" "}
                    </div>
                  )}

                  <div className="p-4">
                    <div className="text-center text-2xl font-quran mb-3 text-blue-800 ">
                      {word.arabic}
                    </div>
                    <div className="text-center text-gray-700  font-liador font-semibold ">
                      {word.bengali}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Vocabulary;
