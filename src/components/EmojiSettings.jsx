import React from 'react';
import Picker from 'emoji-picker-react';

// ======================= css ===============================
import 'assets/css/ToolSettings.css';

const EmojiSettings = ({
  onAddEmoji,
  setEmojiUrl,
  closeSettings
}) => {
  const handleSelectEmoji = (emojiObject) => {
    setEmojiUrl(emojiObject.imageUrl)
    onAddEmoji({
      url: emojiObject.imageUrl
    })
  };

  return (
    <div className="emoji-settings">
      <Picker onEmojiClick={handleSelectEmoji} theme="auto"/>
      <button className="close-button" onClick={closeSettings}>
        닫기
      </button>
    </div>
  );
};

export default EmojiSettings;
