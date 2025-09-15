/**
 * CollectableBottle: Represents a bottle that can be collected by the player.
 * Inherits from CollectableObject.
 */
class CollectableBottle extends CollectableObject {

    width = 100;
    height = 100;

    /**
     * Constructor for CollectableBottle.
     * @param {number} [mapWidth=7200] - The width of the map for random bottle placement.
     */
    constructor(mapWidth = 7200) {
        super().loadImage('img/6_salsa_bottle/2_salsa_bottle_on_ground.png');
        this.x = 100 + Math.random() * (mapWidth - 100);
        this.y = 350;
    }
}