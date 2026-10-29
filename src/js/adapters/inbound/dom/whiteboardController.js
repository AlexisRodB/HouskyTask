document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('drawing-canvas');
  const container = document.getElementById('canvas-container');
  if (!canvas || !container) return;

  // Añadimos willReadFrequently para optimizar el rendimiento de las figuras geométricas
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  
  let history = [];
  let historyStep = -1;

  function saveState() {
    if (historyStep < history.length - 1) {
      history = history.slice(0, historyStep + 1);
    }
    history.push(canvas.toDataURL());
    historyStep++;
  }

  function resizeCanvas() {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    if (canvas.width > 0 && canvas.height > 0) {
      tempCtx.drawImage(canvas, 0, 0);
    }

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    ctx.fillStyle = '#05070d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (tempCanvas.width > 0) {
      ctx.drawImage(tempCanvas, 0, 0);
    } else {
      saveState();
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Herramientas y estados
  let isDrawing = false;
  let currentTool = 'pen'; // 'pen', 'eraser', 'rect', 'circle', 'line'
  let startX = 0;
  let startY = 0;
  let snapshot = null;

  const penBtn = document.getElementById('tool-pen');
  const eraserBtn = document.getElementById('tool-eraser');
  const shapesDropdownBtn = document.getElementById('shapes-dropdown-btn');
  const shapeOptions = document.querySelectorAll('.shape-option');
  const undoBtn = document.getElementById('undo-btn');
  const colorPicker = document.getElementById('color-picker');
  const brushSizeInput = document.getElementById('brush-size');
  const sizeLabel = document.getElementById('size-label');
  const clearBtn = document.getElementById('clear-canvas-btn');
  const saveBtn = document.getElementById('save-canvas-btn');

  // Botones principales de herramientas básicas
  const baseTools = [penBtn, eraserBtn];

  function setBaseToolActive(activeBtn) {
    baseTools.forEach(b => {
      b.classList.remove('active', 'text-white');
      b.classList.add('text-secondary');
    });
    shapesDropdownBtn.classList.remove('active', 'text-white');
    shapesDropdownBtn.classList.add('text-secondary');
    
    if (activeBtn) {
      activeBtn.classList.add('active', 'text-white');
      activeBtn.classList.remove('text-secondary');
    }
  }

  penBtn.addEventListener('click', () => {
    currentTool = 'pen';
    setBaseToolActive(penBtn);
  });

  eraserBtn.addEventListener('click', () => {
    currentTool = 'eraser';
    setBaseToolActive(eraserBtn);
  });

  // Controlar selección de figuras desde el dropdown
  shapeOptions.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.preventDefault();
      const shape = e.currentTarget.getAttribute('data-shape');
      currentTool = shape; // 'rect', 'circle', o 'line'
      
      // Activar visualmente el botón de formas
      baseTools.forEach(b => {
        b.classList.remove('active', 'text-white');
        b.classList.add('text-secondary');
      });
      shapesDropdownBtn.classList.add('active', 'text-white');
      shapesDropdownBtn.classList.remove('text-secondary');

      const iconClass = shape === 'rect' ? 'bi-square' : shape === 'circle' ? 'bi-circle' : 'bi-slash-lg';
      const shapeName = shape === 'rect' ? 'Cuadrado' : shape === 'circle' ? 'Círculo' : 'Línea';
      shapesDropdownBtn.innerHTML = `<i class="bi ${iconClass}"></i> <span class="small" style="font-size: 0.75rem;">${shapeName}</span>`;
    });
  });

  // Slider de tamaño intuitivo
  brushSizeInput.addEventListener('input', (e) => {
    const val = e.target.value;
    sizeLabel.textContent = `${val}px`;
  });

  function startPosition(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    startX = (e.clientX || e.touches[0].clientX) - rect.left;
    startY = (e.clientY || e.touches[0].clientY) - rect.top;

    if (currentTool === 'pen' || currentTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
    } else {
      // Capturar el canvas antes de empezar a estirar la figura geométrica
      snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
  }

  function draw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.lineWidth = brushSizeInput.value;
    ctx.strokeStyle = currentTool === 'eraser' ? '#05070d' : colorPicker.value;
    ctx.fillStyle = colorPicker.value;

    if (currentTool === 'pen' || currentTool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (snapshot) {
      // Restaurar captura previa para renderizar la figura dinámicamente al arrastrar
      ctx.putImageData(snapshot, 0, 0);

      if (currentTool === 'rect') {
        ctx.strokeRect(startX, startY, x - startX, y - startY);
      } else if (currentTool === 'circle') {
        let radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (currentTool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  }

  function endPosition() {
    if (!isDrawing) return;
    isDrawing = false;
    ctx.beginPath();
    saveState();
  }

  canvas.addEventListener('mousedown', startPosition);
  canvas.addEventListener('mouseup', endPosition);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseleave', endPosition);

  canvas.addEventListener('touchstart', startPosition);
  canvas.addEventListener('touchend', endPosition);
  canvas.addEventListener('touchmove', draw);

  // Deshacer
  function undo() {
    if (historyStep > 0) {
      historyStep--;
      let img = new Image();
      img.src = history[historyStep];
      img.onload = () => {
        ctx.fillStyle = '#05070d';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
    } else if (historyStep === 0) {
      historyStep = -1;
      ctx.fillStyle = '#05070d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  undoBtn.addEventListener('click', undo);

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      undo();
    }
  });

  // Pegar imágenes con Ctrl + V
  window.addEventListener('paste', (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let item of items) {
      if (item.type.indexOf('image') === 0) {
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = function(event) {
          const wrapper = document.createElement('div');
          wrapper.className = 'pasted-image-wrapper';
          wrapper.style.left = '100px';
          wrapper.style.top = '100px';

          const img = document.createElement('img');
          img.src = event.target.result;
          
          img.onload = () => {
            let width = img.naturalWidth;
            let height = img.naturalHeight;
            if (width > 300) {
              height = (300 / width) * height;
              width = 300;
            }
            wrapper.style.width = `${width}px`;
            wrapper.style.height = `${height}px`;
          };

          wrapper.appendChild(img);
          container.appendChild(wrapper);

          let isDraggingImg = false;
          let startXImg, startYImg;

          wrapper.addEventListener('mousedown', (ev) => {
            isDraggingImg = true;
            startXImg = ev.clientX - wrapper.offsetLeft;
            startYImg = ev.clientY - wrapper.offsetTop;
            ev.stopPropagation();
          });

          window.addEventListener('mousemove', (ev) => {
            if (!isDraggingImg) return;
            wrapper.style.left = `${ev.clientX - startXImg}px`;
            wrapper.style.top = `${ev.clientY - startYImg}px`;
          });

          window.addEventListener('mouseup', () => {
            isDraggingImg = false;
          });
        };
        reader.readAsDataURL(blob);
      }
    }
  });

  clearBtn.addEventListener('click', () => {
    if (confirm('¿Limpiar toda la pizarra?')) {
      ctx.fillStyle = '#05070d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      document.querySelectorAll('.pasted-image-wrapper').forEach(el => el.remove());
      saveState();
    }
  });

  saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'houskytask-pizarra-pro.png';
    link.href = canvas.toDataURL();
    link.click();
  });
});