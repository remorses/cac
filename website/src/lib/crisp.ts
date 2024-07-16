import { env } from './env'

export class Crisp {
    id: string
    key: string
    base = 'https://api.crisp.chat/'
    constructor({ id, key }) {
        this.id = id
        this.key = key
    }
    async fetch<T>({ path, body = undefined as any, method = 'GET' }) {
        const res = await fetch(new URL(path, this.base).toString(), {
            method,
            body: body ? JSON.stringify(body) : undefined,
            headers: {
                Authorization: `Basic ${btoa(`${this.id}:${this.key}`)}`,

                'Content-Type': 'application/json',
                'X-Crisp-Tier': 'plugin',
            },
        })
        if (!res.ok) {
            throw new Error(await res.text())
        }
        const json = (await res.json()) as any
        if (!json.error) {
            return json?.data as T
        } else {
            throw new Error(JSON.stringify(json))
        }
    }
    getWebsites() {
        let page = 0
        // TODO pagination
        return this.fetch<
            { website_id: string; token: string; settings: any }[]
        >({
            // https://docs.crisp.chat/references/rest-api/v1/#list-all-connect-websites
            path: `/v1/plugin/connect/websites/all/${page}?filter_configured=${0}`,
        })
    }
    getOperators({ websiteId }: { websiteId: string }) {
        return this.fetch<
            {
                type: string
                details: {
                    user_id: string
                    email: string
                    first_name: string
                    last_name: string
                    role: string
                    title: string
                    availability: string
                    has_token: boolean
                }
            }[]
        >({
            // https://docs.crisp.chat/references/rest-api/v1/#list-website-operators
            path: `/v1/website/${websiteId}/operators/list`,
        })
    }

    subscriptionSettings({
        websiteId,
        pluginId,
    }: {
        websiteId: string
        pluginId: string
    }) {
        return this.fetch<{
            plugin_id: string
            website_id: string
            token: string
            schema: any
            settings: any
            settings_form_url: string | null
            callback_url: string | null
        }>({
            // https://docs.crisp.chat/references/rest-api/v1/#get-subscription-settings
            path: `/v1/plugins/subscription/${websiteId}/${pluginId}/settings`,
        })
    }
    async getWebsite({ websiteId }) {
        const response = await this.fetch<{
            website_id: string
            name: string
            domain: string
            logo: string
        }>({
            path: `/v1/website/${websiteId}`,
        })
        return response
    }
    getConversations(options: {
        websiteId: string
        pageNumber: number
        searchQuery?: string
        searchType?: 'text' | 'segment' | 'filter'
        searchOperator?: 'or' | 'and'
        includeEmpty?: boolean
        filterUnread?: boolean
        filterResolved?: boolean
        filterNotResolved?: boolean
        filterMention?: boolean
        filterAssigned?: boolean
        filterUnassigned?: boolean
        filterDateStart?: string
        filterDateEnd?: string
        orderDateCreated?: boolean
        orderDateUpdated?: boolean
        orderDateWaiting?: boolean
        perPage?: number
    }) {
        const {
            websiteId,
            pageNumber,
            searchQuery,
            searchType,
            searchOperator,
            includeEmpty,
            filterUnread,
            filterResolved,
            filterNotResolved,
            filterMention,
            filterAssigned,
            filterUnassigned,
            filterDateStart,
            filterDateEnd,
            orderDateCreated,
            orderDateUpdated,
            orderDateWaiting,
            perPage,
        } = options

        const queryParams = new URLSearchParams()

        if (searchQuery) {
            queryParams.set('search_query', searchQuery)
        }
        if (searchType) {
            queryParams.set('search_type', searchType)
        }
        if (searchOperator) {
            queryParams.set('search_operator', searchOperator)
        }
        if (includeEmpty !== undefined) {
            queryParams.set('include_empty', includeEmpty ? '1' : '0')
        }
        if (filterUnread !== undefined) {
            queryParams.set('filter_unread', filterUnread ? '1' : '0')
        }
        if (filterResolved !== undefined) {
            queryParams.set('filter_resolved', filterResolved ? '1' : '0')
        }
        if (filterNotResolved !== undefined) {
            queryParams.set(
                'filter_not_resolved',
                filterNotResolved ? '1' : '0',
            )
        }
        if (filterMention !== undefined) {
            queryParams.set('filter_mention', filterMention ? '1' : '0')
        }
        if (filterAssigned !== undefined) {
            queryParams.set('filter_assigned', filterAssigned ? '1' : '0')
        }

        if (filterUnassigned !== undefined) {
            queryParams.set('filter_unassigned', filterUnassigned ? '1' : '0')
        }
        if (filterDateStart) {
            queryParams.set('filter_date_start', filterDateStart)
        }
        if (filterDateEnd) {
            queryParams.set('filter_date_end', filterDateEnd)
        }
        if (orderDateCreated !== undefined) {
            queryParams.set('order_date_created', orderDateCreated ? '1' : '0')
        }
        if (orderDateUpdated !== undefined) {
            queryParams.set('order_date_updated', orderDateUpdated ? '1' : '0')
        }
        if (orderDateWaiting !== undefined) {
            queryParams.set('order_date_waiting', orderDateWaiting ? '1' : '0')
        }
        if (perPage !== undefined) {
            queryParams.set('per_page', String(perPage))
        }

        return this.fetch<
            {
                session_id: string
                website_id: string
                people_id: string
                status: number
                state: string
                is_verified: boolean
                is_blocked: boolean
                availability: string
                active: {
                    now: boolean
                }
                last_message: string
                mentions: any[]
                participants: {
                    type: string
                    target: string
                }[]
                updated_at: number
                created_at: number
                unread: {
                    operator: number
                    visitor: number
                }
                assigned: {
                    user_id: string
                }
                meta: {
                    nickname: string
                    email: string
                    ip: string
                    avatar: any
                    device: {
                        capabilities: string[]
                        geolocation: {
                            country: string
                            region: string
                            city: string
                            coordinates: {
                                latitude: number
                                longitude: number
                            }
                        }
                        system: {
                            os: {
                                version: string
                                name: string
                            }
                            engine: {
                                name: string
                                version: string
                            }
                            browser: {
                                major: string
                                version: string
                                name: string
                            }
                            useragent: string
                        }
                        timezone: number
                        locales: string[]
                    }
                    segments: string[]
                }
            }[]
        >({
            // https://docs.crisp.chat/references/rest-api/v1/#list-conversations
            path: `/v1/website/${websiteId}/conversations/${pageNumber}?${queryParams.toString()}`,
        })
    }
}

export const crisp = new Crisp({
    id: env.CRISP_ID!,
    key: env.CRISP_KEY!,
})
