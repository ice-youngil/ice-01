import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { fabric } from 'fabric';

import 'assets/css/SketchHome.css';

const CanvasComponent = forwardRef(({
  selectedTool,
  toolSize,
  image,
  selectedColor,
  onHistoryChange,
}, ref) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [canvasWidth, setCanvasWidth] = useState(0); // 캔버스 너비 상태 관리
  const [canvasHeight, setCanvasHeight] = useState(0); // 캔버스 높이 상태 관리

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
        },{ crossOrigin: 'anonymous' });
      }
    },
    getCanvas: () => canvas, // canvas 객체 반환
    handleZoom: (zoomIn) => {
      if (canvas) {
        const zoomFactor = zoomIn ? 1.1 : 0.95;
        const currentZoom = canvas.getZoom();
        const newZoom = currentZoom * zoomFactor;

        // 캔버스 중심을 기준으로 좌표 변환 적용
        const canvasCenter = new fabric.Point(canvasWidth / 2, canvasHeight / 2);

        // 현재 캔버스의 중심점 좌표 계산
        const centerPointBeforeZoom = fabric.util.transformPoint(canvasCenter, canvas.viewportTransform);

        // 새로운 줌 레벨로 확대/축소 적용
        canvas.zoomToPoint(centerPointBeforeZoom, newZoom);

        // 줌 이후 중심점 좌표를 다시 계산
        const centerPointAfterZoom = fabric.util.transformPoint(canvasCenter, canvas.viewportTransform);

        // 중심이 유지되도록 이동
        const panX = centerPointBeforeZoom.x - centerPointAfterZoom.x;
        const panY = centerPointBeforeZoom.y - centerPointAfterZoom.y;
        canvas.relativePan(new fabric.Point(panX, panY));
      }
    }
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

        const canvasW = imgInstance.width * scaleFactor;
        const canvasH = imgInstance.height * scaleFactor;

        canvasInstance.setWidth(canvasW);
        canvasInstance.setHeight(canvasH);

        imgInstance.scaleToWidth(canvasW);
        imgInstance.scaleToHeight(canvasH);

        canvasInstance.add(imgInstance);
        canvasInstance.sendToBack(imgInstance);

        // 캔버스 크기 상태 업데이트
        setCanvasWidth(canvasW);
        setCanvasHeight(canvasH);

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
      // canvasContainer.style.overflow = 'hidden';
      // canvasContainer.style.display = 'flex';
      // canvasContainer.style.alignItems = 'center';
      // canvasContainer.style.justifyContent = 'center';
      // canvasContainer.style.transformOrigin = 'center center';
    }
  }, [image]);

  return (
    <div className="canvas-window">
      <canvas ref={canvasRef}  />
      {!image && <div className="placeholder">이미지를 불러와 주세요</div>}
    </div>
  );
});

export default CanvasComponent;
