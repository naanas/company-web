import { onMounted } from 'vue'
import { whenIdle } from './useIdle'

/**
 * Decodes `urls` off-thread during browser idle time so the decode cost
 * lands before the images scroll into view instead of on their first
 * visible frame. Fire-and-forget — doesn't block or reflect back into the
 * component, since a slow/failed decode just means the browser falls back
 * to decoding normally when the <img> actually paints.
 */
export function usePreloadImages(urls) {
  onMounted(() => {
    whenIdle(() => {
      urls.forEach((url) => {
        const img = new Image()
        img.src = url
        img.decode?.().catch(() => {})
      })
    })
  })
}
