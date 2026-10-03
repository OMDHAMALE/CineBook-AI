/**
 * CineBook AI – Smart Movie and Book Recommendation System
 * Main Application Logic (script.js)
 * 
 * Provides:
 * 1. Authentication & Session Management (Login & 9-field Registration)
 * 2. Multi-view Sidebar Navigation (Home, Movies, Books, Wishlist, History, Profile)
 * 3. Main Home Page Dashboard (Hero, Media switchers, Mood/Genre selections)
 * 4. Rule-Based AI Engine Preferences Management
 * 5. Dynamic Popular Media Cards generation (from movies.json & books.json)
 * 6. AI Details Modal with explicit Rule-Firing breakdown
 * 7. Interactive Wishlist & Toast Notification System
 */

// Storage Keys
const STORAGE_KEYS = {
  SESSION:       'cinebook_auth_session',
  USERS:         'cinebook_registered_users',
  PREFERENCES:   'cinebook_user_preferences',
  PROFILE:       'cinebook_profile',         // Step 7: profile storage
  WISHLIST:      'cinebook_wishlist',        // legacy shared key
  HISTORY:       'cinebook_history',          // legacy combined history
  MOVIE_WISHLIST:'cinebook_movie_wishlist',   // Step 7: movies-only wishlist
  BOOK_WISHLIST: 'cinebook_book_wishlist',    // Step 7: books-only wishlist
  MOVIE_HISTORY: 'cinebook_movie_history',   // Step 7: movies-only history
  BOOK_HISTORY:  'cinebook_book_history'     // Step 7: books-only history
};

// Default Demo User Account
const DEFAULT_DEMO_USER = {
  name: 'Om Dhamale',
  email: 'om.dhamale@cinebook.ai',
  password: 'password123',
  dob: '2004-01-01',
  language: 'English',
  movieGenre: 'Action',
  bookGenre: 'Fantasy',
  mood: 'Excited',
  tag: 'Movie & Book Lover'
};

// Embedded Datasets (ensures instant availability even under local file:// protocol)
const FALLBACK_MOVIES = [
  {
    id: "m1",
    title: "Interstellar",
    year: 2014,
    rating: 8.6,
    type: "Movie",
    genre: "Sci-Fi",
    secondaryGenre: "Adventure",
    duration: "Long",
    language: "English",
    mood: "Excited",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival as Earth faces catastrophic famine.",
    aiRuleMatch: {
      genreMatched: "Sci-Fi",
      moodMatched: "Excited",
      languageMatched: "English",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Sci-Fi AND Mood = Excited THEN Recommend Sci-Fi movies."
    }
  },
  {
    id: "m2",
    title: "Inception",
    year: 2010,
    rating: 8.8,
    type: "Movie",
    genre: "Sci-Fi",
    secondaryGenre: "Thriller",
    duration: "Long",
    language: "English",
    mood: "Thoughtful",
    poster: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    aiRuleMatch: {
      genreMatched: "Sci-Fi",
      moodMatched: "Thoughtful",
      languageMatched: "English",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Sci-Fi AND Mood = Thoughtful THEN Recommend Sci-Fi thrillers."
    }
  },
  {
    id: "m3",
    title: "The Dark Knight",
    year: 2008,
    rating: 9.0,
    type: "Movie",
    genre: "Action",
    secondaryGenre: "Crime",
    duration: "Long",
    language: "English",
    mood: "Intense",
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
    aiRuleMatch: {
      genreMatched: "Action",
      moodMatched: "Intense",
      languageMatched: "English",
      ratingMatched: "9+",
      ruleFired: "IF Genre = Action AND Rating >= 9.0 THEN Recommend Top Action masterpieces."
    }
  },
  {
    id: "m4",
    title: "Avengers: Endgame",
    year: 2019,
    rating: 8.4,
    type: "Movie",
    genre: "Action",
    secondaryGenre: "Sci-Fi",
    duration: "Long",
    language: "English",
    mood: "Excited",
    poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    description: "After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more to reverse Thanos' actions.",
    aiRuleMatch: {
      genreMatched: "Action",
      moodMatched: "Excited",
      languageMatched: "English",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Action AND Mood = Excited THEN Recommend Superhero epics."
    }
  },
  {
    id: "m5",
    title: "3 Idiots",
    year: 2009,
    rating: 8.4,
    type: "Movie",
    genre: "Comedy",
    secondaryGenre: "Drama",
    duration: "Long",
    language: "Hindi",
    mood: "Happy",
    poster: "https://image.tmdb.org/t/p/w500/7c47s7b6U2l4U7kHhYIu09q5hO6.jpg",
    description: "Two friends embark on a quest for a lost buddy. On this journey, they reminisce about their college days and their friend who inspired them to think differently.",
    aiRuleMatch: {
      genreMatched: "Comedy",
      moodMatched: "Happy",
      languageMatched: "Hindi",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Comedy AND Mood = Happy THEN Recommend Uplifting college dramas."
    }
  },
  {
    id: "m6",
    title: "Zindagi Na Milegi Dobara",
    year: 2011,
    rating: 8.2,
    type: "Movie",
    genre: "Drama",
    secondaryGenre: "Adventure",
    duration: "Long",
    language: "Hindi",
    mood: "Relaxed",
    poster: "https://image.tmdb.org/t/p/w500/9s9Q53tq18L2X4M7XoQv5yR6A2L.jpg",
    description: "Three friends decide to turn their fantasy vacation into reality after one of their friends gets engaged, discovering deep truths about their lives and fears.",
    aiRuleMatch: {
      genreMatched: "Drama",
      moodMatched: "Relaxed",
      languageMatched: "Hindi",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Drama AND Language = Hindi THEN Recommend Road trip journey dramas."
    }
  },
  {
    id: "m7",
    title: "Dangal",
    year: 2016,
    rating: 8.4,
    type: "Movie",
    genre: "Drama",
    secondaryGenre: "Action",
    duration: "Long",
    language: "Hindi",
    mood: "Inspired",
    poster: "https://image.tmdb.org/t/p/w500/4cpmb1oT55R5U6YI0kK8XGqN5oF.jpg",
    description: "Former wrestler Mahavir Singh Phogat and his two wrestler daughters struggle towards glory at the Commonwealth Games in the face of societal oppression.",
    aiRuleMatch: {
      genreMatched: "Drama",
      moodMatched: "Inspired",
      languageMatched: "Hindi",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Drama AND Mood = Inspired THEN Recommend Motivational sports biopics."
    }
  },
  {
    id: "m8",
    title: "KGF Chapter 1",
    year: 2018,
    rating: 8.2,
    type: "Movie",
    genre: "Action",
    secondaryGenre: "Drama",
    duration: "Long",
    language: "Hindi",
    mood: "Intense",
    poster: "https://image.tmdb.org/t/p/w500/i9nO0V2gqT9qM0R5L8Y5V8R7o6l.jpg",
    description: "In the 1970s, a fierce rebel rises against brutal oppression and becomes the symbol of hope to legions of downtrodden people in the Kolar Gold Fields.",
    aiRuleMatch: {
      genreMatched: "Action",
      moodMatched: "Intense",
      languageMatched: "Hindi",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Action AND Mood = Intense THEN Recommend Mass action blockbusters."
    }
  },
  {
    id: "m9",
    title: "RRR",
    year: 2022,
    rating: 8.4,
    type: "Movie",
    genre: "Action",
    secondaryGenre: "Drama",
    duration: "Long",
    language: "Hindi",
    mood: "Excited",
    poster: "https://image.tmdb.org/t/p/w500/wE0noFU9ErUsh2b1iW9m31fBwE4.jpg",
    description: "A fearless revolutionary and an officer in the British force, who once were friends, unite against a common tyrant in 1920s India.",
    aiRuleMatch: {
      genreMatched: "Action",
      moodMatched: "Excited",
      languageMatched: "Hindi",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Action AND Mood = Excited THEN Recommend High-octane historical epics."
    }
  },
  {
    id: "m10",
    title: "Taare Zameen Par",
    year: 2007,
    rating: 8.3,
    type: "Movie",
    genre: "Drama",
    secondaryGenre: "Family",
    duration: "Long",
    language: "Hindi",
    mood: "Romantic",
    poster: "https://image.tmdb.org/t/p/w500/8lT5r5s8lYwQv4T1W2K3Z4k5V6b.jpg",
    description: "An eight-year-old boy is thought to be a lazy trouble-maker, until the new art teacher has the patience and compassion to discover the real problem behind his struggles.",
    aiRuleMatch: {
      genreMatched: "Drama",
      moodMatched: "Romantic",
      languageMatched: "Hindi",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Drama AND Language = Hindi THEN Recommend Heartfelt inspirational dramas."
    }
  },
  {
    id: "m11",
    title: "Drishyam",
    year: 2015,
    rating: 8.3,
    type: "Movie",
    genre: "Thriller",
    secondaryGenre: "Mystery",
    duration: "Long",
    language: "Hindi",
    mood: "Curious",
    poster: "https://image.tmdb.org/t/p/w500/p4vdD0Jm1D3M2j5X69r1gJt6A6.jpg",
    description: "Desperate measures are taken by a man who tries to save his family from the dark side of the law after they commit an unexpected crime.",
    aiRuleMatch: {
      genreMatched: "Thriller",
      moodMatched: "Curious",
      languageMatched: "Hindi",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Thriller AND Mood = Curious THEN Recommend Gripping investigative mysteries."
    }
  },
  {
    id: "m12",
    title: "Baahubali 2: The Conclusion",
    year: 2017,
    rating: 8.2,
    type: "Movie",
    genre: "Action",
    secondaryGenre: "Adventure",
    duration: "Long",
    language: "Hindi",
    mood: "Excited",
    poster: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
    description: "When Shiva, the son of Bahubali, learns about his heritage, he begins to look for answers while plotting revenge against the tyrannical king Bhallaladeva.",
    aiRuleMatch: {
      genreMatched: "Action",
      moodMatched: "Excited",
      languageMatched: "Hindi",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Action AND Mood = Excited THEN Recommend Grand cinematic kingdom sagas."
    }
  },
  {
    id: "m13",
    title: "Spider-Man: No Way Home",
    year: 2021,
    rating: 8.2,
    type: "Movie",
    genre: "Action",
    secondaryGenre: "Sci-Fi",
    duration: "Long",
    language: "English",
    mood: "Excited",
    poster: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    description: "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds appear.",
    aiRuleMatch: {
      genreMatched: "Action",
      moodMatched: "Excited",
      languageMatched: "English",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Action AND Mood = Excited THEN Recommend Multiverse superhero adventures."
    }
  },
  {
    id: "m14",
    title: "The Matrix",
    year: 1999,
    rating: 8.7,
    type: "Movie",
    genre: "Sci-Fi",
    secondaryGenre: "Action",
    duration: "Long",
    language: "English",
    mood: "Curious",
    poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    description: "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth — the life he knows is the elaborate deception of an evil cyber-intelligence.",
    aiRuleMatch: {
      genreMatched: "Sci-Fi",
      moodMatched: "Curious",
      languageMatched: "English",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Sci-Fi AND Mood = Curious THEN Recommend Mind-bending cyberpunk thrillers."
    }
  },
  {
    id: "m15",
    title: "Jurassic Park",
    year: 1993,
    rating: 8.2,
    type: "Movie",
    genre: "Adventure",
    secondaryGenre: "Sci-Fi",
    duration: "Medium",
    language: "English",
    mood: "Excited",
    poster: "https://image.tmdb.org/t/p/w500/oU7Oq2kFAAlGqbU4VoAE36g4ho1.jpg",
    description: "A pragmatic paleontologist touring an almost complete theme park on an island is tasked with protecting a couple of kids after a power failure causes cloned dinosaurs to run loose.",
    aiRuleMatch: {
      genreMatched: "Adventure",
      moodMatched: "Excited",
      languageMatched: "English",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Adventure AND Mood = Excited THEN Recommend Classic prehistoric creature adventures."
    }
  },
  {
    id: "m16",
    title: "Titanic",
    year: 1997,
    rating: 7.9,
    type: "Movie",
    genre: "Romance",
    secondaryGenre: "Drama",
    duration: "Long",
    language: "English",
    mood: "Romantic",
    poster: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
    description: "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.",
    aiRuleMatch: {
      genreMatched: "Romance",
      moodMatched: "Romantic",
      languageMatched: "English",
      ratingMatched: "7+",
      ruleFired: "IF Genre = Romance AND Mood = Romantic THEN Recommend Epic historical romances."
    }
  },
  {
    id: "m17",
    title: "The Shawshank Redemption",
    year: 1994,
    rating: 9.3,
    type: "Movie",
    genre: "Drama",
    secondaryGenre: "Crime",
    duration: "Long",
    language: "English",
    mood: "Serious",
    poster: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    aiRuleMatch: {
      genreMatched: "Drama",
      moodMatched: "Serious",
      languageMatched: "English",
      ratingMatched: "9+",
      ruleFired: "IF Genre = Drama AND Rating >= 9.0 THEN Recommend Legendary acclaimed prison dramas."
    }
  },
  {
    id: "m18",
    title: "Forrest Gump",
    year: 1994,
    rating: 8.8,
    type: "Movie",
    genre: "Drama",
    secondaryGenre: "Romance",
    duration: "Long",
    language: "English",
    mood: "Happy",
    poster: "https://image.tmdb.org/t/p/w500/arw2VCBveWOVZr6pxd9XTd1TdQa.jpg",
    description: "The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold through the perspective of an Alabama man with an IQ of 75.",
    aiRuleMatch: {
      genreMatched: "Drama",
      moodMatched: "Happy",
      languageMatched: "English",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Drama AND Mood = Happy THEN Recommend Uplifting life journey epics."
    }
  },
  {
    id: "m19",
    title: "Harry Potter and the Sorcerer's Stone",
    year: 2001,
    rating: 7.6,
    type: "Movie",
    genre: "Adventure",
    secondaryGenre: "Fantasy",
    duration: "Long",
    language: "English",
    mood: "Curious",
    poster: "https://image.tmdb.org/t/p/w500/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg",
    description: "An orphaned boy enrolls in a school of wizardry, where he learns the truth about himself, his family and the terrible evil that haunts the magical world.",
    aiRuleMatch: {
      genreMatched: "Adventure",
      moodMatched: "Curious",
      languageMatched: "English",
      ratingMatched: "7+",
      ruleFired: "IF Genre = Adventure AND Mood = Curious THEN Recommend Magical wizarding fantasy epics."
    }
  }
];

