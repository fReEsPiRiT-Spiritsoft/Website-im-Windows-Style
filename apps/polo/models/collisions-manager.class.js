/**
 * CollisionManager: Handles all collision, pickup and knockback logic for the world.
 */
class CollisionManager {

    /**
     * @param {World} world - Reference to the game world.
     */
    constructor(world) {
        this.world = world;
    }

    /**
     * Runs the full collision update sequence (called in a loop by World).
     */
    update() {
        if (this.world.paused) return;

        const char = this.world.character;
        char.prevY = char.prevY ?? char.y;
        char.vy = char.y - char.prevY;

        this.checkChickenStomp();
        this.checkEnemyCollision();
        this.checkCollectableCollision();
        this.checkEnemyBottleCollision();
        this.checkMiniChickenStomp();

        char.prevY = char.y;
    }

    /**
     * Player collides with living enemies -> player takes damage.
     */
    checkEnemyCollision() {
        this.world.level.enemies.forEach(enemy => {
            if (this.world.character.isColliding(enemy) && enemy.energy > 0) {
                this.world.character.hit();
                this.world.statusBar.setPercentage(this.world.character.energy);
                const now = performance.now();
                if (now - this.world.lastHurtSound > 1000) {
                    AudioHub.PEPE_HURT.currentTime = 0;
                    AudioHub.PEPE_HURT.play();
                    this.world.lastHurtSound = now;
                }
            }
        });
    }

    /**
     * Checks if the player stomped normal chickens from above.
     */
    checkChickenStomp() {
        this.world.enemies.forEach(enemy => {
            if (
                enemy instanceof Chicken &&
                enemy.energy > 0 &&
                this.world.character.isColliding(enemy) &&
                this.isStompTopHit(this.world.character, enemy)
            ) {
                enemy.energy = 0;
                AudioHub.CHICKEN_STOMP.currentTime = 0;
                AudioHub.CHICKEN_STOMP.volume = 1;
                AudioHub.CHICKEN_STOMP.play();
                this.world.character.jump(20);
                this.world.character.startJumpAnimation();
                enemy.animateDeath && enemy.animateDeath();
                setTimeout(() => enemy.markedForRemoval = true, 800);
            }
        });
        this.world.enemies = this.world.enemies.filter(e => !e.markedForRemoval);
    }

    /**
     * Determines if the collision was a top stomp (player falling onto enemy).
     * @param {MoveableObject} char
     * @param {MoveableObject} enemy
     * @returns {boolean}
     */
    isStompTopHit(char, enemy) {
        const charPrevBottom = (char.prevY ?? char.y) + char.height;
        const charNowBottom = char.y + char.height;
        const enemyTop = enemy.y;
        const falling = char.vy > 0;
        return falling && charPrevBottom <= enemyTop && charNowBottom >= enemyTop;
    }

    /**
     * Checks bottle collisions with enemies.
     */
    checkEnemyBottleCollision() {
        this.world.throwableObjects.forEach(bottle => {
            if (bottle.markedForRemoval) return;
            this.world.enemies.forEach(enemy => {
                if (enemy.energy > 0 && bottle.isColliding(enemy) && !bottle.markedForRemoval) {
                    this.handleBottleHit(enemy, bottle);
                    bottle.startSplash();
                }
            });
        });
        this.world.enemies = this.world.enemies.filter(e => !e.markedForRemoval);
        this.world.throwableObjects = this.world.throwableObjects.filter(b => !b.markedForRemoval);
    }

    /**
     * Delegates bottle hit handling by enemy type.
     * @param {MoveableObject} enemy
     * @param {ThrowableObject} bottle
     */
    handleBottleHit(enemy, bottle) {
        if (enemy instanceof Chicken || enemy instanceof MiniChicken) {
            this.handleChickenBottleHit(enemy, bottle);
        } else if (enemy instanceof ChickenEndboss) {
            this.handleEndbossBottleHit(enemy, bottle);
        }
    }

    /**
     * Handles bottle hits on (mini) chickens.
     * @param {Chicken|MiniChicken} enemy
     * @param {ThrowableObject} bottle
     */
    handleChickenBottleHit(enemy, bottle) {
        enemy.energy = 0;
        this.playChickenStompSound();
        enemy.animateDeath && enemy.animateDeath();
        if (enemy instanceof MiniChicken) {
            this.playMiniChickenExplodeSound();
        }
        bottle.startSplash();
        this.removeChickenAndBottleLater(enemy, bottle);
    }

    /**
     * Plays chicken stomp sound (bottle or jump kill).
     */
    playChickenStompSound() {
        AudioHub.CHICKEN_STOMP.currentTime = 0;
        AudioHub.CHICKEN_STOMP.volume = 0.1;
        AudioHub.CHICKEN_STOMP.play();
    }

