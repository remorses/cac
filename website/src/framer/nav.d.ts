import * as React from "react"

import { UnframerBreakpoint } from "unframer"

export interface Props {
    children?: React.ReactNode
    style?: React.CSSProperties
    className?: string
    id?: string
    width?: any
    height?: any
    layoutId?: string
    "variant"?: 'Desktop' | 'Laptop' | 'Tablet' | 'Mobile' | 'Tablet Open' | 'Mobile Open'
    "framerPlugin"?: string
    "ctaVariant"?: 'Primary' | 'Secondary' | 'Tertiary' | ' Login button' | 'Button text'
}

const NavFramerComponent = (props: Props) => any

type VariantsMap = Partial<Record<UnframerBreakpoint, Props['variant']>> & { base: Props['variant'] }

NavFramerComponent.Responsive = (props: Omit<Props, 'variant'> & {variants: VariantsMap}) => any

export default NavFramerComponent