const FALLBACK_BOOKS = [
  {
    id: "b1",
    title: "The Alchemist",
    author: "Paulo Coelho",
    year: 1988,
    pages: 208,
    rating: 8.7,
    type: "Book",
    genre: "Adventure",
    secondaryGenre: "Philosophical",
    duration: "Short",
    language: "English",
    mood: "Inspired",
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1654371463i/18144590.jpg",
    description: "A fable about following your dream. It tells the magical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure and discovers the true richness of life.",
    aiRuleMatch: {
      genreMatched: "Adventure",
      moodMatched: "Inspired",
      languageMatched: "English",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Adventure AND Mood = Inspired THEN Recommend Transformational journey books."
    }
  },
  {
    id: "b2",
    title: "Atomic Habits",
    author: "James Clear",
    year: 2018,
    pages: 320,
    rating: 8.9,
    type: "Book",
    genre: "Self-Help",
    secondaryGenre: "Psychology",
    duration: "Medium",
    language: "English",
    mood: "Motivated",
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655988385i/40121378.jpg",
    description: "An easy and proven way to build good habits and break bad ones. Learn how tiny changes can lead to remarkable personal and career breakthroughs by compounding small improvements every day.",
    aiRuleMatch: {
      genreMatched: "Self-Help",
      moodMatched: "Motivated",
      languageMatched: "English",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Self-Help AND Mood = Motivated THEN Recommend Habit mastery books."
    }
  },
  {
    id: "b3",
    title: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    year: 1997,
    pages: 309,
    rating: 9.1,
    type: "Book",
    genre: "Fantasy",
    secondaryGenre: "Adventure",
    duration: "Medium",
    language: "English",
    mood: "Excited",
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1474154022i/3.jpg",
    description: "Harry Potter discovers on his eleventh birthday that he is an orphaned wizard with a mysterious lightning scar, and is invited to attend Hogwarts School of Witchcraft and Wizardry.",
    aiRuleMatch: {
      genreMatched: "Fantasy",
      moodMatched: "Excited",
      languageMatched: "English",
      ratingMatched: "9+",
      ruleFired: "IF Genre = Fantasy AND Rating >= 9.0 THEN Recommend Legendary wizarding series."
    }
  },
  {
    id: "b4",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    year: 2011,
    pages: 443,
    rating: 8.6,
    type: "Book",
    genre: "History",
    secondaryGenre: "Science",
    duration: "Long",
    language: "English",
    mood: "Thoughtful",
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1700360786i/23692271.jpg",
    description: "Explore the history of humanity from early humans through cognitive, agricultural, and scientific revolutions, exploring how biology and history define us and our modern world.",
    aiRuleMatch: {
      genreMatched: "History",
      moodMatched: "Thoughtful",
      languageMatched: "English",
      ratingMatched: "8+",
      ruleFired: "IF Genre = History AND Mood = Thoughtful THEN Recommend Global anthropology treatises."
    }
  },
  {
    id: "b5",
    title: "Rich Dad Poor Dad",
    author: "Robert Kiyosaki",
    year: 1997,
    pages: 207,
    rating: 8.2,
    type: "Book",
    genre: "Finance",
    secondaryGenre: "Self-Help",
    duration: "Medium",
    language: "English",
    mood: "Curious",
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388211242i/69571.jpg",
    description: "What the rich teach their kids about money that the poor and middle class do not. Debunks the myth that you need to earn a high income to be rich and reveals the financial secrets of the wealthy.",
    aiRuleMatch: {
      genreMatched: "Finance",
      moodMatched: "Curious",
      languageMatched: "English",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Finance AND Mood = Curious THEN Recommend Wealth mindset guides."
    }
  },
  {
    id: "b6",
    title: "Ikigai: The Japanese Secret",
    author: "Héctor García",
    year: 2016,
    pages: 194,
    rating: 8.3,
    type: "Book",
    genre: "Self-Help",
    secondaryGenre: "Philosophy",
    duration: "Short",
    language: "English",
    mood: "Peaceful",
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1698305047i/34085268.jpg",
    description: "Discover the Japanese philosophy of Ikigai — the convergence of passion, mission, vocation, and profession that brings deep satisfaction and longevity to everyday life.",
    aiRuleMatch: {
      genreMatched: "Self-Help",
      moodMatched: "Peaceful",
      languageMatched: "English",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Self-Help AND Mood = Peaceful THEN Recommend Mindful wellness philosophies."
    }
  },
  {
    id: "b7",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    year: 2020,
    pages: 256,
    rating: 8.8,
    type: "Book",
    genre: "Finance",
    secondaryGenre: "Psychology",
    duration: "Medium",
    language: "English",
    mood: "Thoughtful",
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1581527774i/41881472.jpg",
    description: "Timeless lessons on wealth, greed, and happiness. Doing well with money isn't necessarily about what you know — it's about how you behave with it.",
    aiRuleMatch: {
      genreMatched: "Finance",
      moodMatched: "Thoughtful",
      languageMatched: "English",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Finance AND Mood = Thoughtful THEN Recommend Behavioral economics reads."
    }
  },
  {
    id: "b8",
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    year: 1988,
    pages: 212,
    rating: 8.5,
    type: "Book",
    genre: "Science",
    secondaryGenre: "Cosmology",
    duration: "Medium",
    language: "English",
    mood: "Curious",
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1333578746i/3869.jpg",
    description: "A landmark volume in science writing by one of the great minds of our time, exploring profound questions about the origin, nature, and ultimate fate of the universe.",
    aiRuleMatch: {
      genreMatched: "Science",
      moodMatched: "Curious",
      languageMatched: "English",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Science AND Mood = Curious THEN Recommend Astrophysics classics."
    }
  },
  {
    id: "b9",
    title: "The 5 AM Club",
    author: "Robin Sharma",
    year: 2018,
    pages: 336,
    rating: 8.0,
    type: "Book",
    genre: "Self-Help",
    secondaryGenre: "Productivity",
    duration: "Medium",
    language: "English",
    mood: "Motivated",
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1545648877i/37503112.jpg",
    description: "Own your morning, elevate your life. A revolutionary morning routine that has helped clients maximize productivity, activate their best health and bulletproof their daily serenity.",
    aiRuleMatch: {
      genreMatched: "Self-Help",
      moodMatched: "Motivated",
      languageMatched: "English",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Self-Help AND Mood = Motivated THEN Recommend Morning routine blueprints."
    }
  },
  {
    id: "b10",
    title: "Wings of Fire",
    author: "A.P.J. Abdul Kalam",
    year: 1999,
    pages: 204,
    rating: 9.0,
    type: "Book",
    genre: "Biography",
    secondaryGenre: "Inspiration",
    duration: "Medium",
    language: "English",
    mood: "Inspired",
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1588286863i/634583.jpg",
    description: "An autobiography of the Missile Man of India and former President, chronicling his early life and remarkable career leading India's space research and missile development programs.",
    aiRuleMatch: {
      genreMatched: "Biography",
      moodMatched: "Inspired",
      languageMatched: "English",
      ratingMatched: "9+",
      ruleFired: "IF Genre = Biography AND Rating >= 9.0 THEN Recommend Iconic Indian autobiographies."
    }
  },
  {
    id: "b11",
    title: "Think and Grow Rich",
    author: "Napoleon Hill",
    year: 1937,
    pages: 238,
    rating: 8.4,
    type: "Book",
    genre: "Self-Help",
    secondaryGenre: "Finance",
    duration: "Medium",
    language: "English",
    mood: "Motivated",
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1463241782i/30186948.jpg",
    description: "For over 80 years, this classic has helped millions achieve extraordinary wealth and success by distilling the wisdom of over 500 incredibly successful people into actionable principles.",
    aiRuleMatch: {
      genreMatched: "Self-Help",
      moodMatched: "Motivated",
      languageMatched: "English",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Self-Help AND Mood = Motivated THEN Recommend Success mindset classics."
    }
  },
  {
    id: "b12",
    title: "The Power of Now",
    author: "Eckhart Tolle",
    year: 1997,
    pages: 236,
    rating: 8.4,
    type: "Book",
    genre: "Self-Help",
    secondaryGenre: "Spirituality",
    duration: "Short",
    language: "English",
    mood: "Peaceful",
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1386925471i/6708.jpg",
    description: "A guide to spiritual enlightenment — Tolle shows that our greatest obstacle to happiness is our own mind's attachment to the past and anxiety about the future.",
    aiRuleMatch: {
      genreMatched: "Self-Help",
      moodMatched: "Peaceful",
      languageMatched: "English",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Self-Help AND Mood = Peaceful THEN Recommend Mindfulness and spiritual guides."
    }
  },
  {
    id: "b13",
    title: "Deep Work",
    author: "Cal Newport",
    year: 2016,
    pages: 296,
    rating: 8.6,
    type: "Book",
    genre: "Self-Help",
    secondaryGenre: "Productivity",
    duration: "Medium",
    language: "English",
    mood: "Thoughtful",
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1447957962i/25744928.jpg",
    description: "Rules for focused success in a distracted world. The ability to focus without distraction on cognitively demanding tasks is becoming increasingly rare and increasingly valuable.",
    aiRuleMatch: {
      genreMatched: "Self-Help",
      moodMatched: "Thoughtful",
      languageMatched: "English",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Self-Help AND Mood = Thoughtful THEN Recommend Deep productivity mastery."
    }
  },
  {
    id: "b14",
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen Covey",
    year: 1989,
    pages: 381,
    rating: 8.5,
    type: "Book",
    genre: "Self-Help",
    secondaryGenre: "Leadership",
    duration: "Long",
    language: "English",
    mood: "Motivated",
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1421842784i/36072.jpg",
    description: "A holistic, integrated, principle-centred approach for solving personal and professional problems with timeless lessons for a life of fairness, integrity, honesty, and human dignity.",
    aiRuleMatch: {
      genreMatched: "Self-Help",
      moodMatched: "Motivated",
      languageMatched: "English",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Self-Help AND Mood = Motivated THEN Recommend Leadership effectiveness guides."
    }
  },
  {
    id: "b15",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    year: 1937,
    pages: 310,
    rating: 9.0,
    type: "Book",
    genre: "Fantasy",
    secondaryGenre: "Adventure",
    duration: "Medium",
    language: "English",
    mood: "Excited",
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg",
    description: "A reluctant hero, a terrible dragon, and the ultimate quest. Bilbo Baggins is a hobbit who enjoys a comfortable life until a wizard and thirteen dwarves arrive at his door.",
    aiRuleMatch: {
      genreMatched: "Fantasy",
      moodMatched: "Excited",
      languageMatched: "English",
      ratingMatched: "9+",
      ruleFired: "IF Genre = Fantasy AND Mood = Excited THEN Recommend Classic epic fantasy quests."
    }
  },
  {
    id: "b16",
    title: "1984",
    author: "George Orwell",
    year: 1949,
    pages: 328,
    rating: 9.2,
    type: "Book",
    genre: "Fiction",
    secondaryGenre: "Dystopia",
    duration: "Medium",
    language: "English",
    mood: "Thoughtful",
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327144697i/3744438.jpg",
    description: "A dystopian social science fiction novel set in a totalitarian society where Big Brother watches every citizen. Winston Smith dares to think for himself in a world where independent thought is a crime.",
    aiRuleMatch: {
      genreMatched: "Fiction",
      moodMatched: "Thoughtful",
      languageMatched: "English",
      ratingMatched: "9+",
      ruleFired: "IF Genre = Fiction AND Rating >= 9.0 THEN Recommend Landmark dystopian fiction."
    }
  },
  {
    id: "b17",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    year: 1925,
    pages: 180,
    rating: 8.1,
    type: "Book",
    genre: "Fiction",
    secondaryGenre: "Romance",
    duration: "Short",
    language: "English",
    mood: "Romantic",
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1490528560i/4671.jpg",
    description: "A portrait of the Jazz Age in all of its decadence and excess. Jay Gatsby's doomed love for the beautiful Daisy Buchanan shapes this timeless American novel about wealth and illusion.",
    aiRuleMatch: {
      genreMatched: "Fiction",
      moodMatched: "Romantic",
      languageMatched: "English",
      ratingMatched: "8+",
      ruleFired: "IF Genre = Fiction AND Mood = Romantic THEN Recommend Classic American literature."
    }
  },
  {
    id: "b18",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    year: 1960,
    pages: 281,
    rating: 9.0,
    type: "Book",
    genre: "Fiction",
    secondaryGenre: "Drama",
    duration: "Medium",
    language: "English",
    mood: "Thoughtful",
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690i/2657.jpg",
    description: "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it. A masterpiece about racial injustice, moral growth, and human compassion.",
    aiRuleMatch: {
      genreMatched: "Fiction",
      moodMatched: "Thoughtful",
      languageMatched: "English",
      ratingMatched: "9+",
      ruleFired: "IF Genre = Fiction AND Mood = Thoughtful THEN Recommend Essential American classics."
    }
  },
  {
    id: "b19",
    title: "The Kite Runner",
    author: "Khaled Hosseini",
    year: 2003,
    pages: 371,
    rating: 9.0,
    type: "Book",
    genre: "Fiction",
    secondaryGenre: "Drama",
    duration: "Long",
    language: "English",
    mood: "Inspired",
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1579036753i/77203.jpg",
    description: "A sweeping story of family, friendship, betrayal, and redemption set against the backdrop of Afghanistan's tumultuous history from the 1970s through the brutal Taliban era.",
    aiRuleMatch: {
      genreMatched: "Fiction",
      moodMatched: "Inspired",
      languageMatched: "English",
      ratingMatched: "9+",
      ruleFired: "IF Genre = Fiction AND Mood = Inspired THEN Recommend Powerful redemption stories."
    }
  },
  {
    id: "b20",
    title: "The Secret",
    author: "Rhonda Byrne",
    year: 2006,
    pages: 198,
    rating: 7.9,
    type: "Book",
    genre: "Self-Help",
    secondaryGenre: "Spirituality",
    duration: "Short",
    language: "English",
    mood: "Motivated",
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348257017i/52529.jpg",
    description: "The Secret reveals the most powerful law in the universe — the law of attraction. By understanding this secret you can bring anything you desire into your life.",
    aiRuleMatch: {
      genreMatched: "Self-Help",
      moodMatched: "Motivated",
      languageMatched: "English",
      ratingMatched: "7+",
      ruleFired: "IF Genre = Self-Help AND Mood = Motivated THEN Recommend Law of attraction books."
    }
  }
];

// In-Memory Catalog State
let gMoviesCatalog = [...FALLBACK_MOVIES];
let gBooksCatalog = [...FALLBACK_BOOKS];
let gActiveMediaType = 'movies';

// Movie page control init flag (reset on navigation)
let _movieControlsInited = false;

// Book page control init flag (reset on navigation)
let _bookControlsInited = false;

// Application Initialization
document.addEventListener('DOMContentLoaded', () => {
  loadDataCatalogs();
  initAuthSystem();
  initMobileNavigation();
  initSidebarActiveNav();
  initHomePage();
  initPopularSection();
  initModalInteractions();
  updateSidebarUserProfile();
  updateWishlistBadges();
});

/**
 * Load movies.json and books.json (with silent fallback to embedded data)
 */
async function loadDataCatalogs() {
  try {
    const mRes = await fetch('movies.json');
    if (mRes.ok) {
      const data = await mRes.json();
      if (Array.isArray(data) && data.length > 0) gMoviesCatalog = data;
    }
  } catch (e) {
    // Keep fallback catalog
  }

  try {
    const bRes = await fetch('books.json');
    if (bRes.ok) {
      const data = await bRes.json();
      if (Array.isArray(data) && data.length > 0) gBooksCatalog = data;
    }
  } catch (e) {
    // Keep fallback catalog
  }

  // Refresh popular section once catalogs are loaded
  renderPopularCards('all');
}

/**
 * --------------------------------------------------------------------------
 * 1. Authentication System & User Session Management
 * --------------------------------------------------------------------------
 */
