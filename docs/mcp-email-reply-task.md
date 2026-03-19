# MCP Email Reply Task

Automated hourly task: reply to unread MCP first-open emails on the unframer.co Gmail account.

## Context

When a user opens the Framer MCP plugin for the first time, we send them an email asking if they want a GitHub repo with their exported React components. Users reply "yes" (or similar) to `tommy@unframer.co`. This task reads those replies and sends back the personalized GitHub repo link.

## Account

Use `--account tommy@unframer.co` for all zele commands.

## Steps

### 1. List unread replies

**Only reply to emails that are replies to the MCP first-open email we sent.** The subject is always `Re: Export Framer components as React?`. Ignore all other unread emails — refund requests, billing issues, Google alerts, etc. are not your responsibility.

```bash
zele mail list --account tommy@unframer.co --filter "is:unread subject:Export Framer components as React" --max 20
```

The filter ensures only MCP reply threads are returned. Example output:

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

### 2. For each unread thread

For every thread found in step 1:

#### 2a. Read the thread to get the sender email

```bash
zele mail read <threadId> --account tommy@unframer.co
```

Extract the **sender email** from the latest reply message (the `from` field). This is the user's email address, not tommy@unframer.co.

Read the user's reply carefully. Decide which category it falls into:

- **Interested** (e.g. "yes", "sure", "send it", "sounds great", asks for the repo link, shares their GitHub email): proceed to step 2b.
- **Has a question** (e.g. "what frameworks does it support?", "does it work with Next.js?", "how much does it cost?"): proceed to step 2b but **adapt the reply content** to address their question naturally before sharing the repo link. You don't need to use the fetched HTML verbatim — tweak wording, add a sentence answering their question, remove irrelevant parts. Write as Tommy, keep it short and casual.
- **Not interested** (e.g. "no thanks", "not right now", "unsubscribe"): DO NOT mark as read and skip. Do NOT send the repo link.
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

#### 2c. Reply to the thread

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

## Important notes

- If the curl to `/api/mcp-first-open-reply/<email>` returns 404, skip that thread. The user may not have an MCP project.
- Do NOT reply to threads from `@framer.com` email addresses.
- Do NOT reply to threads that already have a reply from tommy@unframer.co (check the thread messages).
- Each reply contains a personalized GitHub repo URL unique to that user's project.
- The fetched HTML is a template — you can and should adapt the wording if the user asked a question or needs a slightly different response. Keep the GitHub repo link and the core info, but make it feel like a human reply.
- When in doubt about whether to reply, **don't**. Leave the email unread for manual review.
