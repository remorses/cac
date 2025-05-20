'use client'
import NProgress from 'nprogress'

import React from 'react'
import { Icon } from '@iconify/react'
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Chip,
    Divider,
    Link,
    Spacer,
    Tab,
    Tabs,
} from '@heroui/react'
import { cn } from '@heroui/react'

import type { ButtonProps } from '@heroui/react'
import { className } from 'website/src/framer-old/chunks/chunk-3N5VBLZQ'
import { discountCodeUrl, env, reactExportVariants } from 'website/src/lib/env'
import { href } from 'react-router'
import { Route } from './+types/_board.react-export-pricing'

enum FrequencyEnum {
    Yearly = 'yearly',
    Monthly = 'monthly',
}

enum TiersEnum {
    Personal = 'personal',
    Business = 'business',
}

const frequencies: Array<Frequency> = [
    { key: FrequencyEnum.Yearly, label: 'Pay Yearly', priceSuffix: 'per year' },
    {
        key: FrequencyEnum.Monthly,
        label: 'Pay Monthly',
        priceSuffix: 'per month',
    },
]

const tiers: Array<Tier> = [
    {
        key: TiersEnum.Personal,
        title: 'Personal',
        description: 'Single Framer user access, for personal use',
        mostPopular: false,
        price: {
            yearly: '$450',
            monthly: '$50',
        },
        featured: false,
        features: [
            '20 React components per project',
            'Framer forms support',
            'Fetch API integration',
            'Responsive design',
            'SEO optimization',
        ],
        buttonText: 'Start 7 days trial',
        buttonColor: 'default',
        buttonVariant: 'solid',
    },
    {
        key: TiersEnum.Business,
        title: 'Business',

        featured: true,
        mostPopular: true,
        description: 'Accessible by unlimited Framer users and developers',
        price: {
            yearly: '$2250',
            monthly: '$250',
        },
        features: [
            'Unlimited React components',
            'Framer forms support',
            'Fetch API integration',
            'Responsive design',
            'SEO optimization',
        ],
        buttonText: 'Start 7 days trial',
        buttonColor: 'primary',
        buttonVariant: 'flat',
    },
]

type Frequency = {
    key: FrequencyEnum
    label: string
    priceSuffix: string
}

type Tier = {
    key: TiersEnum
    title: string
    price:
        | {
              [FrequencyEnum.Yearly]: string
              [FrequencyEnum.Monthly]: string
          }
        | string
    priceSuffix?: string

    description?: string
    mostPopular?: boolean
    featured?: boolean
    features?: string[]
    buttonText: string
    buttonColor?: ButtonProps['color']
    buttonVariant: ButtonProps['variant']
}

export function loader({ request }: Route.LoaderArgs) {
    const u = new URL(request.url)
    const searchParams = u.searchParams
    const orgId = searchParams.get('orgId') as string
    if (!orgId) {
        throw new Error('No orgId found in search params')
    }
    return {
        orgId,
    }
}

