import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { fabric } from 'fabric';
import 'assets/css/SketchHome.css';

const CanvasComponent2 = forwardRef(({
  selectedTool,
  toolSize,
  image,
  selectedColor,
  onHistoryChange,
  emojiUrl
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
        console.log("element", EmojiSettings.url);
        fabric.Image.fromURL(EmojiSettings.url, (img) => {
          canvas.add(img);
          canvas.renderAll();
          saveHistory();
        });
      }
    },
    getCanvas: () => canvas // 여기서 canvas 객체 반환
  }));

  const saveHistory = useCallback(() => {
    if (canvas && onHistoryChange) {
      const json = canvas.toJSON();
      onHistoryChange(json); // 히스토리 변경 사항을 부모 컴포넌트로 전달
    }
  }, [canvas, onHistoryChange]);

  useEffect(() => {
    if (image && !canvas) {
      const imgElement = new Image();
      imgElement.src = image;
      imgElement.onload = () => {
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
        saveHistory();
      };
    }
  }, [image, canvas]);

  useEffect(() => {
    if (canvas) {
      if (selectedTool === 'pen') {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = toolSize;
        canvas.freeDrawingBrush.color = selectedColor;
      } else {
        canvas.isDrawingMode = false;
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

  // 이 부분은 수정하지 않음
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
      <button>adfsdfasdfasdf</button>
    </div>
  );
});

export default CanvasComponent2;
