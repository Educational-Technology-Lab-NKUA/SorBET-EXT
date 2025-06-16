
for %%a in (*.json) do (
    copy /b myname.txt + %%a %%a.json
    move "%%a.json" "%%a"
)