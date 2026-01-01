import { GameObjects, Scene } from 'phaser';

export default class CharacterView extends GameObjects.Container {
	private partImages: Map<string, GameObjects.Image> = new Map();
	private bones: any[] = [];
	private slots: any[] = [];
	private skins: any = null;
	private baseTransforms: Map<string, { x: number; y: number; rotation: number }> = new Map();
	private animations: any = {};
	private currentAnimation: string | null = null;
	private animationTime: number = 0;
	private baseScale: number = 0.18;

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

		this.bones = bones;
		this.slots = slots;
		this.animations = data.animations || {};
		this.skins = skins?.find((s: any) => s.name === 'default');
		
		// Store base transforms for each bone
		bones.forEach(bone => {
			this.baseTransforms.set(bone.name, {
				x: bone.x || 0,
				y: bone.y || 0,
				rotation: bone.rotation || 0
			});
		});

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
			
			// Store reference to the image for animation updates
			this.partImages.set(slot.name, img);
		}
		this.setDepth(10);
		
		// Start idle animation
		this.playAnimation('Idle', true);
	}

	public playAnimation(animationName: string, loop: boolean = true) {
		if (!this.animations[animationName]) {
			console.warn(`Animation "${animationName}" not found`);
			return;
		}

		this.currentAnimation = animationName;
		this.animationTime = 0;

		// Update animation every frame
		this.scene.events.off('update', this.updateAnimation, this);
		this.scene.events.on('update', this.updateAnimation, this);
	}

	private updateAnimation(time: number, delta: number) {
		if (!this.currentAnimation || !this.animations[this.currentAnimation]) return;

		const animation = this.animations[this.currentAnimation];
		this.animationTime += delta / 1000; // Convert to seconds

		// Get animation duration (find max time in keyframes)
		let duration = 2; // Default
		if (animation.bones) {
			Object.values(animation.bones).forEach((boneAnim: any) => {
				['translate', 'rotate', 'scale'].forEach(type => {
					if (boneAnim[type]) {
						const maxTime = Math.max(...boneAnim[type].map((kf: any) => kf.time || 0));
						duration = Math.max(duration, maxTime);
					}
				});
			});
		}

		// Loop animation
		if (this.animationTime > duration) {
			this.animationTime = this.animationTime % duration;
		}

		// Apply animation transforms to bones and update parts
		this.updateBoneTransforms();
	}

	private updateBoneTransforms() {
		if (!this.currentAnimation || !this.animations[this.currentAnimation]) return;

		const animation = this.animations[this.currentAnimation];
		const animBones = animation.bones || {};

		// Apply animated transforms to bones
		this.bones.forEach(bone => {
			const baseTransform = this.baseTransforms.get(bone.name);
			if (!baseTransform) return;

			let animatedX = 0;
			let animatedY = 0;
			let animatedRotation = 0;

			const boneAnim = animBones[bone.name];
			if (boneAnim) {
				// Apply translation
				if (boneAnim.translate) {
					const interpolated = this.interpolateKeyframes(boneAnim.translate, this.animationTime);
					animatedX = interpolated.x || 0;
					animatedY = interpolated.y || 0;
				}

				// Apply rotation
				if (boneAnim.rotate) {
					const interpolated = this.interpolateKeyframes(boneAnim.rotate, this.animationTime);
					animatedRotation = interpolated.value || 0;
				}
			}

			// Update bone with animated values
			bone.x = baseTransform.x + animatedX;
			bone.y = baseTransform.y + animatedY;
			bone.rotation = baseTransform.rotation + animatedRotation;
		});

		// Rebuild character with new bone positions
		this.rebuildCharacter();
	}

	private interpolateKeyframes(keyframes: any[], time: number): any {
		if (keyframes.length === 0) return {};
		if (keyframes.length === 1) return keyframes[0];

		// Find surrounding keyframes
		let prevKf = keyframes[0];
		let nextKf = keyframes[keyframes.length - 1];

		for (let i = 0; i < keyframes.length - 1; i++) {
			const kf1 = keyframes[i];
			const kf2 = keyframes[i + 1];
			const t1 = kf1.time || 0;
			const t2 = kf2.time || 0;

			if (time >= t1 && time <= t2) {
				prevKf = kf1;
				nextKf = kf2;
				break;
			}
		}

		const t1 = prevKf.time || 0;
		const t2 = nextKf.time || 0;
		
		if (t2 - t1 === 0) return prevKf;

		const progress = (time - t1) / (t2 - t1);

		// Linear interpolation
		const result: any = {};
		['x', 'y', 'value'].forEach(prop => {
			if (prevKf[prop] !== undefined || nextKf[prop] !== undefined) {
				const v1 = prevKf[prop] || 0;
				const v2 = nextKf[prop] || 0;
				result[prop] = v1 + (v2 - v1) * progress;
			}
		});

		return result;
	}

	private rebuildCharacter() {
		const boneMap: Record<string, { worldX: number; worldY: number; worldR: number }> = {};
		const computeWorld = (boneName: string): { x: number; y: number; r: number } => {
			if (boneMap[boneName]) return { x: boneMap[boneName].worldX, y: boneMap[boneName].worldY, r: boneMap[boneName].worldR };
			const bone = this.bones.find((b: any) => b.name === boneName);
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

		const getAttachment = (slotName: string, attachmentName: string) => {
			if (!this.skins) return null;
			const slotAttachments = this.skins.attachments[slotName];
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

		// Update each part's position based on current bone transforms
		for (const slot of this.slots) {
			const img = this.partImages.get(slot.name);
			if (!img) continue;

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

			// Position adjustments
			if (slot.name === 'mouth') { finalX -= 20; finalY += 10; finalR = 0; }
			if (slot.name === 'l-eye') finalX -= 30;
			if (slot.name === 'r-eye') finalX -= 30;
			if (slot.name === 'l-pupil') { finalX -= 25; finalY += 5; }
			if (slot.name === 'r-pupil') { finalX -= 25; finalY += 5; }
			if (slot.name === 'arm-l') finalX -= 30;

			img.setPosition(finalX * this.baseScale, finalY * this.baseScale);
			img.setRotation(finalR);
		}
	}
}