function initAuthSystem() {
  const authView = document.getElementById('authView');
  const mainAppShell = document.getElementById('mainAppShell');
  const loginCardContainer = document.getElementById('loginCardContainer');
  const registerCardContainer = document.getElementById('registerCardContainer');

  const loginForm = document.getElementById('loginForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const emailWrapper = document.getElementById('emailInputWrapper');
  const passwordWrapper = document.getElementById('passwordInputWrapper');
  const emailFeedback = document.getElementById('emailFeedback');
  const passwordFeedback = document.getElementById('passwordFeedback');

  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const togglePasswordIcon = document.getElementById('togglePasswordIcon');
  const rememberMeCheckbox = document.getElementById('rememberMeCheckbox');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const btnFillDemo = document.getElementById('btnFillDemo');

  const toRegisterLink = document.getElementById('toRegisterLink');
  const toLoginLink = document.getElementById('toLoginLink');
  const registerForm = document.getElementById('registerForm');
  const logoutBtn = document.getElementById('logoutBtn');

  // Seed default registered user if none exist
  let registeredUsers = getRegisteredUsers();
  if (registeredUsers.length === 0) {
    registeredUsers = [DEFAULT_DEMO_USER];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(registeredUsers));
  }

  // Check existing session
  checkActiveSession();

  function checkActiveSession() {
    const session = getActiveSession();
    if (session) {
      showMainApp(session);
    } else {
      showAuthView();
    }
  }

  function getActiveSession() {
    const local = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (local) {
      try { return JSON.parse(local); } catch (e) { return null; }
    }
    const sess = sessionStorage.getItem(STORAGE_KEYS.SESSION);
    if (sess) {
      try { return JSON.parse(sess); } catch (e) { return null; }
    }
    return null;
  }

  function getRegisteredUsers() {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { return []; }
    }
    return [];
  }

  function showMainApp(user) {
    if (authView) authView.style.display = 'none';
    if (mainAppShell) mainAppShell.style.display = 'block';

    // Update Profile display in Sidebar
    const profileNameEl = document.querySelector('.sidebar-profile .profile-name');
    if (profileNameEl && user.name) {
      profileNameEl.textContent = user.name;
    }

    const profileTagEl = document.querySelector('.sidebar-profile .profile-tag');
    if (profileTagEl) {
      if (user.movieGenre && user.bookGenre) {
        profileTagEl.textContent = `${user.movieGenre} & ${user.bookGenre} Lover`;
      } else if (user.movieGenre) {
        profileTagEl.textContent = `${user.movieGenre} Fan`;
      } else {
        profileTagEl.textContent = 'Movie & Book Lover';
      }
    }

    // Dynamic greeting on Home Hero Header
    const userGreetingText = document.getElementById('userGreetingText');
    if (userGreetingText && user.name) {
      const firstName = user.name.trim().split(' ')[0];
      userGreetingText.textContent = `Welcome back, ${firstName} 👋`;
    }

    // Pre-sync registered preferences
    syncHomePreferences(user);
    updateSidebarUserProfile();
    updateWishlistBadges();
    renderPopularCards('all');
  }

  function showAuthView() {
    if (mainAppShell) mainAppShell.style.display = 'none';
    if (authView) authView.style.display = 'flex';
    if (loginCardContainer) loginCardContainer.style.display = 'grid';
    if (registerCardContainer) registerCardContainer.style.display = 'none';
  }

  // Password Visibility Toggle for Login
  if (togglePasswordBtn && loginPassword && togglePasswordIcon) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = loginPassword.type === 'password';
      loginPassword.type = isPassword ? 'text' : 'password';
      togglePasswordIcon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    });
  }

  // Clear errors on typing
  if (loginEmail && emailWrapper && emailFeedback) {
    loginEmail.addEventListener('input', () => {
      emailWrapper.classList.remove('is-invalid');
      emailFeedback.textContent = '';
    });
  }

  if (loginPassword && passwordWrapper && passwordFeedback) {
    loginPassword.addEventListener('input', () => {
      passwordWrapper.classList.remove('is-invalid');
      passwordFeedback.textContent = '';
    });
  }

  // Auto-Fill Demo Credentials
  if (btnFillDemo && loginEmail && loginPassword) {
    btnFillDemo.addEventListener('click', () => {
      loginEmail.value = DEFAULT_DEMO_USER.email;
      loginPassword.value = DEFAULT_DEMO_USER.password;
      if (emailWrapper) emailWrapper.classList.remove('is-invalid');
      if (passwordWrapper) passwordWrapper.classList.remove('is-invalid');
      if (emailFeedback) emailFeedback.textContent = '';
      if (passwordFeedback) passwordFeedback.textContent = '';
      showToast('Demo credentials loaded! Click Login to continue.', 'info');
    });
  }

  // Switch to Register View
  if (toRegisterLink && loginCardContainer && registerCardContainer) {
    toRegisterLink.addEventListener('click', (e) => {
      e.preventDefault();
      loginCardContainer.style.display = 'none';
      registerCardContainer.style.display = 'grid';
    });
  }

  // Switch to Login View
  if (toLoginLink && loginCardContainer && registerCardContainer) {
    toLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      registerCardContainer.style.display = 'none';
      loginCardContainer.style.display = 'grid';
    });
  }

  // Forgot Password Simulation
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      const emailVal = loginEmail ? loginEmail.value.trim() : '';
      if (emailVal && isValidEmail(emailVal)) {
        showToast(`Password reset link sent to ${emailVal} (Demo mode).`, 'info');
      } else {
        showToast('Please enter your email address to receive reset instructions.', 'error');
        if (loginEmail) loginEmail.focus();
      }
    });
  }

  // Login Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = loginEmail.value.trim();
      const password = loginPassword.value.trim();
      const rememberMe = rememberMeCheckbox ? rememberMeCheckbox.checked : false;

      let isValid = true;

      if (!email) {
        showInputError(emailWrapper, emailFeedback, 'Email address is required.');
        isValid = false;
      } else if (!isValidEmail(email)) {
        showInputError(emailWrapper, emailFeedback, 'Please enter a valid email address.');
        isValid = false;
      } else {
        clearInputError(emailWrapper, emailFeedback);
      }

      if (!password) {
        showInputError(passwordWrapper, passwordFeedback, 'Password is required.');
        isValid = false;
      } else if (password.length < 6) {
        showInputError(passwordWrapper, passwordFeedback, 'Password must be at least 6 characters.');
        isValid = false;
      } else {
        clearInputError(passwordWrapper, passwordFeedback);
      }

      if (!isValid) return;

      const users = getRegisteredUsers();
      const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (matchedUser) {
        if (matchedUser.password !== password) {
          showInputError(passwordWrapper, passwordFeedback, 'Incorrect password. Please try again.');
          showToast('Invalid credentials. Please verify your password.', 'error');
          return;
        }
        loginSuccess(matchedUser, rememberMe);
      } else {
        // Fallback demo user creation
        const newUser = {
          name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          email: email,
          password: password,
          dob: '2000-01-01',
          language: 'English',
          movieGenre: 'Action',
          bookGenre: 'Adventure',
          mood: 'Excited',
          tag: 'CineBook AI Member'
        };
        users.push(newUser);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        loginSuccess(newUser, rememberMe);
      }
    });
  }

  function loginSuccess(user, remember) {
    const sessionData = {
      name: user.name,
      email: user.email,
      language: user.language || 'English',
      dob: user.dob || '',
      movieGenre: user.movieGenre || 'Action',
      bookGenre: user.bookGenre || 'Fantasy',
      mood: user.mood || 'Excited',
      isLoggedIn: true,
      loginTime: new Date().toISOString()
    };

    if (remember) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
    } else {
      sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
    }

    showToast(`Welcome back, ${user.name}! Accessing CineBook AI...`, 'success');
    setTimeout(() => {
      showMainApp(sessionData);
      navigateToView('home');
    }, 500);
  }

  // Register Password Visibility Toggles
  const toggleRegPasswordBtn = document.getElementById('toggleRegPasswordBtn');
  const toggleRegPasswordIcon = document.getElementById('toggleRegPasswordIcon');
  const regPassword = document.getElementById('regPassword');

  if (toggleRegPasswordBtn && regPassword && toggleRegPasswordIcon) {
    toggleRegPasswordBtn.addEventListener('click', () => {
      const isPassword = regPassword.type === 'password';
      regPassword.type = isPassword ? 'text' : 'password';
      toggleRegPasswordIcon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    });
  }

  const toggleRegConfirmPasswordBtn = document.getElementById('toggleRegConfirmPasswordBtn');
  const toggleRegConfirmPasswordIcon = document.getElementById('toggleRegConfirmPasswordIcon');
  const regConfirmPassword = document.getElementById('regConfirmPassword');

  if (toggleRegConfirmPasswordBtn && regConfirmPassword && toggleRegConfirmPasswordIcon) {
    toggleRegConfirmPasswordBtn.addEventListener('click', () => {
      const isPassword = regConfirmPassword.type === 'password';
      regConfirmPassword.type = isPassword ? 'text' : 'password';
      toggleRegConfirmPasswordIcon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    });
  }

  // Live input error clearing for registration fields
  const regFieldsMap = [
    { input: 'regName', wrapper: 'regNameWrapper', feedback: 'regNameFeedback', event: 'input' },
    { input: 'regEmail', wrapper: 'regEmailWrapper', feedback: 'regEmailFeedback', event: 'input' },
    { input: 'regPassword', wrapper: 'regPasswordWrapper', feedback: 'regPasswordFeedback', event: 'input' },
    { input: 'regConfirmPassword', wrapper: 'regConfirmPasswordWrapper', feedback: 'regConfirmPasswordFeedback', event: 'input' },
    { input: 'regDob', wrapper: 'regDobWrapper', feedback: 'regDobFeedback', event: 'change' },
    { input: 'regLanguage', wrapper: 'regLangWrapper', feedback: 'regLangFeedback', event: 'change' },
    { input: 'regMovieGenre', wrapper: 'regMovieGenreWrapper', feedback: 'regMovieGenreFeedback', event: 'change' },
    { input: 'regBookGenre', wrapper: 'regBookGenreWrapper', feedback: 'regBookGenreFeedback', event: 'change' },
    { input: 'regMood', wrapper: 'regMoodWrapper', feedback: 'regMoodFeedback', event: 'change' }
  ];

  regFieldsMap.forEach(item => {
    const el = document.getElementById(item.input);
    const wrap = document.getElementById(item.wrapper);
    const fb = document.getElementById(item.feedback);
    if (el) {
      el.addEventListener(item.event, () => {
        if (wrap) wrap.classList.remove('is-invalid');
        if (fb) fb.textContent = '';
      });
    }
  });

  // Register Form Submission (9-field AI Profile)
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('regName');
      const emailInput = document.getElementById('regEmail');
      const passInput = document.getElementById('regPassword');
      const confirmPassInput = document.getElementById('regConfirmPassword');
      const dobInput = document.getElementById('regDob');
      const langInput = document.getElementById('regLanguage');
      const movieGenreInput = document.getElementById('regMovieGenre');
      const bookGenreInput = document.getElementById('regBookGenre');
      const moodInput = document.getElementById('regMood');

      const nameWrapper = document.getElementById('regNameWrapper');
      const emailWrapper = document.getElementById('regEmailWrapper');
      const passWrapper = document.getElementById('regPasswordWrapper');
      const confirmPassWrapper = document.getElementById('regConfirmPasswordWrapper');
      const dobWrapper = document.getElementById('regDobWrapper');
      const langWrapper = document.getElementById('regLangWrapper');
      const movieGenreWrapper = document.getElementById('regMovieGenreWrapper');
      const bookGenreWrapper = document.getElementById('regBookGenreWrapper');
      const moodWrapper = document.getElementById('regMoodWrapper');

      const nameFb = document.getElementById('regNameFeedback');
      const emailFb = document.getElementById('regEmailFeedback');
      const passFb = document.getElementById('regPasswordFeedback');
      const confirmPassFb = document.getElementById('regConfirmPasswordFeedback');
      const dobFb = document.getElementById('regDobFeedback');
      const langFb = document.getElementById('regLangFeedback');
      const movieGenreFb = document.getElementById('regMovieGenreFeedback');
      const bookGenreFb = document.getElementById('regBookGenreFeedback');
      const moodFb = document.getElementById('regMoodFeedback');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const pass = passInput ? passInput.value.trim() : '';
      const confirmPass = confirmPassInput ? confirmPassInput.value.trim() : '';
      const dob = dobInput ? dobInput.value : '';
      const language = langInput ? langInput.value : '';
      const movieGenre = movieGenreInput ? movieGenreInput.value : '';
      const bookGenre = bookGenreInput ? bookGenreInput.value : '';
      const mood = moodInput ? moodInput.value : '';

      let isValid = true;
      let firstError = null;

      if (!name || name.length < 2) {
        showInputError(nameWrapper, nameFb, 'Full Name is required (minimum 2 characters).');
        if (!firstError) firstError = nameInput;
        isValid = false;
      }

      if (!email || !isValidEmail(email)) {
        showInputError(emailWrapper, emailFb, 'Please enter a valid email address.');
        if (!firstError) firstError = emailInput;
        isValid = false;
      }

      if (!pass || pass.length < 6) {
        showInputError(passWrapper, passFb, 'Password must be at least 6 characters.');
        if (!firstError) firstError = passInput;
        isValid = false;
      }

      if (!confirmPass) {
        showInputError(confirmPassWrapper, confirmPassFb, 'Please confirm your password.');
        if (!firstError) firstError = confirmPassInput;
        isValid = false;
      } else if (pass !== confirmPass) {
        showInputError(confirmPassWrapper, confirmPassFb, 'Passwords do not match.');
        if (!firstError) firstError = confirmPassInput;
        isValid = false;
      }

      if (!dob) {
        showInputError(dobWrapper, dobFb, 'Please select your Date of Birth.');
        if (!firstError) firstError = dobInput;
        isValid = false;
      }

      if (!language) {
        showInputError(langWrapper, langFb, 'Please select your preferred language.');
        if (!firstError) firstError = langInput;
        isValid = false;
      }

      if (!movieGenre) {
        showInputError(movieGenreWrapper, movieGenreFb, 'Please select your preferred movie genre.');
        if (!firstError) firstError = movieGenreInput;
        isValid = false;
      }

      if (!bookGenre) {
        showInputError(bookGenreWrapper, bookGenreFb, 'Please select your preferred book genre.');
        if (!firstError) firstError = bookGenreInput;
        isValid = false;
      }

      if (!mood) {
        showInputError(moodWrapper, moodFb, 'Please select your preferred mood.');
        if (!firstError) firstError = moodInput;
        isValid = false;
      }

      if (!isValid) {
        if (firstError) firstError.focus();
        showToast('Please fill all highlighted fields correctly.', 'error');
        return;
      }

      const users = getRegisteredUsers();
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (existing) {
        showInputError(emailWrapper, emailFb, 'An account with this email already exists.');
        showToast('Email already registered. Please login instead.', 'error');
        if (emailInput) emailInput.focus();
        return;
      }

      const userProfile = {
        name,
        email,
        dateOfBirth: dob,
        language,
        movieGenre,
        bookGenre,
        mood
      };

      // Save preferences in localStorage for the AI engine
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify({
        language,
        movieGenre,
        bookGenre,
        mood
      }));

      // Save user account
      users.push({
        ...userProfile,
        password: pass,
        tag: `${movieGenre} & ${bookGenre} Fan`
      });
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // Active session
      const sessionData = {
        ...userProfile,
        isLoggedIn: true,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));

      showToast(`Profile created successfully! Welcome, ${name}!`, 'success');
      setTimeout(() => {
        showMainApp(sessionData);
        navigateToView('home');
      }, 500);
    });
  }

  // Logout Handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      sessionStorage.removeItem(STORAGE_KEYS.SESSION);
      showToast('Logged out successfully. See you again soon!', 'info');
      showAuthView();
    });
  }

  // Helpers
  function showInputError(wrapper, feedbackEl, message) {
    if (wrapper) {
      wrapper.classList.add('is-invalid');
      wrapper.classList.remove('is-valid');
    }
    if (feedbackEl) {
      feedbackEl.textContent = message;
    }
  }

  function clearInputError(wrapper, feedbackEl) {
    if (wrapper) {
      wrapper.classList.remove('is-invalid');
      wrapper.classList.add('is-valid');
    }
    if (feedbackEl) {
      feedbackEl.textContent = '';
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }
}

/**
 * Sync registered user preferences with the Home page controls
 */
function syncHomePreferences(user) {
  if (!user) return;

  // Sync Movie Genre
  if (user.movieGenre) {
    const movieGenreBtns = document.querySelectorAll('#movieGenresGrid .genre-card-btn');
    movieGenreBtns.forEach(btn => {
      const g = btn.dataset.genre || btn.querySelector('span')?.textContent.trim();
      if (g && g.toLowerCase() === user.movieGenre.toLowerCase()) {
        movieGenreBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  }

  // Sync Book Genre
  if (user.bookGenre) {
    const bookGenreBtns = document.querySelectorAll('#bookGenresGrid .genre-card-btn');
    bookGenreBtns.forEach(btn => {
      const g = btn.dataset.genre || btn.querySelector('span')?.textContent.trim();
      if (g && g.toLowerCase() === user.bookGenre.toLowerCase()) {
        bookGenreBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  }

  // Sync Language
  if (user.language) {
    const langPills = document.querySelectorAll('#filterRowLanguage .filter-pill');
    langPills.forEach(pill => {
      if (pill.dataset.val?.toLowerCase() === user.language.toLowerCase() ||
          pill.textContent.trim().toLowerCase() === user.language.toLowerCase()) {
        langPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      }
    });
  }

  // Sync Mood
  if (user.mood) {
    const moodPills = document.querySelectorAll('#filterRowMood .filter-pill');
    moodPills.forEach(pill => {
      if (pill.dataset.val?.toLowerCase() === user.mood.toLowerCase() ||
          pill.textContent.trim().toLowerCase().includes(user.mood.toLowerCase())) {
        moodPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      }
    });
  }
}

/**
 * --------------------------------------------------------------------------
 * 2. Mobile Navigation & Drawer
 * --------------------------------------------------------------------------
 */
function initMobileNavigation() {
  const sidebarToggle = document.getElementById('sidebarToggle');
  const appSidebar = document.getElementById('appSidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  if (!sidebarToggle || !appSidebar || !sidebarOverlay) return;

  function toggleSidebar(open) {
    if (open) {
      appSidebar.classList.add('mobile-open');
      sidebarOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      appSidebar.classList.remove('mobile-open');
      sidebarOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  sidebarToggle.addEventListener('click', () => {
    const isOpen = appSidebar.classList.contains('mobile-open');
    toggleSidebar(!isOpen);
  });

  sidebarOverlay.addEventListener('click', () => {
    toggleSidebar(false);
  });

  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener('click', () => {
      toggleSidebar(false);
    });
  }
}

/**
 * --------------------------------------------------------------------------
 * 3. Multi-View Sidebar Navigation Controller
 * --------------------------------------------------------------------------
 */
function initSidebarActiveNav() {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetNav = item.dataset.nav;
      if (targetNav) {
        navigateToView(targetNav);
      }
    });
  });

  // Handle URL hash changes
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      navigateToView(hash, false);
    }
  });
}

/**
 * Switch view and synchronize sidebar active state
 */
function navigateToView(viewName, updateHash = true) {
  const views = {
    home: document.getElementById('homeView'),
    movies: document.getElementById('moviesView'),
    books: document.getElementById('booksView'),
    wishlist: document.getElementById('wishlistView'),
    history: document.getElementById('historyView'),
    profile: document.getElementById('profileView')
  };

  if (!views[viewName]) viewName = 'home';

  // Toggle active class on view sections
  Object.keys(views).forEach(key => {
    if (views[key]) {
      if (key === viewName) {
        views[key].classList.add('active');
      } else {
        views[key].classList.remove('active');
      }
    }
  });

  // Update sidebar active link
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  navItems.forEach(item => {
    if (item.dataset.nav === viewName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update hash if requested
  if (updateHash) {
    history.pushState(null, null, `#${viewName}`);
  }

  // Close mobile sidebar if open
  const appSidebar = document.getElementById('appSidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  if (appSidebar && sidebarOverlay && window.innerWidth <= 768) {
    appSidebar.classList.remove('mobile-open');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Populate placeholder views dynamically
  if (viewName === 'movies') {
    renderMoviesPageView();
  } else if (viewName === 'books') {
    renderBooksPageView();
  } else if (viewName === 'wishlist') {
    renderWishlistView();
  } else if (viewName === 'history') {
    renderHistoryView();
  } else if (viewName === 'profile') {
    renderProfileView();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * --------------------------------------------------------------------------
 * 4. Main Home Page Dashboard Logic (Step 4)
 * --------------------------------------------------------------------------
 */
function initHomePage() {
  const heroBtnMovies = document.getElementById('heroBtnMovies');
  const heroBtnBooks = document.getElementById('heroBtnBooks');
  const movieGenresSection = document.getElementById('movieGenresSection');
  const bookGenresSection = document.getElementById('bookGenresSection');
  const btnGetStarted = document.getElementById('btnGetStarted');

  // Media Toggle in Hero (Movies vs Books)
  function setActiveMedia(type) {
    gActiveMediaType = type;

    if (type === 'movies') {
      if (heroBtnMovies) heroBtnMovies.classList.add('active');
      if (heroBtnBooks) heroBtnBooks.classList.remove('active');
      if (movieGenresSection) movieGenresSection.style.display = 'block';
      if (bookGenresSection) bookGenresSection.style.display = 'none';
    } else {
      if (heroBtnBooks) heroBtnBooks.classList.add('active');
      if (heroBtnMovies) heroBtnMovies.classList.remove('active');
      if (movieGenresSection) movieGenresSection.style.display = 'none';
      if (bookGenresSection) bookGenresSection.style.display = 'block';
    }

    saveCurrentPreferences();
  }

  if (heroBtnMovies) {
    heroBtnMovies.addEventListener('click', () => setActiveMedia('movies'));
  }

  if (heroBtnBooks) {
    heroBtnBooks.addEventListener('click', () => setActiveMedia('books'));
  }

  // Movie Genre Buttons
  const movieGenreBtns = document.querySelectorAll('#movieGenresGrid .genre-card-btn');
  movieGenreBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      movieGenreBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      saveCurrentPreferences();
    });
  });

  // Book Genre Buttons
  const bookGenreBtns = document.querySelectorAll('#bookGenresGrid .genre-card-btn');
  bookGenreBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      bookGenreBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      saveCurrentPreferences();
    });
  });

  // Filter Pill Rows (Duration, Language, Rating, Mood)
  const filterRows = [
    '#filterRowDuration',
    '#filterRowLanguage',
    '#filterRowRating',
    '#filterRowMood'
  ];

  filterRows.forEach(rowSelector => {
    const row = document.querySelector(rowSelector);
    if (!row) return;
    const pills = row.querySelectorAll('.filter-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        saveCurrentPreferences();
      });
    });
  });

  // "Get Started →" CTA Button Handler
  if (btnGetStarted) {
    btnGetStarted.addEventListener('click', () => {
      const prefs = saveCurrentPreferences();

      if (gActiveMediaType === 'movies') {
        showToast(`AI Engine Activated: Recommending ${prefs.movieGenre || 'Top'} movies in ${prefs.language || 'English'}!`, 'info');
        navigateToView('movies');
      } else if (gActiveMediaType === 'books') {
        showToast(`AI Engine Activated: Recommending ${prefs.bookGenre || 'Top'} books in ${prefs.language || 'English'}!`, 'info');
        navigateToView('books');
      } else {
        showToast('Please select either Movies or Books to get started.', 'error');
      }
    });
  }
}

