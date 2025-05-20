'use client'

import React from 'react'
import { Accordion, AccordionItem } from '@heroui/react'
import { Icon } from '@iconify/react'

export function ReactExportFaq() {
    return (
        <section className='mx-auto w-full max-w-6xl py-20 sm:px-6 sm:py-32 lg:px-8 lg:py-40'>
            <div className='mx-auto flex w-full max-w-4xl flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-12'>
                <h2 className='px-2 text-3xl leading-7'>
                    <span className='inline-block lg:hidden'>FAQs</span>
                    <h2 className='hidden bg-gradient-to-br from-foreground-800 to-foreground-500 bg-clip-text pt-4 text-5xl font-semibold tracking-tight text-transparent dark:to-foreground-200 lg:inline-block'>
                        Frequently
                        <br />
                        asked
                        <br />
                        questions
                    </h2>
                </h2>
                <Accordion
                    fullWidth
                    keepContentMounted
                    className='gap-3'
                    itemClasses={{
                        base: 'px-0 sm:px-6',
                        title: 'font-medium',
                        trigger: 'py-6 flex-row-reverse',
                        content: 'pt-0 pb-6 text-base text-default-500',
                    }}
                    items={faqs}
                    selectionMode='multiple'
                >
                    {faqs.map((item, i) => (
                        <AccordionItem
                            key={i}
                            indicator={<Icon icon='lucide:plus' width={24} />}
                            title={item.title}
                        >
                            {item.content}
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    )
}

const faqs = [
    {
        title: 'What exactly does the React Export plugin for Framer do?',
        content:
            'The React Export plugin allows you to use Framer components in your React codebase. It exports your Framer components as React components that you can use in your project.',
    },
    {
        title: 'How is the pricing structured for Personal vs Business plans?',
        content:
            'We offer a 7-day free trial. The Personal plan is for single-user Framer access, while the Business plan is for companies with multiple users in Framer projects. Both plans support unlimited Framer projects. The plugin is free for open source and non-commercial projects.',
    },
    {
        title: 'How can I get the free version for my open source project?',
        content:
            'For open source and non-commercial projects, the plugin is free. Simply send an email to tommy@unframer.co to request access.',
    },
    {
        title: 'Who is responsible for the billing in my organization?',
        content:
            'Billing is connected to the first user who installed the Framer plugin. This user becomes the billing account owner for the subscription.',
    },
    {
        title: 'What are the steps to cancel my existing subscription?',
        content:
            'You can cancel your subscription directly in the plugin using the "Manage Subscription" button, or by sending an email to tommy@unframer.co.',
    },
    {
        title: 'How can I modify the machine-generated component code?',
        content:
            'The generated code is machine-generated, but you can customize components using variables (which become React props) or color variables (which can be updated using CSS variables).',
    },
    {
        title: 'How do I implement dark mode for my Framer components?',
        content:
            'Yes, the components support dark mode through the .dark class. When you add this class to a parent element, all Framer components within will automatically switch to their dark mode styles.',
    },
    {
        title: 'What limitations exist for the single-user Personal plan?',
        content:
            'The Personal plan is limited to single-user Framer access. The plugin can only be used with Framer projects that have 1 member, and it\'s accessible by only one user.',
    },
    {
        title: 'What additional capabilities does the Business plan offer for teams?',
        content:
            'The Business plan is designed for companies with multiple users in Framer projects. It allows for team collaboration while maintaining access to all plugin features.',
    },
    
    {
        title: 'How do responsive breakpoints work with the exported components?',
        content:
            'The exported components automatically adapt to different screen sizes if you\'ve set up responsive variants in Framer. The components will automatically switch variants based on the current breakpoint without any additional configuration.',
    },
    {
        title: 'What methods can I use to style the exported components?',
        content:
            'You can style the components using className or style props. Note that you may need to use !important to override certain styles already defined in Framer, such as width and height.',
    },
    {
        title: 'How can I override the fixed dimensions of Framer components?',
        content:
            'Framer components often have fixed sizes from their root element. To override this, you can use the style prop with width and height properties, or use a CSS class with high specificity.',
    },
    {
        title: 'How can I change the language/locale of my components?',
        content:
            'You can change the locale by passing a locale prop to the component. The locale must be one of the country codes configured in your Framer project. You can also use UnframerProvider to set the locale for all components at once.',
    },
    {
        title: 'How can I use Framer\'s color variables in my own CSS and Tailwind?',
        content:
            'Unframer exports your Framer color styles as CSS variables that you can use in your own code. For example, you can use --unframer-primary in your own CSS or in Tailwind with bg-[--unframer-primary].',
    },
    {
        title: 'When do I need to run the unframer CLI again after making changes?',
        content:
            'You should re-run the unframer CLI when you add a new component, change color styles, add new pages, add new locales, or change breakpoints. For existing components, running unframer will update them with any changes.',
    },
    {
        title: 'How can I set up automatic updates when my Framer components change?',
        content:
            'Yes, you can use the --watch flag (npx unframer {projectId} --watch) to automatically re-export components when they change in Framer. Note that you need to click the Publish button in Framer to trigger updates.',
    },
    {
        title: 'What React warnings and errors might I encounter and how do I fix them?',
        content:
            'Common issues include: React warnings about element.ref in React 19, hydration warnings with SVG icons, and issues with animations in React Strict Mode. Most issues can be resolved by using React 19 and disabling Strict Mode for development.',
    },
    {
        title: 'How does unframer generate TypeScript types for my Framer variables?',
        content:
            'Unframer extracts TypeScript types from the component\'s propertyControls field. Supported props include variants, event functions, scalar variables (String, Number, Boolean), image variables, link strings, rich text, colors, and React components.',
    },
    {
        title: 'How do I resolve "No matching export" errors with npm dependencies?',
        content:
            'If export fails with errors like "No matching export in package for import", use the --external option to externalize npm packages used by Framer, then install them manually with npm install. This happens because Framer sometimes uses legacy versions of packages.',
    }
]
