import React from 'react';
import { Box, Button, Card, CardContent, Grid, Link, Stack, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link as RouterLink } from 'react-router-dom';
import PageShell from '../components/PageShell';
import projectsData from '../projects.json';

const Projects = () => {
  return (
    <PageShell>
      <Box sx={{ mb: { xs: 4, md: 6 }, maxWidth: 760 }}>
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: '2.8rem', md: '3.6rem' },
            mb: 2,
          }}
        >
          Projects
        </Typography>
        <Typography color="text.secondary">
          Tools and experiments that sit at the intersection of rheumatology, clinical workflows,
          and applied AI.
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {projectsData.map((project) => (
          <Grid item xs={12} md={6} key={project.internal_link}>
            <Card
              component="article"
              sx={{
                height: '100%',
                transition: 'transform 160ms ease, box-shadow 160ms ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 22px 58px rgba(21, 26, 24, 0.09)',
                },
              }}
            >
              <CardContent
                sx={{
                  minHeight: 245,
                  height: '100%',
                  p: { xs: 3, md: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography variant="h4" component="h2" sx={{ fontSize: '1.45rem', mb: 1.5 }}>
                  {project.name}
                </Typography>

                <Typography color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                  {project.description}
                </Typography>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
                >
                  <Button
                    variant="contained"
                    href={project.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    endIcon={<OpenInNewIcon />}
                  >
                    Visit project
                  </Button>
                  <Link
                    component={RouterLink}
                    to={`/${project.internal_link}`}
                    underline="hover"
                    sx={{ color: 'text.secondary', fontSize: '0.9rem', fontWeight: 650 }}
                  >
                    /{project.internal_link}
                  </Link>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </PageShell>
  );
};

export default Projects;
