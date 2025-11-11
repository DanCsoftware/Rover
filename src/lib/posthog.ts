// src/lib/posthog.ts
import posthog from 'posthog-js'

const key = import.meta.env.VITE_POSTHOG_KEY
const host = import.meta.env.VITE_POSTHOG_HOST || 'https://us.posthog.com'

// Initialize PostHog once, globally
if (key) {
  posthog.init(key, {
    api_host: host,
    capture_pageview: true,
    capture_pageleave: true,
    person_profiles: 'identified_only', // only after you call identify()
  })
} else {
  console.warn('⚠️ PostHog key missing — analytics disabled.')
}

export {posthog}
