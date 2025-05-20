// allow importing images
declare module '*.jpeg'

// https://github.com/remix-run/react-router/issues/12362
declare module '*/_mdx.guides.migrate-template-affiliate.js' {
    let MDXComponent: (props: any) => JSX.Element
    export default MDXComponent
}
