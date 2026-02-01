'use client'

import { Fragment } from 'react'
import { useLanguage } from '@/contexts/language-context'

interface TProps {
    children: string
    className?: string
}

/**
 * Translation component - Pass-through wrapper
 * Google Translate Widget handles the actual translation on the DOM
 */
export function T({ children, className }: TProps) {
    if (className) {
        return <span className={className}>{children}</span>
    }
    return <Fragment>{children}</Fragment>
}

/**
 * Hook for translating page content
 * Returns original strings as Google Translate handles DOM replacement
 */
export function useTranslate() {
    const { language } = useLanguage()

    const t = (text: string): string => {
        return text
    }

    const translateBatch = async (texts: string[]) => {
        // No-op
        return
    }

    return { t, translateBatch, language, isLoading: false }
}
