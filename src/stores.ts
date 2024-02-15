import { writable, derived } from 'svelte/store'
import type { Writable } from 'svelte/store'

export interface AgriculturalSubsidy {
  saksbehandlende_kommune: string,
  [key: string]: string | number
}

export interface Config {
  municipality: string | undefined,
  county: string | undefined,
  name: string | undefined,
  type: string,
  year: string,
  limit: number,
  unit: string | undefined
}

// Data
export const defaultConfig: Config = {
  municipality: undefined,
  county: undefined,
  name: undefined,
  type: "sum_produksjons_og_avloesertilskudd",
  year: "2022",
  limit: 99999,
  unit: "kr"
}

export const configStore: Writable<Config> = writable({
  ...defaultConfig
})

export const dataStore: Writable<AgriculturalSubsidy[]> = writable([])

export const totals = derived([dataStore, configStore], ([$dataStore, $configStore]) => {
  const count = $dataStore.length
  const sum = $dataStore.reduce((a, b) => {
    a.cash = a.cash + Number(b['sum_produksjons_og_avloesertilskudd'])
    a.sum = a.sum + Number(b[$configStore.type])
    return a
  }, {
    sum: 0,
    cash: 0
  })
  return { count, sum: sum.sum, cash: sum.cash };
})