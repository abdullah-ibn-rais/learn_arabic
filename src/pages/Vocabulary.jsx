import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Vocabulary = ({ vocabulary }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [visibleCategories, setVisibleCategories] = useState([]);

  // Check mobile status
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Group and sort vocabulary
  const { groupedVocabulary, categoryDifficulty } = vocabulary.reduce(
    (acc, item) => {
      if (!acc.groupedVocabulary[item.category]) {
        acc.groupedVocabulary[item.category] = [];
      }

      acc.groupedVocabulary[item.category].push(item);

      const difficultyScore = { easy: 1, medium: 2, hard: 3 }[item.difficulty] || 0;
      acc.categoryDifficulty[item.category] =
        (acc.categoryDifficulty[item.category] || 0) + difficultyScore;

      return acc;
    },
    { groupedVocabulary: {}, categoryDifficulty: {} }
  );

  // Sort categories by total difficulty (descending)
  const categoryList = Object.keys(groupedVocabulary).sort(
    (a, b) => categoryDifficulty[b] - categoryDifficulty[a]
  );

  // Sort words inside each category by difficulty (hard → easy)
  categoryList.forEach((category) => {
    groupedVocabulary[category].sort((a, b) => {
      const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
      return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
    });
  });

  // Reveal categories with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCategories((prev) =>
              [...new Set([...prev, entry.target.dataset.category])]
            );
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('.category-section');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [groupedVocabulary]);

  const getDifficultyColor = (level) => {
    const colors = {
      easy: 'bg-emerald-500',
      medium: 'bg-amber-500',
      hard: 'bg-rose-500',
    };
    return colors[level] || 'bg-gray-500';
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-4 md:p-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500 mb-2">
          Quranic Vocabulary
        </h1>
        <p className="text-sm md:text-base text-gray-400">
          Hardest words appear first in each category
        </p>
      </motion.header>

      {/* Vocabulary Grid */}
      <div className="space-y-10 md:space-y-12">
        {categoryList.map((category) => (
          <section
            key={category}
            data-category={category}
            className="category-section"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: visibleCategories.includes(category) ? 1 : 0,
                y: visibleCategories.includes(category) ? 0 : 20,
              }}
              transition={{ duration: 0.5 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-700"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center">
                <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                  {category}
                </span>
                <span className="ml-3 text-xs bg-gray-700 px-2 py-1 rounded-full">
                  {groupedVocabulary[category].length} words
                </span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {groupedVocabulary[category].map((word, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative rounded-lg overflow-hidden border-l-4 ${
                      word.difficulty === 'hard'
                        ? 'border-rose-500'
                        : word.difficulty === 'medium'
                        ? 'border-amber-500'
                        : 'border-emerald-500'
                    }`}
                  >
                    <div className="relative z-10 p-3 h-full flex flex-col items-center justify-center bg-gray-800/80">
                      {/* Difficulty indicator */}
                      <div
                        className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getDifficultyColor(
                          word.difficulty
                        )}`}
                      ></div>

                      {/* Arabic */}
                      <div className="text-xl md:text-2xl font-quran text-indigo-300 mb-2">
                        {word.arabic}
                      </div>

                      {/* Bengali translation */}
                      <div className="text-center">
                        <div className="text-sm md:text-base text-gray-300 font-medium font-liador">
                          {word.bengali}
                        </div>
                        {word.pronunciation && (
                          <div className="text-xs text-gray-500 mt-1">
                            [{word.pronunciation}]
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Vocabulary;
