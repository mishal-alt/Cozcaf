/** Read once at start-up: the page does not react to these changing mid-visit. */
export const reduced: boolean = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const COARSE: boolean = matchMedia('(pointer: coarse)').matches;

interface DeviceInfo {
  deviceMemory?: number;
}
export const LOW_END: boolean =
  COARSE || (navigator.hardwareConcurrency || 8) <= 4 || ((navigator as Navigator & DeviceInfo).deviceMemory || 8) <= 4;

/** phones and anything taller than 4:5 get the stacked portrait composition */
export const TALL = matchMedia('(max-width: 767px), (max-aspect-ratio: 4/5)');
