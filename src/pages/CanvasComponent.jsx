import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { fabric } from 'fabric';
import 'assets/css/SketchHome.css';

const CanvasComponent2 = forwardRef(({
  selectedTool,
  toolSize,
  image,
  selectedColor,
  onHistoryChange,
}, ref) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);

  useImperativeHandle(ref, () => ({
    clearCanvas: () => {
      if (canvas) {
        canvas.clear();
        if (onHistoryChange) {
          onHistoryChange([]); // 히스토리 초기화
        }
      }
    },
    addText: (textSettings) => {
      if (canvas) {
        const text = new fabric.Textbox(textSettings.text, {
          left: textSettings.left || 50,
          top: textSettings.top || 50,
          fill: textSettings.color || 'black',
          fontSize: textSettings.fontSize || 20,
          fontFamily: textSettings.fontFamily || 'Arial',
        });
        canvas.add(text);
        canvas.renderAll();
        saveHistory();
      }
    },
    addEmoji: (EmojiSettings) => {
      if (canvas) {
        fabric.Image.fromURL(EmojiSettings.url, (img) => {
          canvas.add(img);
          canvas.renderAll();
          saveHistory();
        });
      }
    },
    getCanvas: () => canvas // canvas 객체 반환
  }));

  const saveHistory = useCallback(() => {
    if (canvas && onHistoryChange) {
      const json = canvas.toJSON();
      onHistoryChange(json); // 히스토리 변경 사항을 부모 컴포넌트로 전달
    }
  }, [canvas, onHistoryChange]);

  useEffect(() => {
    if (image) {
      const imgElement = new Image();
      imgElement.crossOrigin = 'anonymous'; // CORS 설정 추가
      imgElement.src = image;
      imgElement.onload = () => {
        // 기존에 캔버스가 있고 DOM 요소가 존재하는지 확인 후 초기화
        if (canvas && canvasRef.current) {
          canvas.dispose();
        }

        const canvasInstance = new fabric.Canvas(canvasRef.current);
        const imgInstance = new fabric.Image(imgElement, {
          selectable: false,
        });

        const maxWidth = window.innerWidth * 0.8; // 최대 너비 (윈도우 크기의 80%)
        const maxHeight = window.innerHeight * 0.8; // 최대 높이 (윈도우 크기의 80%)

        const scaleFactor = Math.min(maxWidth / imgInstance.width, maxHeight / imgInstance.height);

        canvasInstance.setWidth(imgInstance.width * scaleFactor);
        canvasInstance.setHeight(imgInstance.height * scaleFactor);

        imgInstance.scaleToWidth(canvasInstance.width);
        imgInstance.scaleToHeight(canvasInstance.height);

        canvasInstance.add(imgInstance);
        canvasInstance.sendToBack(imgInstance);

        setCanvas(canvasInstance);
        saveHistory(); // 캔버스 초기화 후 히스토리 저장
      };
    }
  }, [image]);

  useEffect(() => {
    if (canvas) {
      // 이전 이벤트 핸들러 제거
      canvas.off('mouse:down');
      canvas.off('mouse:move');
      canvas.off('mouse:up');

      if (selectedTool === 'pen') {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = toolSize;
        canvas.freeDrawingBrush.color = selectedColor;
      } else if (selectedTool === 'panning') {
        // 패닝 기능 활성화
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.defaultCursor = 'grab';

        let panning = false;
        const handleMouseDown = () => {
          panning = true;
          canvas.defaultCursor = 'grabbing';
        };
        const handleMouseMove = (event) => {
          if (panning) {
            const delta = new fabric.Point(event.e.movementX, event.e.movementY);
            canvas.relativePan(delta);
          }
        };
        const handleMouseUp = () => {
          panning = false;
          canvas.defaultCursor = 'grab';
        };

        canvas.on('mouse:down', handleMouseDown);
        canvas.on('mouse:move', handleMouseMove);
        canvas.on('mouse:up', handleMouseUp);
      } else {
        canvas.isDrawingMode = false;
        canvas.selection = true;
        canvas.defaultCursor = 'default';
      }
    }
  }, [selectedTool, toolSize, selectedColor, canvas]);

  useEffect(() => {
    if (canvas) {
      const saveOnEvent = () => saveHistory();

      canvas.on('object:added', saveOnEvent);
      canvas.on('object:modified', saveOnEvent);
      canvas.on('path:created', saveOnEvent);

      return () => {
        canvas.off('object:added', saveOnEvent);
        canvas.off('object:modified', saveOnEvent);
        canvas.off('path:created', saveOnEvent);
      };
    }
  }, [canvas, saveHistory]);

  useEffect(() => {
    const canvasContainer = document.querySelector('.canvas-container');

    if (image && canvasContainer) {
      canvasContainer.style.position = 'relative';
      canvasContainer.style.overflow = 'hidden';
      canvasContainer.style.display = 'flex';
      canvasContainer.style.alignItems = 'center';
      canvasContainer.style.justifyContent = 'center';
      canvasContainer.style.transformOrigin = 'center center';
    }
  }, [image]);

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} className={image ? 'active-canvas' : 'inactive-canvas'} />
      {!image && <div className="placeholder">이미지를 불러와 주세요</div>}
    </div>
  );
});

export default CanvasComponent2;
