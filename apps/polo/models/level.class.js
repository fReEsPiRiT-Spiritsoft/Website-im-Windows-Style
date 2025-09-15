/**
 * Level: Represents a game level, containing all enemies, clouds, background objects, and collectables.
 */
class Level {
    enemies;
    clouds;
    backgroundObjects;
    collectableObjects;

    /**
     * Constructs a new Level instance with the given game objects.
     * @param {Array} enemies - Array of enemy objects in the level.
     * @param {Array} clouds - Array of cloud objects in the level.
     * @param {Array} backgroundObjects - Array of background objects in the level.
     * @param {Array} collectableObjects - Array of collectable objects in the level.
     */
    constructor(enemies, clouds, backgroundObjects, collectableObjects) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.collectableObjects = collectableObjects;
    }
}