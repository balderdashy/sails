# Create full site backup --------------------------------------
"Running"
<#cd "D:\home\site\"
If (Test-Path ./wwwroot-backup/){
    "Removing old backup"
    Remove-Item -Path ./wwwroot-backup -Recurse
}

"Creating Full Site Backup"
Rename-Item -path D:\home\site\wwwroot -newName wwwroot-backup
If (Test-Path ./wwwroot-backup/){
    "Backup done"
}
Else {
    "WARNING Backup not created"
}#>

# Unzip --------------------------------------------------------
"Unzipping folder"
cd "D:\home\site\temp"
unzip -d D:\home\site\wwwroot deployment.zip

# NPM
cd "D:\home\site\wwwroot"
"Running npm install (production)"
npm install --production

# Cleanup ------------------------------------------------------
"We're done, cleaning up!"
cd "D:\home\site\temp\"
Remove-Item -Path ./deployment.zip

# Done ---------------------------------------------------------
"All done!"