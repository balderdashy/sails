# Create full site backup --------------------------------------
"Running"
cd "D:\home\site\wwwroot"
"Removing old site"
Remove-Item -Path ./* -Recurse

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