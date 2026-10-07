@echo off
title Launch scrcpy Screen Mirror
echo ========================================================
echo   GenCash Mobile Device Mirror (scrcpy)
echo ========================================================
echo Checking ADB Devices...
"E:\Phone simulator\scrcpy-win64-v3.3.4\adb.exe" devices
echo.
echo If device says "unauthorized", check your phone screen and tap "Allow".
echo If no device is listed, reconnect USB and enable USB Debugging.
echo.
echo Launching scrcpy...
"E:\Phone simulator\scrcpy-win64-v3.3.4\scrcpy.exe" --stay-awake --window-title "GenCash Phone Screen"
pause
