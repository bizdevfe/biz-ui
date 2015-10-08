#!/bin/sh

#code inspection
jshint ../src
if [ $? -ne 0 ]
  then
    echo "Please solve jshint errors before committing!"
    exit 1
fi

#update version
V="1.0.8"
sed -i "s/v[0-9].[0-9].[0-9]/v$V/" "../src/loader/start.frag"
sed -i "s/v[0-9].[0-9].[0-9]/v$V/" "../src/css/main.css"

#less
lessc ../src/css/theme-custom.less ../src/css/theme-custom.css

#beautify
css-beautify -r ../src/css/*.css
js-beautify -r ../src/*.js
js-beautify -r ../src/*/*.js

#generate documentation
jsduck --config doc-config.json
if [ $? -ne 0 ]
  then
    echo "Please solve jsduck errors before committing!"
    exit 1
fi

#optimize
node r.js -o cssIn=../src/css/main.css out=../dist/jquery.bizui.css
node r.js -o cssIn=../src/css/main.css out=../dist/jquery.bizui.min.css preserveLicenseComments=false optimizeCss=standard
node r.js -o r-config.js out=../dist/jquery.bizui.js optimize=none
node r.js -o r-config.js out=../dist/jquery.bizui.min.js

echo "Congratulations, build done!"