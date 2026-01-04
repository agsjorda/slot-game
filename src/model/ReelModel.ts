/**
 * ReelModel represents a single reel (column) in the slot machine.
 * Each reel can generate random symbols when spun.
 * 
 * Purpose: Encapsulates the logic for one reel's random symbol generation.
 * A slot machine typically has 5 reels (columns), each creating 3 visible symbols.
 */
export default class ReelModel {
	/**
	 * Creates a new reel with a set of possible symbols
	 * @param symbols - Array of symbol IDs that can appear on this reel (e.g., ['cherry', 'seven', 'bar'])
	 */
	constructor(private symbols: string[]) {}

	/**
	 * Spins the reel and generates random symbols
	 * @param rows - Number of symbol positions to generate (typically 3 for visible rows)
	 * @returns Array of random symbol IDs, one for each row position
	 * 
	 * Example: spin(3) might return ['cherry', 'bar', 'seven']
	 */
	spin(rows: number): string[] {
		// Create an array with 'rows' number of random symbols
		return Array.from(
			{ length: rows },
			// For each position, pick a random symbol from the symbols array
			() => this.symbols[Math.floor(Math.random() * this.symbols.length)]
		);
	}
}
