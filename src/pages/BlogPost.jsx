import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Divider, Link, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PageShell from '../components/PageShell';
import { findPost, formatPostDate } from '../data/posts';
import '../styles/markdown.css';

const publicUrl = import.meta.env.BASE_URL.replace(/\/$/, '');

const postUrl = (slug) => `${publicUrl}/posts/${slug}.md`;

const normalizeMarkdown = (content) =>
  content
    .replace(/\]\(images\//g, `](${publicUrl}/posts/images/`)
    .replace(/\]\(\/images\//g, `](${publicUrl}/posts/images/`);

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const metadata = findPost(slug);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(postUrl(slug), {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Post not found');
        }

        const content = await response.text();
        const lines = content.split('\n');
        const title = lines[0].trim();
        const markdownContent = normalizeMarkdown(lines.slice(1).join('\n'));

        setPost({
          title: metadata?.title || title,
          content: markdownContent,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (slug) {
      fetchPost();
    }

    return () => controller.abort();
  }, [metadata?.title, slug]);

  if (loading) {
    return (
      <PageShell maxWidth="md" mainSx={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress aria-label="Loading post" />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell maxWidth="md">
        <Alert severity="error">{error}</Alert>
        <Button component={RouterLink} to="/blog" startIcon={<ArrowBackIcon />} sx={{ mt: 3 }}>
          Back to blog
        </Button>
      </PageShell>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <PageShell maxWidth="md">
      <Box component="article">
        <Button component={RouterLink} to="/blog" startIcon={<ArrowBackIcon />} sx={{ mb: 4, px: 0 }}>
          Back to blog
        </Button>

        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: '2.35rem', md: '3.35rem' },
            mb: 2,
          }}
        >
          {post.title}
        </Typography>

        {metadata && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 1.5 }} sx={{ mb: 3 }}>
            <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>
              {formatPostDate(metadata.date)}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>
              {metadata.readingTime}
            </Typography>
          </Stack>
        )}

        <Divider sx={{ mb: { xs: 4, md: 6 } }} />

        <Box className="markdown-body">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node: _node, href, children, ...props }) => {
                const isExternal = href && /^https?:\/\//.test(href);

                return (
                  <Link
                    href={href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    {...props}
                  >
                    {children}
                  </Link>
                );
              },
            }}
          >
            {post.content}
          </ReactMarkdown>
        </Box>
      </Box>
    </PageShell>
  );
};

export default BlogPost;
