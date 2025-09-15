/**
 * initLevel1: Initializes level 1 with all enemies, clouds, backgrounds, and collectables.
 */
let level1
function initLevel1() {
    playBackgroundMusik();
    level1 = new Level(

        [
            new Chicken(),
            new MiniChicken(),
            new Chicken(),
            new MiniChicken(),
            new Chicken(),
            new MiniChicken(),
            new Chicken(),
            new MiniChicken(),
            new Chicken(),
            new Chicken(),
            new Chicken(),
            new Chicken(),
            new Chicken(),
            new Chicken(),
            new Chicken(),
            new MiniChicken(),
            new MiniChicken(),
            new Chicken(),
            new Chicken(),
            new Chicken(),
            new MiniChicken(),
            new MiniChicken(),
            new MiniChicken(),
            new Chicken(),
            new Chicken(),
            new MiniChicken(),
            new Chicken(),
            new Chicken(),
            new ChickenEndboss(world),
            new MiniChicken(),
            new MiniChicken(),
            new MiniChicken()
        ],

        [
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud(),
            new cloud()
        ],

        [
            new BackgroundObject('img/5_background/layers/air.png', -721, 1),         
            new BackgroundObject('img/5_background/layers/3_third_layer/2.png', -721, 1),
            new BackgroundObject('img/5_background/layers/2_second_layer/2.png', -721, 1),
            new BackgroundObject('img/5_background/layers/1_first_layer/2.png', -721, 1),

            new BackgroundObject('img/5_background/layers/air.png', -1, 0.7),
            new BackgroundObject('img/5_background/layers/3_third_layer/1.png', -1, 0.8),
            new BackgroundObject('img/5_background/layers/2_second_layer/1.png', -1, 0.9),
            new BackgroundObject('img/5_background/layers/1_first_layer/1.png', -1, 1),

            new BackgroundObject('img/5_background/layers/air.png', 718, 0.7),
            new BackgroundObject('img/5_background/layers/3_third_layer/2.png', 718, 0.8),
            new BackgroundObject('img/5_background/layers/2_second_layer/2.png', 718, 0.9),
            new BackgroundObject('img/5_background/layers/1_first_layer/2.png', 718, 1),

            new BackgroundObject('img/5_background/layers/air.png', 1437, 0.7),
            new BackgroundObject('img/5_background/layers/3_third_layer/1.png', 1437, 0.8),
            new BackgroundObject('img/5_background/layers/2_second_layer/1.png', 1437, 0.9),
            new BackgroundObject('img/5_background/layers/1_first_layer/1.png', 1437, 1),

            new BackgroundObject('img/5_background/layers/air.png', 2156, 0.7),
            new BackgroundObject('img/5_background/layers/3_third_layer/2.png', 2156, 0.8),
            new BackgroundObject('img/5_background/layers/2_second_layer/2.png', 2156, 0.9),
            new BackgroundObject('img/5_background/layers/1_first_layer/2.png', 2156, 1),

            new BackgroundObject('img/5_background/layers/air.png', 2875, 0.7),
            new BackgroundObject('img/5_background/layers/3_third_layer/1.png', 2875, 0.8),
            new BackgroundObject('img/5_background/layers/2_second_layer/1.png', 2875, 0.9),
            new BackgroundObject('img/5_background/layers/1_first_layer/1.png', 2875, 1),

            new BackgroundObject('img/5_background/layers/air.png', 3594, 0.7),
            new BackgroundObject('img/5_background/layers/3_third_layer/2.png', 3594, 0.8),
            new BackgroundObject('img/5_background/layers/2_second_layer/2.png', 3594, 0.9),
            new BackgroundObject('img/5_background/layers/1_first_layer/2.png', 3594, 1),

            new BackgroundObject('img/5_background/layers/air.png', 4313, 0.7),
            new BackgroundObject('img/5_background/layers/3_third_layer/1.png', 4313, 0.8),
            new BackgroundObject('img/5_background/layers/2_second_layer/1.png', 4313, 0.9),
            new BackgroundObject('img/5_background/layers/1_first_layer/1.png', 4313, 1),

            new BackgroundObject('img/5_background/layers/air.png', 5032, 0.7),
            new BackgroundObject('img/5_background/layers/3_third_layer/2.png', 5032, 0.8),
            new BackgroundObject('img/5_background/layers/2_second_layer/2.png', 5032, 0.9),
            new BackgroundObject('img/5_background/layers/1_first_layer/2.png', 5032, 1),

            new BackgroundObject('img/5_background/layers/air.png', 5751, 0.7),
            new BackgroundObject('img/5_background/layers/3_third_layer/1.png', 5751, 0.8),
            new BackgroundObject('img/5_background/layers/2_second_layer/1.png', 5751, 0.9),
            new BackgroundObject('img/5_background/layers/1_first_layer/1.png', 5751, 1),

            new BackgroundObject('img/5_background/layers/air.png', 6470, 0.7),
            new BackgroundObject('img/5_background/layers/3_third_layer/2.png', 6470, 0.8),
            new BackgroundObject('img/5_background/layers/2_second_layer/2.png', 6470, 0.9),
            new BackgroundObject('img/5_background/layers/1_first_layer/2.png', 6470, 1),

            new BackgroundObject('img/5_background/layers/air.png', 7189, 0.7),
            new BackgroundObject('img/5_background/layers/3_third_layer/1.png', 7189, 0.8),
            new BackgroundObject('img/5_background/layers/2_second_layer/1.png', 7189, 0.9),
            new BackgroundObject('img/5_background/layers/1_first_layer/1.png', 7189, 1)
        ],

        [
            new CollectableCoin(),
            new CollectableCoin(),
            new CollectableCoin(),
            new CollectableCoin(),
            new CollectableCoin(),
            new CollectableCoin(),
            new CollectableCoin(),
            new CollectableCoin(),
            new CollectableCoin(),
            new CollectableCoin(),
            new CollectableCoin(),
            new CollectableCoin(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle()
        ]
    );
}

/**
 * playBackgroundMusik: Starts and loops the background music for the level.
 */
function playBackgroundMusik() {
    AudioHub.MUSIK_1.loop = true;
    AudioHub.MUSIK_1.currentTime = 0;
    AudioHub.MUSIK_1.volume = 0.25;
    AudioHub.MUSIK_1.play();
}