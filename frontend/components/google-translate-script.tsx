'use client'

import { useEffect } from 'react'

declare global {
    interface Window {
        googleTranslateElementInit: () => void
        google: any
    }
}

export function GoogleTranslateScript() {
    useEffect(() => {
        // Define the callback function
        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: 'en',
                    includedLanguages: 'en,hi,te',
                    autoDisplay: false,
                },
                'google_translate_element'
            )
        }

        // Load the script
        const script = document.createElement('script')
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
        script.async = true
        document.body.appendChild(script)

        // Hacky fix to remove Google Translate Banner
        const intervalId = setInterval(() => {
            const banner = document.querySelector('.goog-te-banner-frame')
            const bannerFrame = document.querySelector('iframe.goog-te-banner-frame')

            if (banner) {
                banner.setAttribute('style', 'display: none !important;')
            }
            if (bannerFrame) {
                bannerFrame.setAttribute('style', 'display: none !important;')
            }

            if (document.body.style.top !== '0px') {
                document.body.style.top = '0px'
            }
        }, 1000)

        return () => {
            document.body.removeChild(script)
            delete (window as any).googleTranslateElementInit
            clearInterval(intervalId)
        }
    }, [])

    return (
        <div
            id="google_translate_element"
            className="hidden"
            aria-hidden="true"
        />
    )
}
