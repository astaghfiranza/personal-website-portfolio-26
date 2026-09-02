import { Project, ExperienceItem, SiteSettings, MediaItem } from '../types';

export const initialSiteSettings: SiteSettings = {
  name: 'Aththar',
  title: 'Product Designer',
  headline: 'I DESIGN PRODUCTS THAT MOVE.',
  supporting_copy: 'Product designer building digital products, experiments, and things worth exploring.',
  metadata_label: 'PRODUCT DESIGNER · DIGITAL PRODUCTS · ENTERPRISE · EXPERIMENTS',
  whatsapp_number: '6281234567890', // Configurable WhatsApp
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
  hero_image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
  hero_image_alt: 'Product Design Studio & Interface Architecture',
  hero_image_tag: 'Warm Precision Studio',
  hero_image_badge: 'JKT · 2026'
};

export const initialExperience: ExperienceItem[] = [
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
      { label: 'Enterprise Features', value: '20+' },
      { label: 'Production Screens', value: '200+' },
      { label: 'Design System Tokens', value: '50+' },
      { label: 'Triage Efficiency', value: '+42%' }
    ],
    tags: ['Enterprise SaaS', 'Design Systems', 'AI Workflows', 'Fintech & BUMN', 'Information Architecture']
  },
  {
    id: 'exp-2',
    category: '01 WORK',
    categoryLabel: 'Work Experience',
    title: 'Digital Product & Interface Studio',
    role: 'UI/UX Designer & Prototyper',
    period: '2023 — 2024',
    organization: 'Independent / Studio Practice',
    location: 'Remote',
    description: 'Collaborated with early-stage tech ventures and product teams to conduct user research, interactive wireframing, high-fidelity UI design, and rapid clickable prototyping.',
    highlights: [
      'Delivered 6 commercial client projects spanning web applications, mobile platforms, and interactive data dashboards.',
      'Conducted moderated usability testing sessions to identify friction points in core user conversion funnels.'
    ],
    tags: ['Rapid Prototyping', 'User Research', 'Usability Audits', 'Design Sprints']
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
      { label: 'Repeat Customer Rate', value: '34%' },
      { label: 'Brew Guide Interactions', value: '1,800+' },
      { label: 'Operational Steps Shipped', value: '6 Stages' }
    ],
    tags: ['Venture Building', 'Brand Identity', 'Product Costing', 'Micro-Operations', 'Packaging Design'],
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
    description: 'Comprehensive 7-course professional program covering foundations of UX research, inclusive design, Figma wireframing, high-fidelity prototyping, and design systems.',
    highlights: [
      'Emphasized accessibility (WCAG AA standards), qualitative user interviews, and competitive audit synthesis.'
    ],
    tags: ['UX Research', 'Accessibility (WCAG)', 'Information Architecture', 'Figma Prototyping']
  },
  {
    id: 'exp-5',
    category: '03 LEARN',
    categoryLabel: 'Certifications',
    title: 'AWS Certified Cloud Practitioner',
    role: 'Cloud Infrastructure & Architecture',
    period: '2024',
    organization: 'Amazon Web Services',
    description: 'Foundational certification validating technical understanding of cloud computing services, serverless deployment, data storage, security, and compliance.',
    highlights: [
      'Bridges product design decisions with engineering feasibility, API latency considerations, and scalable infrastructure.'
    ],
    tags: ['Cloud Computing', 'Technical Literacy', 'Security & Compliance']
  },
  {
    id: 'exp-6',
    category: '03 LEARN',
    categoryLabel: 'Certifications',
    title: 'Dicoding UX Design & Web Accessibility',
    role: 'Certified UX Practitioner',
    period: '2023',
    organization: 'Dicoding Indonesia',
    description: 'Rigorous assessment in user interface heuristics, visual hierarchy, mobile-first responsiveness, and accessibility engineering.',
    highlights: [
      'Graduated top of cohort for practical case study on accessible public transit information architecture.'
    ],
    tags: ['Heuristic Evaluation', 'Design Tokens', 'Mobile UX']
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
    tags: ['Human-Computer Interaction', 'Software Engineering', 'Algorithms & Data Structures']
  }
];

