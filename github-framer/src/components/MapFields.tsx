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
    field: CollectionField | null
    isNewField: boolean
    originalFieldName: string
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
    type: 'update' | 'create'
    collectionFields: CollectionField[]
    ignoredFieldIds: string[]
}

function createFieldConfig(
    database: FrontMatter,
    pluginContext: PluginContext,
): CollectionFieldConfig[] {
    const result: CollectionFieldConfig[] = []

    const existingFieldIds = new Set(
        pluginContext.type === 'update'
            ? pluginContext.collectionFields.map((field) => field.id)
            : [],
    )

    // result.push({
    //     field: pageContentField,
    //     originalFieldName: pageContentField.name,
    //     isNewField:
    //         existingFieldIds.size > 0 &&
    //         !existingFieldIds.has(pageContentField.id),
    // })

    for (const key in database.properties) {
        const property = database.properties[key]
        assert(property)

        // Title is always required in CMS API.
        // if (property.type === 'title') continue

        result.push({
            field: getCollectionFieldForProperty(property),
            originalFieldName: property.name,
            isNewField:
                existingFieldIds.size > 0 && !existingFieldIds.has(property.id),
        })
    }

    return result.sort(sortField)
}

function getFieldNameOverrides(
    pluginContext: PluginContext,
): Record<string, string> {
    const result: Record<string, string> = {}
    if (pluginContext.type !== 'update') return result

    for (const field of pluginContext.collectionFields) {
        result[field.id] = field.name
    }

    return result
}

function hasFieldConfigurationChanged(
    currentConfig: CollectionField[],
    database: FrontMatter,
    ignoredFieldIds: string[],
): boolean {
    const currentFieldsById = new Map<string, CollectionField>()
    for (const field of currentConfig) {
        currentFieldsById.set(field.id, field)
    }

    const suggestedFields = getSuggestedFieldsForDatabase(
        database,
        ignoredFieldIds,
    )
    if (suggestedFields.length !== currentConfig.length) return true

    const includedFields = suggestedFields.filter((field) =>
        currentFieldsById.has(field.id),
    )

    for (const field of includedFields) {
        const currentField = currentFieldsById.get(field.id)

        if (!currentField) return true
        if (currentField.type !== field.type) return true
    }

    return false
}
type FieldId = string

function getSuggestedFieldsForDatabase(
    database: FrontMatter,
    ignoredFieldIds: FieldId[],
) {
    const fields: CollectionField[] = []

    // if (!ignoredFieldIds.includes(pageContentField.id)) {
    //     fields.push(pageContentField)
    // }

    for (const key in database.properties) {
        const property = database.properties[key]
        assert(property)

        // These fields were ignored by the user
        if (ignoredFieldIds.includes(property.id)) continue

        // if (property.type === 'title') continue

        const field = getCollectionFieldForProperty(property)
        if (field) {
            fields.push(field)
        }
    }

    return fields
}

