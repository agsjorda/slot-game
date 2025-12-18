export const PAYLINES: number[][] = [
	// Frame 92 (Paylines 1-5)
	[1, 1, 1, 1, 1], // 1. Middle horizontal
	[0, 0, 0, 0, 0], // 2. Top horizontal
	[2, 2, 2, 2, 2], // 3. Bottom horizontal
	[0, 1, 2, 1, 0], // 4. V-shape
	[2, 1, 0, 1, 2], // 5. Inverted V-shape

	// Frame 93 (Paylines 6-10)
	[0, 0, 1, 2, 2], // 6. Top-left to bottom-right diagonal
	[2, 2, 1, 0, 0], // 7. Bottom-left to top-right diagonal
	[1, 0, 0, 0, 1], // 8. High M-shape
	[1, 2, 2, 2, 1], // 9. Low W-shape
	[0, 1, 1, 1, 0], // 10. Shallow V

	// Frame 94 (Paylines 11-15)
	[2, 1, 1, 1, 2], // 11. Shallow inverted V
	[2, 1, 1, 1, 0], // 12. Diagonal bottom-left to top-right
	[1, 0, 1, 2, 1], // 12. Z-shape
	[1, 2, 1, 0, 1], // 13. S-shape
	[0, 1, 0, 1, 0], // 14. Step down pattern
	[2, 1, 2, 1, 2], // 15. Step up pattern

	// Frame 95 (Paylines 16-20)
	[1, 0, 1, 0, 1], // 16. High zigzag
	[1, 2, 1, 2, 1], // 17. Low zigzag
	[0, 0, 2, 2, 2], // 18. L-shape top to bottom
	[2, 2, 0, 0, 0], // 19. L-shape bottom to top
	[0, 2, 2, 0, 0], // 20. Hook shape
];
