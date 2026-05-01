import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Projects from './pages/Projects';
import BlogPost from './pages/BlogPost';
import ProjectRedirect from './pages/ProjectRedirect';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/post/:slug" element={<BlogPost />} />
      <Route path="/:projectName" element={<ProjectRedirect />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