/**
 * Read and save user selected preferences from the Home controls to localStorage
 */
function saveCurrentPreferences() {
  const activeMovieGenreBtn = document.querySelector('#movieGenresGrid .genre-card-btn.active');
  const activeBookGenreBtn = document.querySelector('#bookGenresGrid .genre-card-btn.active');
  const activeDurationPill = document.querySelector('#filterRowDuration .filter-pill.active');
  const activeLangPill = document.querySelector('#filterRowLanguage .filter-pill.active');
  const activeRatingPill = document.querySelector('#filterRowRating .filter-pill.active');
  const activeMoodPill = document.querySelector('#filterRowMood .filter-pill.active');

  const prefs = {
    mediaType: gActiveMediaType,
    movieGenre: activeMovieGenreBtn ? (activeMovieGenreBtn.dataset.genre || activeMovieGenreBtn.querySelector('span')?.textContent.trim()) : 'Action',
    bookGenre: activeBookGenreBtn ? (activeBookGenreBtn.dataset.genre || activeBookGenreBtn.querySelector('span')?.textContent.trim()) : 'Fantasy',
    duration: activeDurationPill ? (activeDurationPill.dataset.val || activeDurationPill.textContent.trim()) : 'Medium',
    language: activeLangPill ? (activeLangPill.dataset.val || activeLangPill.textContent.trim()) : 'English',
    rating: activeRatingPill ? (activeRatingPill.dataset.val || activeRatingPill.textContent.trim()) : '8+',
    mood: activeMoodPill ? (activeMoodPill.dataset.val || activeMoodPill.textContent.trim()) : 'Excited'
  };

  localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  return prefs;
}

/**
 * --------------------------------------------------------------------------
 * 5. Dynamic Popular Recommendations Section
 * --------------------------------------------------------------------------
 */
function initPopularSection() {
  const tabFilterAll = document.getElementById('tabFilterAll');
  const tabFilterMovies = document.getElementById('tabFilterMovies');
  const tabFilterBooks = document.getElementById('tabFilterBooks');

  const tabs = [tabFilterAll, tabFilterMovies, tabFilterBooks];

  tabs.forEach(tab => {
    if (!tab) return;
    tab.addEventListener('click', () => {
      tabs.forEach(t => t && t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.type || 'all';
      renderPopularCards(filter);
    });
  });

  renderPopularCards('all');
}

/**
 * Render Popular Media Cards dynamically from catalogs
 */
function renderPopularCards(filter = 'all') {
  const grid = document.getElementById('popularMediaGrid');
  if (!grid) return;

  grid.innerHTML = '';

  let items = [];

  if (filter === 'movies') {
    items = gMoviesCatalog.slice(0, 6);
  } else if (filter === 'books') {
    items = gBooksCatalog.slice(0, 6);
  } else {
    // Interleave top 3 movies and top 3 books
    const topM = gMoviesCatalog.slice(0, 3);
    const topB = gBooksCatalog.slice(0, 3);
    items = [...topM, ...topB];
  }

  items.forEach(item => {
    const card = createMediaCardElement(item);
    grid.appendChild(card);
  });
}

/**
 * Generate a Media Card element (Movie or Book)
 */
function createMediaCardElement(item) {
  const isMovie = item.type === 'Movie';
  const card = document.createElement('article');
  card.className = 'media-card';

  const imageSrc = isMovie ? item.poster : item.cover;
  const subMeta = isMovie ? item.year : item.author;
  const isWishlisted = isMovie ? checkMovieWishlistStatus(item.id) : checkBookWishlistStatus(item.id);

  // Genre tag styling
  let tagColorStyle = 'color: #00a8ff; border-color: rgba(0, 168, 255, 0.3); background: rgba(0, 168, 255, 0.15);';
  if (item.genre === 'Action') tagColorStyle = 'color: #f37335; border-color: rgba(243, 115, 53, 0.3); background: rgba(243, 115, 53, 0.15);';
  if (item.genre === 'Comedy') tagColorStyle = 'color: #5352ed; border-color: rgba(83, 82, 237, 0.3); background: rgba(83, 82, 237, 0.15);';
  if (item.genre === 'Adventure') tagColorStyle = 'color: #2ed573; border-color: rgba(46, 213, 115, 0.3); background: rgba(46, 213, 115, 0.15);';
  if (item.genre === 'Fantasy') tagColorStyle = 'color: #9b51e0; border-color: rgba(155, 81, 224, 0.3); background: rgba(155, 81, 224, 0.15);';
  if (item.genre === 'Self-Help') tagColorStyle = 'color: #e67e22; border-color: rgba(230, 126, 34, 0.3); background: rgba(230, 126, 34, 0.15);';

  card.innerHTML = `
    <div class="media-poster-box">
      <img src="${imageSrc}" alt="${item.title}" loading="lazy">
    </div>
    <div class="media-card-body">
      <h4 class="media-title" title="${item.title}">${item.title}</h4>
      <div class="media-meta-row">
        <span>${subMeta}</span>
        <span class="media-rating"><i class="fa-solid fa-star"></i> ${item.rating}</span>
      </div>
      <span class="genre-tag" style="${tagColorStyle}">${item.genre}</span>
      <div class="media-card-actions">
        <button class="btn btn-view-details btn-details-trigger">View Details</button>
        <button class="btn-icon btn-wishlist-trigger ${isWishlisted ? 'active' : ''}" aria-label="Toggle Wishlist">
          <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
      </div>
    </div>
  `;

  // Attach event handlers
  const detailsBtn = card.querySelector('.btn-details-trigger');
  if (detailsBtn) {
    detailsBtn.addEventListener('click', () => {
      if (isMovie) {
        const aiResult = evaluateMovieRules(item, loadWorkingMemoryFacts());
        openMovieDetailsModal(item, aiResult);
      } else {
        const aiResult = evaluateBookRules(item, loadBookWorkingMemoryFacts());
        openBookDetailsModal(item, aiResult);
      }
    });
  }

  const wishlistBtn = card.querySelector('.btn-wishlist-trigger');
  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', () => {
      const activeNow = isMovie ? toggleMovieWishlist(item) : toggleBookWishlist(item);
      wishlistBtn.classList.toggle('active', activeNow);
      const icon = wishlistBtn.querySelector('i');
      if (icon) {
        icon.className = activeNow ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
      }
    });
  }

  return card;
}

/**
 * --------------------------------------------------------------------------
 * 6. Reusable Details Modal with Rule Explanation (Panel 6 Reference)
 * --------------------------------------------------------------------------
 */
function initModalInteractions() {
  const modal = document.getElementById('detailsModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  const dismissBtn = document.getElementById('modalDismissBtn');

  if (!modal) return;

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (dismissBtn) dismissBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

function openDetailsModal(item) {
  if (item.type === 'Book') {
    const facts = loadBookWorkingMemoryFacts();
    const aiResult = evaluateBookRules(item, facts);
    openBookDetailsModal(item, aiResult);
  } else {
    const facts = loadWorkingMemoryFacts();
    const aiResult = evaluateMovieRules(item, facts);
    openMovieDetailsModal(item, aiResult);
  }
}

/**
 * --------------------------------------------------------------------------
 * 7. Wishlist & History Storage Management
 * --------------------------------------------------------------------------
 */
function getMovieWishlist() {
  const raw = localStorage.getItem(STORAGE_KEYS.MOVIE_WISHLIST) || localStorage.getItem(STORAGE_KEYS.WISHLIST);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) { return []; }
  }
  return [];
}

function getBookWishlist() {
  const raw = localStorage.getItem(STORAGE_KEYS.BOOK_WISHLIST);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) { return []; }
  }
  return [];
}

function getWishlist() {
  return getMovieWishlist();
}

function checkMovieWishlistStatus(id) {
  return getMovieWishlist().some(item => item.id === id);
}

function checkBookWishlistStatus(id) {
  return getBookWishlist().some(item => item.id === id);
}

function checkWishlistStatus(id) {
  return checkMovieWishlistStatus(id) || checkBookWishlistStatus(id);
}

function toggleMovieWishlist(movie) {
  let list = getMovieWishlist();
  const index = list.findIndex(i => i.id === movie.id);
  const isNowAdded = index === -1;

  if (index > -1) {
    list.splice(index, 1);
    showToast(`Removed "${movie.title}" from your movie wishlist.`, 'info');
  } else {
    list.push(movie);
    showToast(`Added "${movie.title}" to your movie wishlist! 🎬`, 'success');
  }

  localStorage.setItem(STORAGE_KEYS.MOVIE_WISHLIST, JSON.stringify(list));
  localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(list));
  updateWishlistBadges();
  return isNowAdded;
}

function toggleBookWishlist(book) {
  let list = getBookWishlist();
  const index = list.findIndex(i => i.id === book.id);
  const isNowAdded = index === -1;

  if (index > -1) {
    list.splice(index, 1);
    showToast(`Removed "${book.title}" from your book wishlist.`, 'info');
  } else {
    list.push(book);
    showToast(`Added "${book.title}" to your book wishlist! 📖`, 'success');
  }

  localStorage.setItem(STORAGE_KEYS.BOOK_WISHLIST, JSON.stringify(list));
  updateWishlistBadges();
  return isNowAdded;
}

function toggleWishlist(item) {
  if (item.type === 'Book') {
    return toggleBookWishlist(item);
  }
  return toggleMovieWishlist(item);
}

function removeFromWishlist(id, type) {
  if (type === 'movies' || type === 'Movie') {
    let list = getMovieWishlist().filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.MOVIE_WISHLIST, JSON.stringify(list));
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(list));
    showToast('Movie removed from wishlist.', 'info');
  } else {
    let list = getBookWishlist().filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.BOOK_WISHLIST, JSON.stringify(list));
    showToast('Book removed from wishlist.', 'info');
  }
  updateWishlistBadges();
  renderWishlistView();
}

function updateWishlistBadges() {
  const movieList = getMovieWishlist();
  const bookList  = getBookWishlist();

  const mEl = document.getElementById('wishlistMovieCount');
  const bEl = document.getElementById('wishlistBookCount');
  if (mEl) mEl.textContent = movieList.length;
  if (bEl) bEl.textContent = bookList.length;
}

function getMovieHistory() {
  const raw = localStorage.getItem(STORAGE_KEYS.MOVIE_HISTORY) || localStorage.getItem(STORAGE_KEYS.HISTORY);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) { return []; }
  }
  return [];
}

function getBookHistory() {
  const raw = localStorage.getItem(STORAGE_KEYS.BOOK_HISTORY);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) { return []; }
  }
  return [];
}

