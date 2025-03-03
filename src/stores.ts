import { writable, derived } from 'svelte/store'
import type { Writable } from 'svelte/store'

export interface AgriculturalSubsidy {
  sum: number;
  [key: string]: string | number;
}

export interface Config {
  municipality: string | undefined,
  county: string | undefined,
  name: string | undefined,
  type: string | undefined,
  codes: string[],
  year: string,
  limit: number,
  unit: string | undefined
}

// Data
export const defaultConfig: Config = {
  municipality: undefined,
  county: undefined,
  name: undefined,
  type: undefined,
  codes: ['sum_produksjons_og_avloesertilskudd'],
  year: "2024",
  limit: 99999,
  unit: "kr"
}

export const configStore: Writable<Config> = writable({
  ...defaultConfig
})

export const dataStore: Writable<AgriculturalSubsidy[]> = writable([])

export const totals = derived([dataStore], ([$dataStore]) => {
  const count = $dataStore.length
  const sum = $dataStore.reduce((a, c) => {
    return a + c.sum;
  }, 0);
  return { count, sum };
})