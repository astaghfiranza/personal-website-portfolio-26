import { Project, ExperienceItem, SiteSettings, MediaItem } from '../types';

export const siteSettings: SiteSettings = {
  name: 'Aththar',
  title: 'Product Designer',
  headline: 'I DESIGN PRODUCTS THAT MOVE.',
  supporting_copy: 'Product designer building digital products, experiments, and things worth exploring.',
  metadata_label: 'PRODUCT DESIGNER · DIGITAL PRODUCTS · ENTERPRISE · EXPERIMENTS',
  whatsapp_number: '6281234567890',
  email: 'aththar.designer@gmail.com',
  email_subject: 'Project Inquiry & Collaboration',
  email_body: 'Hi Aththar,\n\nI came across your portfolio and would like to discuss a project / role with you.\n\nBest regards,',
  case_study_email_subject: 'Discussion: {{project_title}}',
  case_study_email_body: 'Hi Aththar,\n\nI just reviewed your case study on {{project_title}} and would love to chat about your design process.\n\nBest regards,',
  linkedin_url: 'https://linkedin.com/in/aththar',
  github_url: 'https://github.com/aththar',
  location: 'Jakarta, Indonesia',
  availability_status: 'Available for Selected Opportunities & Collaborations',
  bio_intro: 'Product designer with a background in Computer Science. Bridging the gap between corporate enterprise precision, entrepreneurial execution, and interaction experiments.',
  hero_image: '/images/hero-default.webp',
  local_hero_image: '/images/hero-default.webp',
  heroImage: '/images/hero-default.webp',
  hero_image_alt: 'Product Design Studio & Interface Architecture',
  hero_image_tag: 'Warm Precision Studio',
  hero_image_badge: 'JKT · 2026'
};