function recordMovieHistory(movie) {
  let history = getMovieHistory();
  history = history.filter(h => h.id !== movie.id);
  history.unshift({
    id: movie.id,
    title: movie.title,
    type: 'Movie',
    genre: movie.genre,
    year: movie.year || '',
    rating: movie.rating,
    poster: movie.poster,
    viewedAt: new Date().toLocaleString('en-US', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  });
  if (history.length > 20) history = history.slice(0, 20);
  localStorage.setItem(STORAGE_KEYS.MOVIE_HISTORY, JSON.stringify(history));
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

function recordBookHistory(book) {
  let history = getBookHistory();
  history = history.filter(h => h.id !== book.id);
  history.unshift({
    id: book.id,
    title: book.title,
    type: 'Book',
    genre: book.genre,
    author: book.author || '',
    year: book.year || '',
    rating: book.rating,
    poster: book.cover,
    viewedAt: new Date().toLocaleString('en-US', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  });
  if (history.length > 20) history = history.slice(0, 20);
  localStorage.setItem(STORAGE_KEYS.BOOK_HISTORY, JSON.stringify(history));
}

function recordItemHistory(item) {
  if (item.type === 'Book') {
    recordBookHistory(item);
  } else {
    recordMovieHistory(item);
  }
}

function clearHistory(type = 'all') {
  if (type === 'movies' || type === 'all') {
    localStorage.removeItem(STORAGE_KEYS.MOVIE_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  }
  if (type === 'books' || type === 'all') {
    localStorage.removeItem(STORAGE_KEYS.BOOK_HISTORY);
  }
  const label = type === 'movies' ? 'Movie' : type === 'books' ? 'Book' : 'All';
  showToast(`${label} history cleared.`, 'info');
  renderHistoryView();
}

function removeHistoryItem(id, type) {
  if (type === 'movies' || type === 'Movie') {
    let list = getMovieHistory().filter(h => h.id !== id);
    localStorage.setItem(STORAGE_KEYS.MOVIE_HISTORY, JSON.stringify(list));
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(list));
  } else {
    let list = getBookHistory().filter(h => h.id !== id);
    localStorage.setItem(STORAGE_KEYS.BOOK_HISTORY, JSON.stringify(list));
  }
  showToast('Item removed from history.', 'info');
  renderHistoryView();
}

/**
 * --------------------------------------------------------------------------
 * 8. Render Placeholder Sub-Views (Step 5-9 Preparatory Views)
 * --------------------------------------------------------------------------
 */
/**
 * --------------------------------------------------------------------------
 * STEP 5 — Rule-Based Movie AI Expert System
 * Working Memory → Rule Base → Forward Chaining → Scored Results
 * --------------------------------------------------------------------------
 */

/**
 * Load user facts from localStorage into Working Memory
 * Returns: { movieGenre, mood, language, rating, duration }
 */
function loadWorkingMemoryFacts() {
  let prefs = {};
  const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
  if (raw) {
    try { prefs = JSON.parse(raw); } catch (e) {}
  }
  // Also fall back to session
  if (!prefs.movieGenre) {
    const sess = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || sessionStorage.getItem(STORAGE_KEYS.SESSION) || '{}');
    if (sess.movieGenre) prefs.movieGenre = sess.movieGenre;
    if (sess.mood) prefs.mood = sess.mood;
    if (sess.language) prefs.language = sess.language;
  }
  return {
    movieGenre: (prefs.movieGenre || 'Action').trim(),
    mood:       (prefs.mood      || 'Excited').trim(),
    language:   (prefs.language  || 'English').trim(),
    rating:     (prefs.rating    || '8+').toString().trim(),
    duration:   (prefs.duration  || 'Any').toString().trim()
  };
}

/**
 * Rule Base — 5 IF-THEN weighted scoring rules
 * Maximum possible score: 10 points
 *
 * Rule 1: Primary Genre Match         → +3 pts
 * Rule 2: Secondary Genre Match        → +1.5 pts
 * Rule 3: Mood Match                   → +2 pts
 * Rule 4: Language Match               → +2 pts
 * Rule 5: Rating Threshold Match       → +1.5 pts
 * Rule 6: Duration Match               → +1 pt    (bonus, capped at 10)
 */
function evaluateMovieRules(movie, facts) {
  let score = 0;
  const matchedRules = [];

  // Rule 1: Primary Genre Match
  if (movie.genre && facts.movieGenre &&
      movie.genre.toLowerCase() === facts.movieGenre.toLowerCase()) {
    score += 3;
    matchedRules.push(`✅ Rule 1: IF Genre = ${facts.movieGenre} THEN +3 pts (Primary genre match)`);
  }

  // Rule 2: Secondary Genre Match (partial bonus)
  if (movie.secondaryGenre && facts.movieGenre &&
      movie.secondaryGenre.toLowerCase() === facts.movieGenre.toLowerCase()) {
    score += 1.5;
    matchedRules.push(`✅ Rule 2: IF SecondaryGenre = ${facts.movieGenre} THEN +1.5 pts (Secondary genre match)`);
  }

  // Rule 3: Mood Match
  if (movie.mood && facts.mood &&
      movie.mood.toLowerCase() === facts.mood.toLowerCase()) {
    score += 2;
    matchedRules.push(`✅ Rule 3: IF Mood = ${facts.mood} THEN +2 pts (Mood aligned)`);
  }

  // Rule 4: Language Match
  if (movie.language && facts.language &&
      movie.language.toLowerCase() === facts.language.toLowerCase()) {
    score += 2;
    matchedRules.push(`✅ Rule 4: IF Language = ${facts.language} THEN +2 pts (Language preferred)`);
  }

  // Rule 5: Rating Threshold Match
  const ratingTarget = parseFloat(facts.rating) || 8.0;
  if (movie.rating >= ratingTarget) {
    score += 1.5;
    matchedRules.push(`✅ Rule 5: IF Rating >= ${ratingTarget} THEN +1.5 pts (Rating threshold met: ${movie.rating})`);
  }

  // Rule 6: Duration Match (bonus)
  const dur = (facts.duration || '').toLowerCase();
  if (dur && dur !== 'any' && movie.duration &&
      movie.duration.toLowerCase() === dur) {
    score += 1;
    matchedRules.push(`✅ Rule 6: IF Duration = ${facts.duration} THEN +1 pt (Duration preference met)`);
  }

  // Cap at 10
  score = Math.min(score, 10);

  return {
    score: Math.round(score * 10) / 10,
    matchedRules,
    ruleFired: movie.aiRuleMatch?.ruleFired ||
      `IF Genre = ${movie.genre} AND Mood = ${movie.mood || 'Any'} THEN Recommend ${movie.genre} movies.`
  };
}

/**
 * Update the Working Memory Facts Banner in the Movies view
 */
function updateMovieFactsBanner(facts) {
  const factGenre  = document.getElementById('factGenre');
  const factMood   = document.getElementById('factMood');
  const factLang   = document.getElementById('factLang');
  const factRating = document.getElementById('factRating');
  if (factGenre)  factGenre.textContent  = `Genre: ${facts.movieGenre}`;
  if (factMood)   factMood.textContent   = `Mood: ${facts.mood}`;
  if (factLang)   factLang.textContent   = `Lang: ${facts.language}`;
  if (factRating) factRating.textContent = `Rating: ${facts.rating}`;
}

/**
 * Generate genre tag color styling
 */
function getGenreTagStyle(genre) {
  const map = {
    'Action':    'color:#f37335;border-color:rgba(243,115,53,.3);background:rgba(243,115,53,.12)',
    'Sci-Fi':    'color:#00a8ff;border-color:rgba(0,168,255,.3);background:rgba(0,168,255,.12)',
    'Drama':     'color:#a29bfe;border-color:rgba(162,155,254,.3);background:rgba(162,155,254,.12)',
    'Comedy':    'color:#5352ed;border-color:rgba(83,82,237,.3);background:rgba(83,82,237,.12)',
    'Adventure': 'color:#2ed573;border-color:rgba(46,213,115,.3);background:rgba(46,213,115,.12)',
    'Thriller':  'color:#fd79a8;border-color:rgba(253,121,168,.3);background:rgba(253,121,168,.12)',
    'Romance':   'color:#ff6b81;border-color:rgba(255,107,129,.3);background:rgba(255,107,129,.12)',
    'Mystery':   'color:#00cec9;border-color:rgba(0,206,201,.3);background:rgba(0,206,201,.12)',
    'Horror':    'color:#d63031;border-color:rgba(214,48,49,.3);background:rgba(214,48,49,.12)',
    'Fantasy':   'color:#9b51e0;border-color:rgba(155,81,224,.3);background:rgba(155,81,224,.12)',
    'Family':    'color:#fdcb6e;border-color:rgba(253,203,110,.3);background:rgba(253,203,110,.12)',
    'Crime':     'color:#e17055;border-color:rgba(225,112,85,.3);background:rgba(225,112,85,.12)'
  };
  return map[genre] || 'color:#00a8ff;border-color:rgba(0,168,255,.3);background:rgba(0,168,255,.12)';
}

/**
 * Create a Movie Card element for the Movies Page (with AI score badge)
 */
function createMoviePageCard(movie, aiResult, isTopMatch) {
  const card = document.createElement('article');
  card.className = 'media-card';

  const isWishlisted = checkWishlistStatus(movie.id);
  const scorePct = Math.round((aiResult.score / 10) * 100);
  const genreStyle = getGenreTagStyle(movie.genre);

  // Star rating display (filled + empty)
  const fullStars  = Math.floor(movie.rating / 2);
  const halfStar   = (movie.rating / 2 - fullStars) >= 0.4 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  let starsHtml = '';
  for (let i = 0; i < fullStars; i++)  starsHtml += '<i class="fa-solid fa-star" style="color:#ffd700;font-size:0.7rem;"></i>';
  if (halfStar)                         starsHtml += '<i class="fa-solid fa-star-half-stroke" style="color:#ffd700;font-size:0.7rem;"></i>';
  for (let i = 0; i < emptyStars; i++) starsHtml += '<i class="fa-regular fa-star" style="color:#555;font-size:0.7rem;"></i>';

  const badgeClass = isTopMatch ? 'ai-match-badge top-match' : 'ai-match-badge';
  const badgeIcon  = isTopMatch ? '⭐' : '🤖';

  card.innerHTML = `
    <div class="media-poster-box" style="position:relative;">
      <img src="${movie.poster}" alt="${movie.title}" loading="lazy"
        onerror="this.src='https://via.placeholder.com/300x440/0b0f19/ff2a6d?text=${encodeURIComponent(movie.title)}'">
      <div class="${badgeClass}">
        <span>${badgeIcon}</span>
        <span>${scorePct}% Match</span>
      </div>
      ${isTopMatch ? '<div style="position:absolute;top:10px;right:10px;background:linear-gradient(135deg,#ff2a6d,#b800e6);color:#fff;font-size:0.65rem;font-weight:700;padding:2px 7px;border-radius:20px;z-index:5;">TOP PICK</div>' : ''}
    </div>
    <div class="media-card-body">
      <h4 class="media-title" title="${movie.title}">${movie.title}</h4>
      <div class="media-meta-row">
        <span>${movie.year}</span>
        <span class="media-rating"><i class="fa-solid fa-star"></i> ${movie.rating}</span>
      </div>
      <div style="display:flex;gap:4px;align-items:center;margin-bottom:6px;">${starsHtml}</div>
      <span class="genre-tag" style="${genreStyle}">${movie.genre}</span>
      <div style="margin-top:8px;font-size:0.75rem;color:var(--text-muted);">
        <i class="fa-solid fa-language" style="margin-right:3px;"></i>${movie.language}
        &nbsp;•&nbsp;
        <i class="fa-regular fa-clock" style="margin-right:3px;"></i>${movie.duration}
      </div>
      <div class="media-card-actions">
        <button class="btn btn-view-details btn-details-trigger">
          <i class="fa-solid fa-circle-info" style="margin-right:5px;font-size:0.8rem;"></i>View Details
        </button>
        <button class="btn-icon btn-wishlist-trigger ${isWishlisted ? 'active' : ''}" aria-label="Toggle Wishlist">
          <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
      </div>
    </div>
  `;

  // Attach handlers
  const detailsBtn = card.querySelector('.btn-details-trigger');
  if (detailsBtn) {
    detailsBtn.addEventListener('click', () => {
      // Attach the dynamic AI explanation to the item before opening modal
      movie._dynamicAIResult = aiResult;
      openMovieDetailsModal(movie, aiResult);
    });
  }

  const wishlistBtn = card.querySelector('.btn-wishlist-trigger');
  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', () => {
      const activeNow = toggleWishlist(movie);
      wishlistBtn.classList.toggle('active', activeNow);
      const icon = wishlistBtn.querySelector('i');
      if (icon) icon.className = activeNow ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    });
  }

  return card;
}

/**
 * Backward Chaining Goal Verification Engine
 * Goal Hypothesis: "Is this candidate item an AI-certified Top Recommendation?"
 * Evaluates sub-goals backward from target hypothesis to working memory facts.
 */
function verifyBackwardChainingGoal(item, facts) {
  const isMovie = item.type === 'Movie';
  const targetGenre = isMovie ? facts.movieGenre : facts.bookGenre;
  const ratingTarget = parseFloat(facts.rating) || 8.0;

  const subgoals = [
    {
      goal: `Quality Threshold (Rating >= ${ratingTarget})`,
      satisfied: item.rating >= ratingTarget,
      detail: `${item.rating}/10 vs target ${ratingTarget}`
    },
    {
      goal: `Genre Alignment (${targetGenre})`,
      satisfied: (item.genre && item.genre.toLowerCase() === targetGenre.toLowerCase()) ||
                 (item.secondaryGenre && item.secondaryGenre.toLowerCase() === targetGenre.toLowerCase()),
      detail: item.genre
    },
    {
      goal: `Mood Compatibility (${facts.mood})`,
      satisfied: item.mood && item.mood.toLowerCase() === facts.mood.toLowerCase(),
      detail: item.mood || 'Standard'
    },
    {
      goal: `Language Accessibility (${facts.language})`,
      satisfied: item.language && item.language.toLowerCase() === facts.language.toLowerCase(),
      detail: item.language
    }
  ];

  const satisfiedCount = subgoals.filter(s => s.satisfied).length;
  const isProven = satisfiedCount >= 2;

  return {
    isProven,
    satisfiedCount,
    totalGoals: subgoals.length,
    subgoals
  };
}

/**
 * Open Details Modal with full AI rule explanation for movie page cards
 */
