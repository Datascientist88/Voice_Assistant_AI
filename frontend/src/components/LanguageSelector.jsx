import React, { useState } from "react";
import "./LanguageSelector.css";

const LanguageSelector = ({ selectedLanguage, setSelectedLanguage }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const languages = [
    { code: "en-US", name: "English (US)" },
    { code: "en-GB", name: "English (UK)" },
    { code: "ar-SA", name: "Arabic (Saudi Arabia)" },
    { code: "ar-EG", name: "Arabic (Egypt)" },
    { code: "hi-IN", name: "Hindi (India)" },
    { code: "bn-IN", name: "Bengali (India)" },
    { code: "te-IN", name: "Telugu (India)" },
    { code: "ta-IN", name: "Tamil (India)" },
    { code: "ml-IN", name: "Malayalam (India)" },
    { code: "gu-IN", name: "Gujarati (India)" },
    { code: "kn-IN", name: "Kannada (India)" },
    { code: "mr-IN", name: "Marathi (India)" },
    { code: "pa-IN", name: "Punjabi (India)" },
    { code: "ur-PK", name: "Urdu (Pakistan)" },
    { code: "zh-CN", name: "Chinese (Simplified)" },
    { code: "zh-TW", name: "Chinese (Traditional)" },
    { code: "ja-JP", name: "Japanese" },
    { code: "ko-KR", name: "Korean" },
    { code: "th-TH", name: "Thai (Thailand)" },
    { code: "vi-VN", name: "Vietnamese" },
    { code: "tl-PH", name: "Tagalog (Philippines)" },
    { code: "id-ID", name: "Indonesian" },
    { code: "ms-MY", name: "Malay (Malaysia)" },
    { code: "es-ES", name: "Spanish (Spain)" },
    { code: "es-MX", name: "Spanish (Mexico)" },
    { code: "fr-FR", name: "French (France)" },
    { code: "fr-CA", name: "French (Canada)" },
    { code: "de-DE", name: "German (Germany)" },
    { code: "it-IT", name: "Italian (Italy)" },
    { code: "pt-PT", name: "Portuguese (Portugal)" },
    { code: "pt-BR", name: "Portuguese (Brazil)" },
    { code: "ru-RU", name: "Russian" },
    { code: "uk-UA", name: "Ukrainian" },
    { code: "pl-PL", name: "Polish" },
    { code: "nl-NL", name: "Dutch" },
    { code: "tr-TR", name: "Turkish" },
    { code: "ro-RO", name: "Romanian" },
    { code: "sv-SE", name: "Swedish" },
    { code: "da-DK", name: "Danish" },
    { code: "no-NO", name: "Norwegian" },
    { code: "fi-FI", name: "Finnish" },
    { code: "cs-CZ", name: "Czech" },
    { code: "sk-SK", name: "Slovak" },
    { code: "el-GR", name: "Greek" },
    { code: "hu-HU", name: "Hungarian" },
    { code: "he-IL", name: "Hebrew (Israel)" },
    { code: "fa-IR", name: "Persian (Iran)" },
    { code: "am-ET", name: "Amharic (Ethiopia)" },
    { code: "sw-KE", name: "Swahili (Kenya)" },
    { code: "zu-ZA", name: "Zulu (South Africa)" },
    { code: "xh-ZA", name: "Xhosa (South Africa)" },
    // Add more languages as needed
  ];

  const handleOptionClick = (code) => {
    setSelectedLanguage(code);
    setIsDropdownOpen(false);
  };

  return (
    <div className="select-menu">
      <div
        className="select"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <span>
          {languages.find((lang) => lang.code === selectedLanguage)?.name ||
            "Select Language"}
        </span>
        <i
          className={`fas ${
            isDropdownOpen ? "fa-angle-up" : "fa-angle-down"
          }`}
        ></i>
      </div>
      {isDropdownOpen && (
        <div className="options-list">
          {languages.map((lang) => (
            <div
              key={lang.code}
              className={`option ${
                selectedLanguage === lang.code ? "selected" : ""
              }`}
              onClick={() => handleOptionClick(lang.code)}
            >
              {lang.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;