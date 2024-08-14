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
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const [history, setHistory] = useState([]); 
  const [redoHistory, setRedoHistory] = useState([]);
  const [undoPerformed, setUndoPerformed] = useState(false); 
  const [isUndoing, setIsUndoing] = useState(false); // undo 중인지 여부를 추적

  useImperativeHandle(ref, () => ({
    clearCanvas: () => {
      if (canvas) {
        canvas.clear();
        setHistory([]);
        setRedoHistory([]);
        if (onHistoryChange) {
          onHistoryChange([]); 
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
        onCanvasChange(); // 히스토리 저장
      }
    },
    addEmoji: (EmojiSettings) => {
      if (canvas) {
        fabric.Image.fromURL(EmojiSettings.url, (img) => {
          canvas.add(img);
          canvas.renderAll();
          onCanvasChange(); // 히스토리 저장
        }, { crossOrigin: 'anonymous' });
      }
    },
    getCanvas: () => canvas, 
    handleZoom: (zoomIn) => {
      if (canvas) {
        const zoomFactor = zoomIn ? 1.1 : 1/1.1;
        const currentZoom = canvas.getZoom();
        const newZoom = currentZoom * zoomFactor;
        const canvasCenter = new fabric.Point(canvasWidth / 2, canvasHeight / 2);
        const centerPointBeforeZoom = fabric.util.transformPoint(canvasCenter, canvas.viewportTransform);
        canvas.zoomToPoint(centerPointBeforeZoom, newZoom);
        const centerPointAfterZoom = fabric.util.transformPoint(canvasCenter, canvas.viewportTransform);
        const panX = centerPointBeforeZoom.x - centerPointAfterZoom.x;
        const panY = centerPointBeforeZoom.y - centerPointAfterZoom.y;
        canvas.relativePan(new fabric.Point(panX, panY));
      }
    },
    undo: () => {
      if (history.length >= 1) {
        const currentState = history[history.length - 1];
        setRedoHistory((prevRedoHistory) => [...prevRedoHistory, currentState]);
        const newHistory = history.slice(0, -1);
        setHistory(newHistory);
        setUndoPerformed(true); // undo 버튼을 눌렀음을 표시
        setIsUndoing(true); // undo 중임을 표시
  
        const lastState = newHistory[newHistory.length - 1];
        if (canvas && lastState) {
          canvas.loadFromJSON(lastState, () => {
            canvas.getObjects('image').forEach((img) => {
              img.set({
                selectable: false,
                evented: false,
              });
            });
            canvas.renderAll();
            setIsUndoing(false); // undo 작업 완료 후 false로 설정
          });
        }
      }
    },
    redo: () => {
      if (redoHistory.length > 0) {
        const redoState = redoHistory[redoHistory.length - 1];
        setRedoHistory(redoHistory.slice(0, -1));
        setHistory((prevHistory) => [...prevHistory, redoState]);
  
        if (canvas) {
          canvas.loadFromJSON(redoState, () => {
            canvas.getObjects('image').forEach((img) => {
              img.set({
                selectable: false,
                evented: false,
              });
            });
            canvas.renderAll();
          });
        }
      }
    }
  }));

  const onCanvasChange = useCallback(() => { //handleSaveHistory
    console.log(canvas);
    console.log(isUndoing)
    if (canvas && !isUndoing) { // undo 중이 아닐 때만 실행
      const json = canvas.toJSON();
      console.log('New history created:', json); // 새로운 히스토리가 생성될 때마다 콘솔에 출력
      setHistory((prevHistory) => [...prevHistory, json]);

      // undoPerformed가 true이고 새로운 히스토리가 추가될 때만 redoHistory 초기화
      if (undoPerformed && history.length > 0) {
        setRedoHistory([]);
        setUndoPerformed(false); // 초기화 후 다시 false로 설정
        setIsUndoing(true);
      }

      if (onHistoryChange) {
        onHistoryChange(json); 
      }
    }
  });

  useEffect(() => {
    if (image) {
      const imgElement = new Image();
      imgElement.crossOrigin = 'anonymous'; 
      imgElement.src = image;
      imgElement.onload = () => {
        if (canvas && canvasRef.current) {
          canvas.dispose();
        }

        const canvasInstance = new fabric.Canvas(canvasRef.current);
        const imgInstance = new fabric.Image(imgElement, {
          selectable: false,
        });

        const maxWidth = window.innerWidth * 0.8;
        const maxHeight = window.innerHeight * 0.8;

        const scaleFactor = Math.min(maxWidth / imgInstance.width, maxHeight / imgInstance.height);

        const canvasW = imgInstance.width * scaleFactor;
        const canvasH = imgInstance.height * scaleFactor;

        canvasInstance.setWidth(canvasW);
        canvasInstance.setHeight(canvasH);

        imgInstance.scaleToWidth(canvasW);
        imgInstance.scaleToHeight(canvasH);

        canvasInstance.add(imgInstance);
        canvasInstance.sendToBack(imgInstance);

        setCanvasWidth(canvasW);
        setCanvasHeight(canvasH);

        setCanvas(canvasInstance);
      };
    }
  }, [image]);

  useEffect(() => {
    if (canvas) {
      canvas.off('mouse:down');
      canvas.off('mouse:move');
      canvas.off('mouse:up');
      canvas.off('touch:down');
      canvas.off('touch:move');
      canvas.off('touch:up');

      if (selectedTool === 'pen') {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = toolSize;
        canvas.freeDrawingBrush.color = selectedColor;
      } else if (selectedTool === 'panning') {
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.defaultCursor = 'grab';

        let panning = false;
        let startX = 0;
        let startY = 0;

        const handlePanStart = (event) => {
          panning = true;
          canvas.defaultCursor = 'grabbing';
          if (event.e.touches) {
            startX = event.e.touches[0].clientX;
            startY = event.e.touches[0].clientY;
          } else {
            startX = event.e.clientX;
            startY = event.e.clientY;
          }
        };

        const handlePanMove = (event) => {
          if (panning) {
            let deltaX, deltaY;
            if (event.e.touches) {
              deltaX = event.e.touches[0].clientX - startX;
              deltaY = event.e.touches[0].clientY - startY;
              startX = event.e.touches[0].clientX;
              startY = event.e.touches[0].clientY;
            } else {
              deltaX = event.e.clientX - startX;
              deltaY = event.e.clientY - startY;
              startX = event.e.clientX;
              startY = event.e.clientY;
            }
            const delta = new fabric.Point(deltaX, deltaY);
            canvas.relativePan(delta);
          }
        };

        const handlePanEnd = () => {
          panning = false;
          canvas.defaultCursor = 'grab';
        };

        canvas.on('mouse:down', handlePanStart);
        canvas.on('mouse:move', handlePanMove);
        canvas.on('mouse:up', handlePanEnd);

        canvas.on('touch:down', handlePanStart);
        canvas.on('touch:move', handlePanMove);
        canvas.on('touch:up', handlePanEnd);
      } else {
        canvas.isDrawingMode = false;
        canvas.selection = true;
        canvas.defaultCursor = 'default';
      }
    }
  }, [selectedTool, toolSize, selectedColor, canvas]);

  useEffect(() => {
    if (canvas) {
      
      const onCanvasChangeWrapper = () => {
        if (!canvas._historySaved) { 
          onCanvasChange(); // 캔버스 상태가 변경될 때마다 히스토리 저장
          canvas._historySaved = true; 
          setTimeout(() => {
            canvas._historySaved = false; 
          }, 0);
        }
      };
    
      canvas.on('object:added', onCanvasChangeWrapper);
      canvas.on('object:modified', onCanvasChangeWrapper);
      canvas.on('path:created', onCanvasChangeWrapper);
    
      return () => {
        canvas.off('object:added', onCanvasChangeWrapper);
        canvas.off('object:modified', onCanvasChangeWrapper);
        canvas.off('path:created', onCanvasChangeWrapper);
      };
    }
  }, [canvas, onCanvasChange]);

  return (
    <div className="canvas-window">
      <canvas ref={canvasRef} className={image ? 'active-canvas' : 'inactive-canvas'} />
      {!image && <div className="placeholder">이미지를 불러와 주세요</div>}
    </div>
  );
});

export default CanvasComponent;