function openMovieDetailsModal(movie, aiResult) {
  const modal = document.getElementById('detailsModal');
  if (!modal) return;

  const modalImg       = document.getElementById('modalImg');
  const modalTitle     = document.getElementById('modalTitle');
  const modalDesc      = document.getElementById('modalDescription');
  const specsContainer = modal.querySelector('.modal-specs-list');
  const aiRuleBox      = modal.querySelector('.ai-rule-box');
  const wishlistBtn    = modal.querySelector('.modal-actions .btn-primary');

  if (modalImg)   modalImg.src           = movie.poster;
  if (modalImg)   modalImg.alt           = movie.title;
  if (modalTitle) modalTitle.textContent = `${movie.title} (${movie.year})`;
  if (modalDesc)  modalDesc.textContent  = movie.description || 'No description available.';

  // Specs
  if (specsContainer) {
    specsContainer.innerHTML = `
      <div class="spec-row"><span class="spec-label">Type</span><span class="spec-value">: Movie</span></div>
      <div class="spec-row"><span class="spec-label">Genre</span><span class="spec-value">: ${movie.genre}${movie.secondaryGenre ? ' / ' + movie.secondaryGenre : ''}</span></div>
      <div class="spec-row"><span class="spec-label">Language</span><span class="spec-value">: ${movie.language}</span></div>
      <div class="spec-row"><span class="spec-label">Rating</span><span class="spec-value">: ⭐ ${movie.rating}/10</span></div>
      <div class="spec-row"><span class="spec-label">Duration</span><span class="spec-value">: ${movie.duration}</span></div>
      <div class="spec-row"><span class="spec-label">AI Score</span><span class="spec-value" style="color:#ff7597;font-weight:700;">: ${aiResult.score}/10 (${Math.round(aiResult.score * 10)}%)</span></div>
    `;
  }

  // AI Rule Explanation (Forward + Backward Chaining)
  if (aiRuleBox) {
    const wmFacts = loadWorkingMemoryFacts();
    const backwardCheck = verifyBackwardChainingGoal(movie, wmFacts);

    const matchItems = aiResult.matchedRules.length > 0
      ? aiResult.matchedRules.map(r => `<div class="ai-match-item"><i class="fa-solid fa-circle-check"></i><span>${r}</span></div>`).join('')
      : '<div class="ai-match-item"><i class="fa-solid fa-circle-xmark" style="color:#e17055;"></i><span>No specific preference rules matched — showing general recommendation.</span></div>';

    aiRuleBox.innerHTML = `
      <div class="ai-rule-title">
        <i class="fa-solid fa-lightbulb"></i>
        <span>Why this movie? — Rule-Based Expert System Analysis</span>
      </div>
      <div style="font-size:0.75rem;font-weight:700;color:var(--color-pink);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">
        Forward Chaining (Deductions Fired):
      </div>
      ${matchItems}
      <div style="font-size:0.75rem;font-weight:700;color:var(--color-cyan);text-transform:uppercase;letter-spacing:0.5px;margin-top:10px;margin-bottom:6px;">
        Backward Chaining (Goal Verification):
      </div>
      <div class="ai-match-item">
        <i class="fa-solid ${backwardCheck.isProven ? 'fa-circle-check' : 'fa-circle-question'}" style="color:${backwardCheck.isProven ? '#2ed573' : '#fdcb6e'};"></i>
        <span><strong>Goal Hypothesis:</strong> "${movie.title} is an ideal match" &rarr; ${backwardCheck.isProven ? '<span style="color:#2ed573;font-weight:700;">PROVEN</span>' : '<span style="color:#fdcb6e;font-weight:700;">PARTIAL</span>'} (${backwardCheck.satisfiedCount}/${backwardCheck.totalGoals} sub-goals satisfied)</span>
      </div>
      <div class="ai-rule-fired" style="margin-top:10px;">
        ⚙️ Primary Production Rule Fired: ${aiResult.ruleFired}
      </div>
    `;
  }

  // Wishlist button in modal
  if (wishlistBtn) {
    const isWished = checkWishlistStatus(movie.id);
    wishlistBtn.innerHTML = `<i class="${isWished ? 'fa-solid' : 'fa-regular'} fa-heart"></i><span>${isWished ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>`;
    wishlistBtn.onclick = () => {
      const nowWished = toggleWishlist(movie);
      wishlistBtn.innerHTML = `<i class="${nowWished ? 'fa-solid' : 'fa-regular'} fa-heart"></i><span>${nowWished ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>`;
    };
  }

  // Record to History
  recordItemHistory(movie);

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Main Movies Page Renderer — AI Inference Engine Orchestrator
 */
function renderMoviesPageView() {
  const container    = document.getElementById('moviesPageGrid');
  const countEl      = document.getElementById('movieResultsCount');
  if (!container) return;

  // 1. Load Working Memory Facts
  const facts = loadWorkingMemoryFacts();
  updateMovieFactsBanner(facts);

  // 2. Read Filter & Search values
  const searchVal   = (document.getElementById('movieSearchInput')?.value || '').toLowerCase().trim();
  const genreFilter = document.getElementById('filterMovieGenre')?.value  || 'All';
  const langFilter  = document.getElementById('filterMovieLang')?.value   || 'All';
  const ratingFilter= parseFloat(document.getElementById('filterMovieRating')?.value) || 0;
  const durFilter   = document.getElementById('filterMovieDuration')?.value || 'All';
  const sortBy      = document.getElementById('sortMovieBy')?.value        || 'ai';

  // 3. Score ALL movies with the Rule-Based Engine (Forward Chaining)
  let scoredMovies = gMoviesCatalog.map(movie => {
    const aiResult = evaluateMovieRules(movie, facts);
    return { movie, aiResult };
  });

  // 4. Apply Search Filter
  if (searchVal) {
    scoredMovies = scoredMovies.filter(({ movie }) =>
      movie.title.toLowerCase().includes(searchVal) ||
      movie.genre.toLowerCase().includes(searchVal) ||
      (movie.secondaryGenre || '').toLowerCase().includes(searchVal) ||
      movie.language.toLowerCase().includes(searchVal) ||
      (movie.mood || '').toLowerCase().includes(searchVal)
    );
  }

  // 5. Apply Dropdown Filters
  if (genreFilter !== 'All') {
    scoredMovies = scoredMovies.filter(({ movie }) =>
      movie.genre === genreFilter || movie.secondaryGenre === genreFilter
    );
  }
  if (langFilter !== 'All') {
    scoredMovies = scoredMovies.filter(({ movie }) => movie.language === langFilter);
  }
  if (ratingFilter > 0) {
    scoredMovies = scoredMovies.filter(({ movie }) => movie.rating >= ratingFilter);
  }
  if (durFilter !== 'All') {
    scoredMovies = scoredMovies.filter(({ movie }) => movie.duration === durFilter);
  }

  // 6. Sort
  if (sortBy === 'ai') {
    scoredMovies.sort((a, b) => b.aiResult.score - a.aiResult.score);
  } else if (sortBy === 'rating') {
    scoredMovies.sort((a, b) => b.movie.rating - a.movie.rating);
  } else if (sortBy === 'year') {
    scoredMovies.sort((a, b) => b.movie.year - a.movie.year);
  } else if (sortBy === 'title') {
    scoredMovies.sort((a, b) => a.movie.title.localeCompare(b.movie.title));
  }

  // 7. Determine Top Match threshold
  const highestScore = scoredMovies.length > 0 ? scoredMovies[0].aiResult.score : 0;

  // 8. Render Cards
  container.innerHTML = '';

  if (scoredMovies.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box">
        <i class="fa-solid fa-film empty-state-icon"></i>
        <h4 class="empty-state-title">No Movies Found</h4>
        <p class="empty-state-desc">Try adjusting your filters or search term to discover more movies.</p>
        <button class="btn btn-secondary" onclick="document.getElementById('filterMovieGenre').value='All';document.getElementById('filterMovieLang').value='All';document.getElementById('filterMovieRating').value='All';document.getElementById('filterMovieDuration').value='All';document.getElementById('movieSearchInput').value='';renderMoviesPageView();">
          <i class="fa-solid fa-rotate-left"></i> Reset Filters
        </button>
      </div>`;
    if (countEl) countEl.textContent = '0 movies found';
    return;
  }

  scoredMovies.forEach(({ movie, aiResult }) => {
    const isTopMatch = highestScore >= 5 && aiResult.score === highestScore;
    const cardEl = createMoviePageCard(movie, aiResult, isTopMatch);
    container.appendChild(cardEl);
  });

  // 9. Update result count
  if (countEl) {
    countEl.textContent = `${scoredMovies.length} movie${scoredMovies.length !== 1 ? 's' : ''} found`;
  }

  // 10. Wire up controls (idempotent — only attach once)
  initMoviePageControls();
}

/**
 * Wire search & filter controls for Movies Page (idempotent)
 */
function initMoviePageControls() {
  if (_movieControlsInited) return;
  _movieControlsInited = true;

  const searchInput  = document.getElementById('movieSearchInput');
  const searchBtn    = document.getElementById('movieSearchBtn');
  const genreSelect  = document.getElementById('filterMovieGenre');
  const langSelect   = document.getElementById('filterMovieLang');
  const ratingSelect = document.getElementById('filterMovieRating');
  const durSelect    = document.getElementById('filterMovieDuration');
  const sortSelect   = document.getElementById('sortMovieBy');
  const tweakBtn     = document.getElementById('btnTweakMovieRules');

  function refresh() { renderMoviesPageView(); }

  if (searchInput) searchInput.addEventListener('input', refresh);
  if (searchBtn)   searchBtn.addEventListener('click', refresh);
  if (genreSelect)  genreSelect.addEventListener('change', refresh);
  if (langSelect)   langSelect.addEventListener('change', refresh);
  if (ratingSelect) ratingSelect.addEventListener('change', refresh);
  if (durSelect)    durSelect.addEventListener('change', refresh);
  if (sortSelect)   sortSelect.addEventListener('change', refresh);

  // "Modify Preferences" → go back to Home to update preferences
  if (tweakBtn) {
    tweakBtn.addEventListener('click', () => {
      navigateToView('home');
      showToast('Update your preferences on the Home page, then come back to Movies!', 'info');
    });
  }
}

/**
 * --------------------------------------------------------------------------
 * STEP 6 — Book AI Expert System
 * Working Memory → Rule Base → Forward Chaining → Scored Book Results
 * Separate wishlist (cinebook_book_wishlist) and history (cinebook_book_history)
 * --------------------------------------------------------------------------
 */

/** Load book working memory facts from localStorage / session */
function loadBookWorkingMemoryFacts() {
  let prefs = {};
  const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
  if (raw) { try { prefs = JSON.parse(raw); } catch (e) {} }

  if (!prefs.bookGenre) {
    const sess = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SESSION) ||
      sessionStorage.getItem(STORAGE_KEYS.SESSION) || '{}'
    );
    if (sess.bookGenre)  prefs.bookGenre  = sess.bookGenre;
    if (sess.mood)       prefs.mood       = sess.mood;
    if (sess.language)   prefs.language   = sess.language;
  }

  return {
    bookGenre: (prefs.bookGenre || 'Fantasy').trim(),
    mood:      (prefs.mood      || 'Excited').trim(),
    language:  (prefs.language  || 'English').trim(),
    rating:    (prefs.rating    || '8+').toString().trim(),
    duration:  (prefs.duration  || 'Any').toString().trim()
  };
}

/**
 * Book Rule Base — 6 IF-THEN weighted rules, max 10 pts
 *
 * Rule 1: Primary Genre Match      → +3 pts
 * Rule 2: Secondary Genre Match    → +1.5 pts
 * Rule 3: Mood Match               → +2 pts
 * Rule 4: Language Match           → +2 pts
 * Rule 5: Rating Threshold Match   → +1.5 pts   (Backward chaining quality gate)
 * Rule 6: Duration/Length Match    → +1 pt       (bonus)
 */
function evaluateBookRules(book, facts) {
  let score = 0;
  const matchedRules = [];

  // Rule 1 — Primary Genre
  if (book.genre && facts.bookGenre &&
      book.genre.toLowerCase() === facts.bookGenre.toLowerCase()) {
    score += 3;
    matchedRules.push(`✅ Rule 1: IF BookGenre = ${facts.bookGenre} THEN +3 pts (Primary genre match)`);
  }

  // Rule 2 — Secondary Genre
  if (book.secondaryGenre && facts.bookGenre &&
      book.secondaryGenre.toLowerCase() === facts.bookGenre.toLowerCase()) {
    score += 1.5;
    matchedRules.push(`✅ Rule 2: IF SecondaryGenre = ${facts.bookGenre} THEN +1.5 pts (Secondary genre match)`);
  }

  // Rule 3 — Mood
  if (book.mood && facts.mood &&
      book.mood.toLowerCase() === facts.mood.toLowerCase()) {
    score += 2;
    matchedRules.push(`✅ Rule 3: IF Mood = ${facts.mood} THEN +2 pts (Mood aligned)`);
  }

  // Rule 4 — Language
  if (book.language && facts.language &&
      book.language.toLowerCase() === facts.language.toLowerCase()) {
    score += 2;
    matchedRules.push(`✅ Rule 4: IF Language = ${facts.language} THEN +2 pts (Language preferred)`);
  }

  // Rule 5 — Rating threshold (backward chaining quality gate)
  const ratingTarget = parseFloat(facts.rating) || 8.0;
  if (book.rating >= ratingTarget) {
    score += 1.5;
    matchedRules.push(`✅ Rule 5: IF Rating >= ${ratingTarget} THEN +1.5 pts (Quality threshold met: ${book.rating})`);
  }

  // Rule 6 — Duration/Length (bonus)
  const dur = (facts.duration || '').toLowerCase();
  if (dur && dur !== 'any' && book.duration &&
      book.duration.toLowerCase() === dur) {
    score += 1;
    matchedRules.push(`✅ Rule 6: IF Length = ${facts.duration} THEN +1 pt (Length preference met)`);
  }

  score = Math.min(score, 10);

  return {
    score: Math.round(score * 10) / 10,
    matchedRules,
    ruleFired: book.aiRuleMatch?.ruleFired ||
      `IF BookGenre = ${book.genre} AND Mood = ${book.mood || 'Any'} THEN Recommend ${book.genre} books.`
  };
}

/** Update the AI Working Memory facts banner on the Books page */
function updateBookFactsBanner(facts) {
  const el = (id) => document.getElementById(id);
  if (el('bookFactGenre'))  el('bookFactGenre').textContent  = `Genre: ${facts.bookGenre}`;
  if (el('bookFactMood'))   el('bookFactMood').textContent   = `Mood: ${facts.mood}`;
  if (el('bookFactLang'))   el('bookFactLang').textContent   = `Lang: ${facts.language}`;
  if (el('bookFactRating')) el('bookFactRating').textContent = `Rating: ${facts.rating}`;
}

/** Genre tag colour map for books */
function getBookGenreTagStyle(genre) {
  const map = {
    'Self-Help':  'color:#2ed573;border-color:rgba(46,213,115,.3);background:rgba(46,213,115,.12)',
    'Fiction':    'color:#a29bfe;border-color:rgba(162,155,254,.3);background:rgba(162,155,254,.12)',
    'Fantasy':    'color:#9b51e0;border-color:rgba(155,81,224,.3);background:rgba(155,81,224,.12)',
    'Biography':  'color:#fdcb6e;border-color:rgba(253,203,110,.3);background:rgba(253,203,110,.12)',
    'Finance':    'color:#f37335;border-color:rgba(243,115,53,.3);background:rgba(243,115,53,.12)',
    'Science':    'color:#00a8ff;border-color:rgba(0,168,255,.3);background:rgba(0,168,255,.12)',
    'History':    'color:#fd79a8;border-color:rgba(253,121,168,.3);background:rgba(253,121,168,.12)',
    'Adventure':  'color:#00cec9;border-color:rgba(0,206,201,.3);background:rgba(0,206,201,.12)',
    'Philosophy': 'color:#e17055;border-color:rgba(225,112,85,.3);background:rgba(225,112,85,.12)',
    'Dystopia':   'color:#d63031;border-color:rgba(214,48,49,.3);background:rgba(214,48,49,.12)',
    'Productivity':'color:#5352ed;border-color:rgba(83,82,237,.3);background:rgba(83,82,237,.12)',
    'Spirituality':'color:#ff6b81;border-color:rgba(255,107,129,.3);background:rgba(255,107,129,.12)'
  };
  return map[genre] || 'color:#00a8ff;border-color:rgba(0,168,255,.3);background:rgba(0,168,255,.12)';
}

// (Book wishlist and history storage helpers are consolidated in Section 7)


/** Create a Book Card element with AI score badge */
function createBookPageCard(book, aiResult, isTopMatch) {
  const card = document.createElement('article');
  card.className = 'media-card';

  const isWishlisted = checkBookWishlistStatus(book.id);
  const scorePct = Math.round((aiResult.score / 10) * 100);
  const genreStyle = getBookGenreTagStyle(book.genre);

  const fullStars  = Math.floor(book.rating / 2);
  const halfStar   = (book.rating / 2 - fullStars) >= 0.4 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  let starsHtml = '';
  for (let i = 0; i < fullStars;  i++) starsHtml += '<i class="fa-solid fa-star"      style="color:#ffd700;font-size:0.7rem;"></i>';
  if (halfStar)                         starsHtml += '<i class="fa-solid fa-star-half-stroke" style="color:#ffd700;font-size:0.7rem;"></i>';
  for (let i = 0; i < emptyStars; i++) starsHtml += '<i class="fa-regular fa-star"     style="color:#555;font-size:0.7rem;"></i>';

  const badgeClass = isTopMatch ? 'ai-match-badge top-match' : 'ai-match-badge';
  const badgeIcon  = isTopMatch ? '⭐' : '🤖';

  card.innerHTML = `
    <div class="media-poster-box" style="position:relative;">
      <img src="${book.cover}" alt="${book.title}" loading="lazy"
        onerror="this.src='https://via.placeholder.com/300x440/0b0f19/a29bfe?text=${encodeURIComponent(book.title)}'">
      <div class="${badgeClass}">
        <span>${badgeIcon}</span>
        <span>${scorePct}% Match</span>
      </div>
      ${isTopMatch ? '<div style="position:absolute;top:10px;right:10px;background:linear-gradient(135deg,#9b51e0,#ff2a6d);color:#fff;font-size:0.65rem;font-weight:700;padding:2px 7px;border-radius:20px;z-index:5;">TOP READ</div>' : ''}
    </div>
    <div class="media-card-body">
      <h4 class="media-title" title="${book.title}">${book.title}</h4>
      <div class="media-meta-row">
        <span style="font-size:0.78rem;color:var(--text-muted);font-style:italic;">${book.author}</span>
        <span class="media-rating"><i class="fa-solid fa-star"></i> ${book.rating}</span>
      </div>
      <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:4px;">${book.year} &nbsp;•&nbsp; ${book.pages || '?'} pages</div>
      <div style="display:flex;gap:4px;align-items:center;margin-bottom:6px;">${starsHtml}</div>
      <span class="genre-tag" style="${genreStyle}">${book.genre}</span>
      <div style="margin-top:8px;font-size:0.75rem;color:var(--text-muted);">
        <i class="fa-solid fa-language" style="margin-right:3px;"></i>${book.language}
        &nbsp;•&nbsp;
        <i class="fa-solid fa-book" style="margin-right:3px;"></i>${book.duration}
      </div>
      <div class="media-card-actions">
        <button class="btn btn-view-details btn-book-details-trigger">
          <i class="fa-solid fa-circle-info" style="margin-right:5px;font-size:0.8rem;"></i>View Details
        </button>
        <button class="btn-icon btn-book-wishlist-trigger ${isWishlisted ? 'active' : ''}" aria-label="Toggle Book Wishlist">
          <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
      </div>
    </div>
  `;

  // Details handler
  const detailsBtn = card.querySelector('.btn-book-details-trigger');
  if (detailsBtn) {
    detailsBtn.addEventListener('click', () => openBookDetailsModal(book, aiResult));
  }

  // Wishlist handler
  const wishBtn = card.querySelector('.btn-book-wishlist-trigger');
  if (wishBtn) {
    wishBtn.addEventListener('click', () => {
      const activeNow = toggleBookWishlist(book);
      wishBtn.classList.toggle('active', activeNow);
      const icon = wishBtn.querySelector('i');
      if (icon) icon.className = activeNow ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    });
  }

  return card;
}

/** Open Details Modal with "Why this book?" AI explanation */
function openBookDetailsModal(book, aiResult) {
  const modal = document.getElementById('detailsModal');
  if (!modal) return;

  const modalImg    = document.getElementById('modalImg');
  const modalTitle  = document.getElementById('modalTitle');
  const modalDesc   = document.getElementById('modalDescription');
  const specsEl     = modal.querySelector('.modal-specs-list');
  const aiRuleBox   = modal.querySelector('.ai-rule-box');
  const wishlistBtn = modal.querySelector('.modal-actions .btn-primary');

  if (modalImg)   { modalImg.src = book.cover; modalImg.alt = book.title; }
  if (modalTitle) modalTitle.textContent = `${book.title} (${book.year})`;
  if (modalDesc)  modalDesc.textContent  = book.description || 'No description available.';

  // Specs
  if (specsEl) {
    specsEl.innerHTML = `
      <div class="spec-row"><span class="spec-label">Type</span><span class="spec-value">: Book 📖</span></div>
      <div class="spec-row"><span class="spec-label">Author</span><span class="spec-value">: ${book.author}</span></div>
      <div class="spec-row"><span class="spec-label">Genre</span><span class="spec-value">: ${book.genre}${book.secondaryGenre ? ' / ' + book.secondaryGenre : ''}</span></div>
      <div class="spec-row"><span class="spec-label">Language</span><span class="spec-value">: ${book.language}</span></div>
      <div class="spec-row"><span class="spec-label">Rating</span><span class="spec-value">: ⭐ ${book.rating}/10</span></div>
      <div class="spec-row"><span class="spec-label">Pages</span><span class="spec-value">: ${book.pages || 'N/A'}</span></div>
      <div class="spec-row"><span class="spec-label">Length</span><span class="spec-value">: ${book.duration}</span></div>
      <div class="spec-row"><span class="spec-label">AI Score</span><span class="spec-value" style="color:#a29bfe;font-weight:700;">: ${aiResult.score}/10 (${Math.round(aiResult.score * 10)}%)</span></div>
    `;
  }

  // "Why this book?" explanation (Forward + Backward Chaining)
  if (aiRuleBox) {
    const bookWmFacts = loadBookWorkingMemoryFacts();
    const backwardCheck = verifyBackwardChainingGoal(book, bookWmFacts);

    const matchItems = aiResult.matchedRules.length > 0
      ? aiResult.matchedRules.map(r =>
          `<div class="ai-match-item"><i class="fa-solid fa-circle-check"></i><span>${r}</span></div>`
        ).join('')
      : '<div class="ai-match-item"><i class="fa-solid fa-circle-xmark" style="color:#e17055;"></i><span>No specific preference rules matched — showing general recommendation.</span></div>';

    aiRuleBox.innerHTML = `
      <div class="ai-rule-title">
        <i class="fa-solid fa-lightbulb"></i>
        <span>Why this book? — Rule-Based Expert System Analysis</span>
      </div>
      <div style="font-size:0.75rem;font-weight:700;color:var(--color-pink);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">
        Forward Chaining (Deductions Fired):
      </div>
      ${matchItems}
      <div style="font-size:0.75rem;font-weight:700;color:var(--color-cyan);text-transform:uppercase;letter-spacing:0.5px;margin-top:10px;margin-bottom:6px;">
        Backward Chaining (Goal Verification):
      </div>
      <div class="ai-match-item">
        <i class="fa-solid ${backwardCheck.isProven ? 'fa-circle-check' : 'fa-circle-question'}" style="color:${backwardCheck.isProven ? '#2ed573' : '#fdcb6e'};"></i>
        <span><strong>Goal Hypothesis:</strong> "${book.title} is an ideal match" &rarr; ${backwardCheck.isProven ? '<span style="color:#2ed573;font-weight:700;">PROVEN</span>' : '<span style="color:#fdcb6e;font-weight:700;">PARTIAL</span>'} (${backwardCheck.satisfiedCount}/${backwardCheck.totalGoals} sub-goals satisfied)</span>
      </div>
      <div class="ai-rule-fired" style="margin-top:10px;">
        ⚙️ Primary Production Rule Fired: ${aiResult.ruleFired}
      </div>
    `;
  }

  // Wishlist button in modal
  if (wishlistBtn) {
    const isWished = checkBookWishlistStatus(book.id);
    wishlistBtn.innerHTML = `<i class="${isWished ? 'fa-solid' : 'fa-regular'} fa-heart"></i><span>${isWished ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>`;
    wishlistBtn.onclick = () => {
      const nowWished = toggleBookWishlist(book);
      wishlistBtn.innerHTML = `<i class="${nowWished ? 'fa-solid' : 'fa-regular'} fa-heart"></i><span>${nowWished ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>`;
    };
  }

  // Record to book history
  recordBookHistory(book);

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Main Books Page Renderer — Book AI Inference Engine Orchestrator
 */
function renderBooksPageView() {
  const container = document.getElementById('booksPageGrid');
  const countEl   = document.getElementById('bookResultsCount');
  if (!container) return;

  // 1. Load Working Memory Facts
  const facts = loadBookWorkingMemoryFacts();
  updateBookFactsBanner(facts);

  // 2. Read Filter & Search values
  const searchVal    = (document.getElementById('bookSearchInput')?.value || '').toLowerCase().trim();
  const genreFilter  = document.getElementById('filterBookGenre')?.value   || 'All';
  const langFilter   = document.getElementById('filterBookLang')?.value    || 'All';
  const ratingFilter = parseFloat(document.getElementById('filterBookRating')?.value) || 0;
  const durFilter    = document.getElementById('filterBookDuration')?.value || 'All';
  const sortBy       = document.getElementById('sortBookBy')?.value         || 'ai';

  // 3. Score ALL books via Forward Chaining Rule Engine
  let scoredBooks = gBooksCatalog.map(book => ({
    book,
    aiResult: evaluateBookRules(book, facts)
  }));

  // 4. Search — title, author, genre, language, mood
  if (searchVal) {
    scoredBooks = scoredBooks.filter(({ book }) =>
      book.title.toLowerCase().includes(searchVal)          ||
      (book.author || '').toLowerCase().includes(searchVal) ||
      book.genre.toLowerCase().includes(searchVal)          ||
      (book.secondaryGenre || '').toLowerCase().includes(searchVal) ||
      book.language.toLowerCase().includes(searchVal)       ||
      (book.mood || '').toLowerCase().includes(searchVal)
    );
  }

  // 5. Dropdown Filters
  if (genreFilter !== 'All') {
    scoredBooks = scoredBooks.filter(({ book }) =>
      book.genre === genreFilter || book.secondaryGenre === genreFilter
    );
  }
  if (langFilter !== 'All') {
    scoredBooks = scoredBooks.filter(({ book }) => book.language === langFilter);
  }
  if (ratingFilter > 0) {
    scoredBooks = scoredBooks.filter(({ book }) => book.rating >= ratingFilter);
  }
  if (durFilter !== 'All') {
    scoredBooks = scoredBooks.filter(({ book }) => book.duration === durFilter);
  }

  // 6. Sort
  if (sortBy === 'ai')     scoredBooks.sort((a, b) => b.aiResult.score - a.aiResult.score);
  else if (sortBy === 'rating') scoredBooks.sort((a, b) => b.book.rating - a.book.rating);
  else if (sortBy === 'year')   scoredBooks.sort((a, b) => b.book.year   - a.book.year);
  else if (sortBy === 'title')  scoredBooks.sort((a, b) => a.book.title.localeCompare(b.book.title));

  // 7. Top match threshold
  const highestScore = scoredBooks.length > 0 ? scoredBooks[0].aiResult.score : 0;

  // 8. Render
  container.innerHTML = '';

  if (scoredBooks.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box">
        <i class="fa-solid fa-book-open empty-state-icon" style="color:#a29bfe;filter:drop-shadow(0 0 18px rgba(162,155,254,0.4));"></i>
        <h4 class="empty-state-title">No Books Found</h4>
        <p class="empty-state-desc">Try adjusting your filters or search term to discover more books.</p>
        <button class="btn btn-secondary" onclick="document.getElementById('filterBookGenre').value='All';document.getElementById('filterBookLang').value='All';document.getElementById('filterBookRating').value='All';document.getElementById('filterBookDuration').value='All';document.getElementById('bookSearchInput').value='';renderBooksPageView();">
          <i class="fa-solid fa-rotate-left"></i> Reset Filters
        </button>
      </div>`;
    if (countEl) countEl.textContent = '0 books found';
    return;
  }

  scoredBooks.forEach(({ book, aiResult }) => {
    const isTopMatch = highestScore >= 5 && aiResult.score === highestScore;
    container.appendChild(createBookPageCard(book, aiResult, isTopMatch));
  });

  // 9. Result count
  if (countEl) {
    countEl.textContent = `${scoredBooks.length} book${scoredBooks.length !== 1 ? 's' : ''} found`;
  }

  // 10. Wire controls (idempotent)
  initBookPageControls();
}

/** Wire search & filter controls for the Books Page (idempotent) */
function initBookPageControls() {
  if (_bookControlsInited) return;
  _bookControlsInited = true;

  const searchInput  = document.getElementById('bookSearchInput');
  const searchBtn    = document.getElementById('bookSearchBtn');
  const genreSelect  = document.getElementById('filterBookGenre');
  const langSelect   = document.getElementById('filterBookLang');
  const ratingSelect = document.getElementById('filterBookRating');
  const durSelect    = document.getElementById('filterBookDuration');
  const sortSelect   = document.getElementById('sortBookBy');
  const tweakBtn     = document.getElementById('btnTweakBookRules');

  const refresh = () => renderBooksPageView();

  if (searchInput) searchInput.addEventListener('input',  refresh);
  if (searchBtn)   searchBtn.addEventListener('click',   refresh);
  if (genreSelect)  genreSelect.addEventListener('change', refresh);
  if (langSelect)   langSelect.addEventListener('change',  refresh);
  if (ratingSelect) ratingSelect.addEventListener('change',refresh);
  if (durSelect)    durSelect.addEventListener('change',   refresh);
  if (sortSelect)   sortSelect.addEventListener('change',  refresh);

  if (tweakBtn) {
    tweakBtn.addEventListener('click', () => {
      navigateToView('home');
      showToast('Update your book preferences on the Home page, then return to Books!', 'info');
    });
  }
}

/**
 * --------------------------------------------------------------------------
 * STEP 7 — Wishlist View Implementation
 * Tabs: Movie Wishlist (cinebook_movie_wishlist) & Book Wishlist (cinebook_book_wishlist)
 * --------------------------------------------------------------------------
 */
let gActiveWishlistTab = 'movies';

function renderWishlistView() {
  const container = document.getElementById('wishlistGrid');
  if (!container) return;
  updateWishlistBadges();

  const tabMovies = document.getElementById('tabWishlistMovies');
  const tabBooks  = document.getElementById('tabWishlistBooks');

  function showWishlistTab(type) {
    gActiveWishlistTab = type;
    if (tabMovies) tabMovies.classList.toggle('active', type === 'movies');
    if (tabBooks)  tabBooks.classList.toggle('active',  type === 'books');

    container.innerHTML = '';

    if (type === 'books') {
      const list = getBookWishlist();
      if (list.length === 0) {
        container.innerHTML = `
          <div class="empty-state-box">
            <i class="fa-solid fa-book-open empty-state-icon" style="color: #a29bfe;"></i>
            <h4 class="empty-state-title">Your Book Wishlist is Empty</h4>
            <p class="empty-state-desc">You haven't saved any books yet. Explore our AI-curated reading collection and tap the heart icon on any title to save it for later!</p>
            <button class="btn btn-primary" id="btnExploreBooksFromWishlist">
              <i class="fa-solid fa-book-bookmark"></i> Explore Recommended Books
            </button>
          </div>`;
        const exploreBtn = document.getElementById('btnExploreBooksFromWishlist');
        if (exploreBtn) exploreBtn.onclick = () => navigateToView('books');
        return;
      }

      list.forEach(book => {
        const card = createWishlistCard(book, 'books');
        container.appendChild(card);
      });
    } else {
      // Movies tab
      const list = getMovieWishlist();
      if (list.length === 0) {
        container.innerHTML = `
          <div class="empty-state-box">
            <i class="fa-solid fa-film empty-state-icon"></i>
            <h4 class="empty-state-title">Your Movie Wishlist is Empty</h4>
            <p class="empty-state-desc">You haven't saved any movies yet. Explore our rule-based recommendations and tap the heart icon to build your watchlist!</p>
            <button class="btn btn-primary" id="btnExploreMoviesFromWishlist">
              <i class="fa-solid fa-clapperboard"></i> Explore Recommended Movies
            </button>
          </div>`;
        const exploreBtn = document.getElementById('btnExploreMoviesFromWishlist');
        if (exploreBtn) exploreBtn.onclick = () => navigateToView('movies');
        return;
      }

      list.forEach(movie => {
        const card = createWishlistCard(movie, 'movies');
        container.appendChild(card);
      });
    }
  }

  // Wire tabs
  if (tabMovies) tabMovies.onclick = () => showWishlistTab('movies');
  if (tabBooks)  tabBooks.onclick  = () => showWishlistTab('books');

  showWishlistTab(gActiveWishlistTab);
}

/** Create Wishlist Card with Details & Remove button */
function createWishlistCard(item, type) {
  const isMovie = type === 'movies';
  const card = document.createElement('article');
  card.className = 'media-card';

  const posterSrc = isMovie ? item.poster : item.cover;
  const tagStyle = isMovie ? getGenreTagStyle(item.genre) : getBookGenreTagStyle(item.genre);
  const subtitle = isMovie ? `${item.year || ''}` : `${item.author || ''} • ${item.year || ''}`;

  card.innerHTML = `
    <div class="media-poster-box" style="position:relative;">
      <img src="${posterSrc}" alt="${item.title}" loading="lazy"
        onerror="this.src='https://via.placeholder.com/300x440/0b0f19/ff2a6d?text=${encodeURIComponent(item.title)}'">
      <div style="position:absolute;top:10px;right:10px;background:rgba(11,15,25,0.85);backdrop-filter:blur(6px);border:1px solid rgba(255,42,109,0.4);color:#ff2a6d;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:0.85rem;">
        <i class="fa-solid fa-heart"></i>
      </div>
    </div>
    <div class="media-card-body">
      <h4 class="media-title" title="${item.title}">${item.title}</h4>
      <div class="media-meta-row">
        <span>${subtitle}</span>
        <span class="media-rating"><i class="fa-solid fa-star"></i> ${item.rating}</span>
      </div>
      <span class="genre-tag" style="${tagStyle}">${item.genre}</span>
      <div class="media-card-actions" style="margin-top:12px;display:flex;gap:8px;">
        <button class="btn btn-view-details btn-wishlist-view" style="flex:1;">
          <i class="fa-solid fa-circle-info" style="font-size:0.8rem;margin-right:4px;"></i>Details
        </button>
        <button class="btn-wishlist-remove" title="Remove from wishlist">
          <i class="fa-solid fa-trash-can"></i> Remove
        </button>
      </div>
    </div>
  `;

  // Details button handler
  const viewBtn = card.querySelector('.btn-wishlist-view');
  if (viewBtn) {
    viewBtn.addEventListener('click', () => {
      if (isMovie) {
        const fullMovie = gMoviesCatalog.find(m => m.id === item.id) || item;
        const aiResult = evaluateMovieRules(fullMovie, loadWorkingMemoryFacts());
        openMovieDetailsModal(fullMovie, aiResult);
      } else {
        const fullBook = gBooksCatalog.find(b => b.id === item.id) || item;
        const aiResult = evaluateBookRules(fullBook, loadBookWorkingMemoryFacts());
        openBookDetailsModal(fullBook, aiResult);
      }
    });
  }

  // Remove button handler
  const removeBtn = card.querySelector('.btn-wishlist-remove');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      removeFromWishlist(item.id, type);
    });
  }

  return card;
}

