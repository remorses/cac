import { CollectionField } from 'framer-plugin'

import { Button } from 'template-rewrite-framer/src/components/Button'
import { getMarkdownPluginData } from '@/lib/utils'
import classNames from 'classnames'
import { ComponentProps, Fragment, useState } from 'react'

import {
    LoaderReturnType,
    Paths,
    pluginApiClient,
    PluginDataKeys,
    withMode,
} from '@/lib/utils'
import { framer } from 'framer-plugin'
import {
    LoaderFunctionArgs,
    redirect,
    RouteObject,
    useActionData,
    useLoaderData,
    useNavigation,
} from 'react-router'
import { Link, useSubmit } from 'react-router-dom'
import {
    MarkdownPluginFrontMatter,
    MarkdownPluginFrontMatterProperty,
} from 'website/src/lib/elysia-markdown-plugin'

async function loader({ request }: LoaderFunctionArgs) {
    const {
        owner,
        githubAccountLogin,
        repo,
        basePath,
        mapFieldsConfig,
        projectId,
        projectName,
    } = await getMarkdownPluginData()
    const { data, error } =
        await pluginApiClient.api.plugins.markdownPlugin.syncGithub.post({
            owner,
            repo,
            basePath,
            githubAccountLogin,
            onlyGetFrontmatter: true,
            projectId,
            projectName,
        })
    if (error) {
        throw error
    }

    const { frontMatter } = data

    let shouldShowSettings = !new URL(request.url).searchParams.get('firstSync')

    const showMapFields = Boolean(Object.keys(frontMatter?.properties).length)
    if (!shouldShowSettings && !showMapFields) {
        console.log('no front matter found, redirecting to sync')
        throw redirect(withMode(Paths.sync))
    }
    return { shouldShowSettings, frontMatter, mapFieldsConfig, showMapFields }
}

export function MapFieldsPage(): RouteObject {
    return {
        handle: 'Front Matter Mapping',
        path: Paths.mapFields,
        loader,
        Component: MapFields,
        async action({ request }) {
            const fieldConfig: CollectionFieldConfig[] = await request.json()
            console.log('saving fieldConfig', fieldConfig)
            const collection = await framer.getManagedCollection()
            await collection.setPluginData(
                PluginDataKeys.mapFieldsConfig,
                JSON.stringify(fieldConfig.filter((x) => x?.type)),
            )
            return redirect(withMode(Paths.sync))
        },
    }
}

export type CollectionFieldConfig =
    | CollectionField
    | {
          type: ''
          id: string
          name: string
      }

function sortField(
    fieldA: CollectionFieldConfig,
    fieldB: CollectionFieldConfig,
): number {
    // Sort unsupported fields to bottom
    if (!fieldA && !fieldB) {
        return 0
    } else if (!fieldA) {
        return 1
    } else if (!fieldB) {
        return -1
    }

    return -1
}

function createFieldConfig(
    frontMatter: MarkdownPluginFrontMatter,
): CollectionFieldConfig[] {
    const result: CollectionFieldConfig[] = []

    for (const key in frontMatter.properties) {
        const property = frontMatter.properties[key]

        // Title is always required in CMS API.
        // if (property.type === 'title') continue

        let field = getCollectionFieldForProperty(property)
        if (!field) {
            continue
        }
        result.push(field)
    }

    console.log(
        'createFieldConfig',
        JSON.stringify(result, null, 2),
        JSON.stringify(frontMatter.properties, null, 2),
    )
    return result.sort(sortField)
}

function getFieldConfigForProp(
    property: MarkdownPluginFrontMatterProperty,
    type: CollectionField['type'] | '',
): CollectionFieldConfig {
    if (!type) {
        return {
            type: '',
            id: property.id,
            name: property.name,
        }
    }
    if (type === 'enum') {
        const x = {
            type: 'enum' as const,
            cases: [...new Set(property.values)]
                .map((option) =>
                    option != undefined ? String(option) : option,
                )
                .filter((option) => option)
                .map((option) => ({
                    id: option,
                    name: option,
                })),
            id: property.id,
            name: property.name,
        }
        if (x.cases.length <= 1) {
            return getFieldConfigForProp(property, 'string')
        }
        // console.log(x)
        return x
    }
    return {
        type: type as any,
        id: property.id,
        name: property.name,
    }
}

