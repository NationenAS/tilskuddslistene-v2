import { writable } from 'svelte/store'

function modifyConfig() {
	const { subscribe, set, update } = writable({})

	return {
		subscribe,
		add: (name, value) => update(n => n[name] = value),
		remove: (name) => update(n => delete n[name]),
		reset: () => set({})
	}
}

export const config = modifyConfig()