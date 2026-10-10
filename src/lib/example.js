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
    id: "example-high",
    example: true,
    priority: "high",
    client_name: "David Kim",
    follow_up_note: "Market drop: client asked to sell everything. Call before he acts.",
    next_meeting_at: daysFromNow(1, 9),
    live_version: 1,
    meeting_confirmed: false,
  },
  {
    id: "example-high-2",
    example: true,
    priority: "high",
    client_name: "Linda Patel",
    follow_up_note: "RMD deadline: withdrawal not set up yet. Confirm amount and account.",
    next_meeting_at: daysFromNow(2, 11),
    live_version: 1,
    meeting_confirmed: true,
  },
  {
    id: "example-low",
    example: true,
    priority: "low",
    client_name: "Emily Carter",
    follow_up_note: "Routine check-in on monthly savings plan",
    next_meeting_at: daysFromNow(5, 14),
    live_version: 1,
    meeting_confirmed: true,
  },
  {
    id: "example-low-2",
    example: true,
    priority: "low",
    client_name: "Robert Nguyen",
    follow_up_note: "Send updated beneficiary forms after the wedding",
    next_meeting_at: daysFromNow(6, 16),
    live_version: 0,
    meeting_confirmed: false,
  },
];
