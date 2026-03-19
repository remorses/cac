# MCP Email Reply Task

Automated hourly task: reply to unread MCP first-open emails on the unframer.co Gmail account.

## Context

When a user opens the Framer MCP plugin for the first time, we send them an email asking if they want a GitHub repo with their exported React components. Users reply "yes" (or similar) to `tommy@unframer.co`. This task reads those replies and sends back the personalized GitHub repo link.

## Account

Use `--account tommy@unframer.co` for all zele commands.

## Steps

### 1. List unread replies

```bash
zele mail list --account tommy@unframer.co --filter "is:unread subject:Export Framer components as React" --max 20
```

This returns threads where users replied to the MCP first-open email. Each thread has a `threadId` and shows the sender email.

If there are no unread threads matching, stop here. Nothing to do.

### 2. For each unread thread

For every thread found in step 1:

#### 2a. Read the thread to get the sender email

```bash
zele mail read <threadId> --account tommy@unframer.co
```

Extract the **sender email** from the latest reply message (the `from` field). This is the user's email address, not tommy@unframer.co.

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
- The plain text content already contains the GitHub repo URL as a plain link, which is clickable in most email clients.
