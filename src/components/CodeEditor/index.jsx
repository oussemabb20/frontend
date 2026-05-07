import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import VuiBox from "components/VuiBox";
import VuiButton from "components/VuiButton";
import VuiTypography from "components/VuiTypography";
import { useVisionUIController } from "context";
import { Card, Select, MenuItem, FormControl, InputLabel, Tooltip } from "@mui/material";
import { IoPlaySharp, IoCodeSlash, IoRefresh } from "react-icons/io5";

const CodeEditor = ({ 
  initialCode = "", 
  language = "javascript",
  onCodeChange,
  onRunCode,
  onLanguageChange,
  readOnly = false,
  height = "500px"
}) => {
  const [controller] = useVisionUIController();
  const { darkMode } = controller;
  const [code, setCode] = useState(initialCode);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const theme = darkMode ? "vs-dark" : "light";

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "csharp", label: "C#" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "typescript", label: "TypeScript" },
  ];

  const handleEditorChange = (value) => {
    setCode(value);
    if (onCodeChange) {
      onCodeChange(value);
    }
  };

  const handleRunCode = () => {
    if (onRunCode) {
      onRunCode(code, selectedLanguage);
    }
  };

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
    if (onLanguageChange) {
      onLanguageChange(event.target.value);
    }
  };

  const handleReset = () => {
    setCode(initialCode);
    if (onCodeChange) {
      onCodeChange(initialCode);
    }
  };

  return (
    <Card sx={{ 
      height: "100%", 
      background: darkMode
        ? "linear-gradient(135deg, rgba(5, 10, 30, 0.97) 0%, rgba(10, 15, 35, 0.95) 50%, rgba(6, 12, 28, 0.97) 100%)"
        : "linear-gradient(135deg, rgba(255, 255, 255, 0.99), rgba(241, 245, 249, 0.96))",
      backdropFilter: "blur(60px)",
      border: darkMode ? "2px solid rgba(0, 117, 255, 0.32)" : "1px solid rgba(148, 163, 184, 0.35)",
      borderRadius: "20px",
      boxShadow: darkMode
        ? "0px 10px 40px rgba(0, 0, 0, 0.7), 0px 0px 80px rgba(0, 117, 255, 0.15)"
        : "0px 10px 30px rgba(15, 23, 42, 0.1)",
      position: "relative",
      overflow: "hidden",
      transition: "all 0.3s ease",
      "&:hover": {
        boxShadow: darkMode
          ? "0px 12px 48px rgba(0, 0, 0, 0.8), 0px 0px 100px rgba(0, 117, 255, 0.2)"
          : "0px 14px 34px rgba(15, 23, 42, 0.14)",
      },
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: "linear-gradient(90deg, #0075ff 0%, #4318ff 50%, #0075ff 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 3s linear infinite",
      },
      "@keyframes shimmer": {
        "0%": { backgroundPosition: "200% 0" },
        "100%": { backgroundPosition: "-200% 0" },
      },
    }}>
      <VuiBox p={2}>
        {/* Editor Controls */}
        <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
          <VuiBox display="flex" gap={2} alignItems="center">
            <IoCodeSlash size="24px" color="#0075ff" style={{ opacity: 0.8 }} />
            <FormControl variant="outlined" sx={{ minWidth: 160 }}>
              <InputLabel sx={{ 
                color: darkMode ? "rgba(255, 255, 255, 0.8)" : "#475569", 
                fontSize: "0.9rem",
                "&.Mui-focused": { color: "#0075ff" },
              }}>Language</InputLabel>
              <Select
                value={selectedLanguage}
                onChange={handleLanguageChange}
                label="Language"
                disabled={readOnly}
                inputProps={{ "aria-label": "Select programming language" }}
                sx={{
                  color: darkMode ? "white !important" : "#0f172a !important",
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  background: darkMode ? "rgba(0, 117, 255, 0.08) !important" : "#ffffff !important",
                  backgroundColor: darkMode ? "rgba(0, 117, 255, 0.08) !important" : "#ffffff !important",
                  borderRadius: "12px",
                  ".MuiOutlinedInput-notchedOutline": { 
                    borderColor: darkMode ? "rgba(0, 117, 255, 0.4)" : "rgba(148, 163, 184, 0.42)",
                    borderWidth: darkMode ? "2px" : "1px",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": { 
                    borderColor: "rgba(0, 117, 255, 0.7)",
                    boxShadow: darkMode ? "0px 0px 15px rgba(0, 117, 255, 0.2)" : "none",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0075ff",
                    boxShadow: darkMode ? "0px 0px 20px rgba(0, 117, 255, 0.3)" : "none",
                  },
                  ".MuiSvgIcon-root": { color: darkMode ? "white" : "#334155", display: "block" },
                  "& .MuiInputBase-root": {
                    backgroundColor: "transparent !important",
                  },
                  "& .MuiSelect-select": {
                    backgroundColor: "transparent !important",
                    color: darkMode ? "white !important" : "#0f172a !important",
                  },
                  transition: "all 0.3s ease",
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      background: darkMode ? "linear-gradient(135deg, #05153f 0%, #072561 100%)" : "#ffffff",
                      border: darkMode ? "2px solid rgba(0, 117, 255, 0.3)" : "1px solid rgba(148, 163, 184, 0.42)",
                      borderRadius: "12px",
                      boxShadow: darkMode
                        ? "0px 10px 40px rgba(0, 0, 0, 0.7), 0px 0px 30px rgba(0, 117, 255, 0.15)"
                        : "0px 8px 24px rgba(15, 23, 42, 0.12)",
                      mt: 1,
                      "& .MuiList-root": {
                        padding: "8px",
                      },
                    },
                  },
                }}
              >
                {languages.map((lang) => (
                  <MenuItem 
                    key={lang.value} 
                    value={lang.value}
                    sx={{
                      color: darkMode ? "rgba(255, 255, 255, 0.85)" : "#0f172a",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      borderRadius: "8px",
                      padding: "10px 16px",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        background: "rgba(0, 117, 255, 0.2)",
                        color: "#fff",
                      },
                      "&.Mui-selected": {
                        background: darkMode ? "rgba(0, 117, 255, 0.3) !important" : "rgba(14, 165, 233, 0.16) !important",
                        color: darkMode ? "#66b3ff !important" : "#0369a1 !important",
                        fontWeight: "600",
                      },
                      "&.Mui-selected:hover": {
                        background: "rgba(0, 117, 255, 0.4) !important",
                      },
                    }}
                  >
                    {lang.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <VuiBox 
              sx={{
                background: darkMode ? "rgba(0, 117, 255, 0.15)" : "rgba(14, 165, 233, 0.14)",
                padding: "8px 16px",
                borderRadius: "10px",
                border: darkMode ? "1px solid rgba(0, 117, 255, 0.3)" : "1px solid rgba(14, 165, 233, 0.35)",
              }}
            >
              <VuiTypography variant="caption" sx={{ 
                color: darkMode ? "#66b3ff" : "#0c4a6e", 
                fontSize: "0.85rem",
                fontWeight: "600",
              }}>
                {code.split("\n").length} lines
              </VuiTypography>
            </VuiBox>
          </VuiBox>

          {!readOnly && (
            <VuiBox display="flex" gap={1.5}>
              <Tooltip title="Reset to default code" arrow placement="top">
                <VuiButton 
                  color="warning"
                  variant="outlined"
                  onClick={handleReset}
                  sx={{ 
                    minWidth: "auto",
                    padding: "10px 12px",
                    borderWidth: "2px",
                    borderColor: "rgba(255, 181, 71, 0.5)",
                    "&:hover": {
                      borderWidth: "2px",
                      borderColor: "#ffb547",
                      background: "rgba(255, 181, 71, 0.15)",
                      transform: "scale(1.05)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <IoRefresh size="18px" />
                </VuiButton>
              </Tooltip>
              <VuiButton 
                color="info" 
                onClick={handleRunCode}
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 1,
                  fontWeight: "bold",
                  background: "linear-gradient(135deg, #0075ff 0%, #0056cc 100%)",
                  boxShadow: "0px 5px 15px rgba(0, 117, 255, 0.4)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #0088ff 0%, #0066dd 100%)",
                    boxShadow: "0px 7px 20px rgba(0, 117, 255, 0.5)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <IoPlaySharp size="16px" />
                Run Code
              </VuiButton>
            </VuiBox>
          )}
        </VuiBox>

        {/* Monaco Editor */}
        <VuiBox
          sx={{
            border: darkMode ? "2px solid rgba(0, 117, 255, 0.3)" : "1px solid rgba(148, 163, 184, 0.4)",
            borderRadius: "15px",
            overflow: "hidden",
            boxShadow: darkMode
              ? "inset 0px 3px 12px rgba(0, 0, 0, 0.4), 0px 2px 15px rgba(0, 117, 255, 0.1)"
              : "0px 2px 12px rgba(15, 23, 42, 0.08)",
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: darkMode
                ? "linear-gradient(90deg, transparent 0%, #0075ff 50%, transparent 100%)"
                : "linear-gradient(90deg, transparent 0%, rgba(14,165,233,0.9) 50%, transparent 100%)",
              opacity: darkMode ? 0.5 : 0.35,
            },
          }}
        >
          <Editor
            height={height}
            language={selectedLanguage}
            value={code}
            onChange={handleEditorChange}
            theme={theme}
            options={{
              readOnly: readOnly,
              minimap: { 
                enabled: true,
                renderCharacters: false,
                showSlider: "always",
              },
              fontSize: 15,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
              fontLigatures: true,
              lineNumbers: "on",
              lineNumbersMinChars: 3,
              glyphMargin: true,
              folding: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: "on",
              formatOnPaste: true,
              formatOnType: true,
              scrollbar: {
                verticalScrollbarSize: 12,
                horizontalScrollbarSize: 12,
                useShadows: true,
              },
              renderLineHighlight: "all",
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: true,
              smoothScrolling: true,
              padding: { top: 16, bottom: 16 },
              bracketPairColorization: {
                enabled: true,
              },
            }}
          />
        </VuiBox>
      </VuiBox>
    </Card>
  );
};

export default CodeEditor;
