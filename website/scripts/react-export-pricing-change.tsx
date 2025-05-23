import dedent from 'dedent'

export function email({ projectTitle, buyUrl }) {
    return {
        subject: "Personal plan for Framer React Export plugin - $49 (was $250)",
        content: dedent`
        Hey!

        I just added a personal plan for $49 (was $250) for the Framer React Export plugin.

        Grab it here: ${buyUrl}

        You'll get full access to the React Export plugin plus I'll set up a GitHub repo with a working example React code for you.

        Tommy
      `
    }
}
