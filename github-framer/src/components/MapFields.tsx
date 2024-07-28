import { CollectionField } from 'framer-plugin'

import { ComponentProps, Fragment, useMemo, useState } from 'react'
import classNames from 'classnames'
import { assert, isTruthy } from '@/lib/utils'
import { Button } from '@/components/Button'

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

interface CollectionFieldConfig {
    field: CollectionField
    isDisabled: boolean
    // isNewField: boolean
    // originalFieldName: string
}

function sortField(
    fieldA: CollectionFieldConfig,
    fieldB: CollectionFieldConfig,
): number {
    // Sort unsupported fields to bottom
    if (!fieldA.field && !fieldB.field) {
        return 0
    } else if (!fieldA.field) {
        return 1
    } else if (!fieldB.field) {
        return -1
    }

    return -1
}
export type FrontMatterProperty = {
    values: any[]
    name: string
    id: string
    // type: string
}

export type FrontMatter = {
    properties: Record<string, FrontMatterProperty>
}

type PluginContext = {
    // type: 'update' | 'create'
    collectionFields: CollectionField[]
    ignoredFieldIds: string[]
}

function createFieldConfig(
    frontMatter: FrontMatter,
    pluginContext: PluginContext,
): CollectionFieldConfig[] {
    const result: CollectionFieldConfig[] = []

    const existingFieldIds = new Set(
        pluginContext.collectionFields.map((field) => field.id),
    )

    // result.push({
    //     field: pageContentField,
    //     originalFieldName: pageContentField.name,
    //     isNewField:
    //         existingFieldIds.size > 0 &&
    //         !existingFieldIds.has(pageContentField.id),
    // })

    for (const key in frontMatter.properties) {
        const property = frontMatter.properties[key]
        assert(property)

        // Title is always required in CMS API.
        // if (property.type === 'title') continue

        let field = getCollectionFieldForProperty(property)
        if (!field) {
            continue
        }
        result.push({
            field,
            isDisabled: false,
            // originalFieldName: property.name,
        })
    }

    return result.sort(sortField)
}

function getFieldConfigForProp(
    property: FrontMatterProperty,
    type: CollectionField['type'] | '',
): CollectionField {
    if (!type) {
        return {
            type: 'string',
            id: property.id,
            name: property.name,
        }
    }
    if (type === 'enum') {
        return {
            type: 'enum',
            cases: [...new Set(property.values)].map((option) => ({
                id: option.id,
                name: option.name,
            })),
            id: property.id,
            name: property.name,
        }
    }
    return {
        type: type,
        id: property.id,
        name: property.name,
    }
}

/**
 * Given a Notion Database Properties object returns a CollectionField object
 * That maps the Notion Property to the Framer CMS collection property type
 */
// https://developers.framer.wiki/plugins/docs/cms#adding-fields
function getCollectionFieldForProperty(property: {
    values: any[]
    name: string
    id: string
}): CollectionField | null {
    const allTypes = new Set(property.values.map((property) => typeof property))

    const onlyType = allTypes.size === 1 ? allTypes.values().next().value : null

    if (
        onlyType === 'string' &&
        new Set(property.values).size < property.values.length / 3 // low cardinality
    ) {
        return getFieldConfigForProp(property, 'enum')
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
    } else {
        return getFieldConfigForProp(property, 'string')
    }
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

export function MapFields({
    frontMatter,
    onSubmit,
    isLoading,
    error,
    pluginContext,
}: {
    frontMatter: FrontMatter
    onSubmit: (options: CollectionFieldConfig[]) => void
    isLoading: boolean
    error?: string
    pluginContext: PluginContext
}) {
    const [fieldConfig, setFieldConfig] = useState(() =>
        createFieldConfig(frontMatter, pluginContext),
    )

    // assert(isFullDatabase(database))

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (isLoading) return

        // assert(slugFieldId)

        onSubmit(fieldConfig)
    }

    return (
        <form onSubmit={handleSubmit} className='flex flex-col gap-4 flex-1'>
            <hr className='' />
            <div className='flex-1 flex flex-col gap-4'>
                {/* <div className='flex flex-col gap-2 w-full'>
                    <label htmlFor='collectionName'>Slug Field</label>
                    <select
                        className='w-full'
                        value={slugFieldId ?? ''}
                        onChange={(e) => setSlugFieldId(e.target.value)}
                        required
                    >
                        {slugFields.map((field) => (
                            <option key={field.id} value={field.id}>
                                {field.name}
                            </option>
                        ))}
                    </select>
                </div> */}
                <div className='grid grid-cols-[1fr_8px_1fr] gap-3 -mt-1 w-full items-center justify-center'>
                    <span className=' '>Front Matter Property</span>
                    <div className=''></div>
                    <span>Collection Field</span>

                    {fieldConfig.map((fieldConfig) => {
                        const isDisabled = fieldConfig.isDisabled

                        return (
                            <Fragment key={fieldConfig.field?.id}>
                                <Input
                                    type='text'
                                    className={classNames(
                                        'w-full opacity-50',
                                        isDisabled && 'opacity-50',
                                    )}
                                    disabled
                                    value={fieldConfig.field?.name || ''}
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
                                    // disabled={!fieldConfig.field}
                                    onChange={(e) => {
                                        const newType = e.target.value as any
                                        // if (!newType) return
                                        let isDisabled = newType === ''
                                        setFieldConfig((current) => {
                                            const newConfig = current.map(
                                                (config) => {
                                                    if (
                                                        config.field?.id ===
                                                        fieldConfig.field?.id
                                                    ) {
                                                        const property =
                                                            frontMatter
                                                                .properties[
                                                                config.field.id
                                                            ]
                                                        return {
                                                            isDisabled,
                                                            field: getFieldConfigForProp(
                                                                property,
                                                                newType,
                                                            ),
                                                        }
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
                                    value={fieldConfig.field?.type || ''}
                                >
                                    <option value=''>disable</option>
                                    {possibleTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
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
                                        !fieldConfig.field ||
                                        disabledFieldIds.has(
                                            fieldConfig.field.id,
                                        )
                                    }
                                    placeholder={fieldConfig.originalFieldName}
                                    value={
                                        !fieldConfig.field
                                            ? 'Unsupported Field'
                                            : (fieldNameOverrides[
                                                  fieldConfig.field.id
                                              ] ?? '')
                                    }
                                    onChange={(e) => {
                                        assert(fieldConfig.field)

                                        handleFieldNameChange(
                                            fieldConfig.field.id,
                                            e.target.value,
                                        )
                                    }}
                                ></Input> */}
                            </Fragment>
                        )
                    })}
                </div>
            </div>
            <hr className='' />
            <div className='left-0 bottom-0 w-full flex justify-between sticky items-center max-w-full overflow-hidden'>
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
            </div>
        </form>
    )
}

const possibleTypes: CollectionField['type'][] = [
    'boolean',
    'date',
    'enum',
    'formattedText',
    'link',
    'number',
    'image',
    'color',
]
