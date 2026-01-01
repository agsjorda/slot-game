import { ReelsFrameView } from './ReelsFrame';

export default class SlotView {
	constructor(private reelsFrameView: ReelsFrameView) {}

	renderGrid(grid: string[][]) {
		// Animate the reels spin
		this.reelsFrameView.spinAnimation(grid);
	}
}
