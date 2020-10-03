cd /d %~dp0

:LOOP
    deno run -A ./client_a5.js
goto :LOOP
