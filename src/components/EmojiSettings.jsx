import React, { useState } from 'react';
import EmojiPicker from 'react-emoji-picker';

const EmojiSettings = ({setEmoji}) => {
     
    function handleEmojiSelect(emoji) {
      setEmoji(emoji);
    }
    return (
      <div>
        <EmojiPicker onEmojiSelect={handleEmojiSelect} />
      </div>
    );
  }
  
  export default EmojiSettings;