export const experience: ExperienceItem[] = [
  {
    id: 'exp-1',
    category: '01 WORK',
    categoryLabel: 'Work Experience',
    title: 'PT Hexacode Teknologi Indonesia',
    role: 'Product Designer',
    period: '2024 — 2026',
    organization: 'PT Hexacode Teknologi Indonesia',
    location: 'Jakarta, ID',
    description: 'Spearheaded end-to-end product design for enterprise SaaS suites, AI-driven automation workflows, and digital transformation initiatives for banking, government bodies, and state-owned enterprises (BUMN).',
    highlights: [
      'Architected 20+ complex enterprise features from zero-to-one, translating regulatory requirements into intuitive UI flows.',
      'Designed and documented over 200+ production-ready screens with strict edge-case validation and multi-role permission matrices.',
      'Established and maintained an accessible, tokenized design system of 50+ reusable components used by 12 cross-functional engineers.',
      'Reduced average document triage and compliance review time by 42% through focused contextual AI workflows.',
      'Reduced average document triage and compliance review time by 42% through focused contextual AI workflows.',
      'Reduced average document triage and compliance review time by 42% through focused contextual AI workflows.',
      'Reduced average document triage and compliance review time by 42% through focused contextual AI workflows.'
    ],
    metrics: [
      {
        label: 'Enterprise Features',
        value: '20+'
      },
      {
        label: 'Production Screens',
        value: '200+'
      },
      {
        label: 'Design System Tokens',
        value: '50+'
      },
      {
        label: 'Triage Efficiency',
        value: '+42%'
      }
    ],
    tags: [
      'Enterprise SaaS',
      'Design Systems',
      'AI Workflows',
      'Fintech & BUMN',
      'Information Architecture'
    ]
  },
  {
    id: 'exp-2',
    category: '01 WORK',
    categoryLabel: 'Work Experience',
    title: 'Smartek Sistem Kreasi Alpha',
    role: 'UI/UX Designer & Prototyper',
    period: '2023 — 2024',
    organization: 'Independent / Studio Practice',
    location: 'Remote',
    description: 'Collaborated with early-stage tech ventures and product teams to conduct user research, interactive wireframing, high-fidelity UI design, and rapid clickable prototyping.',
    highlights: [
      'Delivered 6 commercial client projects spanning web applications, mobile platforms, and interactive data dashboards.',
      'Conducted moderated usability testing sessions to identify friction points in core user conversion funnels.'
    ],
    metrics: [],
    tags: [
      'Rapid Prototyping',
      'User Research',
      'Usability Audits',
      'Design Sprints'
    ]
  },
  {
    id: 'exp-3',
    category: '02 BUILD',
    categoryLabel: 'Entrepreneurial Experience',
    title: 'Cilcoffee Artisan Lab',
    role: 'Founder / Product / Brand Lead',
    period: '2024 — Present',
    organization: 'Cilcoffee',
    location: 'Indonesia',
    description: 'Founded and directed an artisan coffee initiative from raw concept to physical product, unit economics, brand identity, and companion digital brew experience.',
    highlights: [
      'Executed the complete product lifecycle: Concept Validation → Direct-Farm Sourcing → Unit Costing & Margin Modeling → Brand Identity → Operations.',
      'Designed and engineered the companion mobile digital brew-guide web app, guiding customers through extraction variables and roast profiles.',
      'Achieved a 34% repeat order rate through friction-free customer onboarding and contextual packaging QR cues.'
    ],
    metrics: [
      {
        label: 'Repeat Customer Rate',
        value: '34%'
      },
      {
        label: 'Brew Guide Interactions',
        value: '1,800+'
      },
      {
        label: 'Operational Steps Shipped',
        value: '6 Stages'
      }
    ],
    tags: [
      'Venture Building',
      'Brand Identity',
      'Product Costing',
      'Micro-Operations',
      'Packaging Design'
    ],
    link: 'https://instagram.com/cilcoffee'
  },
  {
    id: 'exp-4',
    category: '03 LEARN',
    categoryLabel: 'Certifications',
    title: 'Google UX Design Professional Certificate',
    role: 'Google Career Certificates',
    period: '2024',
    organization: 'Google / Coursera',
    location: null,
    description: 'Comprehensive 7-course professional program covering foundations of UX research, inclusive design, Figma wireframing, high-fidelity prototyping, and design systems.',
    highlights: [
      'Emphasized accessibility (WCAG AA standards), qualitative user interviews, and competitive audit synthesis.'
    ],
    metrics: [],
    tags: [
      'UX Research',
      'Accessibility (WCAG)',
      'Information Architecture',
      'Figma Prototyping'
    ]
  },
  {
    id: 'exp-5',
    category: '03 LEARN',
    categoryLabel: 'Certifications',
    title: 'AWS Certified Cloud Practitioner',
    role: 'Cloud Infrastructure & Architecture',
    period: '2024',
    organization: 'Amazon Web Services',
    location: null,
    description: 'Foundational certification validating technical understanding of cloud computing services, serverless deployment, data storage, security, and compliance.',
    highlights: [
      'Bridges product design decisions with engineering feasibility, API latency considerations, and scalable infrastructure.'
    ],
    metrics: [],
    tags: [
      'Cloud Computing',
      'Technical Literacy',
      'Security & Compliance'
    ]
  },
  {
    id: 'exp-6',
    category: '03 LEARN',
    categoryLabel: 'Certifications',
    title: 'Dicoding UX Design & Web Accessibility',
    role: 'Certified UX Practitioner',
    period: '2023',
    organization: 'Dicoding Indonesia',
    location: null,
    description: 'Rigorous assessment in user interface heuristics, visual hierarchy, mobile-first responsiveness, and accessibility engineering.',
    highlights: [
      'Graduated top of cohort for practical case study on accessible public transit information architecture.'
    ],
    metrics: [],
    tags: [
      'Heuristic Evaluation',
      'Design Tokens',
      'Mobile UX'
    ]
  },
  {
    id: 'exp-7',
    category: '04 STUDY',
    categoryLabel: 'Education',
    title: 'Bachelor of Computer Science (S1 Informatika)',
    role: 'Undergraduate Degree',
    period: 'Graduated with Honors',
    organization: 'University Faculty of Computer Science',
    location: 'Indonesia',
    description: 'Formal academic background in Computer Science with specialization in Human-Computer Interaction (HCI), Software Engineering, and Modern Web Architectures.',
    highlights: [
      'Gained deep technical fluency across front-end frameworks, database modeling, algorithmic efficiency, and API contracts.',
      'Allows seamless cross-functional collaboration with engineering leads without communication friction.'
    ],
    metrics: [],
    tags: [
      'Human-Computer Interaction',
      'Software Engineering',
      'Algorithms & Data Structures'
    ]
  }
];