/**
 * --------------------------------------------------------------------------
 * STEP 7 — Watch & Read History View Implementation
 * Tabs: Movies History (cinebook_movie_history) & Books History (cinebook_book_history)
 * --------------------------------------------------------------------------
 */
let gActiveHistoryTab = 'movies';

function renderHistoryView() {
  const container = document.getElementById('historyList');
  if (!container) return;

  const tabMovies = document.getElementById('tabHistoryMovies');
  const tabBooks  = document.getElementById('tabHistoryBooks');
  const clearBtn  = document.getElementById('btnClearHistory');

  // Update counter badges
  const movieCountEl = document.getElementById('historyMovieCount');
  const bookCountEl  = document.getElementById('historyBookCount');
  const movieHist = getMovieHistory();
  const bookHist  = getBookHistory();
  if (movieCountEl) movieCountEl.textContent = movieHist.length;
  if (bookCountEl)  bookCountEl.textContent  = bookHist.length;

  function showHistoryTab(type) {
    gActiveHistoryTab = type;
    if (tabMovies) tabMovies.classList.toggle('active', type === 'movies');
    if (tabBooks)  tabBooks.classList.toggle('active',  type === 'books');

    container.innerHTML = '';

    const list = type === 'movies' ? getMovieHistory() : getBookHistory();

    if (list.length === 0) {
      const isMovie = type === 'movies';
      container.innerHTML = `
        <div class="empty-state-box">
          <i class="${isMovie ? 'fa-solid fa-film' : 'fa-solid fa-book-open'} empty-state-icon" style="${isMovie ? '' : 'color: #a29bfe;'}"></i>
          <h4 class="empty-state-title">No ${isMovie ? 'Watch' : 'Reading'} History Yet</h4>
          <p class="empty-state-desc">Whenever you view details of any ${isMovie ? 'movie' : 'book'}, it will automatically be recorded here so you can keep track of your journey!</p>
          <button class="btn btn-primary" id="btnExploreFromHistory">
            <i class="${isMovie ? 'fa-solid fa-clapperboard' : 'fa-solid fa-book'}"></i> Browse ${isMovie ? 'Movies' : 'Books'}
          </button>
        </div>`;
      const btn = document.getElementById('btnExploreFromHistory');
      if (btn) btn.onclick = () => navigateToView(isMovie ? 'movies' : 'books');
      return;
    }

    list.forEach(item => {
      const row = document.createElement('div');
      row.className = 'history-item';
      const isMovie = type === 'movies';
      const icon = isMovie ? '🎬' : '📖';
      const subInfo = item.author ? `<span>•</span><span style="font-style:italic;">${item.author}</span>` : (item.year ? `<span>•</span><span>${item.year}</span>` : '');

      row.innerHTML = `
        <img src="${item.poster}" alt="${item.title}" class="history-thumb"
          onerror="this.src='https://via.placeholder.com/60x80/0b0f19/ff2a6d?text=?'">
        <div class="history-info">
          <h4 class="history-title">${icon} ${item.title}</h4>
          <div class="history-meta">
            <span>${item.type}</span>
            <span>•</span>
            <span style="color: var(--color-pink); font-weight:600;">${item.genre}</span>
            ${subInfo}
            <span>•</span>
            <span class="media-rating"><i class="fa-solid fa-star"></i> ${item.rating}</span>
          </div>
          <span class="history-timestamp">
            <i class="fa-regular fa-clock" style="margin-right:4px;"></i>Viewed on: ${item.viewedAt}
          </span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <button class="btn btn-secondary btn-history-inspect" style="padding:7px 14px;font-size:0.82rem;">
            <i class="fa-solid fa-circle-info" style="margin-right:4px;"></i> View Details
          </button>
          <button class="btn-history-remove" title="Remove from history">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      `;

      // View Details handler
      const inspectBtn = row.querySelector('.btn-history-inspect');
      if (inspectBtn) {
        inspectBtn.addEventListener('click', () => {
          if (isMovie) {
            const fullMovie = gMoviesCatalog.find(m => m.id === item.id) || item;
            const aiResult = evaluateMovieRules(fullMovie, loadWorkingMemoryFacts());
            openMovieDetailsModal(fullMovie, aiResult);
          } else {
            const fullBook = gBooksCatalog.find(b => b.id === item.id) || item;
            const aiResult = evaluateBookRules(fullBook, loadBookWorkingMemoryFacts());
            openBookDetailsModal(fullBook, aiResult);
          }
        });
      }

      // Remove single history item handler
      const removeBtn = row.querySelector('.btn-history-remove');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          removeHistoryItem(item.id, type);
        });
      }

      container.appendChild(row);
    });
  }

  if (tabMovies) tabMovies.onclick = () => showHistoryTab('movies');
  if (tabBooks)  tabBooks.onclick  = () => showHistoryTab('books');
  if (clearBtn) {
    clearBtn.onclick = () => {
      clearHistory(gActiveHistoryTab);
    };
  }

  showHistoryTab(gActiveHistoryTab);
}

/**
 * --------------------------------------------------------------------------
 * STEP 7 — Profile Page View & Edit Implementation (cinebook_profile)
 * --------------------------------------------------------------------------
 */
let gProfileEditMode = false;

function getProfileData() {
  const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) {}
  }

  // Fallback to active session or preferences or default
  const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || sessionStorage.getItem(STORAGE_KEYS.SESSION) || '{}');
  const prefs = JSON.parse(localStorage.getItem(STORAGE_KEYS.PREFERENCES) || '{}');

  const defaultProfile = {
    name: session.name || DEFAULT_DEMO_USER.name,
    email: session.email || DEFAULT_DEMO_USER.email,
    dob: session.dateOfBirth || session.dob || DEFAULT_DEMO_USER.dob,
    language: session.language || prefs.language || DEFAULT_DEMO_USER.language,
    movieGenre: session.movieGenre || prefs.movieGenre || DEFAULT_DEMO_USER.movieGenre,
    bookGenre: session.bookGenre || prefs.bookGenre || DEFAULT_DEMO_USER.bookGenre,
    mood: session.mood || prefs.mood || DEFAULT_DEMO_USER.mood,
    avatar: '👤',
    tag: 'Movie & Book Lover'
  };

  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(defaultProfile));
  return defaultProfile;
}

