import React from 'react';
import Picker from 'emoji-picker-react';
import twemoji from 'twemoji';
import 'assets/css/ToolSettings.css';

const EmojiSettings = ({
  onAddEmoji,
  selectedTool,
  showEmojiPicker,
  closeSettings,
  addEmojiToCanvas,
  setEmojiUrl
}) => {
  const handleSelectEmoji = (emojiObject) => {
  
    console.log('Selected Emoji Object:', emojiObject); // 로그로 구조 확인
    console.log('Selected Emoji Object emojhi:', emojiObject.imageUrl);
    setEmojiUrl(emojiObject.imageUrl)
    

    closeSettings(); // 이모지 선택 후 설정 창 닫기
    onAddEmoji({
      url: emojiObject.imageUrl
    })
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
