# Create full site backup --------------------------------------
"Cleaning folder"
Get-ChildItem -Path 'D:\home\site\wwwroot' -Recurse |
Select -ExpandProperty FullName |
Where {$_ -notlike 'D:\home\site\wwwroot\app_data'} |
sort length -Descending |
Remove-Item -Verbose

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