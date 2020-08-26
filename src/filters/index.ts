import Vue from 'vue'
import { DECIMAL } from '@/libs/meta'

export function base64(url: string) {
  if (!url) return null
  if (url.startsWith('http')) {
    return url
  } else if (url.startsWith('data')) {
    return url
  } else {
    return 'data:image/png;base64,' + url
  }
}
Vue.filter('base64', base64)

export function timestamp(timestamp: number) {
  if(!timestamp) return ''
  return (new Date(timestamp * 1000)).toLocaleString()
}
Vue.filter('timestamp', timestamp)


/**
 * e.g swr(525991000000000) => 52599.1
 */
export function swr(num: number) {
  if (num === 0) return num
  const str = num.toString().padStart(DECIMAL.toString().length, '0')
  const decimal = str.slice(-(DECIMAL.toString().length - 1))
  const int = str.slice(0, str.lastIndexOf(decimal))
  return parseFloat(`${int}.${decimal}`)
}
Vue.filter('swr', swr)

Vue.filter('amount', (n: string) => {
  return parseFloat(n)
})