// Single source of truth for pricing — the /pricing page and the pricing
// block on each /services/:slug page both read from here, the same way
// services.js backs the NavBar dropdown and the service pages.
//
// ---------------------------------------------------------------------------
// WHERE THESE NUMBERS COME FROM
//
// Benchmarked in August 2026 against published Indonesian market rates, then
// deliberately set at the lower-middle of each range — VELTECH is a two-person
// shop, so it undercuts agency pricing without racing freelance marketplaces
// to the bottom. Reference ranges used:
//
//   Company profile site   Rp 1,5jt – 20jt   (agencies: Rp 7,5jt – 20jt)
//   E-commerce             Rp 20jt – 35jt
//   Custom web app         from Rp 10jt, enterprise Rp 300jt+
//   Custom ERP (SME)       Rp 10jt – 50jt for 3-5 modules
//   Mobile app (simple)    Rp 20jt – 50jt; Android + iOS ≈ 1,7-2x one platform
//   Maintenance            Rp 500rb – 5jt/month, or 15-25%/year of build cost
//   Domain                 Rp 115rb – 320rb/year
//   Shared hosting         Rp 180rb – 540rb/year
//   Cloud hosting          Rp 540rb – 1,98jt/year
//
// These are market-derived starting points, NOT rates anyone at VELTECH has
// signed off on. Whoever owns commercial decisions should confirm each figure
// against real delivery cost before this is treated as a published price list.
// Every figure is a floor ("mulai dari"), which is why each tier carries a
// `from: true` and the UI says so — the site never quotes a fixed total for
// work that hasn't been scoped.
// ---------------------------------------------------------------------------

/**
 * Infrastructure VELTECH buys on a client's behalf. Passed through at
 * provider cost with no markup, which is why it's listed separately from
 * the build fee rather than buried inside it — a client can verify these
 * numbers against any Indonesian registrar in a minute, and hiding a margin
 * in them is the fastest way to lose that trust.
 */
export const infrastructure = {
  note: 'Domain and hosting are billed at provider cost, with no markup. The first year is included with every web build.',
  items: [
    { label: 'Domain (.com / .id)', cost: 'Rp 150.000 – 250.000', unit: 'per year' },
    { label: 'Domain (.co.id)', cost: 'Rp 250.000 – 320.000', unit: 'per year' },
    { label: 'Shared hosting', cost: 'Rp 300.000 – 550.000', unit: 'per year' },
    { label: 'Cloud hosting / VPS', cost: 'Rp 600.000 – 2.000.000', unit: 'per year' },
  ],
}

/**
 * Tiers keyed by the service slug they belong to (see services.js). Each
 * service gets the same three-step shape — a scoped entry point, a full
 * build, and an ongoing arrangement — so the tables read consistently when
 * a visitor compares two services side by side on /pricing.
 */
