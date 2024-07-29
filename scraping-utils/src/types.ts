export type ScrapeResult = {
    company: string
    website: string
    emails?: string[]
    twitters?: string[]
    contactLinks?: string[]
    notionLinksContent?: string[]
    notionLinksHref?: string[]
    linkNames?: string[]
    source?: Source
    docsSite?: string
    createdAt?: string
}

type Source =
    | 'Product Hunt'
    | 'Beta Page'
    | 'Hacker News'
    | 'Beta List'
    | 'Startup Base'

export interface AhrefsEntry {
    'Referring page title'?: string
    'Referring page URL'?: string
    Language?: string
    Platform?: string
    'Referring page HTTP code'?: string
    'Domain rating'?: string
    'Domain traffic'?: string
    'Referring domains'?: string
    'Linked domains'?: string
    'External links'?: string
    'Page traffic'?: string
    Keywords?: string
    'Target URL'?: string
    'Left context'?: string
    Anchor?: string
    'Right context'?: string
    Type?: string
    Content?: string
    Nofollow?: string
    UGC?: string
    Sponsored?: string
    Rendered?: string
    Raw?: string
    'Lost status'?: string
    'Drop reason'?: string
    'Discovered status'?: string
    'First seen'?: Date
    'Last seen'?: Date
    Lost?: string
    'Links in group'?: string
}
