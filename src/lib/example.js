// Built-in example hub, shown on the dashboard and at /c/example.
export const EXAMPLE_HUB = {
  client_name: "Maria Lopez",
  first_name: "Maria",
  advisor_name: "Sarah Chen",
  advisor_title: "Wealth Advisor",
  advisor_photo_url: "",
  firm_name: "Northbridge Wealth",
  firm_logo_url: "",
  goals: ["Retire comfortably by 62", "Keep all retirement savings in one place", "Help pay for her daughter's college"],
  plan_summary:
    "Your plan brings your old 401(k) and your new workplace plan under one view. Moving the old account into an IRA makes it easier to see and manage everything together. Your college savings stay separate, so each goal has its own clear path.",
  recap:
    "You recently started a new job and still have a 401(k) with your old employer. You would like your savings in one place and a simple way to track your goals.",
  steps: [
    "Watch for the rollover forms we will email you by Friday.",
    "Sign and return the forms.",
    "We will confirm once the transfer is complete.",
  ],
  advisor_note: "It was great to catch up, Maria. Congratulations again on the new role.",
  readings: [
    {
      title: "What is a rollover?",
      body: "A rollover moves money from an old workplace retirement plan into another retirement account. Done directly between providers, the money stays set aside for retirement the whole time.",
    },
    {
      title: "401(k) and IRA: the difference",
      body: "A 401(k) is a retirement plan offered through an employer. An IRA is a retirement account you open yourself, so it stays with you when you change jobs.",
    },
  ],
  portal_url: "https://example.com",
  // A week from today at 10:00, so the example always shows an upcoming meeting.
  next_meeting_at: (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(10, 0, 0, 0);
    return d.toISOString();
  })(),
  disclosure: "Northbridge Wealth is a registered investment adviser. This example is for illustration only.",
  version: 1,
  approved_at: "2026-10-01T12:00:00.000Z",
};

// Days from today at a given hour, so the examples always sit inside the 7-day window.
function daysFromNow(days, hour) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

