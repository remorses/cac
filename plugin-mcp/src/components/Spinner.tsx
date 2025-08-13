export interface SpinnerProps {
    size?: 'normal' | 'medium' | 'large'
    color?: 'light' | 'dark' | 'system'
    inline?: boolean
    className?: string
    inheritColor?: boolean
}

export const Spinner = ({
    size = 'normal',
    inline = false,
    color = 'system',
    inheritColor,
    className,
    ...rest
}: SpinnerProps) => {
    const sizeClasses = {
        normal: 'w-3 h-3',
        medium: 'w-6 h-6',
        large: 'w-8 h-8',
    }

    const colorClasses = {
        light: 'border-white',
        dark: 'border-gray-800',
        system: 'border-framer-text',
    }

    return (
        <div
            className={`inline-block ${sizeClasses[size]} ${!inheritColor ? colorClasses[color] : ''} border-2 border-t-transparent rounded-full animate-spin ${!inline ? 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''} ${className || ''}`}
            style={
                inheritColor
                    ? {
                          borderColor: 'currentColor',
                          borderTopColor: 'transparent',
                      }
                    : {}
            }
            {...rest}
        />
    )
}