/**
 * Given a Notion Database Properties object returns a CollectionField object
 * That maps the Notion Property to the Framer CMS collection property type
 */
// https://developers.framer.wiki/framer-plugin/docs/cms#adding-fields
function getCollectionFieldForProperty(property: {
    values: any[]
    name: string
    id: string
}): CollectionFieldConfig | null {
    const allTypes = new Set(property.values.map((property) => typeof property))

    const onlyType = allTypes.size === 1 ? allTypes.values().next().value : null

    if (
        onlyType === 'string' &&
        new Set(property.values).size < property.values.length / 3 && // low cardinality
        false // TODO enum is bugged a lot
    ) {
        return getFieldConfigForProp(property, 'enum')
    } else if (
        onlyType === 'string' &&
        property.values.every((x) => {
            return x.startsWith('http://') || x.startsWith('https://')
        }) &&
        property.values.some(
            (x) =>
                x.endsWith('.png') || x.endsWith('.jpg') || x.endsWith('.jpeg'),
        )
    ) {
        return getFieldConfigForProp(property, 'image')
    } else if (
        onlyType === 'string' &&
        property.values.every((x) => {
            return x.startsWith('http://') || x.startsWith('https://')
        })
    ) {
        return getFieldConfigForProp(property, 'link')
    } else if (
        property.values.every((x) => {
            try {
                return !!Date.parse(x)
            } catch (e) {
                return false
            }
        })
    ) {
        return getFieldConfigForProp(property, 'date')
    } else if (onlyType === 'string') {
        return getFieldConfigForProp(property, 'string')
    } else if (onlyType === 'number') {
        return getFieldConfigForProp(property, 'number')
    } else if (onlyType === 'boolean') {
        return getFieldConfigForProp(property, 'boolean')
    }
    return getFieldConfigForProp(property, 'string')
}

function Input({ className, ...rest }: ComponentProps<'input'>) {
    return (
        <input
            className={classNames(
                'rounded-md p-2 w-full bg-framer-tertiary',
                className,
            )}
            {...rest}
        />
    )
}

