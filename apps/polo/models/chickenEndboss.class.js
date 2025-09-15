class ChickenEndboss extends MoveableObject {

    y = 150;
    groundY = 150;
    height = 300;
    width = 300;
    baseSpeed = 9;
    speed = 9;

    alerted = false;
    isJumping = false;
    isAttacking = false;
    isDead = false;
    isHurt = false;
    energy = 100;

    alertStartedAt = 0;
    nextJumpAt = 0;
    nextAttackAt = 0;
    hurtUntil = 0;

    ATTACK_DISTANCE = 110;
    JUMP_DISTANCE_MIN = 220;
    JUMP_DISTANCE_MAX = 1200;

    DASH_DISTANCE_MAX = 800;         
    DASH_MIN_DISTANCE = 180;          
    DASH_COOLDOWN = 4000;             
    DASH_DURATION = 620;            
    DASH_SPEED = 42;                 
    DASH_TRIGGER_CHANCE = 0.6;

    ALERT_DURATION = 600;
    JUMP_COOLDOWN = 1800;
    ATTACK_COOLDOWN = 600;
    ATTACK_DISTANCE = 110;
    JUMP_DISTANCE_MIN = 220;
    JUMP_DISTANCE_MAX = 1200;

    jumpVy = 0;
    jumpStartVy = 24;
    gravity = 1.2;

    IMAGES_WALKING = [
        'img/4_enemie_boss_chicken/1_walk/g1.png',
        'img/4_enemie_boss_chicken/1_walk/g2.png',
        'img/4_enemie_boss_chicken/1_walk/g3.png',
        'img/4_enemie_boss_chicken/1_walk/g4.png'
    ];
    IMAGES_ALERT = [
        'img/4_enemie_boss_chicken/2_alert/g5.png',
        'img/4_enemie_boss_chicken/2_alert/g6.png',
        'img/4_enemie_boss_chicken/2_alert/g7.png',
        'img/4_enemie_boss_chicken/2_alert/g8.png',
        'img/4_enemie_boss_chicken/2_alert/g9.png',
        'img/4_enemie_boss_chicken/2_alert/g10.png',
        'img/4_enemie_boss_chicken/2_alert/g11.png',
        'img/4_enemie_boss_chicken/2_alert/g12.png'
    ];
    IMAGES_ATTACK = [
        'img/4_enemie_boss_chicken/3_attack/g13.png',
        'img/4_enemie_boss_chicken/3_attack/g14.png',
        'img/4_enemie_boss_chicken/3_attack/g15.png',
        'img/4_enemie_boss_chicken/3_attack/g16.png',
        'img/4_enemie_boss_chicken/3_attack/g17.png',
        'img/4_enemie_boss_chicken/3_attack/g18.png',
        'img/4_enemie_boss_chicken/3_attack/g19.png',
        'img/4_enemie_boss_chicken/3_attack/g20.png'
    ];
    IMAGES_HURT = [
        'img/4_enemie_boss_chicken/4_hurt/g21.png',
        'img/4_enemie_boss_chicken/4_hurt/g22.png',
        'img/4_enemie_boss_chicken/4_hurt/g23.png'
    ];
    IMAGES_DEAD = [
        'img/4_enemie_boss_chicken/5_dead/g24.png',
        'img/4_enemie_boss_chicken/5_dead/g25.png',
        'img/4_enemie_boss_chicken/5_dead/g26.png'
    ];

    /**
     * Constructor: Initializes the endboss.
     * @param {World} world - The game world instance.
     */
    constructor(world) {
        super().loadImage('img/4_enemie_boss_chicken/2_alert/g11.png');
        this.world = world;
        this.x = 6400;
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.startLoop();
        this.lastDashAt = 0;
        this.isDashing = false;
        this.maxEnergy = this.energy;
        this.statusBar = new EndbossStatusBar();
        this.updateStatusBar();
        this.hitbox = {
            offsetY: 60,
            offsetX: 60,
            width: 200,
            height: 200
        };
        this.spawnedReinforcements = false;
    }

    /**
     * startLoop: Starts AI and animation intervals.
     */
    startLoop() {
        this.aiInterval = setInterval(() => this.update(), 100);
        this.animInterval = setInterval(() => this.tickAnimation(), 140);
    }

    /**
     * updateStatusBar: Updates the endboss status bar.
     */
    updateStatusBar() {
        let percent = Math.max(0, Math.round((this.energy / this.maxEnergy) * 100));
        this.statusBar.setPercentage(percent);
    }

    /**
     * update: Main AI update logic.
     */
    update() {
        if (this.isDead) return;
        if (!world?.character) return;
        const now = performance.now();
        if (this.isHurt) return this.updateHurt(now);
        const dist = this.x - world.character.x;
        const absDist = Math.abs(dist);
        this.updateFacing(dist);
        this.updateJumpPhysics();
        this.updateDashPhysics();
        if (this.isDashing) return;
        if (!this.alerted) return this.checkAlert(absDist, now);
        if (now - this.alertStartedAt < this.ALERT_DURATION) return;
        if (this.canDash(now, absDist)) return this.startDash(now, dist);
        if (this.canAttack(now, absDist) && !this.isJumping) return this.startAttack(now);
        if (this.canJump(now, absDist) && !this.isJumping) return this.startJump(now, dist);
        if (!this.isJumping && !this.isAttacking) this.chase(dist);
    }

    /**
     * updateHurt: Handles hurt state.
     * @param {number} now - Current timestamp.
     */
    updateHurt(now) {
        if (now >= this.hurtUntil) this.isHurt = false;
        this.updateJumpPhysics();
        this.updateDashPhysics();
    }

    /**
     * checkAlert: Checks if boss should become alerted.
     * @param {number} absDist - Absolute distance to player.
     * @param {number} now - Current timestamp.
     */
    checkAlert(absDist, now) {
        if (this.shouldAlert(absDist)) this.startAlert(now);
    }

    /**
     * tickAnimation: Updates the animation frame.
     */
    tickAnimation() {
        if (this.isDead) { this.playAnimation(this.IMAGES_DEAD); return; }
        if (!this.alerted) { this.playAnimation(this.IMAGES_ALERT); return; }
        if (this.isHurt) { this.playAnimation(this.IMAGES_HURT); return; }
        if (this.isDashing) {
            this.playAnimation(this.IMAGES_ATTACK);
            return;
        }
        if (this.isAttacking) { this.playAnimation(this.IMAGES_ATTACK); return; }
        if (this.isJumping) { this.playAnimation(this.IMAGES_HURT); return; } 
        this.playAnimation(this.IMAGES_WALKING);
    }

    /**
     * shouldAlert: Returns true if boss should alert.
     * @param {number} absDist - Absolute distance to player.
     * @returns {boolean}
     */
    shouldAlert(absDist) {
        const cameraLeft = -world.camera_x;
        const cameraRight = cameraLeft + world.canvas.width;
        return (this.x >= cameraLeft && this.x <= cameraRight) || absDist < 850;
    }

    /**
     * canAttack: Checks if boss can attack.
     * @param {number} now - Current timestamp.
     * @param {number} absDist - Absolute distance to player.
     * @returns {boolean}
     */
    canAttack(now, absDist) {
        return !this.isJumping &&
            !this.isAttacking &&
            absDist <= this.ATTACK_DISTANCE &&
            now >= this.nextAttackAt;
    }

    /**
     * canJump: Checks if boss can jump.
     * @param {number} now - Current timestamp.
     * @param {number} absDist - Absolute distance to player.
     * @returns {boolean}
     */
    canJump(now, absDist) {
        return !this.isJumping &&
            !this.isAttacking &&
            absDist >= this.JUMP_DISTANCE_MIN &&
            absDist <= this.JUMP_DISTANCE_MAX &&
            now >= this.nextJumpAt &&
            this.onGround();
    }

    /**
     * startAlert: Starts alert state.
     * @param {number} now - Current timestamp.
     */
    startAlert(now) {
        this.alerted = true;
        this.alertStartedAt = now;
        this.currentImage = 0;
    }

    /**
     * startAttack: Starts attack state.
     * @param {number} now - Current timestamp.
     */
    startAttack(now) {
        this.isAttacking = true;
        this.currentImage = 0;
        this.nextAttackAt = now + this.ATTACK_COOLDOWN;
        const oldSpeed = this.baseSpeed;
        this.baseSpeed = 18;
        this.attackHit(now);
        setTimeout(() => {
            this.isAttacking = false;
            this.baseSpeed = oldSpeed;
        }, 750);
    }

    /**
     * attackHit: Handles attack hit logic.
     * @param {number} now - Current timestamp.
     */
    attackHit(now) {
        setTimeout(() => {
            if (!this.isDead && Math.abs(this.x - world.character.x) <= this.ATTACK_DISTANCE + 20) {
                world.character.hit();
                world.statusBar.setPercentage(world.character.energy);
            }
        }, 300);
    }

    /**
     * startJump: Starts jump state.
     * @param {number} now - Current timestamp.
     * @param {number} dist - Distance to player.
     */
    startJump(now, dist) {
        this.isJumping = true;
        this.currentImage = 0;
        this.nextJumpAt = now + this.JUMP_COOLDOWN;
        this.jumpVy = this.jumpStartVy;
        this.horizontalPush = dist > 0 ? -6 : 6;
    }

    /**
     * chase: Moves boss towards player.
     * @param {number} dist - Distance to player.
     */
    chase(dist) {
        const dirLeft = dist > 0;
        if (dirLeft) this.moveLeft();
        else if (this.moveRight) this.moveRight();
        else this.x += this.baseSpeed;
        this.x = Math.max(0, this.x);
    }

    /**
     * updateJumpPhysics: Updates jump movement.
     */
    updateJumpPhysics() {
        if (!this.isJumping) return;
        this.x += this.horizontalPush;
        this.y -= this.jumpVy;
        this.jumpVy -= this.gravity;
        if (this.y >= this.groundY) this.land();
    }

    /**
     * land: Handles landing after jump.
     */
    land() {
        this.y = this.groundY;
        this.jumpVy = 0;
        this.isJumping = false;
    }

    /**
     * onGround: Checks if boss is on the ground.
     * @returns {boolean}
     */
    onGround() {
        return !this.isJumping && this.y >= this.groundY;
    }

    /**
     * canDash: Checks if boss can dash.
     * @param {number} now - Current timestamp.
     * @param {number} absDist - Absolute distance to player.
     * @returns {boolean}
     */
    canDash(now, absDist) {
        if (this.isAttacking) return false;
        if (now - this.lastDashAt < this.DASH_COOLDOWN) return false;
        if (absDist > this.DASH_DISTANCE_MAX) return false;
        if (absDist < this.DASH_MIN_DISTANCE) return false;
        return Math.random() < this.DASH_TRIGGER_CHANCE;
    }

    /**
     * startDash: Starts dash state.
     * @param {number} now - Current timestamp.
     * @param {number} dist - Distance to player.
     */
    startDash(now, dist) {
        this.isDashing = true;
        this.lastDashAt = now;
        this.currentImage = 0;
        this.dashDir = dist > 0 ? -1 : 1;
        this.dashEndsAt = now + this.DASH_DURATION;
        if (Math.abs(dist) < this.ATTACK_DISTANCE + 30) {
            world.character.hit();
            world.statusBar.setPercentage(world.character.energy);
        }
    }

    /**
     * updateDashPhysics: Updates dash movement.
     */
    updateDashPhysics() {
        if (!this.isDashing) return;
        const now = performance.now();
        this.x += this.dashDir * this.DASH_SPEED;
        this.dashCollision();
        if (now >= this.dashEndsAt) {
            this.isDashing = false;
        }
    }

    /**
     * dashCollision: Handles dash collision with player.
     */
    dashCollision() {
        if (Math.abs(this.x - world.character.x) <= this.ATTACK_DISTANCE) {
            world.character.hit();
            world.statusBar.setPercentage(world.character.energy);
        }
    }

    /**
     * updateFacing: Updates boss facing direction.
     * @param {number} dist - Distance to player.
     */
    updateFacing(dist) {
        this.otherDirection = dist < 0;
        if (this.world) {
            this.world.cameraMode = 'boss';
        }
    }

    /**
     * takeBottleHit: Handles being hit by a bottle.
     */
    takeBottleHit() {
        if (this.isDead) return;
        this.energy -= 10;
        this.updateStatusBar();
        this.isHurt = true;
        this.hurtUntil = performance.now() + 400;
        this.currentImage = 0;
        if (this.energy <= 0) {
            this.death();
        }
    }

    /**
     * death: Handles boss death.
     */
    death() {
        if (this.isDead) return;
        this.isDead = true;
        this.isJumping = false;
        this.isAttacking = false;
        this.isHurt = false;
        clearInterval(this.aiInterval);
        clearInterval(this.animInterval);
        this.playDeathAnimation();
        setTimeout(() => this.finishDeath(), 2000);
    }

    /**
     * playDeathAnimation: Plays death animation.
     */
    playDeathAnimation() {
        let i = 0;
        const deadAnim = setInterval(() => {
            this.img = this.imageCache[this.IMAGES_DEAD[i]];
            i++;
            if (i >= this.IMAGES_DEAD.length) clearInterval(deadAnim);
        }, 180);
    }

    /**
     * finishDeath: Finalizes death and triggers win.
     */
    finishDeath() {
        if (world && world.enemies) {
            world.enemies.forEach(enemy => {
                if (enemy !== this && enemy.energy > 0) {
                    enemy.energy = 0;
                    enemy.markedForRemoval = true;
                    enemy.animateDeath && enemy.animateDeath();
                }
            });
        }
        AudioHub.WINNER.currentTime = 0;
        AudioHub.WINNER.volume = 0.2;
        AudioHub.WINNER.play();
        const win = document.getElementById('winningscreen');
        if (win) win.classList.remove('hidden');
        if (world) world.paused = true;
        this.markedForRemoval = true;
    }
}