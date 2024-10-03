import { XMLParser } from 'fast-xml-parser'

const parser = new XMLParser()

type SitemapURLSet = {
    url: SitemapURL | SitemapURL[]
}

type SitemapURL = {
    loc: string
    lastmod?: string
    changefreq?: string
    priority?: string
}

const fetchSitemap = async (url: string, timeout = 60000): Promise<any> => {
    const controller = new AbortController()
    const signal = controller.signal

    let timeoutId = setTimeout(() => {
        controller.abort()
    }, timeout)

    try {
        console.log(`fetching ${url}`)
        const res = await fetch(url, { signal })
        if (!res.ok) {
            throw new Error(`HTTP error ${res.status} ${res.statusText}`)
        }
        const xml = await res.text()

        const parsed = parser.parse(xml) as {
            sitemapindex?: { sitemap: SitemapURL | SitemapURL[] }
            urlset?: SitemapURLSet
        }
        const { sitemapindex, urlset } = parsed
        // console.log(urlset.url.slice(0, 3))

        // sitemap contains URLs directly, return them
        if (urlset)
            // Sitemap contains URLs directly, return them
            return 'loc' in urlset.url
                ? [urlset.url.loc] // Only single URL in sitemap
                : urlset.url.map((link) => link.loc) // Multiple URLs. in sitemap

        // Sitemap contains URLs to other sitemap(s), download them resursively
        if (sitemapindex) {
            // Contains only a single sitemap
            if ('loc' in sitemapindex.sitemap)
                return await fetchSitemap(sitemapindex.sitemap.loc)

            // Recursively fetch all sitemaps inside current sitemap and fetch links
            // Using Promise.all() for running in parallel
            const groups = await Promise.all(
                sitemapindex.sitemap.map((sitemap) =>
                    fetchSitemap(sitemap.loc),
                ),
            )
            return groups.flat()
        }

        console.log('sitemap not found', xml)
        // Something else, return empty array
        return []
    } catch (e) {
        throw e
        return []
    } finally {
        clearTimeout(timeoutId)
    }
}

export const getSitemapLinks = async (
    url: string,
    timeout = 60000,
): Promise<string[]> => {
    try {
        console.log(`getting pages for sitemap ${url}`)
        // Fetch sitemap recursively
        let links = (await fetchSitemap(url, timeout)) as string[]

        // Flattern array
        links = links.flat(Infinity)

        // Get only unique links
        links = [...new Set(links)]
        return links
    } catch (e) {
        throw new Error(`Unable to fetch sitemap. ${e}`)
    }
}
