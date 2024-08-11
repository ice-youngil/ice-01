import React from 'react';
import Picker from 'emoji-picker-react';
import 'assets/css/ToolSettings.css';

const EmojiSettings = ({
  onAddEmoji,
  selectedTool,
  showEmojiPicker,
  closeSettings,
  setEmojiUrl
}) => {
  const handleSelectEmoji = (emojiObject) => {
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
          <button className="cancel-button" onClick={closeSettings}>
          닫기 </button>
        </div>
      )}
    </div>
  );
};

export default EmojiSettings;
