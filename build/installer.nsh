; 自定义安装程序脚本
!macro customInstall
  ; 检查并关闭正在运行的应用实例
  nsExec::ExecToLog "taskkill /f /im Excel字段转换工具.exe"
  Pop $0
!macroend

!macro customUnInstall
  ; 清理用户数据（可选）
  ; RMDir /r "$APPDATA\excel-transformer"
!macroend

; 自定义页面
!macro customWelcomePage
  ; 可以在这里添加自定义欢迎页面
!macroend

; 压缩设置
SetCompressor /SOLID lzma
SetCompressorDictSize 32 