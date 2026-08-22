// Single source of truth for the four service offerings — the NavBar
// dropdown, the ServicesSection grid, and each /services/:slug detail page
// all read from this list instead of repeating the copy in three places.
export const services = [
  {
    slug: 'it-consulting',
    title: 'IT Consulting',
    titleParts: ['IT', 'Consulting'],
    summary: 'Advising on the systems and architecture behind your operations, before any code gets written.',
    overview:
      "Most rebuilds fail for the same reason: nobody mapped what was actually there before deciding what to replace. We start by tracing your real data flows, integrations, and bottlenecks — the system as your team actually runs it, not as it appears on a slide — then turn that into an architecture roadmap you can act on.",
    highlights: [
      {
        label: 'Systems Audit',
        detail: 'Mapping what you have today — data flows, integrations, bottlenecks — before recommending anything new.',
      },
      {
        label: 'Architecture Roadmap',
        detail: 'A phased plan for infrastructure and platform decisions built to hold up as you scale.',
      },
      {
        label: 'Vendor-Neutral Guidance',
        detail: 'Recommendations driven by your constraints, not by what is easiest for us to build.',
      },
      {
        label: 'Risk & Cost Assessment',
        detail: 'Flagging technical debt and integration risk before it becomes a budget line.',
      },
    ],
  },
  {
    slug: 'custom-systems-erp',
    title: 'Custom Systems & ERP',
    titleParts: ['Custom Systems', '& ERP'],
    summary: 'Manufacturing, logistics, and business-process systems built around how your team actually works.',
    overview:
      "Off-the-shelf ERP bends your process to fit the software. We build the other way around — systems modeled on your floor and warehouse operations as they actually run, wired into the accounting, procurement, and logistics tools you already depend on, so the system fits the work instead of the work fitting the system.",
    highlights: [
      {
        label: 'Process-First Design',
        detail: 'Workflows mapped straight from your floor and warehouse operations, not a generic template.',
      },
      {
        label: 'Inventory & Production Tracking',
        detail: 'Real-time visibility from raw material to finished goods.',
      },
      {
        label: 'Integration With Existing Tools',
        detail: 'Built to talk to the accounting, procurement, and logistics systems you already run.',
      },
      {
        label: 'Built to Scale With You',
        detail: 'Modular systems that grow with new product lines, sites, or teams without a rebuild.',
      },
    ],
  },
  {
    slug: 'web-mobile-development',
    title: 'Web & Mobile Development',
    titleParts: ['Web & Mobile', 'Development'],
    summary: 'Websites and applications built for clarity, then engineered to hold up under real traffic.',
    overview:
      "A polished demo and a product that survives launch day are two different builds. We treat performance, accessibility, and testing as requirements from the first sprint, ship in increments against real usage, and share one codebase across web and native mobile so nothing drifts out of sync as it grows.",
    highlights: [
      {
        label: 'Product-Grade Engineering',
        detail: 'Performance, accessibility, and testing treated as requirements, not afterthoughts.',
      },
      {
        label: 'Cross-Platform Delivery',
        detail: 'One codebase shipped to web and native mobile without duplicating logic.',
      },
      {
        label: 'Built to Scale Under Load',
        detail: 'Architecture that survives a traffic spike, not just a demo.',
      },
      {
        label: 'Ongoing Iteration',
        detail: 'Shipped in increments, measured, and refined against real usage.',
      },
    ],
  },
  {
    slug: 'ai-data',
    title: 'AI & Data',
    titleParts: ['AI', '& Data'],
    summary: 'Dashboards and predictive tools that turn operational data into decisions.',
    overview:
      "Most operational data sits scattered across systems that were never meant to talk to each other. We consolidate it into one reliable source, build models that forecast demand, maintenance, or risk from your own history, and surface it as dashboards your team can act on — with a person still making the final call.",
    highlights: [
      {
        label: 'Data Pipeline Foundations',
        detail: 'Consolidating scattered operational data into one reliable source of truth.',
      },
      {
        label: 'Predictive Models',
        detail: 'Forecasting demand, maintenance, or risk from your own historical data.',
      },
      {
        label: 'Decision-Ready Dashboards',
        detail: 'Metrics your team can act on, not just look at.',
      },
      {
        label: 'Human-in-the-Loop AI',
        detail: 'Automation that flags and recommends, with people still making the call.',
      },
    ],
  },
]

export function getServiceBySlug(slug) {
  return services.find((s) => s.slug === slug) ?? null
}