export const projects: Project[] = [
  {
    id: 'proj-1789014734698',
    title: 'the mendoans',
    slug: 'themendoans',
    short_description: '',
    category: 'PRODUCT',
    project_type: 'Product Design',
    role: 'Lead Product Designer',
    organization: 'Confidential Client',
    client: 'Confidential Client',
    year: '2026',
    duration: '3 months',
    thumbnail_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    local_thumbnail_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    featured: false,
    featured_order: 1,
    status: 'PUBLISHED',
    tags: [],
    tools: [],
    deliverables: [],
    impact_metrics: [
      {
        label: 'Triage Time',
        value: '-85%'
      }
    ]
  },
  {
    id: 'proj-3',
    title: 'Cilcoffee Rebranding',
    slug: 'cilcoffee-brand-experience',
    short_description: 'From single-origin bean sourcing to digital brewing guide and customer retention ecosystem.',
    category: 'BUILD',
    project_type: 'Physical Venture & Digital PWA',
    role: 'Founder, Product & Brand Lead',
    organization: 'Cilcoffee Artisan Lab',
    client: 'Cilcoffee Artisan Lab',
    year: '2024–2025',
    duration: 'Ongoing',
    thumbnail_url: '/images/projects/project-3.webp',
    local_thumbnail_url: '/images/projects/project-3.webp',
    thumbnail: '/images/projects/project-3.webp',
    featured: false,
    featured_order: 1,
    status: 'PUBLISHED',
    tags: [
      'Venture Building',
      'Brand Identity'
    ],
    tools: [],
    deliverables: [
      'Brand Guidelines',
      'Packaging Architecture',
      'Interactive Brew Companion PWA'
    ],
    impact_metrics: [
      {
        label: 'Companion Scans',
        value: '1,800+'
      },
      {
        label: 'Repeat Customer Rate',
        value: '34%'
      },
      {
        label: 'Product Margin',
        value: '48%'
      },
      {
        label: 'Full Product Stages',
        value: '6 Stages'
      }
    ]
  },
  {
    id: 'proj-1789014560979',
    title: 'pm satria',
    slug: 'pm',
    short_description: '',
    category: 'PRODUCT',
    project_type: 'Product Design',
    role: 'Lead Product Designer',
    organization: 'Confidential Client',
    client: 'Confidential Client',
    year: '2026',
    duration: '3 months',
    thumbnail_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    local_thumbnail_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    featured: false,
    featured_order: 1,
    status: 'PUBLISHED',
    tags: [],
    tools: [],
    deliverables: [],
    impact_metrics: [
      {
        label: 'Triage Time',
        value: '-85%'
      }
    ]
  },
  {
    id: 'proj-1',
    title: 'Mambunity — Community-Powered Odor Monitoring',
    slug: 'mambunity',
    short_description: 'A community-powered platform that turns subjective odor experiences into location-based environmental data.',
    category: 'CONCEPT',
    project_type: 'Personal Project',
    role: 'Product Designer',
    organization: 'Personal',
    client: 'Personal',
    year: '2026',
    duration: '1 Week',
    thumbnail_url: '/images/projects/project-1.webp',
    local_thumbnail_url: '/images/projects/project-1.webp',
    thumbnail: '/images/projects/project-1.webp',
    featured: true,
    featured_order: 1,
    status: 'PUBLISHED',
    tags: [
      'Mobile Apps',
      'Smartwatch Apps'
    ],
    tools: [],
    deliverables: [
      'Hi-Fi Design',
      'Prototyping',
      'Design System'
    ],
    impact_metrics: [
      {
        label: 'UI Screens',
        value: '15+'
      },
      {
        label: 'Device Platforms',
        value: '2'
      },
      {
        label: 'Components',
        value: '20+'
      },
      {
        label: 'Micro Interactions',
        value: '5+'
      }
    ]
  },
  {
    id: 'proj-1789014393794',
    title: 'Hexacode Webchat',
    slug: 'hexacode-webchat',
    short_description: '',
    category: 'PRODUCT',
    project_type: 'Product Design',
    role: 'Lead Product Designer',
    organization: 'Confidential Client',
    client: 'Confidential Client',
    year: '2026',
    duration: '3 months',
    thumbnail_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    local_thumbnail_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    featured: false,
    featured_order: 1,
    status: 'PUBLISHED',
    tags: [],
    tools: [],
    deliverables: [],
    impact_metrics: [
      {
        label: 'Triage Time',
        value: '-85%'
      }
    ]
  },
  {
    id: 'proj-1789014522601',
    title: 'Alivio',
    slug: 'alivio',
    short_description: '',
    category: 'PRODUCT',
    project_type: 'Product Design',
    role: 'Lead Product Designer',
    organization: 'Confidential Client',
    client: 'Confidential Client',
    year: '2026',
    duration: '3 months',
    thumbnail_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    local_thumbnail_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    featured: false,
    featured_order: 1,
    status: 'PUBLISHED',
    tags: [],
    tools: [],
    deliverables: [],
    impact_metrics: [
      {
        label: 'Triage Time',
        value: '-85%'
      }
    ]
  },
  {
    id: 'proj-1789014538067',
    title: 'rhythm fusion',
    slug: 'rhythm',
    short_description: '',
    category: 'PRODUCT',
    project_type: 'Product Design',
    role: 'Lead Product Designer',
    organization: 'Confidential Client',
    client: 'Confidential Client',
    year: '2026',
    duration: '3 months',
    thumbnail_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    local_thumbnail_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    featured: false,
    featured_order: 1,
    status: 'PUBLISHED',
    tags: [],
    tools: [],
    deliverables: [],
    impact_metrics: [
      {
        label: 'Triage Time',
        value: '-85%'
      }
    ]
  },
  {
    id: 'proj-1789014552081',
    title: 'kinagra labs',
    slug: 'kinagra',
    short_description: '',
    category: 'PRODUCT',
    project_type: 'Product Design',
    role: 'Lead Product Designer',
    organization: 'Confidential Client',
    client: 'Confidential Client',
    year: '2026',
    duration: '3 months',
    thumbnail_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    local_thumbnail_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    featured: false,
    featured_order: 1,
    status: 'PUBLISHED',
    tags: [],
    tools: [],
    deliverables: [],
    impact_metrics: [
      {
        label: 'Triage Time',
        value: '-85%'
      }
    ]
  },
  {
    id: 'proj-1789014603476',
    title: 'deltara farm',
    slug: 'deltara',
    short_description: '',
    category: 'PRODUCT',
    project_type: 'Product Design',
    role: 'Lead Product Designer',
    organization: 'Confidential Client',
    client: 'Confidential Client',
    year: '2026',
    duration: '3 months',
    thumbnail_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    local_thumbnail_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    featured: false,
    featured_order: 1,
    status: 'PUBLISHED',
    tags: [],
    tools: [],
    deliverables: [],
    impact_metrics: [
      {
        label: 'Triage Time',
        value: '-85%'
      }
    ]
  },
  {
    id: 'proj-1789014668002',
    title: 'schedbe',
    slug: 'schedbe',
    short_description: '',
    category: 'PRODUCT',
    project_type: 'Product Design',
    role: 'Lead Product Designer',
    organization: 'Confidential Client',
    client: 'Confidential Client',
    year: '2026',
    duration: '3 months',
    thumbnail_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    local_thumbnail_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    featured: false,
    featured_order: 1,
    status: 'PUBLISHED',
    tags: [],
    tools: [],
    deliverables: [],
    impact_metrics: [
      {
        label: 'Triage Time',
        value: '-85%'
      }
    ]
  },
  {
    id: 'proj-1789014680659',
    title: 'seiv landing page',
    slug: 'seiv',
    short_description: '',
    category: 'PRODUCT',
    project_type: 'Product Design',
    role: 'Lead Product Designer',
    organization: 'Confidential Client',
    client: 'Confidential Client',
    year: '2026',
    duration: '3 months',
    thumbnail_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    local_thumbnail_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    featured: false,
    featured_order: 1,
    status: 'PUBLISHED',
    tags: [],
    tools: [],
    deliverables: [],
    impact_metrics: [
      {
        label: 'Triage Time',
        value: '-85%'
      }
    ]
  },
  {
    id: 'proj-2',
    title: 'Agentic AI',
    slug: 'hexacode-agentic-ai',
    short_description: 'Multi-tenant enterprise AI workflow automation and policy compliance platform for banking and state-owned enterprises (BUMN).',
    category: 'PRODUCT',
    project_type: 'Enterprise SaaS',
    role: 'Senior Product Designer',
    organization: 'Hexacode Teknologi Indonesia',
    client: 'Hexacode Teknologi Indonesia',
    year: '2025-2026',
    duration: '3 months',
    thumbnail_url: '/images/projects/project-2.webp',
    local_thumbnail_url: '/images/projects/project-2.webp',
    thumbnail: '/images/projects/project-2.webp',
    featured: true,
    featured_order: 2,
    status: 'PUBLISHED',
    tags: [
      'Enterprise SaaS',
      'Design System'
    ],
    tools: [
      'Figma',
      'FigJam'
    ],
    deliverables: [
      'UI Design',
      'Prototyping'
    ],
    impact_metrics: [
      {
        label: 'Enterprise Modules',
        value: '20+'
      },
      {
        label: 'Production Screens',
        value: '200+'
      },
      {
        label: 'Component Tokens',
        value: '50+'
      },
      {
        label: 'Review Latency',
        value: '-42%'
      }
    ]
  }
];

