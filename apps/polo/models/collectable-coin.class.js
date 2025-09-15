/**
 * CollectableCoin: Represents a coin that can be collected by the player.
 * Inherits from CollectableObject.
 */
class CollectableCoin extends CollectableObject {

    width = 80;
    height = 80;

    /**
     * Constructor for CollectableCoin.
     * @param {number} [mapWidth=7200] - The width of the map for random coin placement.
     * @param {number} [mapHeight=280] - The height of the map for random coin placement.
     */
     constructor(mapWidth = 7200, mapHeight = 280) {
        super().loadImage('img/7_statusbars/3_icons/icon_coin.png')
        this.x = 100 + Math.random() * (mapWidth - 100);
        this.y = Math.random() * mapHeight;
    }
}