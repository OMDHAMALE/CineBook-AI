# CineBook AI – Smart Movie Recommendation System

CineBook AI is an intelligent, cinematic web application that provides personalized movie and book recommendations using an **AI Rule-Based Expert System**. Built entirely with standard web technologies, CineBook AI operates seamlessly as a static web application without requiring external backends, databases, or build processes.

---

## 🚀 Live Demo & GitHub Pages Deployment

CineBook AI is built for 100% static hosting on **GitHub Pages**:
1. Push this repository to GitHub.
2. In your repository settings, navigate to **Settings > Pages**.
3. Under **Branch**, select `main` (or `master`) and directory `/ (root)`.
4. Click **Save**. Your site will be published at `https://<username>.github.io/<repo-name>/`.

---

## 🧠 AI Architecture: Rule-Based Expert System

CineBook AI implements classic Artificial Intelligence knowledge engineering:

### 1. Working Memory
- Dynamically stores current user facts and preferences:
  - Selected Genre (e.g., Action, Sci-Fi, Drama)
  - Current Mood (e.g., Excited, Relaxed, Thoughtful, Romantic)
  - Preferred Language (e.g., English, Hindi)
  - Minimum Rating threshold (e.g., 8.0+)
  - Duration preference (Short, Medium, Long)
- Persisted and synchronized across sessions via `localStorage`.

### 2. Rule Base (Knowledge Base)
- Contains modular **IF-THEN production rules** mapping user preference states to media attributes:
  - **Rule 1 (Adrenaline Rush):** IF `Genre = Action` AND `Mood = Excited` THEN Recommend high-octane blockbusters (Score +10).
  - **Rule 2 (Mind-Bending):** IF `Genre = Sci-Fi` AND `Mood = Thoughtful` THEN Recommend speculative fiction and sci-fi masterpieces (Score +10).
  - **Rule 3 (Emotional Journey):** IF `Genre = Drama` THEN Recommend critically acclaimed dramas (Score +8).
  - **Rule 4 (Laughter Therapy):** IF `Mood = Relaxed` AND `Genre = Comedy` THEN Recommend lighthearted comedies (Score +9).
  - **Rule 5 (Language Filter):** IF `Language == Movie.Language` THEN Boost candidate affinity (Score +5).
  - **Rule 6 (Quality Standard):** IF `Rating >= Threshold` THEN Prioritize top-tier recommendations (Score +6).

### 3. Forward Chaining Inference Engine
- Computes match scores by asserting user facts against the rule base.
- Rules fire in sequence to evaluate and rank all items in the catalog.
- Generates transparent, human-readable **"Why this movie?"** reasoning explanations displaying the exact rules fired and deduction path.

### 4. Backward Chaining Goal Verification
- Formulates a goal hypothesis (e.g., *"Is this movie an ideal recommendation?"*).
- Evaluates backwards through sub-goals (quality threshold, genre alignment, mood synergy, language accessibility) to verify evidence.

---

## ✨ Features

- **Personalized Recommendations:** Dynamic ranking based on mood, genre, language, and rating.
- **Explainable AI:** "Why this movie?" and "Why this book?" breakdown explaining matched facts and fired rules.
- **Search & Advanced Filtering:** Real-time search across titles, actors, genres, with multi-criteria dropdown filters and sorting.
- **Details Modal:** Rich popups with high-resolution imagery, release information, specifications, and full AI inference traces.
- **Wishlist Management:** Separate movie and book wishlists stored locally via `localStorage`.
- **Watch & Read History:** Activity tracking with timestamps, counter badges, and item removal.
- **Profile & Preference Tuning:** Interactive user profile and preference customization that immediately recalibrates recommendation algorithms.
- **Responsive Dark Cinematic UI:** Glassmorphism aesthetics optimized for desktop (1200px+), tablet (768px–1199px), and mobile (320px–767px) viewports with mobile navigation drawer.

---

## 🛠️ Technologies Used

- **HTML5:** Semantic markup, accessible controls, responsive viewport configuration.
- **CSS3:** Modern CSS variables, Glassmorphism backdrop-filters, Flexbox, multi-column CSS Grids, custom keyframe animations.
- **Vanilla JavaScript (ES6+):** Pure client-side logic, Inference Engine, DOM manipulation, asynchronous JSON fetching.
- **JSON:** Modular media catalogs (`movies.json`, `books.json`).
- **Web Storage API:** Local storage for preference persistence, wishlists, history, and auth sessions.

---

## 💻 How to Run Locally

Because CineBook AI uses purely standard web technologies without npm, Node.js, or build steps, running it locally is quick:

### Option 1: Direct File Opening
Double-click `index.html` to open it in any modern browser (Chrome, Edge, Firefox, Safari). Embedded fallback catalogs ensure complete functionality under `file://`.

### Option 2: Local HTTP Server (Recommended)
Using Python:
```bash
# In the project directory:
python -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000) in your web browser.

Or using VS Code:
- Install the **Live Server** extension.
- Right-click `index.html` and select **Open with Live Server**.

---

## 👤 Demo Credentials

- **Email:** `om.dhamale@cinebook.ai`
- **Password:** `password123`
*(Or create a new account via the built-in Registration view)*

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
