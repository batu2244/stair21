# Working in parallel

Several Claude sessions work on this project at once. These rules keep them from overwriting each other.

## Where to work

- **Never edit code in the main folder** (`~/Desktop/senseai-hacks`). It stays on `main` and is only used to merge and deploy.
- Each agent works in its **own worktree** on its own branch:
  ```bash
  cd ~/Desktop/senseai-hacks && scripts/new-worktree.sh <your-name>
  # -> ~/Desktop/senseai-hacks-worktrees/<your-name>, branch agent/<your-name>
  ```
  If your worktree already exists, just `cd` into it. Run `git worktree list` to see who has one.
- Run the app with `npm run dev:wt` inside your worktree. It uses your own backend port (from `.dev-port`), so dev servers don't collide. Vite picks a free frontend port by itself; read it from the output.

## Before you start a task

- `git -C ~/Desktop/senseai-hacks log --oneline -5` and `git merge main` in your worktree, so you build on the latest.
- If another session is active, tell it which files you're about to change (SendMessage), especially for shared hot spots:
  `src/index.css`, `src/App.jsx`, `base44/functions/hubs/entry.ts`, `base44/entities/*`.

## Finishing a task

1. Commit on your branch with a clear message.
2. Merge into main from the main folder:
   ```bash
   cd ~/Desktop/senseai-hacks && git merge --no-ff agent/<your-name>
   ```
   If it conflicts, resolve it there (or ask the other agent), then `npx base44 build` to check it still compiles.
3. Only then deploy (below), or tell the user it's merged and ready.

## Deploying (the live app is shared)

- The user's live app is `https://21-0ade6f8e.base44.app`. Ask the user before deploying, unless they've just asked for it.
- Deploy **only** with `npm run deploy` from the main folder. It refuses to run from a worktree, with uncommitted changes, or while another deploy holds the lock, and tags the deployed commit `deployed`.
- Never run `npx base44 deploy`, `entities push`, or `functions deploy` directly: an entity push replaces the whole schema, so deploying a branch can undo another agent's merged work.

## Shared files outside git

`results/` (user-test transcripts), `slides/` and `hdr.txt` live only in the main folder. Read them by absolute path from your worktree; don't copy them into git.

## Project notes

- Base44 app "21". The AI drafting call (`InvokeLLM`) is blocked by the local dev backend, so test AI on the live app.
- The local dev backend prints sign-up verification codes in its log.
- No login on the advisor side (user's choice); data is scoped by a per-browser owner key.
