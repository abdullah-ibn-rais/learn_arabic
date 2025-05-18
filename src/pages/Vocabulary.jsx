import { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';

// 1. Memory-optimized constants
const DIFFICULTY = Object.create(null);
Object.defineProperties(DIFFICULTY, {
  COLORS: {
    value: Object.freeze({
      easy: 'border-emerald-500',
      medium: 'border-amber-500',
      hard: 'border-rose-500'
    })
  },
  DOTS: {
    value: Object.freeze({
      easy: 'bg-emerald-500',
      medium: 'bg-amber-500',
      hard: 'bg-rose-500'
    })
  },
  ORDER: {
    value: Object.freeze({ easy: 1, medium: 2, hard: 3 })
  }
});

// 2. Array helpers
const ARRAY = {
  EMPTY: Object.freeze([]),
  createSized: (size) => {
    const arr = new Array(size);
    arr.length = size;
    return arr;
  }
};

// 3. Corrected hash function using Map (not WeakMap)
const hashKey = (() => {
  const cache = new Map();
  return (str) => {
    if (cache.has(str)) return cache.get(str);
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    const result = hash >>> 0; // Ensure unsigned
    cache.set(str, result);
    return result;
  };
})();

// 4. WordCard with valid Tailwind classes
const WordCard = memo(function WordCard({ arabic, bengali, pronunciation, difficulty }) {
  const borderColor = DIFFICULTY.COLORS[difficulty] || 'border-gray-500';
  const dotColor = DIFFICULTY.DOTS[difficulty] || 'bg-gray-500';
  
  return (
    <div className={`relative rounded-lg overflow-hidden border-l-4 ${borderColor}`}>
      <div className="relative z-10 p-3 h-full flex flex-col items-center justify-center bg-gray-800/80">
        <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${dotColor}`} />
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
}, (prev, next) =>
  prev.arabic === next.arabic &&
  prev.bengali === next.bengali &&
  prev.pronunciation === next.pronunciation &&
  prev.difficulty === next.difficulty
);

// 5. CategorySection
const CategorySection = memo(function CategorySection({ category, words, isVisible }) {
  const wordCards = useMemo(() => {
    return words.map((word, i) => (
      <WordCard
        key={hashKey(word.arabic + word.bengali + word.difficulty + i)}
        {...word}
      />
    ));
  }, [words]);

  return (
    <section data-category={category}>
      <div
        style={{
          opacity: isVisible ? 1 : 0,
          transform: `translateY(${isVisible ? 0 : 20}px)`,
          transition: 'opacity 0.3s cubic-bezier(0.16,1,0.3,1),transform 0.3s cubic-bezier(0.16,1,0.3,1)'
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {wordCards}
        </div>
      </div>
    </section>
  );
}, (prev, next) =>
  prev.category === next.category &&
  prev.words === next.words &&
  prev.isVisible === next.isVisible
);

// 6. Vocabulary component
const Vocabulary = memo(function Vocabulary({ vocabulary }) {
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let frame;
    const handleResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setIsMobile(window.innerWidth < 768);
      });
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Group and sort vocabulary
  const { groupedVocabulary, categoryList } = useMemo(() => {
    const grouped = Object.create(null);
    const scores = Object.create(null);
    for (let i = 0; i < vocabulary.length; i++) {
      const item = vocabulary[i];
      const cat = item.category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
      scores[cat] = (scores[cat] || 0) + (DIFFICULTY.ORDER[item.difficulty] || 0);
    }
    const sortedCategories = Object.keys(grouped).sort(
      (a, b) => scores[b] - scores[a]
    );
    for (let i = 0; i < sortedCategories.length; i++) {
      grouped[sortedCategories[i]].sort((a, b) =>
        (DIFFICULTY.ORDER[b.difficulty] || 0) - (DIFFICULTY.ORDER[a.difficulty] || 0)
      );
    }
    return Object.freeze({
      groupedVocabulary: grouped,
      categoryList: sortedCategories
    });
  }, [vocabulary]);

  // Intersection Observer
  const [visibleCategories, setVisibleCategories] = useState(() => new Set());
  const observerRef = useRef(null);

  const observerCallback = useCallback((entries) => {
    const updates = new Set();
    for (const entry of entries) {
      if (entry.isIntersecting) {
        updates.add(entry.target.dataset.category);
      }
    }
    if (updates.size) {
      setVisibleCategories(prev => {
        const newSet = new Set(prev);
        let changed = false;
        updates.forEach(cat => {
          if (!newSet.has(cat)) {
            newSet.add(cat);
            changed = true;
          }
        });
        return changed ? newSet : prev;
      });
    }
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    observerRef.current = new IntersectionObserver(observerCallback, {
      threshold: 0.05,
      rootMargin: '100px 0px'
    });
    const observer = observerRef.current;
    const sections = document.querySelectorAll('[data-category]');
    for (let i = 0; i < sections.length; i++) {
      observer.observe(sections[i]);
    }
    return () => observer.disconnect();
  }, [observerCallback, categoryList.length]);

  // Memoized Header
  const Header = useMemo(() => (
    <header className="mb-8 text-center">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-2">
        Quranic Vocabulary
      </h1>
      <p className="text-sm md:text-base text-gray-400">
        Hardest words appear first
      </p>
    </header>
  ), []);

  // Memoized Sections
  const Sections = useMemo(() => (
    categoryList.map(category => (
      <CategorySection
        key={category}
        category={category}
        words={groupedVocabulary[category] || ARRAY.EMPTY}
        isVisible={visibleCategories.has(category)}
      />
    ))
  ), [categoryList, groupedVocabulary, visibleCategories]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-4 md:p-6">
      {Header}
      <div className="space-y-10 md:space-y-12">
        {Sections}
      </div>
    </div>
  );
}, (prev, next) => prev.vocabulary === next.vocabulary);

export default Vocabulary;
