// --- CONFIGURACIÓN Y ASSETS ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Capas UI
const uiLoading = document.getElementById('ui-loading');
const uiStart = document.getElementById('ui-start');
const uiLevel = document.getElementById('ui-level');
const levelImg = document.getElementById('level-img');
const uiNext = document.getElementById('ui-next');
const uiEnd = document.getElementById('ui-end');
const attemptsCounter = document.getElementById('attempts-counter');
const levelIndicator = document.getElementById('level-indicator');
const levelIndicatorImg = document.getElementById('level-indicator-img');
const resetButton = document.getElementById('reset-button');

let level = 1;
let cards = [];
let selected = [];
let canClick = false;
let gameState = 'MENU'; // MENU, PLAYING, LEVEL_WIN, GAME_OVER

// Attempt counter
let currentLevelAttempts = 0;
let levelAttempts = {}; // Store attempts for each level
let totalAttempts = 0;

// Load Card Images
const clownImages = [];
const cardFileNames = ['card-a.png', 'card-b.png', 'card-c.png', 'card-d.png', 'card-e.png', 'card-f.png', 'card-g.png', 'card-h.png'];
let cardBackImage = null;

function loadCardImages() {
    return new Promise((resolve) => {
        let loadedCount = 0;
        const totalToLoad = cardFileNames.length + 1; // +1 for card-back.png
        
        cardFileNames.forEach((fileName) => {
            const img = new Image();
            img.src = 'img/' + fileName;
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalToLoad) {
                    resolve();
                }
            };
            img.onerror = () => {
                console.warn(`Failed to load ${fileName}`);
                loadedCount++;
                if (loadedCount === totalToLoad) {
                    resolve();
                }
            };
            clownImages.push(img);
        });
        
        // Load card back image
        cardBackImage = new Image();
        cardBackImage.src = 'img/card-back.png';
        cardBackImage.onload = () => {
            loadedCount++;
            if (loadedCount === totalToLoad) {
                resolve();
            }
        };
        cardBackImage.onerror = () => {
            console.warn('Failed to load card-back.png');
            loadedCount++;
            if (loadedCount === totalToLoad) {
                resolve();
            }
        };
    });
}

// --- LÓGICA DEL JUEGO ---

function startGame() {
    uiStart.classList.add('hidden');
    level = 1;
    gameState = 'PLAYING';
    initLevel();
}

function initLevel() {
    hideUILayers();
    
    // Mostrar pantalla de nivel
    levelImg.src = `img/nivel-${level}.png`;
    uiLevel.classList.remove('hidden');
    
    // Después de 2 segundos, empezar el juego
    setTimeout(() => {
        hideUILayers();
        cards = [];
        selected = [];
        canClick = false;
        gameState = 'PLAYING';
        attemptsCounter.classList.add('visible'); // Show counter during gameplay
        levelIndicator.classList.add('visible'); // Show level indicator
        resetButton.classList.add('visible'); // Show reset button
        levelIndicatorImg.src = `img/nivel-${level}.png`;
        updateAttemptsDisplay(); // Reset counter display for new level
        
        // Resolución fija para el canvas
        canvas.width = 600; 
        canvas.height = 600;

        // Cartas: Nivel 1=4 (2x2), Nivel 2=6 (2x3...), Nivel 7=16 (4x4)
        let numPairs = level + 1;
        let currentImages = clownImages.slice(0, numPairs); 
        let deck = [...currentImages, ...currentImages];
        // Mezcla aleatoria
        deck.sort(() => Math.random() - 0.5);

        // Rejilla
        const totalCards = deck.length;
        const cols = Math.ceil(Math.sqrt(totalCards));
        const rows = Math.ceil(totalCards / cols);
        
        // Ajuste de tamaño para mobile
        const gap = 10;
        const size = Math.min(
            (canvas.width - (cols + 1) * gap) / cols,
            (canvas.height - (rows + 1) * gap) / rows
        );

        // Centrado de la rejilla
        const gridWidth = cols * (size + gap) - gap;
        const gridHeight = rows * (size + gap) - gap;
        const offsetX = (canvas.width - gridWidth) / 2;
        const offsetY = (canvas.height - gridHeight) / 2;

        deck.forEach((imgCanvas, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = offsetX + col * (size + gap);
            const y = offsetY + row * (size + gap);
            cards.push({ img: imgCanvas, x, y, size, flipped: true, matched: false, shake: 0 });
        });

        draw();

        // Mostrar 0.8 segundos y voltear
        setTimeout(() => {
            cards.forEach(c => c.flipped = false);
            canClick = true;
            draw();
        }, 800);
    }, 2000);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    cards.forEach(card => {
        ctx.save();
        
        // Temblor
        if (card.shake > 0) {
            ctx.translate(Math.sin(Date.now() * 0.2) * 8, 0);
            card.shake--;
        }

        if (card.flipped || card.matched) {
            // Dibujar carta del frente
            ctx.drawImage(card.img, card.x, card.y, card.size, card.size);
        } else {
            // Dibujar reverso de carta
            if (cardBackImage) {
                ctx.drawImage(cardBackImage, card.x, card.y, card.size, card.size);
            }
        }
        
        ctx.restore();
    });

    // Loop de animación si hay temblor
    if (cards.some(c => c.shake > 0)) {
        requestAnimationFrame(draw);
    }
}

