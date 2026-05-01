const posts = [
  {
    title: 'Machine Learning To Get Stuff Done',
    date: '2022-01-29',
    slug: '2022-01-29-machine-learning-to-get-stuff-done',
    excerpt:
      'A practical example of using machine learning as the most efficient way to find clinical reports for research.',
    topics: ['Machine learning', 'Clinical data', 'Research'],
    readingTime: '5 min read',
  },
  {
    title: 'Drug Safety & Australia’s Digital Health Infrastructure',
    date: '2022-01-25',
    slug: '2022-01-25-unbuilt-drug-safety-australias-digital-health-infrastructure',
    excerpt:
      'A look at pharmacovigilance, missing infrastructure, and the data systems needed to detect rare safety signals.',
    topics: ['Digital health', 'Drug safety', 'Policy'],
    readingTime: '8 min read',
  },
];

export const postIndex = posts
  .slice()
  .sort((first, second) => new Date(second.date) - new Date(first.date));

export const findPost = (slug) => postIndex.find((post) => post.slug === slug);

export const formatPostDate = (date) =>
  new Intl.DateTimeFormat('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
