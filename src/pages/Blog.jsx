import React from 'react';
import { Box, Card, CardContent, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PageShell from '../components/PageShell';
import { postIndex, formatPostDate } from '../data/posts';

const Blog = () => {
  return (
    <PageShell maxWidth="md">
      <Box
        sx={{
          mb: { xs: 4, md: 6 },
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: '2.8rem', md: '3.6rem' },
            mb: 2,
          }}
        >
          Blog
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 660 }}>
          Notes on healthcare AI, clinical data, pharmacovigilance, and the practical work of
          turning research ideas into useful systems.
        </Typography>
      </Box>

      <Stack spacing={2.5}>
        {postIndex.map((post) => (
          <Card
            key={post.slug}
            component="article"
            sx={{
              transition: 'transform 160ms ease, box-shadow 160ms ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 22px 58px rgba(21, 26, 24, 0.09)',
              },
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography color="text.secondary" sx={{ fontWeight: 700, mb: 1.5 }}>
                {formatPostDate(post.date)} · {post.readingTime}
              </Typography>

              <Typography variant="h3" component="h2" sx={{ fontSize: '1.75rem', mb: 1.5 }}>
                <Link component={RouterLink} to={`/post/${post.slug}`} underline="hover">
                  {post.title}
                </Link>
              </Typography>

              <Typography color="text.secondary" sx={{ mb: 2.5 }}>
                {post.excerpt}
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1.5, sm: 2 }}
                sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
              >
                <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', fontWeight: 650 }}>
                  {post.topics.join(' · ')}
                </Typography>
                <Link
                  component={RouterLink}
                  to={`/post/${post.slug}`}
                  underline="none"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    color: 'primary.dark',
                    fontWeight: 750,
                  }}
                >
                  Read article <ArrowForwardIcon sx={{ fontSize: 18 }} />
                </Link>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </PageShell>
  );
};

export default Blog;