function updateAttemptsDisplay() {
    attemptsCounter.textContent = `Intentos: ${currentLevelAttempts}`;
}

// --- INTERACCIÓN ---

// Unifica Touch y Mouse
canvas.addEventListener('pointerdown', handlePointerDown);

function handlePointerDown(e) {
    if (!canClick || gameState !== 'PLAYING') return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    cards.forEach(card => {
        if (!card.flipped && !card.matched &&
            mouseX > card.x && mouseX < card.x + card.size &&
            mouseY > card.y && mouseY < card.y + card.size) {
            
            card.flipped = true;
            selected.push(card);
            draw();

            if (selected.length === 2) {
                checkMatch();
            }
        }
    });
}

function checkMatch() {
    canClick = false;
    const [c1, c2] = selected;

    // Increment attempt counter when second card is selected
    currentLevelAttempts++;
    updateAttemptsDisplay();

    // Comparamos el canvas de la imagen directamente
    if (c1.img === c2.img) {
        c1.matched = c2.matched = true;
        selected = [];
        canClick = true;
        // Dibujo inmediato para asegurar que se vea la última carta volteada
        draw(); 
        if (cards.every(c => c.matched)) showLevelWin();
    } else {
        setTimeout(() => {
            // Iniciar temblor
            c1.shake = c2.shake = 15; 
            requestAnimationFrame(draw); // Iniciar loop animación

            setTimeout(() => {
                c1.flipped = c2.flipped = false;
                selected = [];
                canClick = true;
                draw();
            }, 300); // Tiempo temblando
        }, 500); // Tiempo antes de temblar
    }
}

// --- GESTIÓN DE PANTALLAS (UI) ---

function hideUILayers() {
    uiStart.classList.add('hidden');
    uiLevel.classList.add('hidden');
    uiNext.classList.add('hidden');
    uiEnd.classList.add('hidden');
    attemptsCounter.classList.remove('visible');
    levelIndicator.classList.remove('visible');
    resetButton.classList.remove('visible');
}

function showLevelWin() {
    gameState = 'LEVEL_WIN';
    canClick = false; // Disable further clicks
    // Keep the board visible and drawn, just show the overlay on top
    draw();
    uiNext.classList.remove('hidden');
}

function nextLevel() {
    // Save current level's attempts
    levelAttempts[level] = currentLevelAttempts;
    totalAttempts += currentLevelAttempts;
    
    if (level < 7) {
        level++;
        currentLevelAttempts = 0; // Reset for new level
        initLevel();
    } else {
        showGameEnd();
    }
}

function showGameEnd() {
    gameState = 'GAME_OVER';
    hideUILayers();
    
    // Display total attempts in span
    const totalAttemptsSpan = document.getElementById('total-attempts');
    totalAttemptsSpan.textContent = totalAttempts;
    
    uiEnd.classList.remove('hidden');
}

function resetGame() {
    level = 1;
    gameState = 'MENU';
    hideUILayers();
    uiStart.classList.remove('hidden');
}

// --- INICIALIZACIÓN ---
loadCardImages().then(() => {
    // Ocultamos pantalla de carga y mostramos la pantalla de inicio
    uiLoading.classList.add('hidden');
    uiStart.classList.remove('hidden');
});

// Export to global scope for HTML onclick handlers
window.startGame = startGame;
window.nextLevel = nextLevel;
window.resetGame = resetGame;
