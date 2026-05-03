import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import BookmarkAddedOutlinedIcon from '@mui/icons-material/BookmarkAddedOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import PageShell from '../components/PageShell';
import { araPosters, araSessions, conference } from '../data/araAsm2026';

const STORAGE_KEY = 'ara-asm-2026-itinerary';
const CALENDAR_TZID = 'Australia/Brisbane';

const allDays = ['All days', ...Array.from(new Set(araSessions.map((session) => session.day)))];
const allTypes = ['All event types', ...Array.from(new Set(araSessions.map((session) => session.type)))];
const allPosterCategories = [
  'All poster categories',
  ...Array.from(new Set(araPosters.map((poster) => poster.category))),
];

const getPosterNumber = (id) => Number(id.replace(/\D/g, ''));

const getPosterViewing = (id, status) => {
  if (status === 'Withdrawn') {
    return 'Withdrawn';
  }

  return getPosterNumber(id) % 2 === 0
    ? 'Even poster viewing: Sunday 17 May, 10:00-11:00'
    : 'Odd poster viewing: Monday 18 May, 10:00-11:00';
};

const makeKey = (kind, id) => `${kind}:${id}`;

const parseSessionSort = (session) => {
  const time = session.time.match(/\d{2}:?\d{2}/)?.[0]?.replace(':', '') ?? '9999';
  return `${session.date}-${time.padStart(4, '0')}`;
};

const parseTimeParts = (token) => {
  const match = token.match(/^(\d{1,2}):?(\d{2})$/);
  if (!match) {
    return null;
  }

  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
  };
};

const addMinutes = ({ hour, minute }, minutesToAdd) => {
  const total = hour * 60 + minute + minutesToAdd;
  const dayMinutes = 24 * 60;
  const wrapped = ((total % dayMinutes) + dayMinutes) % dayMinutes;

  return {
    hour: Math.floor(wrapped / 60),
    minute: wrapped % 60,
  };
};

const pad2 = (value) => String(value).padStart(2, '0');

const formatIcsDateTime = (date, time) =>
  `${date.replaceAll('-', '')}T${pad2(time.hour)}${pad2(time.minute)}00`;

const parseSessionCalendarTimes = (session) => {
  const tokens = session.time.match(/\d{1,2}:?\d{2}/g) || [];
  const start = parseTimeParts(tokens[0] || '');
  if (!start) {
    return null;
  }

  const end = parseTimeParts(tokens[1] || '') || addMinutes(start, 60);

  return {
    date: session.date,
    start,
    end,
  };
};

const getPosterCalendarWindow = (poster) => {
  if (poster.status === 'Withdrawn') {
    return null;
  }

  const isEven = getPosterNumber(poster.id) % 2 === 0;

  return {
    date: isEven ? '2026-05-17' : '2026-05-18',
    day: isEven ? 'Sunday 17 May' : 'Monday 18 May',
    time: '10:00-11:00',
    start: { hour: 10, minute: 0 },
    end: { hour: 11, minute: 0 },
    location: 'Hall 1 and Central Room B',
  };
};

const getTimestamp = () => {
  const now = new Date();
  return `${now.getUTCFullYear()}${pad2(now.getUTCMonth() + 1)}${pad2(now.getUTCDate())}T${pad2(
    now.getUTCHours(),
  )}${pad2(now.getUTCMinutes())}${pad2(now.getUTCSeconds())}Z`;
};

const escapeIcsText = (value) =>
  String(value || '')
    .replaceAll('\\', '\\\\')
    .replaceAll('\n', '\\n')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,');

const quoteCsv = (value) => `"${String(value || '').replaceAll('"', '""')}"`;

const downloadBlob = (filename, mimeType, content) => {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const normalizePdfText = (value) =>
  String(value || '')
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, (character) => {
      if (character === '\n') return '\n';
      if (character === '\t') return ' ';
      return '-';
    });

