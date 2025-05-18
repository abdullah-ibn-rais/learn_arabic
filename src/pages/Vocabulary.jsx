import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  memo,
  useId,
} from "react";
import { ErrorBoundary } from "react-error-boundary";

// Frozen constant objects for better memory optimization
const DIFFICULTY = Object.freeze({
  COLORS: Object.freeze({
    easy: "border-emerald-500",
    medium: "border-amber-500",
    hard: "border-rose-500",
  }),
  DOTS: Object.freeze({
    easy: "bg-emerald-500",
    medium: "bg-amber-500",
    hard: "bg-rose-500",
  }),
  ORDER: Object.freeze({ easy: 1, medium: 2, hard: 3 }),
  LABELS: Object.freeze({
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
  }),
});

// Fallback component for error boundary
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="p-6 bg-red-900/30 rounded-lg border border-red-500 text-center">
      <h2 className="text-xl font-bold text-red-300 mb-2">
        Something went wrong
      </h2>
      <p className="text-red-200 mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg"
      >
        Try again
      </button>
    </div>
  );
};

// Optimized WordCard with better prop comparison
const WordCard = memo(
  function WordCard({ word }) {
    const { arabic, bengali, pronunciation, difficulty } = word;
    const borderColor = DIFFICULTY.COLORS[difficulty] || "border-gray-500";
    const dotColor = DIFFICULTY.DOTS[difficulty] || "bg-gray-500";
    const id = useId();

    return (
      <div
        className={`relative rounded-lg overflow-hidden border-l-4 ${borderColor}`}
        data-testid={`word-card-${id}`}
      >
        <div className="relative z-10 p-3 h-full flex flex-col items-center justify-center bg-gray-800/80">
          <div
            className={`absolute top-2 right-2 w-3 h-3 rounded-full ${dotColor}`}
            title={DIFFICULTY.LABELS[difficulty]}
          />
          <div className="text-xl md:text-2xl font-quran text-indigo-300 mb-2">
            {arabic}
          </div>
          <div className="text-center">
            <div className="text-sm md:text-base text-gray-300 font-medium font-liador">
              {bengali}
            </div>
            {pronunciation && (
              <div className="text-xs text-gray-500 mt-1">
                [{pronunciation}]
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
  (prev, next) => prev.word === next.word
);

// Loading component with skeleton
const LoadingSkeleton = memo(() => {
  return (
    <div className="space-y-10 md:space-y-12 animate-pulse">
      {[1, 2, 3].map((num) => (
        <div
          key={num}
          className="bg-gray-800/50 rounded-xl p-4 md:p-6 border border-gray-700"
        >
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {Array(10)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="h-32 bg-gray-700 rounded"></div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
});

// Optimized CategorySection with virtualization approach
const CategorySection = memo(
  function CategorySection({ category, words, isVisible }) {
    // Use a ref for words to avoid unnecessary re-renders
    const wordsRef = useRef(words);
    const sectionId = useId();

    // Update ref if words change
    useEffect(() => {
      wordsRef.current = words;
    }, [words]);

    // Memoized word cards
    const wordCards = useMemo(() => {
      if (!isVisible) return null; // Don't render word cards if not visible

      return words.map((word, i) => (
        <WordCard key={`${sectionId}-word-${i}`} word={word} />
      ));
    }, [words, isVisible, sectionId]);

    return (
      <section data-category={category}>
        <div
          style={{
            opacity: isVisible ? 1 : 0,
            transform: `translateY(${isVisible ? 0 : 20}px)`,
            transition:
              "opacity 0.3s cubic-bezier(0.16,1,0.3,1),transform 0.3s cubic-bezier(0.16,1,0.3,1)",
          }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-700"
        >
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center">
            <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              {category}
            </span>
            <span className="ml-3 text-xs bg-gray-700 px-2 py-1 rounded-full">
              {words.length} words
            </span>
          </h2>
          {/* ----- MOBILE-FRIENDLY GRID ----- */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
            {wordCards}
          </div>
        </div>
      </section>
    );
  },
  (prev, next) => {
    return (
      prev.category === next.category &&
      prev.isVisible === next.isVisible &&
      prev.words.length === next.words.length &&
      prev.words === next.words
    );
  }
);

// DifficultyFilter component
const DifficultyFilter = memo(function DifficultyFilter({
  selectedDifficulty,
  onSelectDifficulty,
}) {
  const difficulties = ["easy", "medium", "hard"];

  return (
    <div className="flex justify-center gap-2 my-4">
      <button
        onClick={() => onSelectDifficulty(null)}
        className={`px-4 py-2 rounded-lg transition-all ${
          selectedDifficulty === null
            ? "bg-indigo-600 text-white shadow-lg"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }`}
      >
        All
      </button>
      {difficulties.map((diff) => (
        <button
          key={diff}
          onClick={() => onSelectDifficulty(diff)}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
            selectedDifficulty === diff
              ? `bg-${
                  diff === "easy"
                    ? "emerald"
                    : diff === "medium"
                    ? "amber"
                    : "rose"
                }-600 text-white shadow-lg`
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          <span
            className={`inline-block w-3 h-3 rounded-full ${DIFFICULTY.DOTS[diff]}`}
          ></span>
          {DIFFICULTY.LABELS[diff]}
        </button>
      ))}
    </div>
  );
});

// Optimized search hook
function useSearch(initialValue = "") {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const timerRef = useRef(null);

  useEffect(() => {
    // Clear any existing timeout
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set a new timeout to update the debounced value
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, 300);

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value]);

  return [value, debouncedValue, setValue];
}

// Optimized Header component
const Header = memo(
  function Header({
    totalWords,
    filteredWords,
    search,
    onSearchChange,
    selectedDifficulty,
    onSelectDifficulty,
  }) {
    return (
      <header className="mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-2">
          Quranic Vocabulary
        </h1>
        <p className="text-sm md:text-base text-gray-400">
          Hardest words appear first
        </p>
        <div className="mt-2 text-base text-gray-300 font-semibold">
          {filteredWords !== totalWords ? (
            <>
              Showing <span className="text-indigo-400">{filteredWords}</span>{" "}
              of {totalWords} words
            </>
          ) : (
            <>Total words: {totalWords}</>
          )}
        </div>

        <DifficultyFilter
          selectedDifficulty={selectedDifficulty}
          onSelectDifficulty={onSelectDifficulty}
        />

        {/* ----- MOBILE-FRIENDLY INPUT ----- */}
        <input
          type="text"
          placeholder="Search category or word..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="mt-4 px-3 py-2 rounded-xl bg-gray-700 text-gray-100 w-full max-w-xs sm:max-w-md md:max-w-lg mx-auto focus:outline-none focus:ring-2 focus:ring-indigo-400"
          aria-label="Search vocabulary"
        />
      </header>
    );
  },
  (prev, next) =>
    prev.totalWords === next.totalWords &&
    prev.filteredWords === next.filteredWords &&
    prev.search === next.search &&
    prev.selectedDifficulty === next.selectedDifficulty
);

// Main optimized Vocabulary component
function Vocabulary({ vocabulary }) {
  // Loading state
  const [loading, setLoading] = useState(true);

  // Difficulty filter state
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);

  // Memoize the vocabulary data structure
  const vocabData = useMemo(() => vocabulary || [], [vocabulary]);

  // Use intersection observer for visibility tracking
  const [visibleCategories, setVisibleCategories] = useState(new Set());
  const observerRef = useRef(null);

  // Enhanced search with debouncing
  const [search, debouncedSearch, setSearch] = useSearch("");

  // Simulate loading if necessary (remove if vocabulary is always available)
  useEffect(() => {
    if (vocabData.length > 0) {
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [vocabData]);

  // Setup intersection observer for lazy loading
  const observerCallback = useCallback(
    (entries) => {
      const newVisibleCategories = new Set(visibleCategories);
      let changed = false;

      for (const entry of entries) {
        if (entry.isIntersecting) {
          const category = entry.target.dataset.category;
          if (!newVisibleCategories.has(category)) {
            newVisibleCategories.add(category);
            changed = true;
          }
        }
      }

      if (changed) {
        setVisibleCategories(newVisibleCategories);
      }
    },
    [visibleCategories]
  );

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(observerCallback, {
      threshold: 0.05,
      rootMargin: "150px 0px",
    });

    // Observe all category sections
    const sections = document.querySelectorAll("[data-category]");
    sections.forEach((section) => {
      observerRef.current.observe(section);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [observerCallback, debouncedSearch, selectedDifficulty]); // Re-observe when search or difficulty changes

  // Group and sort vocabulary (optimized)
  const { groupedVocabulary, categoryList } = useMemo(() => {
    // Use Map for better performance with large datasets
    const grouped = new Map();
    const scores = new Map();

    for (let i = 0; i < vocabData.length; i++) {
      const item = vocabData[i];
      const cat = item.category;

      if (!grouped.has(cat)) {
        grouped.set(cat, []);
      }

      grouped.get(cat).push(item);
      scores.set(
        cat,
        (scores.get(cat) || 0) + (DIFFICULTY.ORDER[item.difficulty] || 0)
      );
    }

    // Sort categories by difficulty score
    const sortedCategories = Array.from(grouped.keys()).sort(
      (a, b) => scores.get(b) - scores.get(a)
    );

    // Sort words within each category
    sortedCategories.forEach((category) => {
      grouped
        .get(category)
        .sort(
          (a, b) =>
            (DIFFICULTY.ORDER[b.difficulty] || 0) -
            (DIFFICULTY.ORDER[a.difficulty] || 0)
        );
    });

    return {
      groupedVocabulary: grouped,
      categoryList: sortedCategories,
    };
  }, [vocabData]);

  // Filtered categories and words based on search and difficulty
  const { filteredCategoriesAndWords, totalFilteredWords } = useMemo(() => {
    // Filter first by difficulty (if selected)
    const difficultyFilteredData = [];
    let totalWords = 0;

    for (const category of categoryList) {
      const allWords = groupedVocabulary.get(category);
      const filteredByDifficulty = selectedDifficulty
        ? allWords.filter((word) => word.difficulty === selectedDifficulty)
        : allWords;

      if (filteredByDifficulty.length > 0) {
        difficultyFilteredData.push({
          category,
          words: filteredByDifficulty,
        });
        totalWords += filteredByDifficulty.length;
      }
    }

    // Then filter by search term
    if (!debouncedSearch.trim()) {
      // Show all categories (that match difficulty filter) when no search
      return {
        filteredCategoriesAndWords: difficultyFilteredData,
        totalFilteredWords: totalWords,
      };
    }

    const lower = debouncedSearch.trim().toLowerCase();
    const result = [];
    let searchFilteredWords = 0;

    for (const { category, words } of difficultyFilteredData) {
      // Check if category matches search
      if (category.toLowerCase().includes(lower)) {
        // If category matches, include all words from that category
        result.push({
          category,
          words,
        });
        searchFilteredWords += words.length;
      } else {
        // Otherwise, only include words that match search
        const filteredWords = words.filter(
          (word) =>
            (word.arabic && word.arabic.toLowerCase().includes(lower)) ||
            (word.bengali && word.bengali.toLowerCase().includes(lower)) ||
            (word.pronunciation &&
              word.pronunciation.toLowerCase().includes(lower))
        );

        if (filteredWords.length > 0) {
          result.push({
            category,
            words: filteredWords,
          });
          searchFilteredWords += filteredWords.length;
        }
      }
    }

    return {
      filteredCategoriesAndWords: result,
      totalFilteredWords: searchFilteredWords,
    };
  }, [debouncedSearch, categoryList, groupedVocabulary, selectedDifficulty]);

  // Total words count
  const totalWords = useMemo(() => vocabulary?.length || 0, [vocabulary]);

  // No results message
  const noResultsMessage = useMemo(() => {
    if (totalFilteredWords === 0 && (debouncedSearch || selectedDifficulty)) {
      let message = "No words found";

      if (debouncedSearch && selectedDifficulty) {
        message += ` matching "${debouncedSearch}" with ${DIFFICULTY.LABELS[selectedDifficulty]} difficulty`;
      } else if (debouncedSearch) {
        message += ` matching "${debouncedSearch}"`;
      } else if (selectedDifficulty) {
        message += ` with ${DIFFICULTY.LABELS[selectedDifficulty]} difficulty`;
      }

      return message;
    }
    return null;
  }, [totalFilteredWords, debouncedSearch, selectedDifficulty]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {/* ----- FULLY MOBILE-FRIENDLY WRAPPER ----- */}
      <div
        className="
          w-full
          max-w-full
          min-h-screen
          bg-gradient-to-br from-gray-900 to-gray-800
          text-gray-100
          p-2 sm:p-4 md:p-6
          mx-auto
          overflow-x-hidden
        "
      >
        <Header
          totalWords={totalWords}
          filteredWords={totalFilteredWords}
          search={search}
          onSearchChange={setSearch}
          selectedDifficulty={selectedDifficulty}
          onSelectDifficulty={setSelectedDifficulty}
        />

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="space-y-10 md:space-y-12">
            {filteredCategoriesAndWords.length > 0 ? (
              filteredCategoriesAndWords.map(({ category, words }) => (
                <CategorySection
                  key={`category-${category}`}
                  category={category}
                  words={words}
                  // Show all if observer hasn't registered anything yet:
                  isVisible={
                    visibleCategories.size === 0 ||
                    visibleCategories.has(category)
                  }
                />
              ))
            ) : (
              <div className="text-center py-12 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
                <p className="text-gray-300 text-lg">{noResultsMessage}</p>
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedDifficulty(null);
                  }}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default memo(Vocabulary);
