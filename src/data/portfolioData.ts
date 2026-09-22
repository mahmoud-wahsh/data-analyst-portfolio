import { ProjectItem, SkillItem, NavItem } from '../types';

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

export const SKILLS: SkillItem[] = [
  {
    name: 'SQL',
    category: 'Querying & Extraction',
    description: 'Complex joins, subqueries, CTEs, window functions, and database schema navigation.',
  },
  {
    name: 'Excel',
    category: 'Spreadsheets & Modeling',
    description: 'Advanced lookup functions (XLOOKUP/INDEX-MATCH), dynamic arrays, and pivot tables.',
  },
  {
    name: 'Power BI',
    category: 'Business Intelligence',
    description: 'Interactive dashboard creation, KPI monitoring, and executive report design.',
  },
  {
    name: 'Power Query',
    category: 'ETL & Transformation',
    description: 'Data ingestion, automated cleanup pipelines, unpivoting, and shape transformations.',
  },
  {
    name: 'Data Modeling',
    category: 'Architecture',
    description: 'Star and snowflake schemas, dimension and fact tables, and one-to-many relationship optimization.',
  },
  {
    name: 'DAX',
    category: 'Calculation Engine',
    description: 'Calculated measures, time intelligence formulas, and context transition modeling in Power BI.',
  },
  {
    name: 'Python',
    category: 'Data Analysis & Automation',
    description: 'Exploratory data analysis with Pandas, NumPy calculations, and visualization with Matplotlib & Seaborn.',
  },
  {
    name: 'Tableau',
    category: 'Data Visualization',
    description: 'Visual storytelling, calculated fields, dashboard actions, and interactive parameter controls.',
  },
];

export const PROJECTS: ProjectItem[] = [
  {
    id: 'ecommerce-cohort-analysis',
    title: 'E-Commerce Sales & Cohort Retention Analysis',
    description:
      'Analyzed multi-year retail transactions to track revenue growth, repeat purchase velocity, and customer lifetime value cohorts across regional markets.',
    tools: ['SQL', 'Power BI', 'DAX', 'Excel'],
    highlights: [
      'Engineered SQL scripts to cleanse 85,000+ raw invoice records and group monthly customer cohorts.',
      'Created DAX measures to compute Month-over-Month retention rates and Average Order Value (AOV).',
      'Constructed a 3-page interactive Power BI dashboard highlighting churn risk segments.',
    ],
    keyInsight: 'Identified a 14% drop in month-2 retention that led to targeted email reactivation recommendations.',
  },
  {
    id: 'healthcare-patient-wait-times',
    title: 'Healthcare Operations & Emergency Wait Times',
    description:
      'Examined hospital patient intake records to identify department bottlenecks, peak admission cycles, and triage resource utilization patterns.',
    tools: ['Tableau', 'Python', 'Data Modeling'],
    highlights: [
      'Processed patient arrival logs using Python (Pandas) to flag outliers and standardize time intervals.',
      'Constructed a normalized star schema linking patient encounters, triage levels, and clinical staff ratios.',
      'Built a Tableau visual monitoring suite with time-of-day heatmaps and drill-down triage filters.',
    ],
    keyInsight: 'Showcased that 42% of intake delays occurred during Friday evening shift handovers, suggesting staffing reallocation.',
  },
  {
    id: 'supply-chain-inventory-forecast',
    title: 'Supply Chain Inventory & Demand Forecasting',
    description:
      'Built an automated inventory auditing and demand forecasting model to reduce stockout instances and optimize safety stock thresholds.',
    tools: ['Excel', 'Power Query', 'SQL', 'Python'],
    highlights: [
      'Built automated Power Query extraction routines combining supplier lead times and warehouse stock logs.',
      'Developed inventory turnover metrics and economic order quantity (EOQ) simulations in Excel.',
      'Implemented rolling 30-day demand averages and reorder alert flags for 400+ SKU categories.',
    ],
    keyInsight: 'Simulated a potential 18% reduction in carrying costs while maintaining a 98.5% order fulfillment rate.',
  },
];
