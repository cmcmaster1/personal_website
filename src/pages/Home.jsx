import React from 'react';
import { Box, Button, Card, CardContent, Link, Stack, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import { Link as RouterLink } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { postIndex, formatPostDate } from '../data/posts';

const focusAreas = [
  {
    title: 'Rheumatology',
    description: 'Clinical work, translational questions, and practical tools for specialist care.',
    icon: ScienceOutlinedIcon,
  },
  {
    title: 'Clinical data',
    description: 'Using real-world health data to answer questions that are hard to reach manually.',
    icon: InsightsOutlinedIcon,
  },
  {
    title: 'Healthcare AI',
    description: 'Building and evaluating AI systems that can fit safely into clinical workflows.',
    icon: ArticleOutlinedIcon,
  },
];

const Home = () => {
  const latestPost = postIndex[0];

  return (
    <PageShell>
      <Box
        component="section"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 360px' },
          gap: { xs: 5, md: 8 },
          alignItems: 'center',
          minHeight: { md: 'calc(100vh - 220px)' },
          pb: { xs: 5, md: 8 },
        }}
      >
        <Box
          sx={{
            maxWidth: 720,
          }}
        >
          <Typography
            component="h1"
            variant="h1"
            sx={{
              fontSize: { xs: '3rem', sm: '4.1rem', md: '4.8rem' },
              mb: 2.5,
            }}
          >
            Dr. Chris McMaster
          </Typography>

          <Typography
            variant="h5"
            component="p"
            sx={{
              color: 'primary.dark',
              fontWeight: 750,
              mb: 1.25,
            }}
          >
            Rheumatologist and data scientist
          </Typography>

          <Typography
            variant="h4"
            component="p"
            sx={{
              maxWidth: 640,
              color: 'text.secondary',
              fontFamily: 'inherit',
              fontWeight: 500,
              fontSize: { xs: '1.3rem', md: '1.55rem' },
              lineHeight: 1.5,
              mb: 4,
            }}
          >
            Using AI to improve healthcare, with a focus on clinical data, digital infrastructure,
            and tools that make specialist care easier to deliver.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              component={RouterLink}
              to="/blog"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
            >
              Read the blog
            </Button>
            <Button component={RouterLink} to="/projects" variant="outlined">
              View projects
            </Button>
          </Stack>
        </Box>

        <Box
          sx={{
            justifySelf: { xs: 'stretch', md: 'end' },
            width: '100%',
            maxWidth: { xs: 460, md: 360 },
            mx: { xs: 'auto', md: 0 },
          }}
        >
          <Box
            component="img"
            src="/media/me.jpeg"
            alt="Dr. Chris McMaster"
            loading="eager"
            sx={{
              display: 'block',
              width: '100%',
              aspectRatio: '4 / 5',
              objectFit: 'cover',
              objectPosition: 'center',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 26px 70px rgba(21, 26, 24, 0.16)',
            }}
          />
        </Box>
      </Box>

      <Box
        component="section"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2,
          py: { xs: 3, md: 5 },
        }}
      >
        {focusAreas.map(({ title, description, icon: Icon }) => (
          <Card key={title} component="article">
            <CardContent sx={{ p: 3 }}>
              <Icon sx={{ color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
                {title}
              </Typography>
              <Typography color="text.secondary">{description}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box
        component="section"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '0.8fr 1.2fr' },
          gap: { xs: 3, md: 6 },
          alignItems: 'start',
          py: { xs: 5, md: 8 },
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h2" sx={{ fontSize: { xs: '2.1rem', md: '2.7rem' } }}>
          Recent writing
        </Typography>
        <Card component="article">
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography color="text.secondary" sx={{ fontWeight: 700, mb: 1 }}>
              {formatPostDate(latestPost.date)} · {latestPost.readingTime}
            </Typography>
            <Typography variant="h4" component="h3" sx={{ mb: 1.5 }}>
              <Link component={RouterLink} to={`/post/${latestPost.slug}`} underline="hover">
                {latestPost.title}
              </Link>
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {latestPost.excerpt}
            </Typography>
            <Button
              component={RouterLink}
              to={`/post/${latestPost.slug}`}
              variant="text"
              endIcon={<ArrowForwardIcon />}
              sx={{ px: 0 }}
            >
              Read article
            </Button>
          </CardContent>
        </Card>
      </Box>
    </PageShell>
  );
};

export default Home;
