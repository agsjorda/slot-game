import ReelModel from './ReelModel';
import { SYMBOLS } from '../config/symbols';
import { PAYLINES } from '../config/paylines';

/**
 * WinResult represents a single winning combination on a payline.
 * 
 * Example: If 3 cherries appear on payline 0, this object describes:
 * - Which payline won (paylineIndex: 0)
 * - The pattern of that payline (paylinePattern: [1,1,1,1,1] = middle row)
 * - What symbol won (symbol: 'cherry')
 * - How many matched (matchingCount: 3)
 * - The payout multiplier (payout: 5)
 * - The actual money won (winAmount: 5 * bet)
 * - Where the winning symbols are located (positions: [{col:0,row:1}, {col:1,row:1}, {col:2,row:1}])
 */
export interface WinResult {
	paylineIndex: number; // Which payline (0-19)
	paylinePattern: number[]; // The row pattern [0,0,0,0,0]
	symbol: string; // Winning symbol id ('cherry', 'seven', etc.)
	matchingCount: number; // How many consecutive matches (3, 4, or 5)
	payout: number; // Multiplier from symbol config (e.g., 5 for 3 cherries)
	winAmount: number; // payout * bet
	positions: { col: number; row: number }[]; // Positions of winning symbols
}

/**
 * SlotModel is the core game logic for the slot machine.
 * It manages all 5 reels and handles:
 * 1. Spinning to generate random symbol grids
 * 2. Evaluating wins by checking all paylines
 * 3. Calculating payouts based on matching symbols
 * 
 * Think of this as the "brain" of the slot machine that determines outcomes.
 */
export default class SlotModel {
	// Array of 5 ReelModel instances (one for each column of the slot machine)
	// Array of 5 ReelModel instances (one for each column of the slot machine)
	private reels: ReelModel[];

	/**
	 * Initialize the slot machine with 5 reels.
	 * Each reel gets the same pool of possible symbols to randomly choose from.
	 */
	constructor() {
		// Extract just the symbol IDs from the SYMBOLS config
		// e.g., ['cherry', 'seven', 'bar', 'bell', 'watermelon', ...]
		const ids = SYMBOLS.map((s) => s.id);
		
		// Create 5 independent reels, each with the full symbol set
		this.reels = Array.from({ length: 5 }, () => new ReelModel(ids));
	}

	/**
	 * Spin all reels and generate a new random grid of symbols.
	 * 
	 * @returns A 2D array representing the slot machine grid:
	 *   - Outer array: 5 columns (reels)
	 *   - Inner array: 3 rows (visible symbol positions)
	 * 
	 * Example result:
	 * [
	 *   ['cherry', 'bar', 'seven'],     // Column 0
	 *   ['bell', 'cherry', 'bar'],      // Column 1
	 *   ['seven', 'watermelon', 'bell'],// Column 2
	 *   ['cherry', 'cherry', 'cherry'], // Column 3
	 *   ['bar', 'seven', 'bell']        // Column 4
	 * ]
	 */
	spin(): string[][] {
		// Ask each reel to spin and generate 3 random symbols
		return this.reels.map((reel) => reel.spin(3));
	}

	/**
	 * Evaluate a spin result to determine if there are any winning combinations.
	 * 
	 * How it works:
	 * 1. Check each of the 20 paylines (different patterns across the grid)
	 * 2. For each payline, see if 3 or more consecutive symbols match (left to right)
	 * 3. Calculate the payout based on the symbol type and number of matches
	 * 4. Return all wins and the total amount won
	 * 
	 * @param grid - The 2D array of symbols from a spin result
	 * @param bet - The player's bet amount (used to calculate winnings)
	 * @returns Object containing totalWin amount and array of individual WinResult objects
	 * 
	 * Example:
	 * If grid has 3 cherries on payline 0 and bet is $1:
	 * - Cherry payout for 3 matches = 5x
	 * - Win amount = 5 * $1 = $5
	 */
	evaluate(
		grid: string[][],
		bet: number
	): {
		totalWin: number;
		wins: WinResult[];
	} {
		// Array to store all winning combinations found
		const wins: WinResult[] = [];

		// Check each payline pattern (there are typically 20 paylines)
		// A payline pattern like [0,0,0,0,0] means "check top row across all columns"
		// A payline pattern like [1,1,1,1,1] means "check middle row across all columns"
		// A payline pattern like [0,1,2,1,0] means "check a V-shaped pattern"
		PAYLINES.forEach((paylinePattern, paylineIndex) => {
			// Get the first symbol on this payline (always start from leftmost column)
			const firstSymbol = grid[0][paylinePattern[0]];
			
			// Count how many symbols match consecutively from left to right
			let matchingCount = 1;
			
			// Track the positions of matching symbols for visual feedback
			const positions = [{ col: 0, row: paylinePattern[0] }];

			// Check remaining columns (1 through 4) for consecutive matches
			for (let col = 1; col < 5; col++) {
				// Get the symbol at this column following the payline pattern
				const currentSymbol = grid[col][paylinePattern[col]];

				// If it matches the first symbol, count it
				if (currentSymbol === firstSymbol) {
					matchingCount++;
					positions.push({ col, row: paylinePattern[col] });
				} else {
					// Stop checking once we hit a non-matching symbol
					// (slot machines only count consecutive matches from left)
					break;
				}
			}

			// Only count as win if at least 3 matching symbols
			if (matchingCount >= 3) {
				const symbol = SYMBOLS.find((s) => s.id === firstSymbol);
				const payoutMultiplier = symbol?.payouts[matchingCount] || 0;
				const winAmount = payoutMultiplier * bet;

				wins.push({
					paylineIndex,
					paylinePattern: [...paylinePattern],
					symbol: firstSymbol,
					matchingCount,
					payout: payoutMultiplier,
					winAmount,
					positions,
				});
			}
		});

		const totalWin = wins.reduce((sum, win) => sum + win.winAmount, 0);

		return {
			totalWin,
			wins,
		};
	}
}