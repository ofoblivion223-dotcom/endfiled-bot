Set WshShell = CreateObject("WScript.Shell")
' Botのフォルダパスを指定
WshShell.CurrentDirectory = "C:\Users\owner\.gemini\antigravity\playground\holographic-cluster"
' 黒い画面（ターミナル）を出さずに実行 (0 = invisible)
WshShell.Run "node index.js", 0, false
