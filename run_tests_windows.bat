@echo off
echo Compiling program...
g++ {{SOLUTION_NAME}} -o output.exe
echo Compilation finished.
if "{{SAMPLE_LEN}}"=="0" (
    output < {{SAMPLE_DIR_NAME}}\input0.txt > output0.txt
    fc output0.txt {{SAMPLE_DIR_NAME}}\output0.txt > nul
    if errorlevel 1 (
        echo Failed test 0 :^^O
        echo Expected output:
        type {{SAMPLE_DIR_NAME}}\output0.txt
        echo.
        echo Recieved:
        type output0.txt
        echo.
    ) else (
        echo Passed test 0 :^^D
    )
    del output0.txt
) else (
    if not exist {{TEMP_DIR_NAME}} mkdir {{TEMP_DIR_NAME}}
    for /L %%i in (0, 1, {{SAMPLE_LEN}}) do (
        output < {{SAMPLE_DIR_NAME}}\input%%~ni.txt > {{TEMP_DIR_NAME}}\output%%~ni.txt
        fc {{SAMPLE_DIR_NAME}}\output%%~ni.txt {{TEMP_DIR_NAME}}\output%%~ni.txt > nul
        if errorlevel 1 (
            echo Failed test %%i :^^O
            echo Expected:
            type {{SAMPLE_DIR_NAME}}\output%%~ni.txt
            echo.
            echo Recieved:
            type {{TEMP_DIR_NAME}}\output%%~ni.txt
            echo.
        ) else (
            echo Passed test %%i :^^D
        )
    )
    rmdir /S /F /Q {{TEMP_DIR_NAME}}
)