dt=$(date '+%d/%m/%Y %H:%M:%S');
echo "Build Started: $dt"

npm install
npm run build

cp dist/extension.js extension.js
cp dist/extension.css extension.css

dt=$(date '+%d/%m/%Y %H:%M:%S');
echo "Build Completed: $dt"
