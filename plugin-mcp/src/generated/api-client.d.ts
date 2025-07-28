export declare function createClient({ url }: {
    url: string;
}): Promise<{
    api: {
        plugins: {
            [x: string]: {
                get: (options?: {
                    headers?: Record<string, unknown> | undefined;
                    query?: Record<string, unknown> | undefined;
                    fetch?: RequestInit | undefined;
                } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                    [x: number]: any;
                    200: any;
                }>>;
            };
            rewritePlugin: {
                submitReview: {
                    post: (request: {
                        stars: number;
                        generationId: number;
                    }, options?: {
                        headers?: Record<string, unknown> | undefined;
                        query?: Record<string, unknown> | undefined;
                        fetch?: RequestInit | undefined;
                    } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                        200: {
                            success: boolean;
                            error?: undefined;
                        } | {
                            success: boolean;
                            error: string;
                        };
                    }>>;
                };
                rephrase: {
                    post: (request: {
                        oldText: import("plugin-mcp").FramerLayersTree;
                        sourceHtml: string | null;
                        url: string;
                        description?: string | null | undefined;
                        projectName?: string | undefined;
                        pagePath?: string | undefined;
                    }, options?: {
                        headers?: Record<string, unknown> | undefined;
                        query?: Record<string, unknown> | undefined;
                        fetch?: RequestInit | undefined;
                    } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                        200: AsyncGenerator<{
                            type: "chunk";
                            partialItem: Partial<import("plugin-mcp").NewExtractedNode> | null;
                            completeObj: import("type-fest/source/required-deep").RequiredObjectDeep<import("plugin-mcp").NewExtractedNode> | null;
                            fullItem: import("type-fest/source/required-deep").RequiredObjectDeep<import("plugin-mcp").NewExtractedNode>;
                            generationId?: undefined;
                        } | {
                            type: "chunk";
                            partialItem: Partial<import("plugin-mcp").NewExtractedNode> | null;
                            completeObj: import("type-fest/source/required-deep").RequiredObjectDeep<import("plugin-mcp").NewExtractedNode> | null;
                            fullItem: undefined;
                            generationId?: undefined;
                        } | {
                            type: "chunk";
                            partialItem: Partial<import("plugin-mcp").NewExtractedNode> | null;
                            completeObj: import("type-fest/source/required-deep").RequiredObjectDeep<import("plugin-mcp").NewExtractedNode> | null;
                            fullXml: string;
                            generationId?: undefined;
                        } | {
                            type: "generation";
                            generationId: any;
                        }, void, unknown>;
                    }>>;
                };
                discardGeneration: {
                    post: (request: {
                        id: number;
                    }, options?: {
                        headers?: Record<string, unknown> | undefined;
                        query?: Record<string, unknown> | undefined;
                        fetch?: RequestInit | undefined;
                    } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                        200: {
                            error: string;
                            success?: undefined;
                        } | {
                            success: boolean;
                            error?: undefined;
                        };
                    }>>;
                };
                getCredits: {
                    post: (request?: unknown, options?: {
                        headers?: Record<string, unknown> | undefined;
                        query?: Record<string, unknown> | undefined;
                        fetch?: RequestInit | undefined;
                    } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                        200: import("./credits").RemainingCredits;
                    }>>;
                };
                getWebsiteHtml: {
                    post: (request: {
                        domain: string;
                    }, options?: {
                        headers?: Record<string, unknown> | undefined;
                        query?: Record<string, unknown> | undefined;
                        fetch?: RequestInit | undefined;
                    } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                        200: {
                            html: string;
                            extractedDescription: string;
                        };
                    }>>;
                };
            };
            markdownPlugin: {
                health: {
                    get: (options?: {
                        headers?: Record<string, unknown> | undefined;
                        query?: Record<string, unknown> | undefined;
                        fetch?: RequestInit | undefined;
                    } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                        200: string;
                    }>>;
                };
                githubRepoList: {
                    post: (request: {
                        githubAccountLogin: string;
                    }, options?: {
                        headers?: Record<string, unknown> | undefined;
                        query?: Record<string, unknown> | undefined;
                        fetch?: RequestInit | undefined;
                    } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                        200: {
                            repos: {
                                repo: string;
                                owner: string;
                                repoSlug: string;
                                private: boolean;
                                url: string;
                            }[];
                        };
                    }>>;
                };
                syncsThisMonth: {
                    post: (request: {
                        projectId?: string | undefined;
                        projectName?: string | undefined;
                    }, options?: {
                        headers?: Record<string, unknown> | undefined;
                        query?: Record<string, unknown> | undefined;
                        fetch?: RequestInit | undefined;
                    } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                        200: number;
                    }>>;
                };
                subscriptions: {
                    get: (options: {
                        headers?: Record<string, unknown> | undefined;
                        query: {
                            projectId?: string | undefined;
                        };
                        fetch?: RequestInit | undefined;
                    }) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                        200: {
                            subs: ({
                                variantId: string;
                                email: string | null;
                                pluginName: import("db/.prisma/enums").PluginName | null;
                                status: import("db/.prisma/enums").SubscriptionStatus;
                                createdAt: Date;
                                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                                orgId: string;
                                provider: import("db/.prisma/enums").PaymentProvider;
                                subscriptionId: string;
                                orderId: string | null;
                                itemId: string | null;
                                productId: string;
                                variantName: string | null;
                                quantity: number;
                                endsAt: Date | null;
                                customerId: string | null;
                            } | null)[];
                            activeSub: {
                                variantId: string;
                                email: string | null;
                                pluginName: import("db/.prisma/enums").PluginName | null;
                                status: import("db/.prisma/enums").SubscriptionStatus;
                                createdAt: Date;
                                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                                orgId: string;
                                provider: import("db/.prisma/enums").PaymentProvider;
                                subscriptionId: string;
                                orderId: string | null;
                                itemId: string | null;
                                productId: string;
                                variantName: string | null;
                                quantity: number;
                                endsAt: Date | null;
                                customerId: string | null;
                            } | null;
                            freeSyncs: number;
                            manageSubUrl: string | undefined;
                        };
                    }>>;
                };
                frontmatter: {
                    post: (request: {
                        owner: string;
                        repo: string;
                        basePath: string;
                        githubAccountLogin: string;
                    }, options?: {
                        headers?: Record<string, unknown> | undefined;
                        query?: Record<string, unknown> | undefined;
                        fetch?: RequestInit | undefined;
                    } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                        200: {
                            frontMatter: {
                                properties: Record<string, import("./spiceflow-github-sync-plugin").MarkdownPluginFrontMatterProperty>;
                                order: string[];
                            };
                        };
                    }>>;
                };
                syncGithub: {
                    post: (request: {
                        projectId: string;
                        projectName: string;
                        owner: string;
                        repo: string;
                        basePath: string;
                        githubAccountLogin: string;
                        itemIds?: string[] | undefined;
                        mapFieldsConfig?: import("framer-plugin").ManagedCollectionField[] | undefined;
                        onlyGetFrontmatter?: boolean | undefined;
                        enablePartialUpdate?: boolean | undefined;
                    }, options?: {
                        headers?: Record<string, unknown> | undefined;
                        query?: Record<string, unknown> | undefined;
                        fetch?: RequestInit | undefined;
                    } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                        200: {
                            files: {
                                frontMatter: {
                                    [key: string]: any;
                                };
                                id: string;
                                slug: string;
                                path: string;
                                pagePath: string;
                                title: any;
                                foundMdx: boolean | {};
                                sha: string;
                                html?: string | undefined;
                            }[];
                            toDelete: string[];
                            idsToDelete: string[];
                        };
                    }>>;
                };
                checkBasePath: {
                    post: (request: {
                        owner: string;
                        repo: string;
                        basePath: string;
                        githubAccountLogin: string;
                    }, options?: {
                        headers?: Record<string, unknown> | undefined;
                        query?: Record<string, unknown> | undefined;
                        fetch?: RequestInit | undefined;
                    } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                        200: {
                            error: string;
                            formattedBasePath: string;
                        };
                    }>>;
                };
            };
            reactExportPlugin: {
                health: {
                    get: (options?: {
                        headers?: Record<string, unknown> | undefined;
                        query?: Record<string, unknown> | undefined;
                        fetch?: RequestInit | undefined;
                    } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                        200: string;
                    }>>;
                };
                project: ((params: {
                    projectId: string | number;
                }) => {
                    get: (options?: {
                        headers?: Record<string, unknown> | undefined;
                        query?: Record<string, unknown> | undefined;
                        fetch?: RequestInit | undefined;
                    } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                        200: {
                            project: {
                                projectId: string;
                                projectName: string | null;
                                createdAt: Date;
                                websiteUrl: string | null;
                                orgId: string;
                                fullFramerProjectId: string | null;
                                pageBackgroundColor: string | null;
                                framerUserId: string | null;
                                connectedGitHubRepoName: string | null;
                                invitedGitHubRepoUsername: string | null;
                                connectedGitHubRepoAt: Date | null;
                                lastGitHubSyncAt: Date | null;
                            };
                            components: {
                                url: string;
                                name: string;
                                projectId: string;
                                id: string;
                                componentIdentifier: string | null;
                            }[];
                            framerWebPages: {
                                path: string;
                                projectId: string;
                                webPageId: string;
                            }[];
                            colorStyles: {
                                name: string | null;
                                projectId: string;
                                id: string;
                                lightColor: string;
                                darkColor: string;
                            }[];
                            locales: {
                                name: string;
                                id: string;
                                slug: string;
                                code: string;
                            }[];
                            breakpoints: {
                                width: number;
                                componentId: string;
                                variantId: string;
                                breakpointName: string;
                            }[];
                            componentInstances: {
                                controls: import("@prisma/client/runtime/library").JsonValue;
                                componentId: string;
                                webPageId: string;
                                nodeDepth: number;
                                pageOrdering: number;
                            }[];
                        };
                    }>>;
                    publish: {
                        post: (request: {
                            components: {
                                name: string;
                                projectId: string;
                                id: string;
                                componentIdentifier: string | null;
                                url: string;
                            }[];
                        }, options?: {
                            headers?: Record<string, unknown> | undefined;
                            query?: Record<string, unknown> | undefined;
                            fetch?: RequestInit | undefined;
                        } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                            200: string;
                        }>>;
                    };
                    subscribe: {
                        get: (options?: {
                            headers?: Record<string, unknown> | undefined;
                            query?: Record<string, unknown> | undefined;
                            fetch?: RequestInit | undefined;
                        } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                            200: AsyncGenerator<{
                                type: "change";
                                components: import("db").ReactExportComponent[];
                            } | {
                                project: {
                                    projectId: string;
                                    projectName: string | null;
                                    createdAt: Date;
                                    websiteUrl: string | null;
                                    orgId: string;
                                    fullFramerProjectId: string | null;
                                    pageBackgroundColor: string | null;
                                    framerUserId: string | null;
                                    connectedGitHubRepoName: string | null;
                                    invitedGitHubRepoUsername: string | null;
                                    connectedGitHubRepoAt: Date | null;
                                    lastGitHubSyncAt: Date | null;
                                };
                                components: {
                                    url: string;
                                    name: string;
                                    projectId: string;
                                    id: string;
                                    componentIdentifier: string | null;
                                }[];
                                framerWebPages: {
                                    path: string;
                                    projectId: string;
                                    webPageId: string;
                                }[];
                                colorStyles: {
                                    name: string | null;
                                    projectId: string;
                                    id: string;
                                    lightColor: string;
                                    darkColor: string;
                                }[];
                                locales: {
                                    name: string;
                                    id: string;
                                    slug: string;
                                    code: string;
                                }[];
                                breakpoints: {
                                    width: number;
                                    componentId: string;
                                    variantId: string;
                                    breakpointName: string;
                                }[];
                                componentInstances: {
                                    controls: import("@prisma/client/runtime/library").JsonValue;
                                    componentId: string;
                                    webPageId: string;
                                    nodeDepth: number;
                                    pageOrdering: number;
                                }[];
                                type: "project";
                            }, void, unknown>;
                        }>>;
                    };
                }) & {};
                subscriptions: {
                    get: (options: {
                        headers?: Record<string, unknown> | undefined;
                        query: {
                            projectId: string;
                            forSubscriptionUpgrade?: string | boolean | undefined;
                        };
                        fetch?: RequestInit | undefined;
                    }) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                        200: {
                            freeComponents: number;
                            subs: ({
                                variantId: string;
                                email: string | null;
                                pluginName: import("db/.prisma/enums").PluginName | null;
                                status: import("db/.prisma/enums").SubscriptionStatus;
                                createdAt: Date;
                                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                                orgId: string;
                                provider: import("db/.prisma/enums").PaymentProvider;
                                subscriptionId: string;
                                orderId: string | null;
                                itemId: string | null;
                                productId: string;
                                variantName: string | null;
                                quantity: number;
                                endsAt: Date | null;
                                customerId: string | null;
                            } | null)[];
                            activeSub: {
                                variantId: string;
                                email: string | null;
                                pluginName: import("db/.prisma/enums").PluginName | null;
                                status: import("db/.prisma/enums").SubscriptionStatus;
                                createdAt: Date;
                                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                                orgId: string;
                                provider: import("db/.prisma/enums").PaymentProvider;
                                subscriptionId: string;
                                orderId: string | null;
                                itemId: string | null;
                                productId: string;
                                variantName: string | null;
                                quantity: number;
                                endsAt: Date | null;
                                customerId: string | null;
                            } | null;
                            manageSubUrl: string | undefined;
                            subscriptionStatus: import("db/.prisma/enums").SubscriptionStatus | undefined;
                        };
                    }>>;
                };
                upsertUnframerRepoWithAI: {
                    post: (request: {
                        projectId: string;
                        secret: string;
                        sendEmail?: boolean | undefined;
                    }, options?: {
                        headers?: Record<string, unknown> | undefined;
                        query?: Record<string, unknown> | undefined;
                        fetch?: RequestInit | undefined;
                    } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                        200: AsyncGenerator<{
                            message: string;
                            success?: undefined;
                            result?: undefined;
                        } | {
                            success: boolean;
                            result: import("resend").CreateEmailResponse;
                            message?: undefined;
                        }, Response | {
                            success: boolean;
                            error: string;
                        } | {
                            success: boolean;
                            error?: undefined;
                        } | undefined, unknown>;
                    }>>;
                };
                upsertProject: {
                    post: (request: {
                        components: {
                            name: string;
                            projectId: string;
                            id: string;
                            componentIdentifier: string | null;
                            url: string;
                        }[];
                        projectId: string;
                        colorStyles: {
                            name: string | null;
                            projectId: string;
                            id: string;
                            lightColor: string;
                            darkColor: string;
                        }[];
                        breakpoints?: {
                            width: number;
                            componentId: string;
                            projectId: string;
                            variantId: string;
                            breakpointName: string;
                        }[] | undefined;
                        pages?: {
                            path: string;
                            projectId: string;
                            webPageId: string;
                        }[] | undefined;
                        locales?: {
                            name: string;
                            projectId: string;
                            id: string;
                            slug: string;
                            code: string;
                        }[] | undefined;
                        projectName?: string | null | undefined;
                        websiteUrl?: string | undefined;
                        fullFramerProjectId?: string | undefined;
                        pageBackgroundColor?: string | undefined;
                        framerUserId?: string | undefined;
                        componentInstances?: import("db/.prisma/models").ReactExportComponentInstanceUncheckedCreateInput[] | undefined;
                    }, options?: {
                        headers?: Record<string, unknown> | undefined;
                        query?: Record<string, unknown> | undefined;
                        fetch?: RequestInit | undefined;
                    } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                        200: {
                            projectId: string;
                        };
                    }>>;
                };
            };
            llm: {
                health: {
                    get: (options?: {
                        headers?: Record<string, unknown> | undefined;
                        query?: Record<string, unknown> | undefined;
                        fetch?: RequestInit | undefined;
                    } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                        200: string;
                    }>>;
                };
                submitReview: {
                    post: (request: {
                        stars: number;
                        generationId: number;
                    }, options?: {
                        headers?: Record<string, unknown> | undefined;
                        query?: Record<string, unknown> | undefined;
                        fetch?: RequestInit | undefined;
                    } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                        200: {
                            success: boolean;
                            error?: undefined;
                        } | {
                            success: boolean;
                            error: string;
                        };
                    }>>;
                };
                publish: {
                    post: (request: {
                        tree: import("plugin-mcp").FramerLayersTree;
                        randomId: string;
                        callId: string;
                    }, options?: {
                        headers?: Record<string, unknown> | undefined;
                        query?: Record<string, unknown> | undefined;
                        fetch?: RequestInit | undefined;
                    } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                        200: string;
                    }>>;
                };
                getCredits: {
                    post: (request?: unknown, options?: {
                        headers?: Record<string, unknown> | undefined;
                        query?: Record<string, unknown> | undefined;
                        fetch?: RequestInit | undefined;
                    } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                        200: import("./credits").RemainingCredits;
                    }>>;
                };
                generate: {
                    post: (request: {
                        description: string;
                        tree: import("plugin-mcp").FramerLayersTree;
                        randomId: string;
                        projectId?: string | undefined;
                        projectName?: string | undefined;
                    }, options?: {
                        headers?: Record<string, unknown> | undefined;
                        query?: Record<string, unknown> | undefined;
                        fetch?: RequestInit | undefined;
                    } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                        200: AsyncGenerator<{
                            fullItem: import("type-fest/source/required-deep").RequiredObjectDeep<import("plugin-mcp").NewExtractedNode>;
                            type: "fullItem";
                            partialItem: undefined;
                            nodeId: string;
                        } | {
                            fullItem: undefined;
                            type: "partialItem";
                            partialItem: Partial<import("plugin-mcp").NewExtractedNode>;
                            nodeId: string;
                        } | {
                            url: string;
                            type: "tool-call";
                            id: string;
                            toolName: "delete" | "fetch" | "duplicate";
                            callId: string;
                            nodeIds: never[];
                        } | {
                            nodeIds: string[];
                            type: "tool-call";
                            id: string;
                            toolName: "delete" | "fetch" | "duplicate";
                            callId: string;
                        }, {
                            fullXml: string;
                        }, unknown>;
                    }>>;
                };
                subscriptions: {
                    get: (options: {
                        headers?: Record<string, unknown> | undefined;
                        query: {
                            projectId: string;
                        };
                        fetch?: RequestInit | undefined;
                    }) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                        200: {
                            subs: ({
                                variantId: string;
                                email: string | null;
                                pluginName: import("db/.prisma/enums").PluginName | null;
                                status: import("db/.prisma/enums").SubscriptionStatus;
                                createdAt: Date;
                                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                                orgId: string;
                                provider: import("db/.prisma/enums").PaymentProvider;
                                subscriptionId: string;
                                orderId: string | null;
                                itemId: string | null;
                                productId: string;
                                variantName: string | null;
                                quantity: number;
                                endsAt: Date | null;
                                customerId: string | null;
                            } | null)[];
                            activeSub: {
                                variantId: string;
                                email: string | null;
                                pluginName: import("db/.prisma/enums").PluginName | null;
                                status: import("db/.prisma/enums").SubscriptionStatus;
                                createdAt: Date;
                                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                                orgId: string;
                                provider: import("db/.prisma/enums").PaymentProvider;
                                subscriptionId: string;
                                orderId: string | null;
                                itemId: string | null;
                                productId: string;
                                variantName: string | null;
                                quantity: number;
                                endsAt: Date | null;
                                customerId: string | null;
                            } | null;
                            manageSubUrl: string | undefined;
                        };
                    }>>;
                };
            };
            angledScreen: {
                generationsForUser: {
                    get: (options: {
                        headers?: Record<string, unknown> | undefined;
                        query: {
                            framerUserId: string;
                        };
                        fetch?: RequestInit | undefined;
                    }) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                        200: {
                            generations: number;
                            hasLicenseKey: boolean;
                            maxFreeGenerations: number;
                            shouldBuyLicense: boolean;
                            framerUserId: string;
                        };
                    }>>;
                };
                incrementGenerations: {
                    post: (request: {
                        framerUserId: string;
                        userName?: string | undefined;
                    }, options?: {
                        headers?: Record<string, unknown> | undefined;
                        query?: Record<string, unknown> | undefined;
                        fetch?: RequestInit | undefined;
                    } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                        200: {};
                    }>>;
                };
                activate: {
                    post: (request: {
                        framerUserId: string;
                        licenseKey: string;
                        userName?: string | undefined;
                    }, options?: {
                        headers?: Record<string, unknown> | undefined;
                        query?: Record<string, unknown> | undefined;
                        fetch?: RequestInit | undefined;
                    } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                        200: {
                            error: string;
                        } | {
                            error: null;
                        };
                    }>>;
                };
            };
            currentOrg: {
                post: (request?: unknown, options?: {
                    headers?: Record<string, unknown> | undefined;
                    query?: Record<string, unknown> | undefined;
                    fetch?: RequestInit | undefined;
                } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                    200: {
                        orgId: string;
                        email: string | null | undefined;
                    };
                }>>;
            };
            getSessionForKey: {
                post: (request: {
                    key?: string | undefined;
                    projectId?: string | undefined;
                }, options?: {
                    headers?: Record<string, unknown> | undefined;
                    query?: Record<string, unknown> | undefined;
                    fetch?: RequestInit | undefined;
                } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                    200: {
                        error: string;
                        orgId?: undefined;
                        email?: undefined;
                        key?: undefined;
                        requestData?: undefined;
                    } | {
                        orgId: string;
                        email: string;
                        key: string;
                        requestData: string | number | true | import("db/kysely.types").JsonArray | import("db/kysely.types").JsonObject;
                        error?: undefined;
                    };
                }>>;
            };
            health: {
                get: (options?: {
                    headers?: Record<string, unknown> | undefined;
                    query?: Record<string, unknown> | undefined;
                    fetch?: RequestInit | undefined;
                } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                    readonly 200: {
                        ok: boolean;
                    };
                }>>;
            };
            "sse-test": {
                get: (options?: {
                    headers?: Record<string, unknown> | undefined;
                    query?: Record<string, unknown> | undefined;
                    fetch?: RequestInit | undefined;
                } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                    200: AsyncGenerator<"hello" | {
                        ok: boolean;
                    }, never, unknown>;
                }>>;
            };
            errorExample: {
                get: (options?: {
                    headers?: Record<string, unknown> | undefined;
                    query?: Record<string, unknown> | undefined;
                    fetch?: RequestInit | undefined;
                } | undefined) => Promise<import("spiceflow/client").SpiceflowClient.ClientResponse<{
                    readonly 200: {
                        ok: boolean;
                    };
                }>>;
            };
        };
    };
}>;
