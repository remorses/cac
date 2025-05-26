import dedent from 'dedent'

export function emailForNonUsers({ buyUrl }) {
    return {
        subject:
            'Personal plan for Framer React Export plugin - $49 (was $250)',
        content: dedent`
        Hey!

        I just added a personal plan for $49 (was $250) for the Framer React Export plugin.

        Grab it here: ${buyUrl}

        You'll get full access to the React Export plugin plus I'll set up a GitHub repo with a working example React code for you.

        Tommy
      `,
    }
}

export function reactExportProjectReadyForOldUsers({ deployedUrl, title }) {
    return dedent`
    Hi! I saw you tried exporting to React the Framer project ${JSON.stringify(title)}

    To help you get started I created a GitHub repo with the exported React components, would you like to get access?

    Here is a preview url with your Framer components: ${deployedUrl}
  `
}

export function emailForFailedPaymentsUsers({ buyUrl }) {
    return {
        subject:
            'Personal plan for Framer React Export plugin - $49 (was $250)',
        content: dedent`
        Hey! I saw you tried the Framer React Export but had trouble keeping the sub active

        I just added a personal plan for $49 (was $250) for the Framer React Export plugin.

        Grab it here: ${buyUrl}

        You'll get full access to the React Export plugin plus I'll set up a GitHub repo with a working example React code for you.

        Tommy
      `,
    }
}
