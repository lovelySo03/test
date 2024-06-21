const canvasElement = document.getElementById('drawArea');
const context = canvasElement.getContext('2d');
const colorPickerElement = document.getElementById('colorPicker');
const eraserButtonElement = document.getElementById('eraserButton');
const colorButtonsElements = document.querySelectorAll('.colorButton');
const lineWidthInputElement = document.getElementById('lineWidthInput');
const colorOptionsElement = document.getElementById('colorOptions');
const undoButtonElement = document.getElementById('undoButton'); 

let isPainting = false;
let isErasing = false;
let undoStack = [];

// 캔버스의 초기 크기 설정
const canvasWidth = window.innerWidth;
const canvasHeight = window.innerHeight;
canvasElement.width = canvasWidth;
canvasElement.height = canvasHeight;

context.lineJoin = 'round';
context.lineCap = 'round';
context.strokeStyle = '#000000';

function startDrawing(e) {
    isPainting = true;
    const rect = canvasElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    drawStartIndicator(x, y);
    context.beginPath(); // 마우스를 움직일 때마다 새로운 경로를 시작해야 함
    context.moveTo(x, y); // 현재 위치를 시작점으로 설정
}

function endDrawing() {
    isPainting = false;
    undoStack.push(canvasElement.toDataURL());
}

function draw(e) {
    if (!isPainting) return;
    const rect = canvasElement.getBoundingClientRect();
    let x, y;

    // 모바일에서는 터치 이벤트 사용
    if (e.touches) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }

    if (isErasing) {
        context.strokeStyle = '#ffffff';
        context.lineWidth = 150; // 지우개 두께 설정
    } else {
        context.strokeStyle = colorPickerElement.value;
        context.lineWidth = parseInt(lineWidthInputElement.value);
    }

    context.lineTo(x, y);
    context.stroke();
}

canvasElement.addEventListener('mousedown', startDrawing);
canvasElement.addEventListener('mouseup', endDrawing);
canvasElement.addEventListener('mousemove', draw);

// 모바일에서는 터치 이벤트 사용
canvasElement.addEventListener('touchstart', function(e) {
    e.preventDefault(); // 기본 터치 이벤트 동작 방지
    startDrawing(e.touches[0]);
});
canvasElement.addEventListener('touchmove', function(e) {
    e.preventDefault(); // 기본 터치 이벤트 동작 방지
    draw(e.touches[0]);
});
canvasElement.addEventListener('touchend', endDrawing);

eraserButtonElement.addEventListener('click', function() {
    isErasing = !isErasing;
    if (isErasing) {
        eraserButtonElement.textContent = '그리기';
    } else {
        eraserButtonElement.textContent = '지우개';
    }
});

colorButtonsElements.forEach(button => {
    button.addEventListener('click', function() {
        context.strokeStyle = button.dataset.color;
        colorPickerElement.value = button.dataset.color;
        isErasing = false;
        eraserButtonElement.textContent = '지우개';
    });
});

undoButtonElement.addEventListener('click', function() {
    if (undoStack.length > 0) {
        const lastImage = new Image();
        lastImage.src = undoStack.pop();
        lastImage.onload = function() {
            context.clearRect(0, 0, canvasElement.width, canvasElement.height);
            context.drawImage(lastImage, 0, 0);
        };
    }
});

const defaultColors = ['#000000', '#ff0000', '#198819', '#0000ff', '#ffa500', '#a52a2a'];
defaultColors.forEach(color => {
    const colorOption = document.createElement('div');
    colorOption.className = 'colorOption';
    colorOption.style.backgroundColor = color;
    colorOption.addEventListener('click', function() {
        colorPickerElement.value = color;
    });
    colorOptionsElement.appendChild(colorOption);
});

function drawStartIndicator(x, y) {
    context.save();
    context.beginPath();
    context.arc(x, y, 5, 0, Math.PI * 2);
    context.fillStyle = '#000';
    context.fill();
    context.restore();
}
