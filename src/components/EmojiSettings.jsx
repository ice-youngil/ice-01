import React from 'react';
import Picker from 'emoji-picker-react';
import twemoji from 'twemoji';
import 'assets/css/ToolSettings.css';

const EmojiSettings = ({
  selectedTool,
  showEmojiPicker,
  closeSettings,
  addEmojiToCanvas
}) => {
  const handleSelectEmoji = (event, emojiObject) => {
  
    console.log('Selected Emoji Object:', emojiObject); // 로그로 구조 확인
    console.log('Selected Emoji Object emojhi:', emojiObject.emoji);
    
    if (addEmojiToCanvas && emojiObject && emojiObject.emoji) {
      try {
        console.log("aa", emojiObject.emoji)
        // Twemoji를 사용해 이모지를 이미지 URL로 변환
        const emojiHtml = twemoji.parse(emojiObject.emoji);
        const emojiImg = new DOMParser().parseFromString(emojiHtml, 'text/html').querySelector('img');
        const emojiUrl = emojiImg.src;

        console.log("aba", emojiImg.src)

        // 변환된 이모지 URL을 캔버스에 추가
        addEmojiToCanvas(emojiUrl);
      } catch (error) {
        console.error("Error processing emoji:", error);
      }
    }
    closeSettings(); // 이모지 선택 후 설정 창 닫기
  };

  return (
    <div className="emoji-settings">
      {selectedTool === 'emoji' && showEmojiPicker && (
        <div className="emoji-picker-container">
          <Picker onEmojiClick={handleSelectEmoji} />
        </div>
      )}
    </div>
  );
};

export default EmojiSettings;
