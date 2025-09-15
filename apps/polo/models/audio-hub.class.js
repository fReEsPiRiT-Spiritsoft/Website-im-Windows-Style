/**
 * @class AudioHub
 * @classdesc Central hub for managing all game audio. Provides static references to all sounds,
 *            as well as utility methods for playback, stopping, and volume control.
 */
class AudioHub {
    static CHICKEN_STOMP = new Audio('./audio/chicken_stomp.mp3');
    static FIGHT_FOR_ENDBOSS = new Audio('./audio/fight_for_endboss.mp3');
    static INTRO = new Audio('./audio/intro.mp3');
    static LOOSER = new Audio('./audio/looser.mp3');
    static MINI_CHICKEN_EXPLODE1 = new Audio('./audio/mini_chicken_explode1.mp3');
    static MINI_CHICKEN_EXPLODE2 = new Audio('./audio/mini_chicken_explode2.mp3');
    static MINI_CHICKEN = new Audio('./audio/mini_chicken.mp3');
    static NORMAL_CHICKEN = new Audio('./audio/normal_chicken.mp3');
    static PEPE_HURT = new Audio('./audio/pepe_hurt.mp3');
    static PEPE_JUMP = new Audio('./audio/pepe_jump.mp3');
    static PEPE_LAND = new Audio('./audio/pepe_land.mp3');
    static PEPE_WALK = new Audio('./audio/pepe_walk.mp3');
    static RAIN_HARD = new Audio('./audio/rain_hard.mp3');
    static WINDY_HARD = new Audio('./audio/windy_hard.mp3');
    static WINNER = new Audio('./audio/winner.mp3');
    static BOTTLE_SPLASH = new Audio('./audio/bottle_splash.mp3');
    static COIN_COLLECT = new Audio('./audio/coin_collect.mp3');
    static BOTTLE_COLLECT = new Audio('./audio/bottle_collect.mp3');
    static PEPE_SLEEP = new Audio('./audio/pepe_sleep.mp3');
    static THROW = new Audio('./audio/throw.mp3');
    static MUSIK_1 = new Audio('./audio/background_musik.mp3');

    /**
     * Array containing all audio elements for easy iteration.
     * @type {HTMLAudioElement[]}
     */
    static allSounds = [
        AudioHub.CHICKEN_STOMP,
        AudioHub.FIGHT_FOR_ENDBOSS,
        AudioHub.INTRO,
        AudioHub.LOOSER,
        AudioHub.MINI_CHICKEN_EXPLODE1,
        AudioHub.MINI_CHICKEN_EXPLODE2,
        AudioHub.MINI_CHICKEN,
        AudioHub.NORMAL_CHICKEN,
        AudioHub.PEPE_HURT,
        AudioHub.PEPE_JUMP,
        AudioHub.PEPE_LAND,
        AudioHub.PEPE_WALK,
        AudioHub.RAIN_HARD,
        AudioHub.WINDY_HARD,
        AudioHub.WINNER,
        AudioHub.BOTTLE_SPLASH,
        AudioHub.COIN_COLLECT,
        AudioHub.BOTTLE_COLLECT,
        AudioHub.PEPE_SLEEP,
        AudioHub.THROW,
        AudioHub.MUSIK_1
    ];

    /**
     * Plays a single sound and visually activates the corresponding instrument image.
     * @param {HTMLAudioElement} sound - The audio element to play.
     * @param {string} instrumentId - The DOM id of the instrument image to activate.
     */
    static playOne(sound, instrumentId) {
        if (sound.readyState === 4 && sound.paused) {
            sound.volume = 0.2;
            sound.currentTime = 0;
            sound.play().catch(() => { }); 
            const instrumentImg = document.getElementById(instrumentId);
            if (instrumentImg) instrumentImg.classList.add('active');
        }
    }

    /**
     * Stops all sounds and resets the volume slider and instrument images.
     */
    static stopAll() {
        AudioHub.allSounds.forEach(sound => {
            if (!sound.paused) {
                sound.pause();
            }
        });
        const volumeElem = document.getElementById('volume');
        if (volumeElem) volumeElem.value = 0.2;
        const instrumentImages = document.querySelectorAll('.sound_img');
        instrumentImages.forEach(img => img.classList.remove('active'));
    }

    /**
     * Stops a single sound and visually deactivates the corresponding instrument image.
     * @param {HTMLAudioElement} sound - The audio element to stop.
     * @param {string} instrumentId - The DOM id of the instrument image to deactivate.
     */
    static stopOne(sound, instrumentId) {
        if (!sound.paused) {
            sound.pause();
        }
        const instrumentImg = document.getElementById(instrumentId);
        if (instrumentImg) instrumentImg.classList.remove('active');
    }


    /**
     * Sets the volume for all provided audio elements based on the volume slider value.
     * @param {HTMLAudioElement[]} volumeSlider - Array of audio elements to set the volume for.
     */
    static objSetVolume(volumeSlider) {
        let volumeValue = document.getElementById('volume').value;
        volumeSlider.forEach(sound => {
            sound.volume = volumeValue;
        });
    }
}