export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'Mambu Radar',
    slug: 'mambu-radar',
    short_description: 'Community-powered outdoor odor reporting platform with calibrated sensory telemetry and municipal escalation.',
    category: 'PRODUCT',
    project_type: 'Civic & Sensory Telemetry',
    role: 'Lead Product Designer',
    organization: 'Environmental Tech Initiative',
    client: 'Environmental Tech Initiative',
    year: '2026',
    duration: '4 months',
    thumbnail_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    featured: true,
    featured_order: 1,
    status: 'PUBLISHED',
    created_at: '2026-01-15T08:00:00.000Z',
    updated_at: '2026-08-20T14:30:00.000Z',
    published_at: '2026-02-01T10:00:00.000Z',
    seo_title: 'Mambu Radar Case Study — Aththar Product Design',
    seo_description: 'How we turned subjective olfactory complaints into verified civic telemetry with a 2-tap reporting interface.',
    og_image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    tags: ['Citizen Tech', 'Sensory UX'],
    deliverables: ['Olfactory Taxonomy', '2-Tap Mobile Web', 'Inspector Triage Portal'],
    impact_metrics: [
      { label: 'Verified Reports', value: '4,200+' },
      { label: 'Municipal Triage Speed', value: '68% Faster' },
      { label: 'Reporting Completion', value: '94%' },
      { label: 'Field Usability Score', value: '4.8 / 5.0' }
    ],
    content_json: [
      {
        id: 'b-1',
        type: 'heading',
        level: 1,
        text: 'MAMBU RADAR — Transforming Citizen Odor Complaints into Verified Civic Telemetry'
      },
      {
        id: 'b-2',
        type: 'paragraph',
        text: 'Industrial odor pollution in suburban residential corridors has historically been an invisible civic problem. While factory emissions and landfill runoff generate pungent, nauseating odor spikes, municipal environmental agencies struggled to take enforcement actions because resident complaints were unstructured, delayed by days, and lacked verified meteorological and geospatial triangulation.'
      },
      {
        id: 'b-3',
        type: 'callout',
        calloutType: 'insight',
        title: 'The Core Human Insight',
        text: 'Smell is fleeting and emotional. When a citizen smells an offensive industrial pollutant while walking their dog or driving home, they experience acute frustration. If a civic reporting tool requires more than 20 seconds, complex registration forms, or chemical nomenclature, 89% of users abandon the report.'
      },
      {
        id: 'b-4',
        type: 'columns',
        leftTitle: 'The Traditional Broken Flow',
        leftText: 'Citizens called bureaucratic hotlines days after the incident. Municipal officers asked for chemical descriptions residents could not provide. Records sat in siloed spreadsheets with zero geographic correlation.',
        rightTitle: 'The Mambu Radar Solution',
        rightText: 'A 2-tap mobile web experience: instant GPS pin, calibrated 5-point sensory wheel (pungent, sulfurous, chemical, burnt, organic decay), wind vector overlay, and automatic background clustering.'
      },
      {
        id: 'b-5',
        type: 'heading',
        level: 2,
        text: 'Product Strategy & Sensory Taxonomy'
      },
      {
        id: 'b-6',
        type: 'paragraph',
        text: 'Our primary challenge was designing a taxonomy that felt natural for everyday residents while remaining scientifically actionable for environmental inspectors. We partnered with olfactory researchers to map familiar descriptive sensations to known industrial emission profiles.'
      },
      {
        id: 'b-7',
        type: 'table',
        caption: 'Olfactory Sensory Mapping & Municipal Classification',
        headers: ['Resident Description', 'Sensory Characteristic', 'Likely Industrial Source', 'Escalation Priority'],
        rows: [
          ['Rotten eggs / Sewage', 'Sulfur / H2S Compounds', 'Water Treatment / Landfill', 'Immediate (P1)'],
          ['Burnt plastic / Acidic', 'Volatile Organic Compounds', 'Chemical & Recycling Plant', 'Immediate (P1)'],
          ['Sweet nail polish / Solvent', 'Acetone / Ester Solvents', 'Printing & Coating Mill', 'High (P2)'],
          ['Burnt rubber / Smoke', 'Particulate Pyrolysis', 'Illegal Waste Incineration', 'High (P2)'],
          ['Fermenting compost', 'Organic decomposition', 'Agricultural / Food Processing', 'Moderate (P3)']
        ]
      },
      {
        id: 'b-8',
        type: 'quote',
        text: 'The first solution we prototyped had 14 nuanced chemical subcategories. It looked great on a desktop mockup. In field trials on windy nights, it completely failed. Simplifying to a 5-quadrant tactile tactile wheel increased field submission velocity by 3.4x.',
        author: 'Aththar',
        role: 'Lead Product Designer'
      },
      {
        id: 'b-9',
        type: 'heading',
        level: 2,
        text: 'Municipal Triage Dashboard'
      },
      {
        id: 'b-10',
        type: 'paragraph',
        text: 'For environmental enforcement officers, we created a high-density triage workstation featuring live spatial heatmaps synchronized with local wind speed and direction data. When multiple citizen reports cluster within a 500-meter radius within a 30-minute window, the system automatically triggers an anomaly investigation ticket.'
      },
      {
        id: 'b-11',
        type: 'callout',
        calloutType: 'outcome',
        title: 'Measured Outcomes & Impact',
        text: 'Over 4,200 verified reports logged within the pilot district over 90 days. Municipal officers reduced their investigation response window from 4.5 days down to under 3 hours, leading to 3 formal industrial compliance remediations.'
      }
    ]
  },
  {
    id: 'proj-2',
    title: 'Hexacode Enterprise AI Suite',
    slug: 'hexacode-enterprise-core',
    short_description: 'Multi-tenant enterprise AI workflow automation and policy compliance platform for banking and state-owned enterprises (BUMN).',
    category: 'PRODUCT',
    project_type: 'Enterprise SaaS & AI Core',
    role: 'Senior Product Designer',
    organization: 'PT Hexacode Teknologi Indonesia',
    client: 'PT Hexacode Teknologi Indonesia',
    year: '2025',
    duration: '8 months',
    thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80',
    featured: true,
    featured_order: 2,
    status: 'PUBLISHED',
    created_at: '2025-06-10T08:00:00.000Z',
    updated_at: '2026-08-18T11:00:00.000Z',
    published_at: '2025-11-15T09:00:00.000Z',
    seo_title: 'Hexacode Enterprise AI Core — Aththar Portfolio',
    seo_description: 'Designing mission-critical AI workflows, permission governance, and 200+ screens for enterprise banking clients.',
    og_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80',
    tags: ['Enterprise SaaS', 'Design System'],
    deliverables: ['Multi-Tenant Tokens', '200+ Production Screens', 'Explainable AI Workflows'],
    impact_metrics: [
      { label: 'Enterprise Modules', value: '20+' },
      { label: 'Production Screens', value: '200+' },
      { label: 'Component Tokens', value: '50+' },
      { label: 'Review Latency', value: '-42%' }
    ],
    content_json: [
      {
        id: 'hb-1',
        type: 'heading',
        level: 1,
        text: 'HEXACODE ENTERPRISE AI — Designing Trust and Precision for High-Stakes Compliance'
      },
      {
        id: 'hb-2',
        type: 'paragraph',
        text: 'Enterprise financial institutions and state-owned enterprises manage thousands of regulatory circulars, loan audit documents, and legal mandates weekly. Hexacode developed an AI document reasoning engine to automate triage, but internal compliance officers were initially hesitant to trust automated outputs.'
      },
      {
        id: 'hb-3',
        type: 'callout',
        calloutType: 'decision',
        title: 'Core Design Decision: Explainable AI over Magic',
        text: 'Instead of displaying a solitary "Approved / Rejected" AI badge, every extracted clause displays a side-by-side interactive citation pane with direct character-level grounding in the source legal PDF, confidence scores, and one-click human override controls.'
      },
      {
        id: 'hb-4',
        type: 'heading',
        level: 2,
        text: 'Multi-Tenant Design System Architecture'
      },
      {
        id: 'hb-5',
        type: 'paragraph',
        text: 'To support 5 Tier-1 banking clients with distinct brand guidelines and strict accessibility constraints, I built a multi-brand token system in Figma and React. Over 50 atomic components adapt seamlessly across high-density data tables, modal drawers, and audit trees while maintaining strict WCAG AA contrast compliance.'
      },
      {
        id: 'hb-6',
        type: 'columns',
        leftTitle: 'Challenge: Dense Data Ergonomics',
        leftText: 'Compliance officers review 80+ page documents on 14-inch laptops for 7 hours daily. Eye fatigue and misclicks carry severe financial penalties.',
        rightTitle: 'Solution: Spatial Hierarchy & Sticky Context',
        rightText: 'Optimized 3-pane split view with collapsible toolbars, keyboard shortcuts (Vim-style navigation for power users), and synchronized bi-directional scroll.'
      },
      {
        id: 'hb-7',
        type: 'callout',
        calloutType: 'outcome',
        title: 'Business Impact',
        text: 'Successfully deployed to 3 state-owned enterprise partners and 2 commercial banking networks. Document processing cycle times dropped from 48 hours to under 4 hours per file, while auditor trust ratings reached 92%.'
      }
    ]
  },
  {
    id: 'proj-3',
    title: 'Cilcoffee Brand & Digital Companion',
    slug: 'cilcoffee-brand-experience',
    short_description: 'From single-origin bean sourcing to digital brewing guide and customer retention ecosystem.',
    category: 'BUILD',
    project_type: 'Physical Venture & Digital PWA',
    role: 'Founder, Product & Brand Lead',
    organization: 'Cilcoffee Artisan Lab',
    client: 'Cilcoffee Artisan Lab',
    year: '2024–2025',
    duration: 'Ongoing',
    thumbnail_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=80',
    featured: true,
    featured_order: 3,
    status: 'PUBLISHED',
    created_at: '2024-10-01T08:00:00.000Z',
    updated_at: '2026-08-15T16:00:00.000Z',
    published_at: '2024-11-20T10:00:00.000Z',
    seo_title: 'Cilcoffee — Building a Coffee Brand and Digital Companion',
    seo_description: 'How an entrepreneurial product design experiment transformed artisan coffee beans into an interactive brew guide.',
    og_image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=80',
    tags: ['Venture Building', 'Brand Identity'],
    deliverables: ['Brand Guidelines', 'Packaging Architecture', 'Interactive Brew Companion PWA'],
    impact_metrics: [
      { label: 'Companion Scans', value: '1,800+' },
      { label: 'Repeat Customer Rate', value: '34%' },
      { label: 'Product Margin', value: '48%' },
      { label: 'Full Product Stages', value: '6 Stages' }
    ],
    content_json: [
      {
        id: 'cb-1',
        type: 'heading',
        level: 1,
        text: 'CILCOFFEE — The Journey of an Entrepreneurial Product Experiment'
      },
      {
        id: 'cb-2',
        type: 'paragraph',
        text: 'As a product designer, I believe true product thinking goes far beyond Figma screens. Cilcoffee was born as a full-stack physical-to-digital venture to validate the complete business lifecycle: Idea → Direct Farm Sourcing → Unit Economics → Packaging Architecture → Digital Experience → Repeat Retention.'
      },
      {
        id: 'cb-3',
        type: 'userFlow',
        flowSteps: [
          { step: '01', title: 'Idea & Validation', description: 'Identified the gap between specialty micro-lots and home brewers lacking barista precision.' },
          { step: '02', title: 'Sourcing & Costing', description: 'Partnered with West Java highland micro-lots; calculated packaging, nitrogen sealing, and fulfillment COGS.' },
          { step: '03', title: 'Tactile Packaging', description: 'Designed minimal, typographic craft bags featuring bold sensory notes and scannable NFC/QR tokens.' },
          { step: '04', title: 'Digital Companion', description: 'Built an ultra-fast web PWA giving real-time ratio timers, water temperature curves, and tasting logs.' },
          { step: '05', title: 'Micro-Operations', description: 'Implemented automated batch tracking and localized courier logistics for 48-hour freshness dispatch.' }
        ]
      },
      {
        id: 'cb-4',
        type: 'callout',
        calloutType: 'highlight',
        title: 'Physical-to-Digital Bridge',
        text: 'Every bag features a high-contrast label with an intentional typographic hierarchy. Scanning the label opens the interactive brew companion tailored specifically to that roast date and grind size.'
      },
      {
        id: 'cb-5',
        type: 'quote',
        text: 'Building a real product with my own capital taught me more about tradeoffs, ruthless prioritization, and customer psychology than any simulated design exercise ever could.',
        author: 'Aththar',
        role: 'Founder & Designer'
      }
    ]
  },
  {
    id: 'proj-4',
    title: 'Urban Transit Pulse',
    slug: 'urban-transit-pulse',
    short_description: 'Accessibility audit and tactile wayfinding design system for multi-modal commuter rail transit hubs.',
    category: 'UX',
    project_type: 'Transit & Civic Wayfinding',
    role: 'UX Researcher & System Designer',
    organization: 'Civic Mobility Research',
    client: 'Civic Mobility Research',
    year: '2024',
    duration: '3 months',
    thumbnail_url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1400&q=80',
    featured: false,
    featured_order: 4,
    status: 'PUBLISHED',
    created_at: '2024-04-10T08:00:00.000Z',
    updated_at: '2026-08-01T12:00:00.000Z',
    published_at: '2024-05-15T09:00:00.000Z',
    seo_title: 'Urban Transit Pulse — Accessible Transit UI & Wayfinding',
    seo_description: 'Optimizing high-density station transit signage and digital platform screens for low-vision and non-native commuters.',
    tags: ['Transit UX', 'Accessibility'],
    deliverables: ['Wayfinding Design Audit', 'High-Contrast Signage Tokens', 'Geometric Line Markers'],
    impact_metrics: [
      { label: 'Station Commuters Surveyed', value: '320+' },
      { label: 'Transfer Confusion Drop', value: '-38%' }
    ],
    content_json: [
      {
        id: 'ut-1',
        type: 'heading',
        level: 1,
        text: 'URBAN TRANSIT PULSE — Wayfinding for High-Density Commuter Hubs'
      },
      {
        id: 'ut-2',
        type: 'paragraph',
        text: 'Jakarta commuter rail interchanges accommodate hundreds of thousands of transfers daily during rush hours. Inadequate visual contrast and confusing gate signage caused bottleneck congestions.'
      },
      {
        id: 'ut-3',
        type: 'callout',
        calloutType: 'insight',
        title: 'Key Accessibility Finding',
        text: 'Color-only line indicators failed for 8% of male commuters with color-blindness. Integrating distinct geometric line markers (Square, Triangle, Diamond) alongside high-contrast typography eliminated platform misdirection.'
      }
    ]
  },
  {
    id: 'proj-5',
    title: 'Spatial Micro-CAD',
    slug: 'spatial-micro-cad',
    short_description: 'Experimental touch-first vector canvas and parametric constraint engine running in WebGL / Canvas.',
    category: 'EXPERIMENT',
    project_type: 'WebGL & Parametric Prototyping',
    role: 'Creator & Prototyper',
    organization: 'Open Source Lab',
    client: 'Open Source Lab',
    year: '2025',
    duration: '2 months',
    thumbnail_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1400&q=80',
    featured: false,
    featured_order: 5,
    status: 'PUBLISHED',
    created_at: '2025-02-14T08:00:00.000Z',
    updated_at: '2026-08-10T10:00:00.000Z',
    published_at: '2025-03-01T10:00:00.000Z',
    seo_title: 'Spatial Micro-CAD — Touch-First Parametric Canvas Experiment',
    seo_description: 'Exploring precision mathematical sketching on tablet interfaces without modal fatigue.',
    tags: ['Canvas API', 'Interaction Design'],
    deliverables: ['WebGL Constraint Solver', 'Touch Gesture Matrix', 'Open-Source Demo'],
    impact_metrics: [
      { label: 'Frame Rate Target', value: '60 FPS' },
      { label: 'GitHub Stars', value: '240+' }
    ],
    content_json: [
      {
        id: 'sc-1',
        type: 'heading',
        level: 1,
        text: 'SPATIAL MICRO-CAD — Rethinking Parametric Precision on Touch'
      },
      {
        id: 'sc-2',
        type: 'paragraph',
        text: 'Traditional CAD software relies heavily on mouse hover states, right-click context trees, and keyboard coordinate inputs. This experiment explored how radial springs, gesture velocity, and magnetic snapping can make 2D mechanical drafting fluid on direct-touch screens.'
      }
    ]
  },
  {
    id: 'proj-6',
    title: 'Public Policy Analytics Desk',
    slug: 'public-policy-analytics',
    short_description: 'Government policy simulation dashboard tracking socio-economic metrics across 38 provincial regions.',
    category: 'PRODUCT',
    project_type: 'GovTech & Econometric Dashboard',
    role: 'Senior UI/UX Specialist',
    organization: 'Public Sector Advisory',
    client: 'Public Sector Advisory',
    year: '2024',
    duration: '5 months',
    thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80',
    featured: false,
    featured_order: 6,
    status: 'PUBLISHED',
    created_at: '2024-01-20T08:00:00.000Z',
    updated_at: '2026-07-15T09:00:00.000Z',
    published_at: '2024-06-10T08:00:00.000Z',
    seo_title: 'Public Policy Analytics — Aththar Portfolio',
    seo_description: 'Turning dense econometric data into executive decision levers for ministerial leadership.',
    tags: ['Data Visualization', 'Civic Tech'],
    deliverables: ['Choropleth Visualizer', '38 Provincial Models', 'Executive Briefing Views'],
    impact_metrics: [
      { label: 'Provincial Regions', value: '38 Regions' },
      { label: 'Data Points Processed', value: '1.2M+' }
    ],
    content_json: [
      {
        id: 'pp-1',
        type: 'heading',
        level: 1,
        text: 'PUBLIC POLICY ANALYTICS — Decision Levers for Ministerial Executives'
      },
      {
        id: 'pp-2',
        type: 'paragraph',
        text: 'Transforming massive multi-year census and inflation indices into actionable scenario simulators. Designed bespoke choropleth maps, comparative sparklines, and policy outcome forecast sliders.'
      }
    ]
  }
];

export const initialMedia: MediaItem[] = [
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
