function playFx() {
    document.body.insertAdjacentHTML('beforeend',
        '<div class="fx-bg"></div>' +
        '<div class="ripple-overlay" id="ripple-overlay"><div class="ripple-ring ring1"></div><div class="ripple-ring ring2"></div><div class="ripple-ring ring3"></div></div>' +
        '<div class="crack-overlay" id="crack-overlay">' + buildCrackSVG() + '</div>');

    setTimeout(() => {
        const crack = document.getElementById('crack-overlay');
        if (crack) crack.classList.add('active');
    }, 60);

    setTimeout(() => {
        clearFx();
    }, 1600);
}

function clearFx() {
    ['crack-overlay', 'ripple-overlay', 'fx-bg'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });
}

function buildCrackSVG() {
    const cx = 50, cy = 50;
    let lines = '';
    const spokes = [
        { a: -90, d: 34 }, { a: -55, d: 42 }, { a: -20, d: 30 },
        { a: 15, d: 44 }, { a: 50, d: 36 }, { a: 85, d: 46 },
        { a: 120, d: 33 }, { a: 155, d: 42 }, { a: 190, d: 35 },
        { a: 225, d: 44 }, { a: 260, d: 31 }, { a: 295, d: 40 }, { a: 330, d: 37 }
    ];
    spokes.forEach(s => {
        const rad = s.a * Math.PI / 180;
        const x = cx + Math.cos(rad) * s.d;
        const y = cy + Math.sin(rad) * s.d;
        lines += `<path class="crack-line" d="M${cx},${cy} L${x},${y} M${(cx + x) / 2},${(cy + y) / 2} L${(cx + x) / 2 - 3},${(cy + y) / 2 + 4} M${(cx + x) * 0.7},${(cy + y) * 0.7} L${(cx + x) * 0.7 + 5},${(cy + y) * 0.7 - 3}"/>`;
    });
    const thinBarbs = [
        [58, 42], [62, 55], [45, 60], [40, 40], [55, 65], [48, 30], [65, 48], [35, 55]
    ];
    thinBarbs.forEach(b => {
        lines += `<path class="crack-line thin" d="M${b[0]},${b[1]} L${b[0] - 6},${b[1] - 5} M${b[0] + 2},${b[1]} L${b[0] + 8},${b[1] - 4}"/>`;
    });

    return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">${lines}</svg>`;
}