export function ReactExportPricing({
    loaderData: { orgId },
}: Route.ComponentProps) {
    const [selectedFrequency, setSelectedFrequency] = React.useState(
        frequencies[0],
    )

    const onFrequencyChange = (selectedKey: React.Key) => {
        const frequencyIndex = frequencies.findIndex(
            (f) => f.key === selectedKey,
        )

        setSelectedFrequency(frequencies[frequencyIndex])
    }

    return (
        <div className='flex max-w-2xl mx-auto flex-col items-center py-24'>
            <div className='flex max-w-xl flex-col text-center'>
                <h2 className='font-medium text-primary'>Pricing</h2>
                <h1 className='text-4xl font-medium tracking-tight'>
                    React Export Subscription
                </h1>
                <Spacer y={4} />
                <h2 className='text-large text-default-500'>
                    Export Framer components to React and deploy anywhere
                </h2>
            </div>
            <Spacer y={8} />
            <Tabs
                classNames={{
                    tab: 'data-[hover-unselected=true]:opacity-90',
                }}
                radius='full'
                size='lg'
                onSelectionChange={onFrequencyChange}
            >
                <Tab key={FrequencyEnum.Monthly} title='Pay Monthly' />
                <Tab
                    key={FrequencyEnum.Yearly}
                    aria-label='Pay Yearly'
                    className='pr-1.5'
                    title={
                        <div className='flex items-center gap-2'>
                            <p>Pay Yearly</p>
                            <Chip color='primary'>Save 25%</Chip>
                        </div>
                    }
                />
            </Tabs>
            <Spacer y={12} />
            <div className='grid grid-cols-1 gap-4 md:gap-12 sm:grid-cols-2 '>
                {tiers.map((tier) => {
                    const p = href('/api/react-export-plugin/buy')
                    console.log({ p })
                    const u = new URL(p, env.PUBLIC_URL!)
                    const priceId =
                        reactExportVariants[tier.key]?.[selectedFrequency.key]

                    u.searchParams.set('priceId', priceId)
                    u.searchParams.set('orgId', orgId)

                    return (
                        <Card
                            key={tier.key}
                            className={cn('relative p-3', {
                                'border-2 !border-primary ': tier.mostPopular,
                                '!border-medium border-default-100 bg-transparent':
                                    !tier.mostPopular,
                                'border-content3 bg-content2 dark:border-content2 dark:bg-content1':
                                    tier.featured,
                            })}
                            shadow='none'
                        >
                            {tier.mostPopular ? (
                                <Chip
                                    classNames={{
                                        base: 'absolute top-4 right-4',
                                        content:
                                            'font-medium text-primary-500 dark:text-primary-600',
                                    }}
                                    color='primary'
                                    variant='flat'
                                >
                                    Best Value
                                </Chip>
                            ) : null}
                            <CardHeader className='flex flex-col items-start gap-2 pb-6'>
                                <h2 className='text-large font-medium'>
                                    {tier.title}
                                </h2>
                                <p className='text-medium min-h-[3em] text-default-500'>
                                    {tier.description}
                                </p>
                            </CardHeader>
                            <Divider />
                            <CardBody className='gap-8'>
                                <p className='flex items-baseline gap-1 pt-2'>
                                    <span className='inline bg-gradient-to-br from-foreground to-foreground-600 bg-clip-text text-4xl font-semibold leading-7 tracking-tight text-transparent'>
                                        {typeof tier.price === 'string'
                                            ? tier.price
                                            : tier.price[selectedFrequency.key]}
                                    </span>
                                    {typeof tier.price !== 'string' ? (
                                        <span className='text-small font-medium text-default-400'>
                                            {tier.priceSuffix
                                                ? `/${tier.priceSuffix}/${selectedFrequency.priceSuffix}`
                                                : `/${selectedFrequency.priceSuffix}`}
                                        </span>
                                    ) : null}
                                </p>
                                <ul className='flex flex-col gap-2'>
                                    {tier.features?.map((feature) => (
                                        <li
                                            key={feature}
                                            className='flex items-center text-sm gap-2'
                                        >
                                            <Icon
                                                className='text-primary'
                                                icon='ci:check'
                                                width={24}
                                            />
                                            <p className='text-default-500'>
                                                {feature}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </CardBody>
                            <CardFooter>
                                <Button
                                    fullWidth
                                    as={Link}
                                    color={tier.buttonColor}
                                    href={u.toString()}
                                    onClick={(e) => {
                                        NProgress.start()
                                    }}
                                    variant={tier.buttonVariant}
                                >
                                    {tier.buttonText}
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
            <Spacer y={12} />
            <div className='flex py-2'>
                <p className='text-default-400 text-sm'>
                    Open source and non commercial?&nbsp;
                    <Link
                        color='foreground'
                        className='text-sm'
                        href={discountCodeUrl('React Export')}
                    >
                        Get Free Access
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default ReactExportPricing
