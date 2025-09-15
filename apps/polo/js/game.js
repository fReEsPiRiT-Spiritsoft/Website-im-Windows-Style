let canvas;
let world;
let keyboard = new Keyboard();
let inputManager;
let selectedDifficulty = 'medium';
let isMuted = localStorage.getItem('isMuted') === '1';

window.addEventListener('DOMContentLoaded', () => {

    AudioHub.allSounds.forEach(sound => sound.muted = isMuted);
    const btnMute = document.getElementById('btnMute');
    if (btnMute) {
        if (isMuted) {
            btnMute.classList.add('muted');
        } else {
            btnMute.classList.remove('muted');
        }
    }
});

/**
 * init: Initializes the canvas and disables right-click context menu.
 */
function init() {
    canvas = document.getElementById('canvas');
    canvas.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });
}

/**
 * getDifficultySettings: Returns settings for the selected difficulty.
 */
function getDifficultySettings() {
    switch (selectedDifficulty) {
        case 'easy':
            return { endbossEnergy: 60, characterEnergy: 120, cloudSpeed: 0.2, darkClouds: false, rain: false };
        case 'medium':
            return { endbossEnergy: 100, characterEnergy: 100, cloudSpeed: 0.4, darkClouds: false, rain: false };
        case 'hard':
            return { endbossEnergy: 160, characterEnergy: 40, cloudSpeed: 1.5, darkClouds: true, rain: true };
        default:
            return { endbossEnergy: 100, characterEnergy: 100, cloudSpeed: 0.4, darkClouds: false, rain: false };
    }
}

/**
 * startGame: Starts the game and sets up everything.
 */
function startGame() {
    const isMobile = isMobileDevice();
    const isPortrait = isPortraitMode();
    const settings = getDifficultySettings();
    setupLevel(settings);
    hideStartScreen();
    handleFullscreen(isMobile, isPortrait);
    handleWeatherSounds();
    showTouchControlsIfNeeded();
}

/**
 * isMobileDevice: Checks if the user is on a mobile device.
 */
function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * isPortraitMode: Checks if the device is in portrait mode.
 */
function isPortraitMode() {
    return window.matchMedia("(orientation: portrait)").matches;
}

/**
 * setupLevel: Initializes the level and world with settings.
 */
function setupLevel(settings) {
    world = null;
    initLevel1(settings.darkClouds);
    world = new World(canvas, keyboard, level1);
    world.start();
    if (!inputManager) {
        inputManager = new InputManager(keyboard, world);
    } else {
        inputManager.setWorld(world);
    }
    const endboss = world.enemies.find(e => e instanceof ChickenEndboss);
    if (endboss) {
        endboss.energy = settings.endbossEnergy;
        world.character.energy = settings.characterEnergy;
        world.clouds.forEach(c => c.speed = settings.cloudSpeed);
        if (settings.darkClouds) darkenClouds(world);
        if (settings.rain) world.enableRain = true;
    }
}

/**
 * hideStartScreen: Hides the start screen.
 */
function hideStartScreen() {
    const s = document.getElementById('startscreen');
    if (s) s.style.display = 'none';
}

/**
 * handleFullscreen: Handles fullscreen mode for mobile/portrait.
 */
function handleFullscreen(isMobile, isPortrait) {
    if (isMobile && !isPortrait && !document.fullscreenElement) {
        toggleFullscreen();
    }
}

/**
 * handleWeatherSounds: Plays weather sounds based on difficulty.
 */
function handleWeatherSounds() {
    if (selectedDifficulty === 'hard') {
        playWindyAudio();
    } else {
        playRainyAudio();
    }
}

/**
 * playWindyAudio: Plays windy audio for hard mode.
 */
function playWindyAudio() {
    AudioHub.RAIN_HARD.loop = true;
    AudioHub.RAIN_HARD.currentTime = 0;
    AudioHub.RAIN_HARD.volume = 0.2;
    AudioHub.RAIN_HARD.play();
    AudioHub.WINDY_HARD.currentTime = 0;
}

