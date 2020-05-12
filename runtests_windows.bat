@echo off
g++ {{SOLUTION_NAME}} -o output.exe
if "{{SAMPLE_LEN}}"=="0" (
    output < {{SAMPLE_DIR_NAME}}\input0.txt > output0.txt
    fc output0.txt {{SAMPLE_DIR_NAME}}\output0.txt > nul
    if errorlevel 1 (
        echo Failed test 0
        echo Expected output:
        type {{SAMPLE_DIR_NAME}}\output0.txt
        echo.
        echo Recieved:
        type output0.txt
        echo.
    ) else (
        echo Passed test 0
    )
    del output0.txt
) else (
    for /L %%i in (0, 1, {{SAMPLE_LEN}}) do (
        output < {{SAMPLE_DIR_NAME}}\input%%~ni.txt > output%%~ni.txt
        fc output%%~ni.txt {{SAMPLE_DIR_NAME}}\output%%~ni.txt > nul
        if errorlevel 1 (
            echo Failed test %%i
            echo Expected:
            type {{SAMPLE_DIR_NAME}}\output%%~ni.txt
            echo.
            echo Recieved:
            type output%%~ni.txt
            echo.
        ) else (
            echo Passed test %%i
        )
        del output%%~ni.txt
    )
)