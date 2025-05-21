(function($){ // IIFE

    // --- Constantes del Juego ---
    const ITEM_HEIGHT = 90; // <-- !! VALOR CORRECTO SEGÚN CSS !!
    const INITIAL_SPIN_DURATION_BASE = 1500;
    const INITIAL_SPIN_DURATION_RANDOM = 1000;
    const STOP_DURATION = 800;
    const NUDGE_DURATION = 150;
    const POINTS_PER_WIN = 15;
    const COST_PER_NUDGE = 1;
    const INITIAL_CREDITS = 15;
    const FEEDBACK_DELAY_CORRECT = 2000;
    const FEEDBACK_DELAY_INCORRECT = 3000;
    const ILLUMINATION_INTERVAL = 500;

    // --- Datos Base ---
    const basePronouns = [ ["yo"], ["tú"], ["vos"], ["él", "ella"], ["nosotros", "nosotras"], ["vosotros", "vosotras"], ["ellos", "ellas"] ];

    // --- Datos Ruedas Dinámicos ---
    let displayPronouns = []; let displayVerbForms = []; let displayRandomWords = [];
    let wheelData = [displayPronouns, displayVerbForms, displayRandomWords];

    // --- Variables de Estado ---
    let credits = INITIAL_CREDITS;
    let currentWheelIndex = [-1, -1, -1];
    let isInitialSpinning = false;
    let isGameOver = false;
    let currentTense = 'present';
    let highScore = 0;
    let illuminationTimer = null;
    let currentLitButtonIndex = 0;
    let $controlButtons = [];
    let isMuted = false;

    // --- Traducciones ---
    const tenseTranslations = { present: 'presente', past: 'pasado', future: 'futuro' };

    // --- Funciones del Juego ---

    function loadHighScore() { const savedScore = localStorage.getItem('verbMachineHighScore'); highScore = savedScore ? parseInt(savedScore, 10) : 0; console.log("Récord cargado:", highScore); }
    function saveHighScore() { localStorage.setItem('verbMachineHighScore', highScore.toString()); console.log("Récord guardado:", highScore); }
    function checkAndUpdateHighScore() { if (credits > highScore) { highScore = credits; console.log("¡Nuevo récord!", highScore); saveHighScore(); $('#slot-record').css({transform: 'scale(1.2)', color: '#FFF'}).animate({transform: 'scale(1)', color: '#FFD700'}, 500); } }
    function loadMuteState() { const savedMute = localStorage.getItem('verbMachineMuted'); isMuted = savedMute === 'true'; console.log("Estado silencio cargado:", isMuted); updateMuteButtonVisuals(); }
    function saveMuteState() { localStorage.setItem('verbMachineMuted', isMuted.toString()); console.log("Estado silencio guardado:", isMuted); }
    function updateMuteButtonVisuals() { const $muteButton = $('#muteButton'); if (isMuted) { $muteButton.text('🔇').addClass('muted').attr('title', 'Activar Sonido'); } else { $muteButton.text('🔊').removeClass('muted').attr('title', 'Silenciar'); } }
    function toggleMute() { isMuted = !isMuted; updateMuteButtonVisuals(); saveMuteState(); console.log("Mute toggled:", isMuted); }

    function updateUI() {
        $('#slot-credits-current').text(credits); $('#slot-record').text(highScore);
        const canNudge = credits >= COST_PER_NUDGE && !isInitialSpinning && !isGameOver;
        const canConfirm = !isInitialSpinning && !isGameOver;
        $('#spinWheel1').prop('disabled', !canNudge); $('#spinWheel2').prop('disabled', !canNudge); $('#spinWheel3').prop('disabled', !canNudge);
        $('#confirmButton').prop('disabled', !canConfirm);
        $('input[name="tense"]').prop('disabled', isInitialSpinning);
        $('#resetButton').prop('disabled', isInitialSpinning && !isGameOver);
        if (isGameOver) { $('#feedback').text('¡JUEGO TERMINADO! Pulsa Reiniciar.'); if(illuminationTimer) clearInterval(illuminationTimer); $('.control-button').removeClass('illuminated'); $('#resetButton').prop('disabled', false); }
    }

    function gameOver() { console.log("Game Over"); checkAndUpdateHighScore(); stopButtonIllumination(); isGameOver = true; updateUI(); }
    function addCredits(amount) { const startCredits = credits; const endCredits = Math.max(0, startCredits + amount); credits = endCredits; console.log(`Créditos: ${startCredits} -> ${endCredits}`); $('#slot-credits-current').prop('Counter', startCredits).animate({ Counter: endCredits }, { duration: 500, easing: 'swing', step: function (now) { $(this).text(Math.ceil(now)); }, complete: function() { $(this).text(credits); checkAndUpdateHighScore(); updateUI(); }}); }
    function populateWheelsForTense() { console.log(`Poblando ${currentTense}`); if (typeof correctPhrasesData === 'undefined' || !correctPhrasesData[currentTense] || correctPhrasesData[currentTense].length === 0) { console.error(`Error: Datos no encontrados para "${currentTense}".`); wheelData = [[], [], []]; populateWheelHTML(1, []); populateWheelHTML(2, []); populateWheelHTML(3, []); $('#feedback').text(`Error: Faltan frases (${currentTense})`); $('#spinWheel1, #spinWheel2, #spinWheel3, #confirmButton').prop('disabled', true); return; } const correct = correctPhrasesData[currentTense]; let p = [...new Set(correct.map(x => x[0]))]; let v = [...new Set(correct.map(x => x[1]))]; let w = [...new Set(correct.map(x => x[2]))]; const addDist = (t, pool, c) => { const u = [...new Set(pool)]; const d = u.filter(i => !t.includes(i)).sort(() => .5-Math.random()).slice(0, c); return [...t, ...d].sort(() => .5-Math.random()); }; let allP = []; basePronouns.forEach(x => allP.push(x[Math.floor(Math.random()*x.length)])); displayPronouns = [...new Set(allP)].sort(() => .5-Math.random()); const allV = Object.values(correctPhrasesData).flat().map(x => x[1]); displayVerbForms = addDist(v, allV, 5); const allW = Object.values(correctPhrasesData).flat().map(x => x[2]); displayRandomWords = addDist(w, allW, 5); wheelData = [displayPronouns, displayVerbForms, displayRandomWords]; populateWheelHTML(1, displayPronouns); populateWheelHTML(2, displayVerbForms); populateWheelHTML(3, displayRandomWords); }

     function initialSpinAllWheels() {
        if (isGameOver) return; console.log("Realizando giro inicial automático...");
        isInitialSpinning = true; updateUI(); const translatedTense = tenseTranslations[currentTense] || currentTense; $('#feedback').text(`Preparando ronda (${translatedTense})...`).removeClass('correct incorrect'); let wheelsCompletedSpin = 0; const totalWheels = 3;
        playSound('audioSpin');
        for (let i = 0; i < totalWheels; i++) {
            const wheelNum = i + 1; const $wheelItems = $(`#wheel${wheelNum} .items`);
            const dataArray = wheelData[i]; const numItems = dataArray.length;
            if (numItems === 0) { console.warn(`Rueda ${wheelNum} vacía.`); wheelsCompletedSpin++; if (wheelsCompletedSpin === totalWheels) { isInitialSpinning = false; updateUI(); startButtonIllumination(); } continue; }
            const finalIndex = Math.floor(Math.random() * numItems); currentWheelIndex[i] = finalIndex;
            const finalPosition = -(finalIndex * ITEM_HEIGHT);
            const totalContentHeight = $wheelItems.height(); // Altura total del contenido con repeticiones
            // --- CORRECCIÓN AQUÍ ---
            // Se usaba itemsArray.length que no está definido en este scope. Usar numItems.
            const currentPosition = parseInt($wheelItems.css('top'), 10) || -(numItems * ITEM_HEIGHT);
            // --- FIN CORRECCIÓN ---
            const minVisualRotations = 2; const targetPosition = finalPosition - (minVisualRotations * totalContentHeight) - (Math.random() * numItems * ITEM_HEIGHT);
            const duration = INITIAL_SPIN_DURATION_BASE + Math.random() * INITIAL_SPIN_DURATION_RANDOM;
            console.log(`Rueda ${wheelNum}: Índice final ${finalIndex} (${dataArray[finalIndex] || 'N/A'}), Pos ${finalPosition}, Anim hasta ${targetPosition}`);
            $wheelItems.stop(true, false).css('top', currentPosition + 'px').animate({ top: targetPosition }, { duration: duration, easing: 'linear',
                    complete: function() {
                        $wheelItems.animate({ top: finalPosition }, { duration: STOP_DURATION, easing: 'elasticOut',
                            complete: function() {
                                console.log(`Rueda ${wheelNum} parada.`); wheelsCompletedSpin++;
                                if (wheelsCompletedSpin === totalWheels) {
                                    console.log("Giro inicial completado.");
                                    isInitialSpinning = false;
                                    $('#feedback').text("¡Listo! Ajusta las ruedas o confirma.");
                                    updateUI();
                                    startButtonIllumination();
                                }
                            }}); }}); }
    }

    function nudgeWheel(wheelNum) { if (isInitialSpinning || credits < COST_PER_NUDGE || isGameOver) return; playSound('audioNudge'); console.log(`Nudge R${wheelNum}`); addCredits(-COST_PER_NUDGE); const idx = wheelNum - 1; const data = wheelData[idx]; const num = data.length; if (num === 0) return; currentWheelIndex[idx] = (currentWheelIndex[idx] + 1) % num; const newIdx = currentWheelIndex[idx]; const newPos = -(newIdx * ITEM_HEIGHT); const $items = $(`#wheel${wheelNum} .items`); console.log(`  Idx ${newIdx} (${data[newIdx] || 'N/A'}), Pos ${newPos}`); $items.stop(true, false).animate({ top: newPos }, NUDGE_DURATION, 'swing'); $('#feedback').text("¡Listo!").removeClass('correct incorrect'); }
    function confirmSelection() { if (isInitialSpinning || isGameOver) return; if (currentWheelIndex.some(idx => idx < 0) || !wheelData[0] || currentWheelIndex[0] >= wheelData[0].length || !wheelData[1] || currentWheelIndex[1] >= wheelData[1].length || !wheelData[2] || currentWheelIndex[2] >= wheelData[2].length) { console.error("Índices inválidos.", currentWheelIndex, wheelData); $('#feedback').text("Error."); return; } const p = wheelData[0][currentWheelIndex[0]]; const v = wheelData[1][currentWheelIndex[1]]; const w = wheelData[2][currentWheelIndex[2]]; const currentArr = [p, v, w]; console.log(`Confirmando [${currentTense}]: ${currentArr.join(' ')}`); stopButtonIllumination(); isInitialSpinning = true; updateUI(); const isOk = correctPhrasesData[currentTense].some(ok => ok.length === 3 && ok[0] === p && ok[1] === v && ok[2] === w ); let msg = ""; if (isOk) { msg = `¡Correcto! "${currentArr.join(' ')}". +${POINTS_PER_WIN} créditos`; playSound('audioWin'); addCredits(POINTS_PER_WIN); } else { const transTense = tenseTranslations[currentTense] || currentTense; msg = `Incorrecto (${transTense}).`; playSound('audioLose'); } $('#feedback').text(msg).removeClass('correct incorrect').addClass(isOk ? 'correct' : 'incorrect'); setTimeout(() => { if (credits <= 0) { playSound('audioGameOver'); gameOver(); } else { initialSpinAllWheels(); } }, isOk ? FEEDBACK_DELAY_CORRECT : FEEDBACK_DELAY_INCORRECT); }
    function populateWheelHTML(wheelNum, items) { const $items = $(`#wheel${wheelNum} .items`); $items.empty(); const reps = 5; if (!items || items.length === 0) { console.warn(`Rueda ${wheelNum} sin items.`); $('<span></span>').addClass('item').text('-').appendTo($items); $items.css('height', ITEM_HEIGHT + 'px'); return; } for (let r = 0; r < reps; r++) { items.forEach(t => { $('<span></span>').addClass('item').text(t).appendTo($items); }); } $items.css('height', items.length * reps * ITEM_HEIGHT + 'px'); const initPos = -(items.length * ITEM_HEIGHT); $items.css('top', initPos + 'px'); if(currentWheelIndex[wheelNum-1] >= items.length || currentWheelIndex[wheelNum-1] < 0) { currentWheelIndex[wheelNum-1] = 0; } }
    function handleTenseChange() { if (isInitialSpinning) { $(`input[name="tense"][value="${currentTense}"]`).prop('checked', true); return; } currentTense = $('input[name="tense"]:checked').val(); console.log(`Tiempo: ${currentTense}`); populateWheelsForTense(); initialSpinAllWheels(); }
    function playSound(id) { if (isMuted) return; const el = document.getElementById(id); if (el) { el.pause(); el.currentTime = 0; el.play().catch(e => { console.warn(`Error audio #${id}:`, e); }); } else { console.warn(`Audio ID "${id}" no encontrado.`); } }
    function resetGame() { if (isInitialSpinning) return; console.log("Reiniciando..."); playSound('audioReset'); stopButtonIllumination(); isGameOver = false; credits = INITIAL_CREDITS; currentTense = 'present'; $('input[name="tense"][value="present"]').prop('checked', true); populateWheelsForTense(); updateUI(); initialSpinAllWheels(); }
    function startButtonIllumination() { if (illuminationTimer) clearInterval(illuminationTimer); $controlButtons = [$('#spinWheel1'), $('#spinWheel2'), $('#spinWheel3'), $('#confirmButton'), $('#resetButton')]; currentLitButtonIndex = 0; illuminationTimer = setInterval(() => { if (isGameOver) { stopButtonIllumination(); return; } $controlButtons.forEach($btn => $btn.removeClass('illuminated')); if ($controlButtons[currentLitButtonIndex] && !$controlButtons[currentLitButtonIndex].prop('disabled')) { $controlButtons[currentLitButtonIndex].addClass('illuminated'); } currentLitButtonIndex = (currentLitButtonIndex + 1) % $controlButtons.length; }, ILLUMINATION_INTERVAL); }
    function stopButtonIllumination() { if (illuminationTimer) { clearInterval(illuminationTimer); illuminationTimer = null; } if($controlButtons.length > 0) { $controlButtons.forEach($btn => $btn.removeClass('illuminated')); } }

    // --- Inicialización ---
    function init() { console.log("Init..."); loadHighScore(); loadMuteState(); currentTense = $('input[name="tense"]:checked').val(); populateWheelsForTense(); $('#spinWheel1').on('click', () => nudgeWheel(1)); $('#spinWheel2').on('click', () => nudgeWheel(2)); $('#spinWheel3').on('click', () => nudgeWheel(3)); $('#confirmButton').on('click', confirmSelection); $('#resetButton').on('click', resetGame); $('#muteButton').on('click', toggleMute); $('input[name="tense"]').on('change', handleTenseChange); credits = INITIAL_CREDITS; isGameOver = false; updateUI(); initialSpinAllWheels(); console.log("¡Listo!"); }

    // --- jQuery Easing ---
    $.extend($.easing,{ bounceOut: function (x, t, b, c, d){if((t/=d) < (1/2.75)){return c*(7.5625*t*t) + b;} else if(t < (2/2.75)){return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;} else if(t < (2.5/2.75)){return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;} else {return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;}}, easeOut: function (x, t, b, c, d){return -c *(t/=d)*(t-2) + b;}, elasticOut: function (x, t, b, c, d) {var s=1.70158;var p=0;var a=c;if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;if (a < Math.abs(c)) { a=c; var s=p/4; }else var s = p/(2*Math.PI) * Math.asin (c/a);return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;}});

    // --- Ejecutar Init ---
    $(document).ready(init);

})(jQuery);