export const media: MediaItem[] = [
  {
    id: 'med-1',
    projectId: 'proj-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    alt_text: 'Mambu Radar Field Testing and Atmospheric Olfactory Sensing',
    caption: 'Citizen sensory reporter capturing odor spike telemetry near industrial perimeters.',
    width: 1400,
    height: 900,
    created_at: '2026-01-20T08:00:00.000Z',
    size_kb: 420
  },
  {
    id: 'med-2',
    projectId: 'proj-2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80',
    alt_text: 'Hexacode Enterprise AI Document Triage Workstation',
    caption: 'High-density multi-tenant dashboard with explainable AI confidence intervals.',
    width: 1400,
    height: 900,
    created_at: '2025-07-10T08:00:00.000Z',
    size_kb: 380
  },
  {
    id: 'med-3',
    projectId: 'proj-3',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=80',
    alt_text: 'Cilcoffee Artisan Lab Specialty Micro-lot Packaging',
    caption: 'Physical tactile packaging with scannable interactive brewing telemetry.',
    width: 1400,
    height: 900,
    created_at: '2024-11-01T08:00:00.000Z',
    size_kb: 510
  }
];

// Compatibility aliases
export const initialSiteSettings = siteSettings;
export const initialExperience = experience;
export const initialProjects = projects;
export const initialMedia = media;
