# Personal Website

React + Vite personal website for Dr. Chris McMaster.

## Commands

```bash
npm install
npm start
npm run build
npm run preview
```

`npm start` runs the Vite development server. `npm run build` writes the production bundle to `dist/`.

## Structure

```text
public/
  media/        Profile and static media
  posts/        Markdown posts and post images
src/
  components/   Shared page shell and navigation
  data/         Post metadata
  pages/        Route-level React pages
  styles/       Markdown article styling
```

## Routes

- `/` home
- `/blog` post index
- `/post/:slug` markdown post renderer
- `/projects` project index
- `/:projectName` legacy project shortcut redirect

Blog post files live in `public/posts`. Add matching metadata in `src/data/posts.js` so the blog index can list the post in a static build.