/**
 * playRainyAudio: Plays rainy audio for other modes.
 */
function playRainyAudio() {
    AudioHub.WINDY_HARD.loop = true;
    AudioHub.WINDY_HARD.currentTime = 0;
    AudioHub.WINDY_HARD.volume = 0.2;
    AudioHub.WINDY_HARD.play();
    AudioHub.RAIN_HARD.currentTime = 0;
}

/**
 * toggleMute: Toggles mute for all sounds.
 */
function toggleMute() {
    isMuted = !isMuted;
    localStorage.setItem('isMuted', isMuted ? '1' : '0');
    AudioHub.allSounds.forEach(sound => sound.muted = isMuted);
    const muteIcon = document.getElementById('muteIcon');
    const btnMute = document.getElementById('btnMute');
    if (isMuted) {
        btnMute.classList.add('muted');
    } else {
        btnMute.classList.remove('muted');
    }
}

/**
 * showTouchControlsIfNeeded: Shows touch controls on touch devices.
 */
function showTouchControlsIfNeeded() {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        const t = document.getElementById('touchControls');
        if (t) t.classList.remove('hidden');
    }
}

/**
 * darkenClouds: Sets dark cloud images for the world.
 */
function darkenClouds(world) {
    const darkImgs = [
        'img/5_background/layers/4_clouds/1_dark.png',
        'img/5_background/layers/4_clouds/2_dark.png'
    ];
    if (!world.clouds) return;
    world.clouds.forEach(c => {
        c.loadImage(darkImgs[Math.floor(Math.random() * darkImgs.length)]);
        c.isDark = true;
    });
}

/**
 * restartGame: Restarts the game and world.
 */
function restartGame() {
    destroyWorldIfExists();
    world = null;
    const settings = getDifficultySettings();
    initLevel1(settings.darkClouds);
    world = new World(canvas, keyboard, level1);
    world.start();
    inputManager.setWorld(world);
    const endboss = world.enemies.find(e => e instanceof ChickenEndboss);
    if (endboss) {
        endboss.energy = settings.endbossEnergy;
        world.character.energy = settings.characterEnergy;
        world.clouds.forEach(c => c.speed = settings.cloudSpeed);
        if (settings.darkClouds) darkenClouds(world);
        if (settings.rain) world.enableRain = true;
    }
    cleanScreen();
}

/**
 * destroyWorldIfExists: Destroys the world if it exists.
 */
function destroyWorldIfExists() {
    if (world && world.enemies) {
        world.enemies.forEach(enemy => {
            if (enemy !== this && enemy.energy > 0) {
                enemy.energy = 0;
                enemy.markedForRemoval = true;
                enemy.animateDeath && enemy.animateDeath();
            }
        });
    }
    if (world && typeof world.destroy === 'function') {
        world.destroy();
    }
}

/**
 * cleanScreen: Hides win and end screens.
 */
function cleanScreen() {
    const w = document.getElementById('winningscreen')
    const s = document.getElementById('endscreen');
    if (s) s.classList.add('hidden');
    if (w) w.classList.add('hidden');
}


/**
 * goToMainMenu: Reloads the page to go to main menu.
 */
function goToMainMenu() {
    location.reload();
}

/**
 * toggleFullscreen: Toggles fullscreen mode for the game.
 */
function toggleFullscreen() {
    const gameDiv = document.querySelector('.game');
    if (!document.fullscreenElement) {
        gameDiv.requestFullscreen && gameDiv.requestFullscreen();
    } else {
        document.exitFullscreen && document.exitFullscreen();
    }
}

/**
 * resizeCanvasToFullscreen: Resizes canvas for fullscreen mode.
 */
function resizeCanvasToFullscreen() {
    const gameDiv = document.querySelector('.game');
    if (document.fullscreenElement === gameDiv) {
        setGameDivFullscreen(gameDiv);
        setCanvasFullscreen();
        centerCanvas();
    } else {
        resetGameDiv(gameDiv);
        resetCanvas();
    }
}