/**
 * Given a Notion Database Properties object returns a CollectionField object
 * That maps the Notion Property to the Framer CMS collection property type
 */
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
        return {
            type: 'enum',
            cases: [...new Set(property.values)].map((option) => ({
                id: option.id,
                name: option.name,
            })),
            id: property.id,
            name: property.name,
        }
    } else if (
        property.values.every((x) => {
            try {
                return !!Date.parse(x)
            } catch (e) {
                return false
            }
        })
    ) {
        return {
            type: 'date',
            id: property.id,
            name: property.name,
        }
    } else if (onlyType === 'string') {
        return {
            type: 'formattedText',
            id: property.id,
            name: property.name,
        }
    } else if (onlyType === 'number') {
        return {
            type: 'number',
            id: property.id,
            name: property.name,
        }
    } else if (onlyType === 'boolean') {
        return {
            type: 'boolean',
            id: property.id,
            name: property.name,
        }
    } else {
        // More Field types can be added here
        return null
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

export interface SynchronizeMutationOptions {
    fields: CollectionField[]
    ignoredFieldIds: string[]
    // lastSyncedTime: string | null
    // slugFieldId: string
}

export function MapDatabaseFields({
    database,
    onSubmit,
    isLoading,
    error,
    pluginContext,
}: {
    database: FrontMatter
    onSubmit: (options: SynchronizeMutationOptions) => void
    isLoading: boolean
    error: Error | null
    pluginContext: PluginContext
}) {
    // const slugFields = useMemo(
    //     () => getPossibleSlugFields(database),
    //     [database],
    // )
    // const [slugFieldId, setSlugFieldId] = useState<string | null>(() =>
    //     getInitialSlugFieldId(pluginContext, slugFields),
    // )
    const [fieldConfig] = useState<CollectionFieldConfig[]>(() =>
        createFieldConfig(database, pluginContext),
    )
    const [disabledFieldIds, setDisabledFieldIds] = useState(
        () =>
            new Set<string>(
                pluginContext.type === 'update'
                    ? pluginContext.ignoredFieldIds
                    : [],
            ),
    )
    const [fieldNameOverrides, setFieldNameOverrides] = useState<
        Record<string, string>
    >(() => getFieldNameOverrides(pluginContext))

    // assert(isFullDatabase(database))

    const handleFieldToggle = (key: string) => {
        setDisabledFieldIds((current) => {
            const nextSet = new Set(current)
            if (nextSet.has(key)) {
                nextSet.delete(key)
            } else {
                nextSet.add(key)
            }

            return nextSet
        })
    }

    const handleFieldNameChange = (id: string, value: string) => {
        setFieldNameOverrides((current) => ({
            ...current,
            [id]: value,
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (isLoading) return

        const allFields = fieldConfig
            .filter(
                (fieldConfig) =>
                    fieldConfig.field &&
                    !disabledFieldIds.has(fieldConfig.field.id),
            )
            .map((fieldConfig) => fieldConfig.field)
            .filter(isTruthy)
            .map((field) => {
                if (fieldNameOverrides[field.id]) {
                    field.name = fieldNameOverrides[field.id]
                }

                return field
            })

        // assert(slugFieldId)

        onSubmit({
            fields: allFields,
            ignoredFieldIds: Array.from(disabledFieldIds),
            // slugFieldId,
            // lastSyncedTime: getLastSyncedTime(
            //     pluginContext,
            //     database,
            //     // slugFieldId,
            //     disabledFieldIds,
            // ),
        })
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
                <div className='grid grid-cols-[16px_1fr_8px_1fr] gap-3 -mt-1 w-full items-center justify-center'>
                    <span className='col-start-2 col-span-2'>
                        Front Matter Property
                    </span>
                    <span>Collection Field</span>

                    {fieldConfig.map((fieldConfig) => {
                        const isUnsupported =
                            !fieldConfig.field ||
                            disabledFieldIds.has(fieldConfig.field.id)

                        return (
                            <Fragment key={fieldConfig.originalFieldName}>
                                <Input
                                    type='checkbox'
                                    disabled={!fieldConfig.field}
                                    checked={
                                        !!fieldConfig.field &&
                                        !disabledFieldIds.has(
                                            fieldConfig.field.id,
                                        )
                                    }
                                    className={classNames(
                                        'mx-auto ',
                                        isUnsupported && 'opacity-50',
                                    )}
                                    onChange={() => {
                                        assert(fieldConfig.field)

                                        handleFieldToggle(fieldConfig.field.id)
                                    }}
                                />
                                <Input
                                    type='text'
                                    className={classNames(
                                        'w-full',
                                        isUnsupported && 'opacity-50',
                                    )}
                                    disabled
                                    value={fieldConfig.originalFieldName}
                                />
                                <div
                                    className={classNames(
                                        'flex items-center justify-center',
                                        isUnsupported && 'opacity-50',
                                    )}
                                >
                                    <IconChevron />
                                </div>
                                <Input
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
                                ></Input>
                            </Fragment>
                        )
                    })}
                </div>
            </div>
            <hr className='' />
            <div className='left-0 bottom-0 w-full flex justify-between sticky items-center max-w-full overflow-hidden'>
                {/* <div className='inline-flex items-center gap-1 min-w-0'>
                    {error ? (
                        <span className='text-red-500'>{error.message}</span>
                    ) : (
                        <>
                            <span className='text-framer-tertiary flex-shrink-0'>
                                Importing from front matter
                            </span>
                        </>
                    )}
                </div> */}
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
