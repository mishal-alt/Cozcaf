/** Read once at start-up, like the approved design: the page does not react to these changing mid-visit. */
export const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
export const reduced: boolean = mqReduce.matches;
export const COARSE: boolean = matchMedia('(pointer: coarse)').matches;

interface DeviceInfo {
  deviceMemory?: number;
}
export const LOW_END: boolean =
  COARSE || (navigator.hardwareConcurrency || 8) <= 4 || ((navigator as Navigator & DeviceInfo).deviceMemory || 8) <= 4;

/** The comparison build (PUBLIC_HERO_TEST=1) exposes seek / state handles on window. Production builds drop them. */
export const TEST: boolean = import.meta.env.PUBLIC_HERO_TEST === '1';