const escapePdfText = (value) => normalizePdfText(value).replace(/[\\()]/g, '\\$&');

const wrapText = (text, maxLength = 82) => {
  const words = normalizePdfText(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
      return;
    }
    current = next;
  });

  if (current) {
    lines.push(current);
  }

  return lines;
};

const buildPdf = (title, sections) => {
  const lineStyles = {
    title: { font: 'F2', size: 20, height: 28 },
    section: { font: 'F2', size: 14, height: 20 },
    primary: { font: 'F2', size: 10.5, height: 15 },
    body: { font: 'F1', size: 9.5, height: 14 },
    muted: { font: 'F1', size: 9, height: 13 },
    spacer: { font: 'F1', size: 4, height: 8 },
  };
  const rawLines = [
    { text: title, variant: 'title' },
    { text: `Generated from saved items in the ARA ASM 2026 planner`, variant: 'muted' },
    { text: '', variant: 'spacer' },
  ];

  sections.forEach((section) => {
    rawLines.push({ text: `${section.title} (${section.rows.length})`, variant: 'section' });

    if (section.rows.length === 0) {
      rawLines.push({ text: 'No saved items in this section.', variant: 'muted', indent: 12 });
      rawLines.push({ text: '', variant: 'spacer' });
      return;
    }

    section.rows.forEach((row, rowIndex) => {
      wrapText(row.primary, 74).forEach((line, lineIndex) => {
        rawLines.push({
          text: line,
          variant: lineIndex === 0 ? 'primary' : 'body',
          indent: lineIndex === 0 ? 12 : 22,
        });
      });
      rawLines.push({ text: row.meta, variant: 'muted', indent: 22 });
      if (row.notes) {
        wrapText(row.notes, 82).slice(0, 3).forEach((line) => {
          rawLines.push({ text: line, variant: 'body', indent: 22 });
        });
      }
      if (rowIndex < section.rows.length - 1) {
        rawLines.push({ text: '', variant: 'spacer' });
      }
    });

    rawLines.push({ text: '', variant: 'spacer' });
  });

  const pages = [[]];
  let y = 790;
  rawLines.forEach((line) => {
    const style = lineStyles[line.variant] || lineStyles.body;
    if (y - style.height < 48 && pages[pages.length - 1].length > 0) {
      pages.push([]);
      y = 790;
    }

    pages[pages.length - 1].push({ ...line, y });
    y -= style.height;
  });

  const objects = [];
  const addObject = (content) => {
    objects.push(content);
    return objects.length;
  };

  const regularFontObject = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const boldFontObject = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  const pageRefs = [];

  pages.forEach((pageLines) => {
    const streamLines = pageLines.map((line) => {
      const style = lineStyles[line.variant] || lineStyles.body;
      const x = 50 + (line.indent || 0);
      return `BT /${style.font} ${style.size} Tf ${x} ${line.y} Td (${escapePdfText(line.text)}) Tj ET`;
    });

    const stream = streamLines.join('\n');
    const contentObject = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const pageObject = addObject(
      `<< /Type /Page /Parent 0 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${regularFontObject} 0 R /F2 ${boldFontObject} 0 R >> >> /Contents ${contentObject} 0 R >>`,
    );
    pageRefs.push(pageObject);
  });

  const pagesObject = addObject(
    `<< /Type /Pages /Kids [${pageRefs.map((ref) => `${ref} 0 R`).join(' ')}] /Count ${pageRefs.length} >>`,
  );

  const catalogObject = addObject(`<< /Type /Catalog /Pages ${pagesObject} 0 R >>`);
  const patchedObjects = objects.map((object) =>
    object.replaceAll('/Parent 0 0 R', `/Parent ${pagesObject} 0 R`),
  );

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  patchedObjects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${patchedObjects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${patchedObjects.length + 1} /Root ${catalogObject} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
};

const matchesQuery = (values, query) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return values.filter(Boolean).join(' ').toLowerCase().includes(normalized);
};

