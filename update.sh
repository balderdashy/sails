if [ -z "$1" ]
then
  echo "Please specify the version as an argument.\n"
  exit 0
else
  sed 's/{{sailsVersion}}/'$1'/' package.json.template > package.json
  #todo: use second argument (optional) as commit message and annotated tag message
  git tag "$1"
  git commit -am "Bumped version to $1."
  npm publish --force && git push --tags && git push
fi