export const pricingTiers = {
  'it-consulting': [
    {
      name: 'Systems Audit',
      price: 'Rp 5.000.000',
      unit: 'one-off',
      from: true,
      blurb: 'A scoped review of what you run today, ending in a written findings report.',
      includes: [
        'Up to 2 weeks of review across your existing systems',
        'Data flow and integration mapping',
        'Bottleneck and technical debt findings',
        'Written report with prioritised recommendations',
        'Walkthrough session with your team',
      ],
    },
    {
      name: 'Architecture Roadmap',
      price: 'Rp 12.000.000',
      unit: 'one-off',
      from: true,
      featured: true,
      blurb: 'The audit plus a phased plan for what to build, replace, and retire — and in what order.',
      includes: [
        'Everything in Systems Audit',
        'Target architecture and platform decisions',
        'Phased migration plan with sequencing',
        'Cost and risk assessment per phase',
        'Vendor-neutral tooling recommendations',
        'Build estimate you can take to any vendor, including us',
      ],
    },
    {
      name: 'Advisory Retainer',
      price: 'Rp 3.500.000',
      unit: 'per month',
      from: true,
      blurb: 'Ongoing access for teams making architecture calls on a regular basis.',
      note: 'Rolling monthly, cancel any time. No minimum term.',
      includes: [
        'Two scheduled advisory sessions each month',
        'Design and architecture review on request',
        'Vendor and tooling evaluations',
        'Direct line for ad-hoc technical questions',
      ],
    },
  ],

  'custom-systems-erp': [
    {
      name: 'Discovery & Blueprint',
      price: 'Rp 4.500.000',
      unit: 'one-off',
      from: true,
      blurb: 'Mapping your actual floor and warehouse process into a build-ready specification.',
      note: 'Credited back against the build fee if you go ahead with us.',
      includes: [
        'On-site process mapping',
        'Data model and module breakdown',
        'Integration inventory for existing tools',
        'Fixed-scope build estimate',
      ],
    },
    {
      name: 'Core Build',
      price: 'Rp 35.000.000',
      unit: 'per project',
      from: true,
      featured: true,
      blurb: 'The working system: modules built to your process, wired into what you already run.',
      note: 'Typical range for a 3–5 module system. Cloud hosting first year included.',
      includes: [
        'Everything in Discovery & Blueprint',
        '3–5 custom modules built to the agreed scope',
        'Inventory and production tracking',
        'Integration with accounting and procurement',
        'Cloud hosting and deployment, first year included',
        'Staff training and rollout support',
        '3 months of post-launch bug fixes at no charge',
      ],
    },
    {
      name: 'Managed & Support',
      price: 'Rp 1.500.000',
      unit: 'per month',
      from: true,
      blurb: 'Keeping the system running, patched, and growing after go-live.',
      note: 'Starts after the free 3-month post-launch window. Rolling monthly.',
      includes: [
        'Monitoring, backups, and security patching',
        'Response within 1 business day for incidents',
        '4 hours of iteration work each month',
        'Hosting managed and billed at cost',
        'New site and product line onboarding',
      ],
    },
  ],

  'web-mobile-development': [
    {
      name: 'Marketing Site',
      price: 'Rp 6.500.000',
      unit: 'per project',
      from: true,
      blurb: 'A fast, accessible company site built to be edited without calling us back.',
      note: 'Domain and hosting for the first year included — around Rp 500rb of real cost.',
      includes: [
        'Up to 6 pages, designed to your brand',
        'Content management so your team can edit it',
        'Mobile-first, performance and accessibility pass',
        'Domain and hosting set up, first year included',
        'Analytics and SEO groundwork',
        '1 month of post-launch fixes at no charge',
      ],
    },
    {
      name: 'Web Application',
      price: 'Rp 25.000.000',
      unit: 'per project',
      from: true,
      featured: true,
      blurb: 'A product with real users, real data, and an architecture that survives launch day.',
      note: 'Covers the shape of most e-commerce and internal-tool builds.',
      includes: [
        'Product-grade engineering and automated tests',
        'Authentication, roles, and permissions',
        'Admin dashboard for your team',
        'API and third-party integrations (payments, shipping)',
        'Cloud hosting and deployment pipeline, first year included',
        'Incremental delivery you review as it ships',
        '3 months of post-launch bug fixes at no charge',
      ],
    },
    {
      name: 'Web + Native Mobile',
      price: 'Rp 55.000.000',
      unit: 'per project',
      from: true,
      blurb: 'One codebase shipped to web and native mobile, so the two never drift apart.',
      note: 'A second platform costs well under a second build — shared code is the point.',
      includes: [
        'Everything in Web Application',
        'iOS and Android builds from one codebase',
        'App store submission and release setup',
        'Push notifications',
        'Offline and sync handling',
      ],
    },
  ],

  'ai-data': [
    {
      name: 'Data Foundation',
      price: 'Rp 15.000.000',
      unit: 'per project',
      from: true,
      blurb: 'Consolidating scattered operational data into one source you can actually query.',
      includes: [
        'Source system inventory and access setup',
        'Pipeline and data warehouse setup',
        'Data quality and validation rules',
        'Documented schema your team owns outright',
      ],
    },
    {
      name: 'Decision Dashboards',
      price: 'Rp 25.000.000',
      unit: 'per project',
      from: true,
      featured: true,
      blurb: 'The metrics your team acts on, surfaced where they will actually be seen.',
      note: 'Built on the Data Foundation — quoted together if you need both.',
      includes: [
        'Everything in Data Foundation',
        'Operational dashboards per team',
        'Scheduled reporting and threshold alerts',
        'Role-based access to figures',
        'Cloud hosting first year included',
        'Handover training so your team can add their own views',
      ],
    },
    {
      name: 'Predictive Models',
      price: 'Rp 35.000.000',
      unit: 'per model',
      from: true,
      blurb: 'Forecasting demand, maintenance, or risk from your own history — with a person still deciding.',
      note: 'Feasibility review first: if your data cannot support a model, we say so and stop there.',
      includes: [
        'Feasibility review against your actual data',
        'Model development and validation',
        'Human-in-the-loop review workflow',
        'Monitoring for model drift',
        'Retraining runbook handed to your team',
      ],
    },
  ],
}

/** Tiers for one service slug, or an empty list for a slug with no pricing yet. */
export function getPricingForService(slug) {
  return pricingTiers[slug] ?? []
}

// Shown once per pricing table rather than repeated into every tier — these
// hold true across all four services, and repeating them would bury the
// differences that actually distinguish the tiers.
export const includedEverywhere = [
  'Direct line to the two people building it — no account managers in between',
  'Source code and infrastructure handed over to you, in your accounts',
  'Fixed scope and fixed price agreed in writing before work starts',
  'Documentation written as the system is built, not after',
  'Domain and hosting passed through at provider cost, never marked up',
  'No lock-in — you can take the codebase to another team whenever you want',
]

// The honest answer to "why is there a range?", kept next to the numbers
// instead of hidden in a FAQ nobody opens.
export const pricingFactors = [
  {
    label: 'Scope and integrations',
    detail:
      'How many systems the build has to talk to is usually the single biggest driver. A site that stands alone is far cheaper than one wired into your accounting and inventory.',
  },
  {
    label: 'Data condition',
    detail:
      'Clean, documented data moves fast. Undocumented legacy data takes longer to trust, and that time is real work.',
  },
  {
    label: 'Timeline',
    detail:
      'A compressed deadline costs more because it changes how the work has to be staffed, not because the work itself changed.',
  },
  {
    label: 'Ongoing support',
    detail:
      'Whether you want us on call after go-live, or prefer to run it in-house. Budget 15–25% of the build cost per year if you want it maintained.',
  },
]
