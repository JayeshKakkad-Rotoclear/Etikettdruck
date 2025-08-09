// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

export type UserRole = 'VIEWER' | 'PRUEFER_A' | 'PRUEFER_B' | 'PRUEFER_AB' | 'MANAGEMENT' | 'ADMIN';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: {
				id: number;
				username: string;
				firstName: string;
				lastName: string;
				role: UserRole;
			};
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
