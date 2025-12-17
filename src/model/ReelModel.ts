export default class ReelModel {
	constructor(private symbols: string[]) {}

	spin(rows: number): string[] {
		return Array.from(
			{ length: rows },
			() => this.symbols[Math.floor(Math.random() * this.symbols.length)]
		);
	}
}
