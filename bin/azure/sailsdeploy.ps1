# Create full site backup --------------------------------------

cd "D:\home\site\"
If (Test-Path ./wwwroot-backup/){
    "Removing old backup"
    Remove-Item -Path ./wwwroot-backup -Recurse
}

"Creating Full Site Backup"
Stop-Process -processname node
Rename-Item -path D:\home\site\wwwroot -newName wwwroot-backup
If (Test-Path ./wwwroot-backup/){
    "Backup done"
}
Else {
    "WARNING Backup not created"
}

# Unzip --------------------------------------------------------
"Unzipping folder"
cd "D:\home\site\temp"
unzip -d D:\home\site\wwwroot sailsdeploy.zip

# NPM
cd "D:\home\site\wwwroot"
"Running npm install (production)"
Stop-Process -processname node
npm install --production

# Cleanup ------------------------------------------------------
"We're done, cleaning up!"
cd "D:\home\site\temp\"
Remove-Item -Path ./sailsdeploy.zip

# Done ---------------------------------------------------------
"All done!"