const Stat = ({ value, label }) => (
  <Box>
    <Typography sx={{ fontSize: { xs: '1.65rem', md: '2rem' }, fontWeight: 800, lineHeight: 1 }}>
      {value}
    </Typography>
    <Typography color="text.secondary" sx={{ fontSize: '0.86rem', fontWeight: 700, mt: 0.75 }}>
      {label}
    </Typography>
  </Box>
);

const SaveButton = ({ selected, onClick, compact = false }) => (
  <Button
    variant={selected ? 'contained' : 'outlined'}
    color={selected ? 'primary' : 'inherit'}
    size={compact ? 'small' : 'medium'}
    startIcon={selected ? <BookmarkAddedOutlinedIcon /> : <BookmarkAddOutlinedIcon />}
    onClick={onClick}
    sx={{ flexShrink: 0 }}
  >
    {selected ? 'Saved' : 'Save'}
  </Button>
);

const AraAsm2026 = () => {
  const [eventQuery, setEventQuery] = useState('');
  const [posterQuery, setPosterQuery] = useState('');
  const [dayFilter, setDayFilter] = useState('All days');
  const [typeFilter, setTypeFilter] = useState('All event types');
  const [posterCategory, setPosterCategory] = useState('All poster categories');
  const [posterViewing, setPosterViewing] = useState('All posters');
  const [savedKeys, setSavedKeys] = useState([]);
  const [copyStatus, setCopyStatus] = useState('');
  const [activeTab, setActiveTab] = useState('events');

  useEffect(() => {
    try {
      setSavedKeys(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]'));
    } catch {
      setSavedKeys([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedKeys));
  }, [savedKeys]);

  const savedSet = useMemo(() => new Set(savedKeys), [savedKeys]);

  const toggleSaved = (kind, id) => {
    const key = makeKey(kind, id);
    setSavedKeys((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  };

  const filteredSessions = useMemo(
    () =>
      araSessions
        .filter((session) => dayFilter === 'All days' || session.day === dayFilter)
        .filter((session) => typeFilter === 'All event types' || session.type === typeFilter)
        .filter((session) =>
          matchesQuery(
            [
              session.title,
              session.description,
              session.location,
              session.type,
              session.track,
              session.day,
              session.time,
            ],
            eventQuery,
          ),
        )
        .sort((a, b) => parseSessionSort(a).localeCompare(parseSessionSort(b))),
    [dayFilter, eventQuery, typeFilter],
  );

  const filteredPosters = useMemo(
    () =>
      araPosters
        .filter((poster) => posterCategory === 'All poster categories' || poster.category === posterCategory)
        .filter((poster) => {
          if (posterViewing === 'All posters' || poster.status === 'Withdrawn') {
            return true;
          }

          const isEven = getPosterNumber(poster.id) % 2 === 0;
          return posterViewing === 'Even posters' ? isEven : !isEven;
        })
        .filter((poster) =>
          matchesQuery(
            [poster.id, poster.title, poster.authors, poster.category, poster.status],
            posterQuery,
          ),
        ),
    [posterCategory, posterQuery, posterViewing],
  );

  const savedItems = useMemo(() => {
    const sessionById = new Map(araSessions.map((session) => [session.id, session]));
    const posterById = new Map(araPosters.map((poster) => [poster.id, poster]));

    return savedKeys
      .map((key) => {
        const [kind, id] = key.split(':');
        if (kind === 'session' && sessionById.has(id)) {
          const session = sessionById.get(id);
          return {
            key,
            kind,
            id,
            source: session,
            sort: parseSessionSort(session),
            day: session.day,
            title: session.title,
            detail: `${session.time} | ${session.location}`,
          };
        }

        if (kind === 'poster' && posterById.has(id)) {
          const poster = posterById.get(id);
          const viewing = getPosterCalendarWindow(poster);
          return {
            key,
            kind,
            id,
            source: poster,
            sort: `zz-${String(getPosterNumber(poster.id)).padStart(3, '0')}`,
            day: viewing?.day || 'Poster list',
            title: `${poster.id}: ${poster.title}`,
            detail: getPosterViewing(poster.id, poster.status),
          };
        }

        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a.sort.localeCompare(b.sort));
  }, [savedKeys]);

  const itinerary = useMemo(
    () => savedItems.filter((item) => item.kind === 'session'),
    [savedItems],
  );

  const postersOfInterest = useMemo(
    () => savedItems.filter((item) => item.kind === 'poster'),
    [savedItems],
  );

  const copyItinerary = async () => {
    const text =
      itinerary.length === 0
        ? ''
        : itinerary.map((item) => `${item.day} | ${item.detail} | ${item.title}`).join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('Copied');
      window.setTimeout(() => setCopyStatus(''), 1600);
    } catch {
      setCopyStatus('Copy unavailable');
    }
  };

  const buildItineraryRows = () =>
    itinerary.map((item) => {
      const session = item.source;
      return {
        day: session.day,
        date: session.date,
        time: session.time,
        title: session.title,
        location: session.location,
        track: session.track,
        notes: session.description,
      };
    });

  const buildPosterRows = () =>
    postersOfInterest.map((item) => {
      const poster = item.source;
      const viewing = getPosterCalendarWindow(poster);
      return {
        id: poster.id,
        category: poster.category,
        title: poster.title,
        authors: poster.authors || poster.status,
        viewing: getPosterViewing(poster.id, poster.status),
        viewingDay: viewing?.day || '',
        viewingTime: viewing?.time || '',
        location: viewing?.location || '',
      };
    });

  const downloadCalendar = () => {
    const timestamp = getTimestamp();
    const events = itinerary
      .map((item) => {
        const session = item.source;
        const times = parseSessionCalendarTimes(session);
        if (!times) {
          return null;
        }

        return {
          uid: `${session.id}@ara-asm-2026`,
          title: session.title,
          date: times.date,
          start: times.start,
          end: times.end,
          location: session.location,
          description: `${session.day} ${session.time}\n${session.track}\n${session.description}`,
        };
      })
      .filter(Boolean);

    const content = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//RheumAI//ARA ASM 2026 Planner//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...events.flatMap((event) => [
        'BEGIN:VEVENT',
        `UID:${escapeIcsText(event.uid)}`,
        `DTSTAMP:${timestamp}`,
        `DTSTART;TZID=${CALENDAR_TZID}:${formatIcsDateTime(event.date, event.start)}`,
        `DTEND;TZID=${CALENDAR_TZID}:${formatIcsDateTime(event.date, event.end)}`,
        `SUMMARY:${escapeIcsText(event.title)}`,
        `LOCATION:${escapeIcsText(event.location)}`,
        `DESCRIPTION:${escapeIcsText(event.description)}`,
        'END:VEVENT',
      ]),
      'END:VCALENDAR',
    ].join('\r\n');

    downloadBlob('ara-asm-2026-itinerary.ics', 'text/calendar;charset=utf-8', content);
  };

  const downloadSpreadsheet = () => {
    const itineraryHeaders = ['Day', 'Date', 'Time', 'Session', 'Location', 'Track', 'Notes'];
    const posterHeaders = ['Poster ID', 'Category', 'Title', 'Authors', 'Viewing', 'Location'];
    const itineraryRows = buildItineraryRows().map((row) => [
      row.day,
      row.date,
      row.time,
      row.title,
      row.location,
      row.track,
      row.notes,
    ]);
    const posterRows = buildPosterRows().map((row) => [
      row.id,
      row.category,
      row.title,
      row.authors,
      row.viewing,
      row.location,
    ]);

    const csvSections = [
      ['ARA ASM 2026 itinerary'],
      itineraryHeaders,
      ...itineraryRows,
      [],
      ['Posters of interest'],
      posterHeaders,
      ...posterRows,
    ];
    const csv = csvSections.map((row) => row.map(quoteCsv).join(',')).join('\n');
    downloadBlob('ara-asm-2026-itinerary.csv', 'text/csv;charset=utf-8', csv);
  };

  const downloadPdf = () => {
    const pdf = buildPdf('ARA ASM 2026 saved program', [
      {
        title: 'Itinerary',
        rows: buildItineraryRows().map((row) => ({
          primary: row.title,
          meta: `${row.day} | ${row.time} | ${row.location} | ${row.track}`,
          notes: row.notes,
        })),
      },
      {
        title: 'Posters of interest',
        rows: buildPosterRows().map((row) => ({
          primary: `${row.id}: ${row.title}`,
          meta: `${row.category} | ${row.viewing}${row.location ? ` | ${row.location}` : ''}`,
          notes: row.authors,
        })),
      },
    ]);
    downloadBlob('ara-asm-2026-itinerary.pdf', 'application/pdf', pdf);
  };

  return (
    <PageShell maxWidth="xl" mainSx={{ py: { xs: 3, md: 5 } }}>
      <Box
        component="section"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 380px' },
          gap: { xs: 4, md: 6 },
          alignItems: 'end',
          pb: { xs: 4, md: 6 },
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ maxWidth: 860 }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{ fontSize: { xs: '2.75rem', sm: '3.8rem', md: '5rem' }, mb: 2 }}
          >
            ARA ASM 2026
          </Typography>
          <Typography
            variant="h4"
            component="p"
            sx={{
              maxWidth: 760,
              color: 'text.secondary',
              fontFamily: 'inherit',
              fontWeight: 500,
              fontSize: { xs: '1.22rem', md: '1.55rem' },
              lineHeight: 1.45,
              mb: 3,
            }}
          >
            Find posters, scan the program, and build a lightweight itinerary for the Gold Coast
            conference.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              href={conference.programPdf}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              startIcon={<FileDownloadOutlinedIcon />}
            >
              Program PDF
            </Button>
            <Button
              href={conference.postersPdf}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              startIcon={<FileDownloadOutlinedIcon />}
            >
              Poster list PDF
            </Button>
          </Stack>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.72)',
          }}
        >
          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <CalendarTodayOutlinedIcon sx={{ color: 'secondary.main', mt: 0.35 }} />
              <Box>
                <Typography sx={{ fontWeight: 800 }}>{conference.dates}</Typography>
                <Typography color="text.secondary">{conference.city}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <PlaceOutlinedIcon sx={{ color: 'secondary.main', mt: 0.35 }} />
              <Box>
                <Typography sx={{ fontWeight: 800 }}>{conference.venue}</Typography>
                <Typography color="text.secondary">
                  Program draft: {conference.programUpdated}. Poster list: {conference.posterListUpdated}.
                </Typography>
              </Box>
            </Box>
            <Divider />
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
              <Stat value={araSessions.length} label="events" />
              <Stat value={araPosters.length} label="posters" />
              <Stat value={savedItems.length} label="saved" />
            </Box>
          </Stack>
        </Paper>
      </Box>

      <Grid container spacing={3} sx={{ py: { xs: 4, md: 5 } }}>
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.68)',
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
              variant="fullWidth"
              aria-label="Conference planner sections"
              sx={{
                minHeight: 54,
                '& .MuiTab-root': {
                  minHeight: 54,
                  fontWeight: 800,
                },
              }}
            >
              <Tab
                value="events"
                label={`Events (${filteredSessions.length})`}
                icon={<EventAvailableOutlinedIcon />}
                iconPosition="start"
              />
              <Tab
                value="posters"
                label={`Posters (${filteredPosters.length})`}
                icon={<LocalOfferOutlinedIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Paper>

          {activeTab === 'events' && (
          <Box component="section" id="events">
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'end' }, mb: 2 }}
            >
              <Box>
                <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.6rem' }, mb: 1 }}>
                  Events
                </Typography>
                <Typography color="text.secondary">
                  Search sessions, speakers, tracks, rooms, and social events from the current program.
                </Typography>
              </Box>
              <Chip
                icon={<EventAvailableOutlinedIcon />}
                label={`${filteredSessions.length} shown`}
                sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}
              />
            </Stack>

            <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
              <Grid item xs={12} md={5}>
                <TextField
                  value={eventQuery}
                  onChange={(event) => setEventQuery(event.target.value)}
                  placeholder="Search events, tracks, speakers..."
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlinedIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3.5}>
                <FormControl fullWidth>
                  <InputLabel id="ara-day-filter">Day</InputLabel>
                  <Select
                    labelId="ara-day-filter"
                    value={dayFilter}
                    label="Day"
                    onChange={(event) => setDayFilter(event.target.value)}
                  >
                    {allDays.map((day) => (
                      <MenuItem key={day} value={day}>
                        {day}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3.5}>
                <FormControl fullWidth>
                  <InputLabel id="ara-type-filter">Type</InputLabel>
                  <Select
                    labelId="ara-type-filter"
                    value={typeFilter}
                    label="Type"
                    onChange={(event) => setTypeFilter(event.target.value)}
                  >
                    {allTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Stack spacing={1.5}>
              {filteredSessions.map((session) => {
                const selected = savedSet.has(makeKey('session', session.id));

                return (
                  <Card component="article" key={session.id}>
                    <CardContent sx={{ p: { xs: 2.25, md: 3 } }}>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', md: '150px minmax(0, 1fr) auto' },
                          gap: { xs: 1.5, md: 2.5 },
                          alignItems: 'start',
                        }}
                      >
                        <Box>
                          <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>
                            {session.day}
                          </Typography>
                          <Typography sx={{ fontSize: '1.15rem', fontWeight: 800 }}>
                            {session.time}
                          </Typography>
                        </Box>
                        <Box>
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ mb: 1, flexWrap: 'wrap', rowGap: 1 }}
                          >
                            <Chip size="small" label={session.type} />
                            <Chip size="small" variant="outlined" label={session.track} />
                          </Stack>
                          <Typography variant="h5" component="h3" sx={{ mb: 1 }}>
                            {session.title}
                          </Typography>
                          <Typography color="text.secondary" sx={{ mb: 1.25 }}>
                            {session.description}
                          </Typography>
                          <Typography
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.75,
                              color: 'text.secondary',
                              fontSize: '0.92rem',
                              fontWeight: 700,
                            }}
                          >
                            <PlaceOutlinedIcon fontSize="small" />
                            {session.location}
                          </Typography>
                        </Box>
                        <SaveButton
                          selected={selected}
                          onClick={() => toggleSaved('session', session.id)}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          </Box>
          )}

          {activeTab === 'posters' && (
          <Box
            component="section"
            id="posters"
            sx={{ scrollMarginTop: 96 }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'end' }, mb: 2 }}
            >
              <Box>
                <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.6rem' }, mb: 1 }}>
                  Posters
                </Typography>
                <Typography color="text.secondary">
                  Search by poster ID, title, author, category, or viewing day.
                </Typography>
              </Box>
              <Chip
                icon={<LocalOfferOutlinedIcon />}
                label={`${filteredPosters.length} shown`}
                sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}
              />
            </Stack>

            <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
              <Grid item xs={12} md={5}>
                <TextField
                  value={posterQuery}
                  onChange={(event) => setPosterQuery(event.target.value)}
                  placeholder="Search P23, lupus, author..."
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlinedIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3.5}>
                <FormControl fullWidth>
                  <InputLabel id="ara-poster-category">Category</InputLabel>
                  <Select
                    labelId="ara-poster-category"
                    value={posterCategory}
                    label="Category"
                    onChange={(event) => setPosterCategory(event.target.value)}
                  >
                    {allPosterCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3.5}>
                <FormControl fullWidth>
                  <InputLabel id="ara-poster-viewing">Viewing</InputLabel>
                  <Select
                    labelId="ara-poster-viewing"
                    value={posterViewing}
                    label="Viewing"
                    onChange={(event) => setPosterViewing(event.target.value)}
                  >
                    {['All posters', 'Even posters', 'Odd posters'].map((value) => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={1.5}>
              {filteredPosters.map((poster) => {
                const selected = savedSet.has(makeKey('poster', poster.id));

                return (
                  <Grid item xs={12} md={6} key={poster.id}>
                    <Card
                      component="article"
                      sx={{
                        height: '100%',
                        opacity: poster.status === 'Withdrawn' ? 0.68 : 1,
                      }}
                    >
                      <CardContent
                        sx={{
                          p: 2.5,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1.25,
                        }}
                      >
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Chip
                            label={poster.id}
                            color={poster.status === 'Withdrawn' ? 'default' : 'primary'}
                            sx={{ fontWeight: 800 }}
                          />
                          <Chip size="small" variant="outlined" label={poster.category} />
                          {poster.status === 'Withdrawn' && <Chip size="small" label="Withdrawn" />}
                        </Stack>
                        <Typography variant="h6" component="h3">
                          {poster.title}
                        </Typography>
                        {poster.authors && (
                          <Typography color="text.secondary" sx={{ fontSize: '0.94rem' }}>
                            {poster.authors}
                          </Typography>
                        )}
                        <Typography sx={{ color: 'primary.dark', fontSize: '0.9rem', fontWeight: 750, mt: 'auto' }}>
                          {getPosterViewing(poster.id, poster.status)}
                        </Typography>
                        <SaveButton
                          selected={selected}
                          compact
                          onClick={() => toggleSaved('poster', poster.id)}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
          )}
        </Grid>

        <Grid item xs={12} lg={4}>
          <Box
            component="aside"
            sx={{
              position: { lg: 'sticky' },
              top: { lg: 96 },
            }}
          >
            <Card>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
                >
                  <Box>
                    <Typography variant="h4" component="h2" sx={{ fontSize: '1.55rem' }}>
                      Itinerary
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: '0.94rem' }}>
                      Saved events in this browser.
                    </Typography>
                  </Box>
                  <Chip label={itinerary.length} />
                </Stack>

                {itinerary.length === 0 ? (
                  <Box
                    sx={{
                      py: 4,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, mb: 0.75 }}>No saved events yet</Typography>
                    <Typography color="text.secondary">
                      Save sessions and social events as you browse. They will appear here in conference order.
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1.5} sx={{ pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                    {itinerary.map((item) => (
                      <Box key={item.key}>
                        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
                          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                            <Typography sx={{ color: 'primary.dark', fontSize: '0.82rem', fontWeight: 800 }}>
                              {item.day}
                            </Typography>
                            <Typography sx={{ fontWeight: 800, lineHeight: 1.35 }}>{item.title}</Typography>
                            <Typography color="text.secondary" sx={{ fontSize: '0.88rem', mt: 0.4 }}>
                              {item.detail}
                            </Typography>
                          </Box>
                          <Button
                            aria-label={`Remove ${item.title}`}
                            onClick={() => setSavedKeys((current) => current.filter((key) => key !== item.key))}
                            sx={{ minWidth: 38, width: 38, height: 38, p: 0 }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </Button>
                        </Stack>
                        <Divider sx={{ mt: 1.5 }} />
                      </Box>
                    ))}
                  </Stack>
                )}

                <Stack direction={{ xs: 'column', sm: 'row', lg: 'column' }} spacing={1.25} sx={{ mt: 2.5 }}>
                  <Button
                    variant="contained"
                    startIcon={<ContentCopyOutlinedIcon />}
                    onClick={copyItinerary}
                    disabled={itinerary.length === 0}
                  >
                    {copyStatus || 'Copy itinerary'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CalendarTodayOutlinedIcon />}
                    onClick={downloadCalendar}
                    disabled={itinerary.length === 0}
                  >
                    Add to calendar
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<FileDownloadOutlinedIcon />}
                    onClick={downloadSpreadsheet}
                    disabled={savedItems.length === 0}
                  >
                    Download CSV
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<FileDownloadOutlinedIcon />}
                    onClick={downloadPdf}
                    disabled={savedItems.length === 0}
                  >
                    Download PDF
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => setSavedKeys((current) => current.filter((key) => !key.startsWith('session:')))}
                    disabled={itinerary.length === 0}
                  >
                    Clear itinerary
                  </Button>
                </Stack>
                <Typography color="text.secondary" sx={{ fontSize: '0.82rem', mt: 1.5 }}>
                  Calendar export includes itinerary events. CSV and PDF include itinerary events and posters of interest.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mt: 2 }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
                >
                  <Box>
                    <Typography variant="h4" component="h2" sx={{ fontSize: '1.35rem' }}>
                      Posters of interest
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: '0.94rem' }}>
                      Saved separately from your itinerary.
                    </Typography>
                  </Box>
                  <Chip label={postersOfInterest.length} />
                </Stack>

                {postersOfInterest.length === 0 ? (
                  <Box
                    sx={{
                      py: 3,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, mb: 0.75 }}>No saved posters yet</Typography>
                    <Typography color="text.secondary">
                      Open the Posters tab and save posters you want to find later.
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1.5} sx={{ pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                    {postersOfInterest.map((item) => (
                      <Box key={item.key}>
                        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
                          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                            <Typography sx={{ color: 'primary.dark', fontSize: '0.82rem', fontWeight: 800 }}>
                              {item.source.category}
                            </Typography>
                            <Typography sx={{ fontWeight: 800, lineHeight: 1.35 }}>{item.title}</Typography>
                            <Typography color="text.secondary" sx={{ fontSize: '0.88rem', mt: 0.4 }}>
                              {item.detail}
                            </Typography>
                          </Box>
                          <Button
                            aria-label={`Remove ${item.title}`}
                            onClick={() => setSavedKeys((current) => current.filter((key) => key !== item.key))}
                            sx={{ minWidth: 38, width: 38, height: 38, p: 0 }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </Button>
                        </Stack>
                        <Divider sx={{ mt: 1.5 }} />
                      </Box>
                    ))}
                    <Button
                      variant="outlined"
                      startIcon={<DeleteOutlineIcon />}
                      onClick={() => setSavedKeys((current) => current.filter((key) => !key.startsWith('poster:')))}
                    >
                      Clear posters
                    </Button>
                  </Stack>
                )}
              </CardContent>
            </Card>

            <Paper
              elevation={0}
              sx={{
                mt: 2,
                p: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.58)',
              }}
            >
              <Typography sx={{ fontWeight: 800, mb: 1 }}>Poster viewing guide</Typography>
              <Typography color="text.secondary" sx={{ fontSize: '0.94rem', mb: 1 }}>
                Even-numbered posters are scheduled for Sunday morning tea; odd-numbered posters
                are scheduled for Monday morning tea.
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: '0.94rem' }}>
                Additional poster viewing appears during Sunday afternoon tea, Monday afternoon tea,
                and Tuesday morning tea.
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                mt: 2,
                p: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.58)',
              }}
            >
              <Typography sx={{ fontWeight: 800, mb: 1 }}>Source documents</Typography>
              <Stack spacing={0.75}>
                <Link href={conference.programPdf} target="_blank" rel="noopener noreferrer" underline="hover">
                  Current program PDF
                </Link>
                <Link href={conference.postersPdf} target="_blank" rel="noopener noreferrer" underline="hover">
                  Poster abstract list PDF
                </Link>
              </Stack>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </PageShell>
  );
};

export default AraAsm2026;
