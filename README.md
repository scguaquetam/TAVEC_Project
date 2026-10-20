# AI Trust Passport · Harbor demo

React + Vite frontend for The Nexus 5 presentation. The case reveals the AI's missed supplier email during human review, then shows the resulting correction and client-facing AI Trust Passport.

## Run locally

Use Node.js 20.19+ and pnpm 11 (or a compatible package manager):

```bash
pnpm install
pnpm dev
```

Open the local URL printed by Vite. To build the static site, run `pnpm build`; the output is in `dist/`. The repository includes a built `dist/` so the demo can also be served with `python3 -m http.server 4173 --directory dist`.

## Demo path

1. Open **AI draft**. It presents a plausible marketing explanation without flagging the supplier email.
2. Open **Human review**, then the **supplier email**. Add it to the review trail, correct the root cause, accept the sales figure, and correct the recommendation.
3. Complete **Compliance** and issue the **AI Trust Passport**. The Passport discloses the simulated tool, four sources, the missed evidence and its risk, both human approvers, and the final advice.

Use **Focus view** for large captions and larger text during screen sharing. Reset is tucked into the reviewer avatar menu. The short MP4 in `demo/` is the backup for the presentation.

The AI draft and client materials are prepared demonstration content. Uploaded files stay in the browser and are not analyzed or sent to a model. Review decisions are stored in browser local storage; there is no backend or shared persistence yet.
