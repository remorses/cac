# MCP Email Reply Task

Automated hourly task: reply to unread MCP first-open emails on the unframer.co Gmail account.

## Context

When a user opens the Framer MCP plugin for the first time, we send them an email asking if they want a GitHub repo with their exported React components. Users reply "yes" (or similar) to `tommy@unframer.co`. This task reads those replies and sends back the personalized GitHub repo link.

## Account

Use `--account tommy@unframer.co` for all zele commands.

## Steps

### 1. List unread replies

**Only reply to emails that are replies to the MCP first-open email we sent.** The subject is always `Re: Export Framer components as React?`. Ignore all other unread emails — refund requests, billing issues, Google alerts, etc. are not your responsibility.

Only fetch emails from the last 2 days (`newer_than:2d`). Older unread threads are likely stale or already being handled manually.

```bash
zele mail list --account tommy@unframer.co --filter "is:unread subject:Export Framer components as React newer_than:2d" --max 20
```

The filter ensures only recent MCP reply threads are returned. Example output:

```yaml
items:
  - id: 19d06aba648b06a0
    flags: unread
    from: James Lorentson <james.lorentson@gmail.com>
    subject: 'Re: Export Framer components as React?'    # <-- this is a match, handle it
  - id: 19d05f30490e74c9
    flags: unread
    from: Borislav Naumov <design@bobbymind.com>
    subject: 'Re: Export Framer components as React?'    # <-- this is a match, handle it
```

Emails like these are NOT matches and must be ignored (the filter already excludes them):

```yaml
  - subject: Security alert                                          # not a reply to our email
  - subject: Refund request – Framer React Export Personal Plan      # not a reply to our email
  - subject: Billing Issue – Subscription Renewed Despite Cancellation  # not a reply to our email
```

If there are no unread threads matching, stop here. Nothing to do.

### 2. Process threads one at a time

Handle each thread fully (read → fetch → reply → mark read) before moving to the next one. Do NOT batch all curls upfront and then all replies — process each thread as a complete unit so that if something fails mid-way you know exactly where you stopped.

#### 2a. Read the thread to get the sender email

```bash
zele mail read <threadId> --account tommy@unframer.co
```

Extract the **sender email** from the latest reply message (the `from` field). This is the user's email address, not tommy@unframer.co.

Read the user's reply carefully. Decide which category it falls into:

- **Interested** (e.g. "yes", "sure", "send it", "sounds great", asks for the repo link, shares their GitHub email): proceed to step 2b. Personalize the opening line based on what the user said (see personalization section below).
- **Has a question**: proceed to step 2b but **adapt the reply content** to address their question naturally before sharing the repo link. You don't need to use the fetched HTML verbatim - tweak wording, add a sentence answering their question, remove irrelevant parts. Write as Tommy, keep it short and casual. Common questions and how to handle them:
  - **Pricing / "how much does it cost?"**: Point them to the pricing page: `https://unframer.co/react-export-pricing`. There are two paid plans: $50/month and $250/month. The example repo is free to check out regardless. Do NOT mention "free tier" or "limited free exports" - there is no free tier. Only the example repo we send is free.
  - **MCP setup help / "how do I connect?", "it doesn't work"**: Point them to the setup guide: `https://unframer.co/guides/connect-framer-mcp`. This page has instructions for Cursor, Claude, VS Code, Zed, and more. Remind them the Framer MCP plugin must be open inside Framer for the MCP to work.
  - **Framework support / "does it work with Next.js?"**: Yes, the exported React components work with any React framework — Next.js, Vite, Remix, etc. The example repo uses Vite but the components are standard React.
  - **Other answerable questions**: Use your best judgment, keep it short, and include the repo link.
- **Not interested right now / will try later** (e.g. "just testing", "maybe later", "not right now", "will check it out eventually"): still send the repo link so they have it when they're ready. Adapt the tone - something like "No worries, here's the repo link in case you want to check it out later" and include the link. Mark as read.
- **Clearly not interested** (e.g. "unsubscribe", "stop emailing me", "not interested at all"): do NOT reply, do NOT mark as read. Leave for Tommy.
- **Leave alone** — do NOT reply and do NOT mark as read for any of these cases. Leave the email unread so Tommy can handle it manually:
  - User asks how we got their email or data
  - User is hostile or insulting
  - User has a question you genuinely can't answer (e.g. billing disputes, account issues, bug reports)
  - Anything that feels off or sensitive