// Built-in example follow-ups for the dashboard: a mix of urgent and routine, soonest first.
export const EXAMPLE_FOLLOW_UPS = [
  {
    // Real prospect added from his public LinkedIn profile (Bright Data scrape).
    // Only public facts; no invented contact or financial details.
    id: "client-stonny-l",
    example: true,
    client_name: "Stonny L.",
    follow_up_note: "Intro call: new prospect from LinkedIn",
    next_meeting_at: daysFromNow(2, 10),
    live_version: 0,
    meeting_confirmed: false,
    profile: {
      situation: "Founder of VenueHopper in New York. NYU 2019–2023. Runs Ship & Drink founder build nights; VenueHopper won first place at NYU's Berkley Center venture competition.",
      action: "Intro call: congratulate him on the NYU win, learn his plans for the company and his personal finances as a young founder",
      company: "VenueHopper (Founder)",
      location: "New York, NY",
      linkedin: "https://www.linkedin.com/in/stonnyliu/",
      activity: [
        { at: daysFromNow(0, 9), text: "Added as a prospect from LinkedIn" },
      ],
    },
  },
  {
    id: "example-high-3",
    example: true,
    priority: "high",
    client_name: "Sarah Chen",
    follow_up_note: "Call re: investing idle cash. Propose bond ladder, log call notes.",
    next_meeting_at: daysFromNow(3, 10),
    last_contact_at: daysFromNow(-28, 10),
    live_version: 1,
    meeting_confirmed: false,
    // Shown on the client profile (/clients/:id), not in the dashboard row.
    profile: {
      tier: "A",
      aum: "$2.4M",
      owner: "J. Patel",
      situation: "$150K cash deposit",
      action: "Call about investing idle cash, propose a bond ladder",
      email: "sarah.chen@example.com",
      phone: "(415) 555-0142",
      location: "San Francisco, CA",
      household: "Married, 2 children (14, 17)",
      client_since: "2017",
      risk: "Moderate",
      accounts: [
        { name: "Joint brokerage", type: "Taxable", value: "$1.1M" },
        { name: "Rollover IRA", type: "Retirement", value: "$820K" },
        { name: "529 plans (2)", type: "Education", value: "$310K" },
        { name: "Cash management", type: "Cash", value: "$170K" },
      ],
      activity: [
        { at: daysFromNow(-2, 9), text: "$150K deposit landed in cash management" },
        { at: daysFromNow(-28, 10), text: "Quarterly review call" },
        { at: daysFromNow(-60, 14), text: "Hub version 1 approved and shared" },
      ],
    },
  },
  {
    id: "example-high",
    example: true,
    priority: "high",
    client_name: "David Kim",
    follow_up_note: "Market drop: client asked to sell everything. Call before he acts.",
    next_meeting_at: daysFromNow(1, 9),
    last_contact_at: daysFromNow(-1, 16),
    live_version: 1,
    meeting_confirmed: false,
    profile: {
      tier: "A",
      aum: "$3.1M",
      owner: "J. Patel",
      situation: "Asked to sell everything after the market drop",
      action: "Call before he acts: revisit the plan and his time horizon",
      email: "david.kim@example.com",
      phone: "(206) 555-0187",
      location: "Seattle, WA",
      household: "Married, no children",
      client_since: "2014",
      risk: "Moderately aggressive",
      accounts: [
        { name: "Individual brokerage", type: "Taxable", value: "$1.6M" },
        { name: "Traditional IRA", type: "Retirement", value: "$1.2M" },
        { name: "Roth IRA", type: "Retirement", value: "$240K" },
        { name: "Cash management", type: "Cash", value: "$60K" },
      ],
      activity: [
        { at: daysFromNow(-1, 16), text: "Email: \"Should we get out of the market?\"" },
        { at: daysFromNow(-45, 11), text: "Annual planning meeting" },
        { at: daysFromNow(-46, 9), text: "Hub version 1 approved and shared" },
      ],
    },
  },
  {
    id: "example-high-2",
    example: true,
    priority: "high",
    client_name: "Linda Patel",
    follow_up_note: "RMD deadline: withdrawal not set up yet. Confirm amount and account.",
    next_meeting_at: daysFromNow(2, 11),
    last_contact_at: daysFromNow(-14, 13),
    live_version: 1,
    meeting_confirmed: true,
    profile: {
      tier: "B",
      aum: "$1.2M",
      owner: "M. Rivera",
      situation: "Required minimum distribution not set up for this year",
      action: "Confirm the withdrawal amount and which account it pays into",
      email: "linda.patel@example.com",
      phone: "(602) 555-0119",
      location: "Scottsdale, AZ",
      household: "Widowed, 3 adult children",
      client_since: "2011",
      risk: "Conservative",
      accounts: [
        { name: "Traditional IRA", type: "Retirement", value: "$780K" },
        { name: "Individual brokerage", type: "Taxable", value: "$330K" },
        { name: "Checking (linked)", type: "Cash", value: "$90K" },
      ],
      activity: [
        { at: daysFromNow(-14, 13), text: "Phone call: confirmed she still wants monthly income" },
        { at: daysFromNow(-90, 10), text: "Beneficiaries updated" },
        { at: daysFromNow(-120, 15), text: "Hub version 1 approved and shared" },
      ],
    },
  },
  {
    id: "example-low",
    example: true,
    priority: "low",
    client_name: "Emily Carter",
    follow_up_note: "Routine check-in on monthly savings plan",
    next_meeting_at: daysFromNow(5, 14),
    last_contact_at: daysFromNow(-35, 12),
    live_version: 1,
    meeting_confirmed: true,
    profile: {
      tier: "C",
      aum: "$410K",
      owner: "M. Rivera",
      situation: "On track with monthly savings plan",
      action: "Routine check-in; review contribution amount",
      email: "emily.carter@example.com",
      phone: "(512) 555-0164",
      location: "Austin, TX",
      household: "Single",
      client_since: "2021",
      risk: "Moderate",
      accounts: [
        { name: "Roth IRA", type: "Retirement", value: "$140K" },
        { name: "401(k) (advised)", type: "Retirement", value: "$215K" },
        { name: "Individual brokerage", type: "Taxable", value: "$55K" },
      ],
      activity: [
        { at: daysFromNow(-35, 12), text: "Check-in call: raised monthly contribution" },
        { at: daysFromNow(-200, 10), text: "Hub version 1 approved and shared" },
      ],
    },
  },
  {
    id: "example-low-2",
    example: true,
    priority: "low",
    client_name: "Robert Nguyen",
    follow_up_note: "Send updated beneficiary forms after the wedding",
    next_meeting_at: daysFromNow(6, 16),
    last_contact_at: daysFromNow(-10, 11),
    live_version: 0,
    meeting_confirmed: false,
    profile: {
      tier: "B",
      aum: "$860K",
      owner: "J. Patel",
      situation: "Recently married; beneficiaries out of date",
      action: "Send updated beneficiary forms and review joint accounts",
      email: "robert.nguyen@example.com",
      phone: "(617) 555-0138",
      location: "Boston, MA",
      household: "Recently married",
      client_since: "2019",
      risk: "Moderately aggressive",
      accounts: [
        { name: "401(k) rollover IRA", type: "Retirement", value: "$520K" },
        { name: "Individual brokerage", type: "Taxable", value: "$290K" },
        { name: "HSA", type: "Health", value: "$50K" },
      ],
      activity: [
        { at: daysFromNow(-10, 11), text: "Email: shared wedding news, asked about beneficiaries" },
        { at: daysFromNow(-150, 14), text: "Annual review" },
      ],
    },
  },
];