function updateSidebarUserProfile(profile) {
  if (!profile) profile = getProfileData();

  const nameEl = document.getElementById('sidebarProfileName') || document.querySelector('.sidebar-profile .profile-name');
  const tagEl = document.getElementById('sidebarProfileTag') || document.querySelector('.sidebar-profile .profile-tag');
  const avatarEl = document.getElementById('sidebarProfileAvatar') || document.querySelector('.sidebar-profile .avatar-circle');

  if (nameEl && profile.name) nameEl.textContent = profile.name;
  if (tagEl) {
    tagEl.textContent = `${profile.movieGenre || 'Movie'} & ${profile.bookGenre || 'Book'} Lover`;
  }
  if (avatarEl) {
    if (profile.avatar && (profile.avatar.startsWith('http') || profile.avatar.startsWith('data:image'))) {
      avatarEl.innerHTML = `<img src="${profile.avatar}" alt="${profile.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else if (profile.avatar) {
      avatarEl.innerHTML = `<span style="font-size:1.3rem;">${profile.avatar}</span>`;
    } else {
      avatarEl.innerHTML = `<i class="fa-solid fa-user"></i>`;
    }
  }

  // Update greeting on Home page
  const greetingEl = document.getElementById('userGreetingText');
  if (greetingEl && profile.name) {
    const firstName = profile.name.trim().split(' ')[0];
    greetingEl.textContent = `Welcome back, ${firstName} 👋`;
  }
}

function renderProfileView() {
  const panel = document.getElementById('profileSettingsPanel');
  if (!panel) return;

  const profile = getProfileData();
  const movieWishlistCount = getMovieWishlist().length;
  const bookWishlistCount  = getBookWishlist().length;
  const totalHistoryCount  = getMovieHistory().length + getBookHistory().length;

  // VIEW MODE
  if (!gProfileEditMode) {
    const avatarContent = (profile.avatar && (profile.avatar.startsWith('http') || profile.avatar.startsWith('data:image')))
      ? `<img src="${profile.avatar}" alt="${profile.name}">`
      : `<span>${profile.avatar || '👤'}</span>`;

    panel.innerHTML = `
      <!-- Hero Profile Card -->
      <div class="profile-hero">
        <div class="profile-hero-left">
          <div class="profile-avatar-large">
            <div class="profile-avatar-inner">
              ${avatarContent}
            </div>
          </div>
          <div class="profile-hero-info">
            <h3 class="profile-hero-title">${profile.name}</h3>
            <span class="profile-hero-email"><i class="fa-regular fa-envelope" style="margin-right:6px;"></i>${profile.email}</span>
            <div class="profile-hero-badge">
              <i class="fa-solid fa-shield-heart"></i> AI CineBook Member
            </div>
          </div>
        </div>
        <button class="btn btn-primary" id="btnEditProfileTrigger" style="padding: 10px 22px; font-size: 0.9rem;">
          <i class="fa-solid fa-user-pen"></i> Edit Profile
        </button>
      </div>

      <!-- Quick Stats Grid -->
      <div class="profile-stats-grid">
        <div class="profile-stat-card">
          <div class="profile-stat-icon" style="background: rgba(255, 42, 109, 0.15); color: #ff2a6d;">
            <i class="fa-solid fa-film"></i>
          </div>
          <div>
            <div class="profile-stat-num">${movieWishlistCount}</div>
            <div class="profile-stat-label">Saved Movies</div>
          </div>
        </div>
        <div class="profile-stat-card">
          <div class="profile-stat-icon" style="background: rgba(162, 155, 254, 0.15); color: #a29bfe;">
            <i class="fa-solid fa-book-open"></i>
          </div>
          <div>
            <div class="profile-stat-num">${bookWishlistCount}</div>
            <div class="profile-stat-label">Saved Books</div>
          </div>
        </div>
        <div class="profile-stat-card">
          <div class="profile-stat-icon" style="background: rgba(0, 168, 255, 0.15); color: #00a8ff;">
            <i class="fa-solid fa-clock-rotate-left"></i>
          </div>
          <div>
            <div class="profile-stat-num">${totalHistoryCount}</div>
            <div class="profile-stat-label">Activity Views Logged</div>
          </div>
        </div>
      </div>

      <!-- User Preferences Grid -->
      <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff; margin-bottom: 14px;">
        <i class="fa-solid fa-sliders accent-pink" style="margin-right: 8px;"></i>
        Personalized AI Preferences
      </h3>
      <div class="profile-details-grid">
        <div class="profile-detail-card">
          <div class="profile-detail-icon"><i class="fa-regular fa-calendar"></i></div>
          <div class="profile-detail-meta">
            <span class="profile-detail-label">Date of Birth</span>
            <span class="profile-detail-val">${profile.dob || '2004-01-01'}</span>
          </div>
        </div>
        <div class="profile-detail-card">
          <div class="profile-detail-icon"><i class="fa-solid fa-language"></i></div>
          <div class="profile-detail-meta">
            <span class="profile-detail-label">Preferred Language</span>
            <span class="profile-detail-val">${profile.language || 'English'}</span>
          </div>
        </div>
        <div class="profile-detail-card">
          <div class="profile-detail-icon"><i class="fa-solid fa-film"></i></div>
          <div class="profile-detail-meta">
            <span class="profile-detail-label">Favorite Movie Genre</span>
            <span class="profile-detail-val">${profile.movieGenre || 'Action'}</span>
          </div>
        </div>
        <div class="profile-detail-card">
          <div class="profile-detail-icon"><i class="fa-solid fa-book"></i></div>
          <div class="profile-detail-meta">
            <span class="profile-detail-label">Favorite Book Genre</span>
            <span class="profile-detail-val">${profile.bookGenre || 'Fantasy'}</span>
          </div>
        </div>
        <div class="profile-detail-card">
          <div class="profile-detail-icon"><i class="fa-solid fa-masks-theater"></i></div>
          <div class="profile-detail-meta">
            <span class="profile-detail-label">Current Mood</span>
            <span class="profile-detail-val">${profile.mood || 'Excited'}</span>
          </div>
        </div>
        <div class="profile-detail-card">
          <div class="profile-detail-icon"><i class="fa-solid fa-microchip"></i></div>
          <div class="profile-detail-meta">
            <span class="profile-detail-label">Recommendation Engine</span>
            <span class="profile-detail-val" style="color: #ff7597;">Rule-Based AI Active</span>
          </div>
        </div>
      </div>
    `;

    const editBtn = document.getElementById('btnEditProfileTrigger');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        gProfileEditMode = true;
        renderProfileView();
      });
    }
  } else {
    // EDIT MODE
    let selectedAvatar = profile.avatar || '👤';

    const avatarOptions = [
      { emoji: '👤', label: 'Classic' },
      { emoji: '🎬', label: 'Director' },
      { emoji: '🍿', label: 'Cinephile' },
      { emoji: '📖', label: 'Scholar' },
      { emoji: '🧙', label: 'Fantasy' },
      { emoji: '🚀', label: 'Explorer' }
    ];

    const avatarButtonsHtml = avatarOptions.map(opt => `
      <button type="button" class="avatar-preset-btn ${selectedAvatar === opt.emoji ? 'active' : ''}" data-avatar="${opt.emoji}" title="${opt.label}">
        ${opt.emoji}
      </button>
    `).join('');

    panel.innerHTML = `
      <div class="glass-panel" style="padding: 30px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:16px;">
          <div>
            <h3 style="font-size: 1.35rem; font-weight: 800; color: #fff;">
              <i class="fa-solid fa-user-pen accent-pink" style="margin-right: 8px;"></i>
              Edit Profile & AI Preferences
            </h3>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">
              Updating your preferences here immediately tunes your rule-based recommendations.
            </p>
          </div>
          <button class="btn btn-secondary" id="btnCancelEditTop" style="padding: 6px 14px; font-size: 0.82rem;">
            <i class="fa-solid fa-xmark"></i> Cancel
          </button>
        </div>

        <form id="editProfileForm">
          <!-- Avatar Picker -->
          <div style="margin-bottom: 24px;">
            <label class="form-label" style="margin-bottom: 8px; display:block;">Profile Avatar / Photo</label>
            <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
              <div class="profile-avatar-large" style="width: 76px; height: 76px;">
                <div class="profile-avatar-inner" id="editAvatarPreview" style="font-size: 2rem;">
                  ${selectedAvatar.startsWith('http') ? `<img src="${selectedAvatar}">` : `<span>${selectedAvatar}</span>`}
                </div>
              </div>
              <div>
                <span style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 6px;">Choose a Character Preset:</span>
                <div class="avatar-preset-grid" id="avatarPresets">
                  ${avatarButtonsHtml}
                </div>
              </div>
            </div>
            <div style="margin-top: 14px;">
              <span style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 4px;">Or paste a custom Image URL:</span>
              <div class="input-wrapper">
                <input type="url" id="editAvatarUrl" class="input-field" placeholder="https://example.com/photo.jpg" value="${selectedAvatar.startsWith('http') ? selectedAvatar : ''}">
              </div>
            </div>
          </div>

          <!-- Form Grid -->
          <div class="form-grid-2col" style="gap: 18px; margin-bottom: 28px;">
            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <div class="input-wrapper">
                <input type="text" id="editProfileName" class="input-field" value="${profile.name}" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Email Address (Read-Only)</label>
              <div class="input-wrapper">
                <input type="email" class="input-field" value="${profile.email}" readonly style="opacity: 0.7; cursor: not-allowed;">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Date of Birth</label>
              <div class="input-wrapper">
                <input type="date" id="editProfileDob" class="input-field" value="${profile.dob || '2004-01-01'}">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Preferred Language</label>
              <div class="input-wrapper">
                <select id="editProfileLang" class="input-field" style="background:#151a2c; color:#fff;">
                  <option value="English" ${profile.language === 'English' ? 'selected' : ''}>English</option>
                  <option value="Hindi" ${profile.language === 'Hindi' ? 'selected' : ''}>Hindi</option>
                  <option value="Marathi" ${profile.language === 'Marathi' ? 'selected' : ''}>Marathi</option>
                  <option value="Spanish" ${profile.language === 'Spanish' ? 'selected' : ''}>Spanish</option>
                  <option value="French" ${profile.language === 'French' ? 'selected' : ''}>French</option>
                  <option value="German" ${profile.language === 'German' ? 'selected' : ''}>German</option>
                  <option value="Japanese" ${profile.language === 'Japanese' ? 'selected' : ''}>Japanese</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Preferred Movie Genre</label>
              <div class="input-wrapper">
                <select id="editProfileMovieGenre" class="input-field" style="background:#151a2c; color:#fff;">
                  <option value="Action" ${profile.movieGenre === 'Action' ? 'selected' : ''}>Action</option>
                  <option value="Sci-Fi" ${profile.movieGenre === 'Sci-Fi' ? 'selected' : ''}>Sci-Fi</option>
                  <option value="Drama" ${profile.movieGenre === 'Drama' ? 'selected' : ''}>Drama</option>
                  <option value="Comedy" ${profile.movieGenre === 'Comedy' ? 'selected' : ''}>Comedy</option>
                  <option value="Adventure" ${profile.movieGenre === 'Adventure' ? 'selected' : ''}>Adventure</option>
                  <option value="Thriller" ${profile.movieGenre === 'Thriller' ? 'selected' : ''}>Thriller</option>
                  <option value="Romance" ${profile.movieGenre === 'Romance' ? 'selected' : ''}>Romance</option>
                  <option value="Mystery" ${profile.movieGenre === 'Mystery' ? 'selected' : ''}>Mystery</option>
                  <option value="Fantasy" ${profile.movieGenre === 'Fantasy' ? 'selected' : ''}>Fantasy</option>
                  <option value="Horror" ${profile.movieGenre === 'Horror' ? 'selected' : ''}>Horror</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Preferred Book Genre</label>
              <div class="input-wrapper">
                <select id="editProfileBookGenre" class="input-field" style="background:#151a2c; color:#fff;">
                  <option value="Self-Help" ${profile.bookGenre === 'Self-Help' ? 'selected' : ''}>Self-Help</option>
                  <option value="Fiction" ${profile.bookGenre === 'Fiction' ? 'selected' : ''}>Fiction</option>
                  <option value="Fantasy" ${profile.bookGenre === 'Fantasy' ? 'selected' : ''}>Fantasy</option>
                  <option value="Biography" ${profile.bookGenre === 'Biography' ? 'selected' : ''}>Biography</option>
                  <option value="Finance" ${profile.bookGenre === 'Finance' ? 'selected' : ''}>Finance</option>
                  <option value="Science" ${profile.bookGenre === 'Science' ? 'selected' : ''}>Science</option>
                  <option value="History" ${profile.bookGenre === 'History' ? 'selected' : ''}>History</option>
                  <option value="Adventure" ${profile.bookGenre === 'Adventure' ? 'selected' : ''}>Adventure</option>
                  <option value="Philosophy" ${profile.bookGenre === 'Philosophy' ? 'selected' : ''}>Philosophy</option>
                </select>
              </div>
            </div>

            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label">Preferred Mood</label>
              <div class="input-wrapper">
                <select id="editProfileMood" class="input-field" style="background:#151a2c; color:#fff;">
                  <option value="Excited" ${profile.mood === 'Excited' ? 'selected' : ''}>Excited</option>
                  <option value="Inspired" ${profile.mood === 'Inspired' ? 'selected' : ''}>Inspired</option>
                  <option value="Motivated" ${profile.mood === 'Motivated' ? 'selected' : ''}>Motivated</option>
                  <option value="Thoughtful" ${profile.mood === 'Thoughtful' ? 'selected' : ''}>Thoughtful</option>
                  <option value="Peaceful" ${profile.mood === 'Peaceful' ? 'selected' : ''}>Peaceful</option>
                  <option value="Romantic" ${profile.mood === 'Romantic' ? 'selected' : ''}>Romantic</option>
                  <option value="Curious" ${profile.mood === 'Curious' ? 'selected' : ''}>Curious</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div style="display:flex;gap:12px;justify-content:flex-end;">
            <button type="button" class="btn btn-secondary" id="btnCancelEdit">
              <i class="fa-solid fa-xmark"></i> Cancel
            </button>
            <button type="submit" class="btn btn-primary" id="btnSaveProfile">
              <i class="fa-solid fa-floppy-disk"></i> Save Profile
            </button>
          </div>
        </form>
      </div>
    `;

    // Avatar presets click handler
    const presetBtns = panel.querySelectorAll('.avatar-preset-btn');
    const previewEl = document.getElementById('editAvatarPreview');
    const urlInput = document.getElementById('editAvatarUrl');

    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedAvatar = btn.dataset.avatar;
        if (urlInput) urlInput.value = '';
        if (previewEl) previewEl.innerHTML = `<span>${selectedAvatar}</span>`;
      });
    });

    if (urlInput) {
      urlInput.addEventListener('input', () => {
        const val = urlInput.value.trim();
        if (val) {
          selectedAvatar = val;
          presetBtns.forEach(b => b.classList.remove('active'));
          if (previewEl) previewEl.innerHTML = `<img src="${val}" onerror="this.src='https://via.placeholder.com/80/0b0f19/ff2a6d?text=?'">`;
        }
      });
    }

    // Cancel handlers
    const cancel1 = document.getElementById('btnCancelEdit');
    const cancel2 = document.getElementById('btnCancelEditTop');
    const doCancel = () => {
      gProfileEditMode = false;
      renderProfileView();
    };
    if (cancel1) cancel1.onclick = doCancel;
    if (cancel2) cancel2.onclick = doCancel;

    // Submit handler
    const form = document.getElementById('editProfileForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameVal = (document.getElementById('editProfileName')?.value || '').trim();
        if (!nameVal) {
          showToast('Please enter your full name.', 'error');
          return;
        }

        const updatedProfile = {
          name: nameVal,
          email: profile.email,
          dob: document.getElementById('editProfileDob')?.value || profile.dob,
          language: document.getElementById('editProfileLang')?.value || profile.language,
          movieGenre: document.getElementById('editProfileMovieGenre')?.value || profile.movieGenre,
          bookGenre: document.getElementById('editProfileBookGenre')?.value || profile.bookGenre,
          mood: document.getElementById('editProfileMood')?.value || profile.mood,
          avatar: selectedAvatar,
          tag: `${document.getElementById('editProfileMovieGenre')?.value || 'Movie'} & ${document.getElementById('editProfileBookGenre')?.value || 'Book'} Lover`
        };

        // Save to cinebook_profile
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedProfile));

        // Update auth session
        const sessRaw = localStorage.getItem(STORAGE_KEYS.SESSION) || sessionStorage.getItem(STORAGE_KEYS.SESSION);
        if (sessRaw) {
          try {
            const sess = JSON.parse(sessRaw);
            Object.assign(sess, updatedProfile);
            localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sess));
            sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sess));
          } catch (err) {}
        }

        // Update preferences so AI Working Memory reflects new choices
        const prefs = {
          movieGenre: updatedProfile.movieGenre,
          bookGenre: updatedProfile.bookGenre,
          language: updatedProfile.language,
          mood: updatedProfile.mood,
          rating: '8+',
          duration: 'Any'
        };
        localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));

        // Update sidebar
        updateSidebarUserProfile(updatedProfile);

        showToast('Profile updated successfully! AI recommendation rules refreshed. ✨', 'success');
        gProfileEditMode = false;
        renderProfileView();
      });
    }
  }
}

/**
 * --------------------------------------------------------------------------
 * 9. Toast Notification System
 * --------------------------------------------------------------------------
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconClass = 'fa-solid fa-circle-info';
  if (type === 'success') iconClass = 'fa-solid fa-circle-check';
  if (type === 'error') iconClass = 'fa-solid fa-circle-exclamation';

  toast.innerHTML = `
    <i class="${iconClass} toast-icon"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3500);
}
