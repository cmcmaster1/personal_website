import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Projects from './pages/Projects';
import BlogPost from './pages/BlogPost';
import ProjectRedirect from './pages/ProjectRedirect';
import NotFound from './pages/NotFound';

const AraAsm2026 = lazy(() => import('./pages/AraAsm2026'));

const routeFallback = (
  <Box
    sx={{
      minHeight: '100vh',
      backgroundColor: 'background.default',
    }}
  />
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/projects" element={<Projects />} />
      <Route
        path="/ara-asm-2026"
        element={
          <Suspense fallback={routeFallback}>
            <AraAsm2026 />
          </Suspense>
        }
      />
      <Route path="/post/:slug" element={<BlogPost />} />
      <Route path="/:projectName" element={<ProjectRedirect />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