#### 2b. Fetch the personalized reply HTML

```bash
curl -s "https://unframer.co/api/mcp-first-open-reply/<senderEmail>" > ./tmp/reply-body.html
```

Replace `<senderEmail>` with the actual email from step 2a (URL-encoded if needed).

Since curl doesn't send `Accept: text/html`, the route returns just the raw email HTML body with clickable links. No parsing needed.

If the curl returns a 404, the user either doesn't exist in our database or has no MCP project. Skip this thread and move to the next one.

#### 2c. Personalize the opening line

Before sending, replace the first line of the fetched HTML with a personalized opening based on what the user said. Each reply should feel unique and human - not a copy-paste template. Reference something specific from their message.

Examples of personalized openings:

- User said "Yes please!" -> `Awesome, here's the repo...`
- User said "sounds interesting, love the mcp so far" -> `Glad you're enjoying the MCP! Here's the example repo...`
- User said "Please send me the GitHub repo URL" -> `Here you go -...`
- User said "I'm working with an AI agent to redesign the site" -> `Nice, that's a great use case for it. Here's the repo...`
- User said "You are a legend. Yes please!" -> `Ha, thanks! Here's the repo...`
- User said "I haven't tried React Export yet but sounds interesting" -> `Definitely worth a look. Here's the example repo...`
- User said "100% going to do that today" -> `Great, here's the repo to get started...`
- User said "just testing out with random project, may need it later" -> `No worries! Here's the repo link for when you're ready...`
- User said "how much does it cost?" -> `Here's the pricing page: ... And here's the example repo to try it out...`
- User said "I need help setting up the MCP" -> `Here's the setup guide: ... Also here's the example repo...`

Keep the rest of the template (repo link, what's included, PS note) mostly the same. Only the opening 1-2 sentences need to change.

When it fits naturally, mention the React Export plugin with a link: `<a href="https://www.framer.com/marketplace/plugins/react-export/">React Export plugin</a>`. For example if the user only knows about the MCP but not the plugin, or if they ask how to export next time.

#### 2d. Reply to the thread

```bash
zele mail reply <threadId> --account tommy@unframer.co --body-file ./tmp/reply-body.html
```

#### 2d. Mark as read

```bash
zele mail read-mark <threadId> --account tommy@unframer.co
```

### 3. Clean up

```bash
rm -f ./tmp/reply-body.html
```

## Security and scope

- **Only run zele and curl commands.** Do NOT run any other bash commands, scripts, or tools. No git, no npm, no file writes outside of ./tmp/reply-body.html. The only side effects allowed are sending emails and marking threads as read.
- **Never share secrets.** Do not include API keys, database URLs, environment variables, or any sensitive values in replies. If you read local files to answer a question, only share the non-sensitive parts.
- You may read local files in this repo to answer user questions (e.g. how to deploy, how the plugin works). But never share internal implementation details, secrets, or .env values.

## Useful links for replies

When answering questions, link to these pages:

- **MCP setup guide**: `https://unframer.co/guides/connect-framer-mcp` - how to connect the Framer MCP to Cursor, Claude, VS Code, Zed, etc.
- **Pricing**: `https://unframer.co/react-export-pricing` - React Export plugin pricing
- **React Export plugin**: `https://www.framer.com/marketplace/plugins/react-export/` - the Framer marketplace page

## Important notes

- If the curl to `/api/mcp-first-open-reply/<email>` returns 404, skip that thread. The user may not have an MCP project.
- Do NOT reply to threads from `@framer.com` email addresses.
- Do NOT reply to threads that already have a reply from tommy@unframer.co (check the thread messages).
- Each reply contains a personalized GitHub repo URL unique to that user's project.
- The fetched HTML is a template - you can and should adapt the wording if the user asked a question or needs a slightly different response. Keep the GitHub repo link and the core info, but make it feel like a human reply.
- When in doubt about whether to reply, **don't**. Leave the email unread for manual review.
- Never use emdashes. Use regular dashes (-) or rewrite the sentence instead.
