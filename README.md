# Stair21

One template, filled per client. After a meeting the advisor enters the client's name, goals, meeting notes and next step. AI drafts a plain-language hub ("here's your plan and why"), the advisor edits it, and a compliance reviewer signs off. Clients open it from an expiring, revocable link.

No login: each browser gets a random owner key (localStorage) that scopes the advisor's data.

## Compliance by design

- **Approval required.** Clients only ever see an approved version. The reviewer's name and attestation are recorded.
- **Archive.** Every approval stores an immutable `HubSnapshot` (books and records). Editing starts a new version; the last approved one stays live.
- **Automatic checks.** Account numbers, dollar amounts, percentages, guarantees, performance predictions, recommendations and testimonials are flagged.
- **No account data on the page.** Balances live in the custodian/planning portal; the hub links to it.
- **Expiring links.** Share-link tokens are stored only as SHA-256 hashes, expire (firm setting) and can be revoked.
- **Audit trail.** Every draft, approval, link and client action is logged in `Activity`.

## Structure

```
base44/
├── entities/        # Firm, AdvisorProfile, ClientHub, HubSnapshot, ShareLink, Activity (no direct browser access)
└── functions/
    ├── hubs/        # Advisor actions + AI drafting + compliance checks, scoped by owner key
    └── client-hub/  # Public client view and meeting confirmation, by link token

src/
├── App.jsx                   # Routes: / /hubs /follow-ups /firm /profile /new /hubs/:id /hubs/:id/v/:n /c/:token
├── components/               # Shell (tab bar), HubView (client template), HubTable, FollowUpList, FollowUpEditor
├── pages/                    # Home (dashboard), Hubs, FollowUps, Create, HubDetail, Snapshot, Profile, Firm, ClientView
└── lib/                      # API + owner key, router, example hub
```

## Development

```bash
npm install
npx base44 dev                  # local backend + frontend (AI drafting only works when deployed)
npx base44 deploy --build -y    # deploy everything
```