/**
 * setGameDivFullscreen: Sets the game container to fullscreen size and position.
 */
function setGameDivFullscreen(gameDiv) {
    gameDiv.style.width = '100vw';
    gameDiv.style.height = '100vh';
    gameDiv.style.position = 'relative';
}

/**
 * setCanvasFullscreen: Sets the canvas size and position for fullscreen mode.
 */

function setCanvasFullscreen() {
    canvas.width = 720;
    canvas.height = 480;
    const { targetW, targetH } = calculateCanvasSize();
    canvas.style.position = 'absolute';
    canvas.style.width = targetW + 'px';
    canvas.style.height = targetH + 'px';
}

/**
 * calculateCanvasSize: Calculates the optimal canvas size for the current window.
 */

function calculateCanvasSize() {
    const aspect = 720 / 480;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let targetW = vw;
    let targetH = targetW / aspect;
    if (targetH > vh) {
        targetH = vh;
        targetW = targetH * aspect;
    }
    const scaleFactor = 0.98;
    targetW *= scaleFactor;
    targetH *= scaleFactor;
    return { targetW, targetH };
}

/**
 * centerCanvas: Centers the canvas in the viewport and sets background.
 */
function centerCanvas() {
    canvas.style.left = '50%';
    canvas.style.top = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';
    canvas.style.background = '#000';
}

/**
 * resetGameDiv: Resets the game container to default size and position.
 */
function resetGameDiv(gameDiv) {
    gameDiv.style.width = '720px';
    gameDiv.style.height = '480px';
    gameDiv.style.position = 'static';
}

/**
 * resetCanvas: Resets the canvas to default size and style.
 */
function resetCanvas() {
    canvas.width = 720;
    canvas.height = 480;
    canvas.style.position = 'static';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.left = '';
    canvas.style.top = '';
    canvas.style.transform = '';
    canvas.style.background = '';
}

/**
 * updateRotateNotice: Updates the rotate notice for mobile/portrait.
 */
function updateRotateNotice() {
    const el = document.getElementById('rotateNotice');
    if (!el) return;
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    el.style.display = (isMobile && isPortrait) ? 'flex' : '';
}

/**
 * toggleMenu: Toggles the UI menu open/close.
 */
function toggleMenu() {
    const ui = document.getElementById('ui');
    if (!ui) return;
    ui.classList.toggle('open');
}

/**
 * focusCanvas: Focuses the canvas element.
 */
function focusCanvas() {
    const c = document.getElementById('canvas');
    if (c) c.focus();
}

/**
 * openControlsModal: Opens the controls modal.
 */
function openControlsModal() {
    document.getElementById('controlsModal').classList.remove('hidden');
}

/**
 * closeControlsModal: Closes the controls modal.
 */
function closeControlsModal() {
    document.getElementById('controlsModal').classList.add('hidden');
}

/**
 * openImpressumModal: Opens the impressum modal.
 */
function openImpressumModal() {
    document.getElementById('impressumModal').classList.remove('hidden');
}

/**
 * closeImpressumModal: Closes the impressum modal.
 */
function closeImpressumModal() {
    document.getElementById('impressumModal').classList.add('hidden');
}

document.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (btn) {
        setTimeout(() => {
            btn.blur();
            focusCanvas();
        }, 0);
    }
});

window.addEventListener('keydown', e => {
    if (e.code === 'Space' && document.activeElement?.tagName === 'BUTTON') {
        e.preventDefault();
        document.activeElement.blur();
        focusCanvas();
    }
});


const _origStartGame = startGame;
startGame = function () {
    _origStartGame();
    focusCanvas();
};
window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.name === 'AbortError') {
        event.preventDefault();
    }
});
window.addEventListener('orientationchange', updateRotateNotice);
window.addEventListener('resize', updateRotateNotice);
document.addEventListener('DOMContentLoaded', updateRotateNotice);

document.getElementById('difficulty').addEventListener('change', function (e) {
    selectedDifficulty = e.target.vSalue;
});