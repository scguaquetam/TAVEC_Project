# AI Trust Passport · Harbor demo

Interactive frontend for The Nexus 5 presentation. It shows the full path from source files to an AI draft, human review, compliance sign-off, and a client-facing Passport.

## Run locally

Serve the `dist/` directory with any static HTTP server, then open `index.html` through that server. For example: `python3 -m http.server 4173 --directory dist`, then visit `http://localhost:4173`. There is no build step or package installation.

The project is ready to commit to a private Git repository. Commit `dist/`, `README.md`, and `.gitignore`. The local `.openai/` configuration belongs to an unpublished Sites draft and is excluded from Git.

## Demo path

1. Start in **Human review** and open the supplier email under **Overlooked evidence**.
2. Choose **Use in human review**. Reject and correct the root-cause finding.
3. Accept the sales figure and reject and correct the recommendation.
4. Complete the compliance checklist and sign off.
5. Show the **AI Trust Passport** and its before/after comparison. Use **Print / save PDF** for a one-page handout.

The sample AI output, source summaries, and email are prepared demonstration content. Added files stay in the browser and are not analyzed or uploaded. Review decisions are stored in browser local storage. The interface has no server-side AI, user accounts, or shared persistence yet.
