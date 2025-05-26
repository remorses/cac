import dedent from 'dedent'

export function reactExportProjectReady({ deployedUrl, title }) {
    return dedent`
    Hi! Your Framer project ${JSON.stringify(title)} is ready!

    I created a GitHub repo with the exported React components, would you like to get access? What is your GitHub email?

    Here is a preview url with your Framer components: ${deployedUrl}
  `
}
