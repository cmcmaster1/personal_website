import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Button, Stack, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PageShell from '../components/PageShell';
import projects from '../projects.json';

const ProjectRedirect = () => {
  const { projectName } = useParams();
  const project = projects.find((item) => item.internal_link === projectName);

  useEffect(() => {
    if (project) {
      window.location.replace(project.external_link);
    }
  }, [project]);

  if (!project) {
    return (
      <PageShell maxWidth="md">
        <Alert severity="warning">Project not found.</Alert>
      </PageShell>
    );
  }

  return (
    <PageShell maxWidth="md" mainSx={{ minHeight: '58vh', display: 'grid', alignItems: 'center' }}>
      <Stack spacing={2.5}>
        <Typography variant="h1" sx={{ fontSize: { xs: '2.4rem', md: '3.2rem' } }}>
          Opening {project.name}
        </Typography>
        <Typography color="text.secondary">
          If the redirect does not start automatically, use the project link below.
        </Typography>
        <Button
          href={project.external_link}
          variant="contained"
          target="_blank"
          rel="noopener noreferrer"
          endIcon={<OpenInNewIcon />}
          sx={{ alignSelf: 'flex-start' }}
        >
          Visit project
        </Button>
      </Stack>
    </PageShell>
  );
};

export default ProjectRedirect;
