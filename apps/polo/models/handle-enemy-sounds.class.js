/**
 * EnemySounds: Handles dynamic playback and volume of chicken and mini chicken sounds based on player proximity.
 */
class EnemySounds {
    static miniChickenPlaying = false;
    static chickenPlaying = false;

    /**
     * updateMiniChickenSound: Updates the mini chicken sound based on distance to the player.
     * @param {World} world - The current game world instance.
     */
    static updateMiniChickenSound(world) {
        this.updateChickenTypeSound(
            world,
            MiniChicken,
            AudioHub.MINI_CHICKEN,
            'miniChickenPlaying'
        );
    }

    /**
     * updateChickenSound: Updates the normal chicken sound based on distance to the player.
     * @param {World} world - The current game world instance.
     */
    static updateChickenSound(world) {
        this.updateChickenTypeSound(
            world,
            Chicken,
            AudioHub.NORMAL_CHICKEN,
            'chickenPlaying'
        );
    }

    /**
     * updateChickenTypeSound: Generic handler for updating chicken-type sounds.
     * @param {World} world - The current game world instance.
     * @param {Function} type - The chicken class (Chicken or MiniChicken).
     * @param {HTMLAudioElement} audio - The audio element to play.
     * @param {string} playingFlag - The static flag name for tracking playback state.
     */
    static updateChickenTypeSound(world, type, audio, playingFlag) {
        const { chickens, minDist, maxDist } = this.getChickenSoundData(world, type);
        if (chickens.length > 0 && minDist < maxDist) {
            this.playChickenSound(audio, playingFlag, minDist, maxDist);
        } else {
            this.pauseChickenSound(audio, playingFlag);
        }
    }

    /**
     * getChickenSoundData: Returns all living chickens of a type and their minimum distance to the player.
     * @param {World} world - The current game world instance.
     * @param {Function} type - The chicken class (Chicken or MiniChicken).
     * @returns {{chickens: Array, minDist: number, maxDist: number}}
     */
    static getChickenSoundData(world, type) {
        const chickens = world.enemies.filter(e => e instanceof type && e.energy > 0);
        const charX = world.character.x;
        let minDist = Infinity;
        chickens.forEach(chicken => {
            const dist = Math.abs(chicken.x - charX);
            if (dist < minDist) minDist = dist;
        });
        const maxDist = 600;
        return { chickens, minDist, maxDist };
    }

    /**
     * playChickenSound: Plays the chicken sound with volume based on distance.
     * @param {HTMLAudioElement} audio - The audio element to play.
     * @param {string} playingFlag - The static flag name for tracking playback state.
     * @param {number} minDist - The minimum distance to the player.
     * @param {number} maxDist - The maximum distance for sound to be heard.
     */
    static playChickenSound(audio, playingFlag, minDist, maxDist) {
        let volume = 1 - (minDist / maxDist);
        volume = Math.max(0, Math.min(1, volume));
        audio.volume = volume;
        if (!this[playingFlag]) {
            audio.loop = true;
            audio.play();
            this[playingFlag] = true;
        }
    }

    /**
     * pauseChickenSound: Pauses the chicken sound and resets the playback flag.
     * @param {HTMLAudioElement} audio - The audio element to pause.
     * @param {string} playingFlag - The static flag name for tracking playback state.
     */
    static pauseChickenSound(audio, playingFlag) {
        audio.volume = 0;
        if (this[playingFlag]) {
            audio.pause();
            this[playingFlag] = false;
        }
    }
}