export function MapFields({}: {}) {
    const {
        frontMatter,
        mapFieldsConfig: defaultFieldConfigs,
        showMapFields,
        shouldShowSettings,
    } = useLoaderData() as LoaderReturnType<typeof loader>
    const [fieldConfigs, setFieldConfig] = useState(() => {
        const suggested = createFieldConfig(frontMatter)

        return suggested.map((suggestedField) => {
            const existingField = defaultFieldConfigs.find(
                (field) => field.id === suggestedField.id,
            )
            if (existingField) {
                return existingField
            }
            // if it was disabled previously, show it as disabled
            if (defaultFieldConfigs.length) {
                return {
                    ...suggestedField,
                    type: '',
                }
            }
            return suggestedField
        })
    })

    const actionData = useActionData() as any
    const navigation = useNavigation()
    const isLoading = navigation.state !== 'idle'
    const error = String(actionData?.error || '')
    // assert(isFullDatabase(database))

    const submit = useSubmit()
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                console.log('submit')
                submit(JSON.stringify(fieldConfigs), {
                    method: 'post',
                    encType: 'application/json',
                })
            }}
            className='flex flex-col gap-3 '
        >
            {!!showMapFields && (
                <div className='flex-1 flex flex-col gap-4'>
                    <div className='grid grid-cols-[1fr_8px_1fr] gap-3 -mt-1 w-full items-center justify-center'>
                        <span className=' '>Front Matter Property</span>
                        <div className=''></div>
                        <span>Collection Field</span>

                        {fieldConfigs.map((fieldConfig) => {
                            const isDisabled = fieldConfig.type === ''

                            return (
                                <Fragment key={fieldConfig?.id}>
                                    <Input
                                        type='text'
                                        className={classNames(
                                            'w-full opacity-50',
                                            isDisabled && 'opacity-50',
                                        )}
                                        name=''
                                        readOnly
                                        disabled
                                        value={fieldConfig?.name || ''}
                                    />
                                    <div
                                        className={classNames(
                                            'flex items-center justify-center',
                                            isDisabled && 'opacity-50',
                                        )}
                                    >
                                        <IconChevron />
                                    </div>
                                    <select
                                        // disabled={!fieldConfig}
                                        onChange={(e) => {
                                            const newType = e.target
                                                .value as any
                                            // if (!newType) return
                                            let isDisabled = newType === ''
                                            setFieldConfig((current) => {
                                                const newConfig = current.map(
                                                    (config) => {
                                                        if (
                                                            config?.id ===
                                                            fieldConfig?.id
                                                        ) {
                                                            const property =
                                                                frontMatter
                                                                    .properties[
                                                                    config.id
                                                                ]
                                                            return getFieldConfigForProp(
                                                                property,
                                                                newType,
                                                            )
                                                        }
                                                        return config
                                                    },
                                                )

                                                return newConfig
                                            })
                                        }}
                                        className={classNames(
                                            'w-full',
                                            isDisabled && 'opacity-50',
                                        )}
                                        value={fieldConfig?.type || ''}
                                    >
                                        <option value=''>Disable</option>
                                        {possibleTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {mapCollectionFieldToReadableName(
                                                    type,
                                                )}
                                            </option>
                                        ))}
                                    </select>
                                    {/* <Input
                                    type='text'
                                    className={classNames(
                                        'w-full',
                                        isUnsupported && 'opacity-50',
                                    )}
                                    disabled={
                                        !fieldConfig ||
                                        disabledFieldIds.has(
                                            fieldConfig.id,
                                        )
                                    }
                                    placeholder={fieldConfig.originalFieldName}
                                    value={
                                        !fieldConfig
                                            ? 'Unsupported Field'
                                            : (fieldNameOverrides[
                                                  fieldConfig.id
                                              ] ?? '')
                                    }
                                    onChange={(e) => {
                                        assert(fieldConfig)

                                        handleFieldNameChange(
                                            fieldConfig.id,
                                            e.target.value,
                                        )
                                    }}
                                ></Input> */}
                                </Fragment>
                            )
                        })}
                    </div>
                </div>
            )}
            {!showMapFields && (
                <div className='text-center text-balance'>
                    <div className=''>No frontmatter properties found</div>
                </div>
            )}
            {/* <hr className='' /> */}
            <div className='w-full flex-col gap-3 flex items-center max-w-full overflow-hidden'>
                <div className='inline-flex items-center gap-1 min-w-0'>
                    {error && <span className='text-red-500'>{error}</span>}
                </div>

                <Button
                    variant='primary'
                    isLoading={isLoading}
                    type='submit'
                    // disabled={!slugFieldId}
                    // className='w-auto'
                >
                    Import
                </Button>

                {shouldShowSettings && (
                    <Link
                        className='w-full block'
                        to={withMode(Paths.settings)}
                    >
                        <Button type='button' variant='normal'>
                            Settings
                        </Button>
                    </Link>
                )}
            </div>
        </form>
    )
}

const possibleTypes: CollectionField['type'][] = [
    'string',
    'formattedText',
    'number',
    'boolean',
    'date',
    'enum',
    'link',
    // 'image', TODO to support image i have to upload them, which is more complex, i need to find a way to not upload images already uploaded
    'color',
]
function mapCollectionFieldToReadableName(
    field: CollectionField['type'],
): string {
    switch (field) {
        case 'string':
            return 'Text'
        case 'number':
            return 'Number'
        case 'boolean':
            return 'Toggle'
        case 'date':
            return 'Date'
        case 'enum':
            return 'Option (enum)'
        case 'formattedText':
            return 'Rich Text'
        case 'link':
            return 'Link'
        case 'image':
            return 'Image'
        case 'color':
            return 'Color'
        // case 'file':
        //     return 'File'
        default:
            return field
    }
}

function IconChevron() {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='5' height='8'>
            <path
                d='M 1 1 L 4 4 L 1 7'
                fill='transparent'
                strokeWidth='1.5'
                stroke='currentColor'
                strokeLinecap='round'
            ></path>
        </svg>
    )
}
