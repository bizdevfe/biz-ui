#!/bin/sh

#Code inspection
jshint ../src
if [ $? -ne 0 ]
  then
    echo -e "\033[0;31mPlease solve jshint errors before committing! \033[0m"
    read -p "Press any key to exit."
    exit  1
fi
echo -e "\033[0;32mCode inspection pass! \033[0m"

#Less compiling
lessc ../src/css/theme-custom.less ../src/css/theme-custom.css
echo -e "\033[0;32mLess compiling done! \033[0m"

#Beautify
css-beautify -r ../src/css/*.css
js-beautify -r ../src/*.js
js-beautify -r ../src/*/*.js
echo -e "\033[0;32mBeautify done! \033[0m"

#API generating
jsduck --config doc-config.json
if [ $? -ne 0 ]
  then
    echo -e "\033[0;31mPlease solve jsduck errors before committing! \033[0m"
    read -p "Press any key to continue."
fi
echo -e "\033[0;32mAPI generating done! \033[0m"

#Version updating
V="1.2.0"
sed -i "s/v[0-9].[0-9].[0-9]/v$V/" "../src/wrapper/start.frag"
sed -i "s/v[0-9].[0-9].[0-9]/v$V/" "../src/css/main.css"
sed -i "s/bizui.version\s=\s'[0-9].[0-9].[0-9]'/bizui.version = '$V'/" "../src/bizui.js"
sed -i "s/\"version\":\s\"[0-9].[0-9].[0-9]\"/\"version\": \"$V\"/" "../package.json"
echo -e "\033[0;32mVersion updating done! \033[0m"

#Optimizing
node ../node_modules/requirejs/bin/r.js -o cssIn=../src/css/main.css out=../dist/jquery.bizui.css
node ../node_modules/requirejs/bin/r.js -o cssIn=../src/css/main.css out=../dist/jquery.bizui.min.css preserveLicenseComments=false optimizeCss=standard
echo -e "\033[0;32mCSS Optimizing done! \033[0m"
node ../node_modules/requirejs/bin/r.js -o r-config.js out=../dist/jquery.bizui.js optimize=none
node ../node_modules/requirejs/bin/r.js -o r-config.js out=../dist/jquery.bizui.min.js
echo -e "\033[0;32mJS Optimizing done! \033[0m"

echo -e "\033[0;32mCongratulations, build done! \033[0m"

read -p "Press any key to exit."
exit  1