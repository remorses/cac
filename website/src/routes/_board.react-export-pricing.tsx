'use client'
// https://unframer.co/react-export-pricing?orgId=xxx
// https://localhost:8040/react-export-pricing?orgId=xxx

import NProgress from 'nprogress'

import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Chip,
    cn,
    Divider,
    Link,
    Spacer,
    Tab,
    Tabs,
} from '@heroui/react'
import { Icon } from '@iconify/react'
import React from 'react'

import type { ButtonProps } from '@heroui/react'
import { href, useLoaderData } from 'react-router'
import { ReactExportFaq } from 'website/src/components/react-export-faq'
import {
    discountCodeUrl,
    env,
    isReactExportFreePlanEnabled,
    reactExportVariants,
} from 'website/src/lib/env'
import { Route } from './+types/_board.react-export-pricing'
import LogosFramerComponent from 'website/src/framer/logos'
import TestimonialsFramerComponent from 'website/src/framer/testimonials'

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
        key: TiersEnum.Business,
        title: 'Commercial',

        featured: true,
        mostPopular: true,
        description: isReactExportFreePlanEnabled
            ? 'Accessible by unlimited Framer users and developers. 7 day trial with $1 upfront fee.'
            : 'Accessible by unlimited Framer users and developers',
        price: {
            yearly: '$2250',
            monthly: '$250',
        },
        features: [
            'Unlimited Framer Users', //
            'Unlimited Developers',
            'Commercial Use',
        ],
        buttonText: isReactExportFreePlanEnabled
            ? 'Start 7-Day Trial'
            : 'Start Subscription',
        buttonColor: 'primary',
        buttonVariant: 'solid',
    },
    {
        key: TiersEnum.Personal,
        title: 'Hobby',
        description: isReactExportFreePlanEnabled
            ? 'Single Framer user access, for personal use. 7 day trial with $1 upfront fee.'
            : 'Single Framer user access, for personal use',
        mostPopular: false,
        price: {
            yearly: '$450',
            monthly: '$49',
        },
        featured: false,
        features: [
            '1 Framer user access', //
            '1 Developer',
            'Personal Use',
        ],
        buttonText: isReactExportFreePlanEnabled
            ? 'Start 7-Day Trial'
            : 'Start Subscription',
        buttonColor: 'default',
        buttonVariant: 'solid',
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
    // orgId/email are optional so the pricing page renders for anyone visiting
    // the public URL. When missing, Subscribe buttons still render but the
    // downstream /api/react-export-plugin/buy endpoint will reject the purchase
    // since it requires an orgId to link the subscription to a Framer org.
    const orgId = (searchParams.get('orgId') as string) || ''
    const email = (searchParams.get('email') as string) || ''

    return {
        orgId,
        email,
    }
}

export function ReactExportPricing({}) {
    const { orgId, email } = useLoaderData<Route.ComponentProps['loaderData']>()
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
        <div className='flex max-w-2xl mx-auto flex-col items-center py-12'>
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
            {!orgId ? (
                <div className='mb-6 max-w-xl text-center text-sm text-default-500'>
                    To subscribe, open this pricing page from the React Export
                    plugin inside Framer. Checkout needs your Framer org id to
                    link the subscription, so direct visits can only preview
                    the plans.
                </div>
            ) : null}
            <div className='grid grid-cols-1 gap-4 md:gap-12 sm:grid-cols-2 '>
                {tiers.map((tier) => {
                    // When orgId is missing we must not let the user start a
                    // subscription, otherwise we'd end up with a Stripe/Lemon
                    // sub that isn't linked to any Framer org. Disable the
                    // button in that case and skip building the buy URL.
                    const buyUrl = (() => {
                        if (!orgId) {
                            return ''
                        }
                        const p = href('/api/react-export-plugin/buy')
                        const u = new URL(p, env.PUBLIC_URL!)
                        const priceId =
                            reactExportVariants[tier.key]?.[
                                selectedFrequency.key
                            ]
                        u.searchParams.set('priceId', priceId)
                        u.searchParams.set('email', email)
                        u.searchParams.set('orgId', orgId)
                        return u.toString()
                    })()

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
                                {orgId ? (
                                    <Button
                                        fullWidth
                                        as={Link}
                                        color={tier.buttonColor}
                                        href={buyUrl}
                                        onClick={() => {
                                            NProgress.start()
                                        }}
                                        variant={tier.buttonVariant}
                                    >
                                        {tier.buttonText}
                                    </Button>
                                ) : (
                                    <Button
                                        fullWidth
                                        isDisabled
                                        color={tier.buttonColor}
                                        variant={tier.buttonVariant}
                                    >
                                        Open in Framer to Subscribe
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
            <Spacer y={12} />
            <div className='flex py-2'>
                <p className='text-default-400 text-sm'>
                    Open source and non commercial?&nbsp;
                    <a
                        color='foreground'
                        className='text-sm'
                        href={'mailto:tommy@unframer.co'}
                    >
                        Get Free Access
                    </a>
                </p>
            </div>
        </div>
    )
}

export default function Page() {
    return (
        <div className='flex flex-col gap-3'>
            <div className='flex max-w-xl flex-col mx-auto text-center'>
                <h2 className='font-medium text-primary'>Pricing</h2>
                <h1 className='text-4xl font-medium tracking-tight'>
                    {isReactExportFreePlanEnabled
                        ? 'Try React Export Free for 7 Days'
                        : 'React Export Subscription'}
                </h1>
                <Spacer y={4} />
                <h2 className='text-large text-default-500'>
                    {isReactExportFreePlanEnabled
                        ? 'Export Framer components to React. Start with a 7-day trial for just $1'
                        : 'Export Framer components to React and deploy anywhere'}
                </h2>
            </div>

            <ReactExportPricing />
            <div className='mt-14'></div>
            <LogosFramerComponent.Responsive className='mx-auto' />
            <div className=''></div>
            <TestimonialsFramerComponent.Responsive className='mx-auto' />
            <ReactExportFaq />
        </div>
    )
}
