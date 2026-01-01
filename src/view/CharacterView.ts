import { GameObjects, Scene } from 'phaser';

export default class CharacterView extends GameObjects.Container {
	constructor(scene: Scene, x: number, y: number) {
		super(scene, x, y);
		scene.add.existing(this);

		fetch('assets/Assets/Character/char.json')
			.then(response => response.json())
			.then(data => this.buildCharacter(scene, data))
			.catch(err => console.error('CharacterView: Failed to load char.json', err));
	}

	private buildCharacter(scene: Scene, charData: any) {
		const data = charData.default || charData;
		const bones: any[] = data.bones;
		const slots: any[] = data.slots;
		const skins: any[] = data.skins;

		if (!bones || !slots) return;

		const defaultSkin = skins?.find((s: any) => s.name === 'default');
		const getAttachment = (slotName: string, attachmentName: string) => {
			if (!defaultSkin) return null;
			const slotAttachments = defaultSkin.attachments[slotName];
			return slotAttachments ? slotAttachments[attachmentName] : null;
		};

		const getMeshCenter = (vertices: number[]) => {
			let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
			let i = 0;
			while (i < vertices.length) {
				const boneCount = vertices[i++];
				for (let j = 0; j < boneCount; j++) {
					i++; i++; i++; i++;
					const vx = vertices[i - 3];
					const vy = vertices[i - 2];
					if (vx < minX) minX = vx;
					if (vx > maxX) maxX = vx;
					if (vy < minY) minY = vy;
					if (vy > maxY) maxY = vy;
				}
			}
			return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
		};

		const boneMap: Record<string, { worldX: number; worldY: number; worldR: number }> = {};
		const computeWorld = (boneName: string): { x: number; y: number; r: number } => {
			if (boneMap[boneName]) return { x: boneMap[boneName].worldX, y: boneMap[boneName].worldY, r: boneMap[boneName].worldR };
			const bone = bones.find((b: any) => b.name === boneName);
			if (!bone) return { x: 0, y: 0, r: 0 };

			let px = 0, py = 0, pr = 0;
			if (bone.parent) {
				const parent = computeWorld(bone.parent);
				px = parent.x; py = parent.y; pr = parent.r;
			}

			const angle = -(bone.rotation || 0) * Math.PI / 180;
			const cos = Math.cos(pr);
			const sin = Math.sin(pr);
			const x = px + (bone.x || 0) * cos - (-(bone.y || 0)) * sin;
			const y = py + (bone.x || 0) * sin + (-(bone.y || 0)) * cos;
			const r = pr + angle;

			boneMap[boneName] = { worldX: x, worldY: y, worldR: r };
			return { x, y, r };
		};

		const baseScale = 0.18;
		const shadow = scene.add.ellipse(0, 85, 80, 20, 0x000000, 0.25);
		shadow.setOrigin(0.5, 0.5);
		this.add(shadow);

		for (const slot of slots) {
			const attachmentName = slot.name === 'mouth' ? 'mouth-happy' : slot.attachment;
			if (!attachmentName) continue;

			const boneT = computeWorld(slot.bone);
			let attX = 0, attY = 0, attR = 0;

			const attachment = getAttachment(slot.name, attachmentName);
			if (attachment) {
				if (attachment.type === 'mesh') {
					const center = getMeshCenter(attachment.vertices);
					attX = center.x;
					attY = -center.y;
				} else {
					attX = attachment.x || 0;
					attY = -(attachment.y || 0);
					attR = -(attachment.rotation || 0);
				}
			}

			const attAngle = attR * Math.PI / 180;
			const cos = Math.cos(boneT.r);
			const sin = Math.sin(boneT.r);

			let finalX = boneT.x + attX * cos - attY * sin;
			let finalY = boneT.y + attX * sin + attY * cos;
			let finalR = boneT.r + attAngle;
			let scaleMultiplier = 1;

			// Position adjustments
			if (slot.name === 'mouth') { finalX -= 20; finalY += 10; finalR = 0; }
			if (slot.name === 'l-eye') finalX -= 30;
			if (slot.name === 'r-eye') finalX -= 30;
			if (slot.name === 'l-pupil') { finalX -= 25; finalY += 5; scaleMultiplier = 1.3; }
			if (slot.name === 'r-pupil') { finalX -= 25; finalY += 5; scaleMultiplier = 1.3; }
			if (slot.name === 'arm-l') finalX -= 30;

			const img = scene.add.image(finalX * baseScale, finalY * baseScale, 'char', attachmentName);
			img.setOrigin(0.5, 0.5);
			img.setScale(baseScale * scaleMultiplier);
			img.setRotation(finalR);
			this.add(img);
		}
		this.setDepth(10);
	}
}