    /**
     * Plays mini chicken explode sound.
     */
    playMiniChickenExplodeSound() {
        AudioHub.MINI_CHICKEN_EXPLODE2.currentTime = 0;
        AudioHub.MINI_CHICKEN_EXPLODE2.play();
    }

    /**
     * Delays removal of chicken and bottle to allow splash/death animation.
     * @param {MoveableObject} enemy
     * @param {ThrowableObject} bottle
     */
    removeChickenAndBottleLater(enemy, bottle) {
        setTimeout(() => {
            enemy.markedForRemoval = true;
            bottle.markedForRemoval = true;
        }, bottle.BOTTLE_SPLASH.length * 100);
    }

    /**
     * Handles bottle hitting endboss.
     * @param {ChickenEndboss} enemy
     * @param {ThrowableObject} bottle
     */
    handleEndbossBottleHit(enemy, bottle) {
        enemy.takeBottleHit();
        setTimeout(() => {
            bottle.markedForRemoval = true;
        }, bottle.BOTTLE_SPLASH.length * 100);
    }

    /**
     * Player picking up collectables (coins, bottles).
     */
    checkCollectableCollision() {
        this.world.level.collectableObjects =
            this.world.level.collectableObjects.filter(obj => {
                if (this.world.character.isColliding(obj)) {
                    this.handleCollectable(obj);
                    return false;
                }
                return true;
            });
    }

    /**
     * Routes a collectable object to its specific handler.
     * @param {CollectableObject} obj
     */
    handleCollectable(obj) {
        if (obj instanceof CollectableCoin) this.collectCoin();
        if (obj instanceof CollectableBottle) this.collectBottle();
    }

    /**
     * Increases coin count and updates UI.
     */
    collectCoin() {
        this.world.collectedCoins++;
        AudioHub.COIN_COLLECT.currentTime = 0;
        AudioHub.COIN_COLLECT.play();
        this.world.coinStatusBar.setPercentage(this.world.collectedCoins / 12 * 100);
    }

    /**
     * Increases bottle count and updates UI.
     */
    collectBottle() {
        this.world.collectedBottles++;
        AudioHub.BOTTLE_COLLECT.currentTime = 0;
        AudioHub.BOTTLE_COLLECT.volume = 0.4;
        AudioHub.BOTTLE_COLLECT.play();
        this.world.bottleStatusBar.setPercentage(this.world.collectedBottles / 20 * 100);
    }

    /**
     * Checks if mini chickens cause knockback damage.
     */
    checkMiniChickenStomp() {
        this.world.enemies.forEach(enemy => {
            if (this.shouldMiniChickenStomp(enemy)) {
                this.handleMiniChickenStomp(enemy);
                AudioHub.MINI_CHICKEN_EXPLODE2.currentTime = 0;
                AudioHub.MINI_CHICKEN_EXPLODE2.play();
            }
        });
    }

    /**
     * @param {MoveableObject} enemy
     * @returns {boolean} True if mini chicken collision should trigger knockback.
     */
    shouldMiniChickenStomp(enemy) {
        return enemy instanceof MiniChicken &&
            !this.world.character.isDead() &&
            this.world.character.isColliding(enemy) &&
            enemy.energy > 0;
    }

    /**
     * Handles knockback when mini chicken hits player.
     * @param {MiniChicken} enemy
     */
    handleMiniChickenStomp(enemy) {
        this.world.characterKnockbackActive = true;
        if (enemy.x < this.world.character.x) {
            this.knockbackRight(enemy);
        } else {
            this.knockbackLeft(enemy);
        }
        this.world.character.hit();
        this.world.statusBar.setPercentage(this.world.character.energy);
    }

    /**
     * Applies right-direction knockback to player and kills mini chicken.
     * @param {MiniChicken} enemy
     */
    knockbackRight(enemy) {
        const char = this.world.character;
        let interval = setInterval(() => {
            char.jump(10);
            char.moveRight();
            enemy.energy = 0;
            setTimeout(() => enemy.markedForRemoval = true, 500);
        }, 16);
        setTimeout(() => {
            clearInterval(interval);
            this.world.characterKnockbackActive = false;
        }, 1500);
    }

    /**
     * Applies left-direction knockback to player and kills mini chicken.
     * @param {MiniChicken} enemy
     */
    knockbackLeft(enemy) {
        const char = this.world.character;
        let interval = setInterval(() => {
            char.jump(10);
            if (char.x > 100) {
                char.moveLeft();
            }
            enemy.energy = 0;
            setTimeout(() => enemy.markedForRemoval = true, 500);
        }, 16);
        setTimeout(() => {
            clearInterval(interval);
            this.world.characterKnockbackActive = false;
        }, 1500);
    }
}