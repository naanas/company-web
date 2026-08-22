// Single source of truth for pricing — the /pricing page and the pricing
// block on each /services/:slug page both read from here, the same way
// services.js backs the NavBar dropdown and the service pages.
//
// ---------------------------------------------------------------------------
// THE FIGURES BELOW ARE PLACEHOLDERS. Every `price` reads "Rp XX.XXX.XXX" on
// purpose, in the same spirit as the "XX+" stats and "Partner One" logos
// elsewhere in this repo: the structure is real, the numbers are not, and
// nothing here should be treated as a quote until someone who sets VELTECH's
// rates replaces them.
//
// When the real figures land, fill in each `price`/`unit` and flip
// PRICES_ARE_PLACEHOLDER to false — that removes the "indicative only" notice
// the pricing UI shows while this is true, so the page can't quietly go live
// presenting made-up numbers as firm ones.
// ---------------------------------------------------------------------------
export const PRICES_ARE_PLACEHOLDER = true

const PLACEHOLDER = 'Rp XX.XXX.XXX'

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
      price: PLACEHOLDER,
      unit: 'one-off',
      blurb: 'A scoped review of what you run today, ending in a written findings report.',
      includes: [
        'Data flow and integration mapping',
        'Bottleneck and technical debt findings',
        'Written report with prioritised recommendations',
        'Walkthrough session with your team',
      ],
    },
    {
      name: 'Architecture Roadmap',
      price: PLACEHOLDER,
      unit: 'one-off',
      blurb: 'The audit plus a phased plan for what to build, replace, and retire — and in what order.',
      featured: true,
      includes: [
        'Everything in Systems Audit',
        'Target architecture and platform decisions',
        'Phased migration plan with sequencing',
        'Cost and risk assessment per phase',
        'Vendor-neutral tooling recommendations',
      ],
    },
    {
      name: 'Advisory Retainer',
      price: PLACEHOLDER,
      unit: 'per month',
      blurb: 'Ongoing access for teams making architecture calls on a regular basis.',
      includes: [
        'Scheduled monthly advisory sessions',
        'Design and architecture review on request',
        'Vendor and tooling evaluations',
        'Direct line for ad-hoc technical questions',
      ],
    },
  ],

  'custom-systems-erp': [
    {
      name: 'Discovery & Blueprint',
      price: PLACEHOLDER,
      unit: 'one-off',
      blurb: 'Mapping your actual floor and warehouse process into a build-ready specification.',
      includes: [
        'On-site process mapping',
        'Data model and module breakdown',
        'Integration inventory for existing tools',
        'Fixed-scope build estimate',
      ],
    },
    {
      name: 'Core Build',
      price: PLACEHOLDER,
      unit: 'per project',
      blurb: 'The working system: modules built to your process, wired into what you already run.',
      featured: true,
      includes: [
        'Everything in Discovery & Blueprint',
        'Custom modules built to the agreed scope',
        'Inventory and production tracking',
        'Integration with accounting and procurement',
        'Staff training and rollout support',
      ],
    },
    {
      name: 'Managed & Support',
      price: PLACEHOLDER,
      unit: 'per month',
      blurb: 'Keeping the system running, patched, and growing after go-live.',
      includes: [
        'Monitoring, backups, and patching',
        'Agreed response time for incidents',
        'Monthly iteration allowance',
        'New site and product line onboarding',
      ],
    },
  ],

  'web-mobile-development': [
    {
      name: 'Marketing Site',
      price: PLACEHOLDER,
      unit: 'per project',
      blurb: 'A fast, accessible company site built to be edited without calling us back.',
      includes: [
        'Design and build to your brand',
        'Content management for your team',
        'Performance and accessibility pass',
        'Analytics and SEO groundwork',
      ],
    },
    {
      name: 'Web Application',
      price: PLACEHOLDER,
      unit: 'per project',
      blurb: 'A product with real users, real data, and an architecture that survives launch day.',
      featured: true,
      includes: [
        'Product-grade engineering and testing',
        'Authentication, roles, and permissions',
        'API and third-party integrations',
        'Load-tested deployment pipeline',
        'Incremental delivery against real usage',
      ],
    },
    {
      name: 'Web + Native Mobile',
      price: PLACEHOLDER,
      unit: 'per project',
      blurb: 'One codebase shipped to web and native mobile, so the two never drift apart.',
      includes: [
        'Everything in Web Application',
        'iOS and Android builds',
        'App store submission and release setup',
        'Offline and sync handling',
      ],
    },
  ],

  'ai-data': [
    {
      name: 'Data Foundation',
      price: PLACEHOLDER,
      unit: 'per project',
      blurb: 'Consolidating scattered operational data into one source you can actually query.',
      includes: [
        'Source system inventory',
        'Pipeline and warehouse setup',
        'Data quality and validation rules',
        'Documented schema your team owns',
      ],
    },
    {
      name: 'Decision Dashboards',
      price: PLACEHOLDER,
      unit: 'per project',
      blurb: 'The metrics your team acts on, surfaced where they will actually be seen.',
      featured: true,
      includes: [
        'Everything in Data Foundation',
        'Operational dashboards per team',
        'Scheduled reporting and alerting',
        'Role-based access to figures',
        'Handover training',
      ],
    },
    {
      name: 'Predictive Models',
      price: PLACEHOLDER,
      unit: 'from, per model',
      blurb: 'Forecasting demand, maintenance, or risk from your own history — with a person still deciding.',
      includes: [
        'Feasibility review against your data',
        'Model development and validation',
        'Human-in-the-loop review workflow',
        'Monitoring for model drift',
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
  'Source code and infrastructure handed over to you',
  'Fixed scope agreed in writing before work starts',
  'Documentation written as the system is built, not after',
]

// The honest answer to "why is there a range?", kept next to the numbers
// instead of hidden in a FAQ nobody opens.
export const pricingFactors = [
  {
    label: 'Scope and integrations',
    detail: 'How many systems the build has to talk to is usually the single biggest driver.',
  },
  {
    label: 'Data condition',
    detail: 'Clean, documented data moves fast. Undocumented legacy data takes longer to trust.',
  },
  {
    label: 'Timeline',
    detail: 'A compressed deadline costs more because it changes how the work has to be staffed.',
  },
  {
    label: 'Ongoing support',
    detail: 'Whether you want us on call after go-live, or prefer to run it in-house.',
  },
]
