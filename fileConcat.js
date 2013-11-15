var fs = require('fs');


var files = fs.readdirSync('.');


var combined = files.reduce(function (string, fileName) {
    if (fileName.charAt(0) === 'c') {
        console.log(fileName);
        return string + fs.readFileSync(fileName);
    } else {
        return string;
    }
}, '');


fs.writeFileSync('combined.md', combined);

console.log(combined.length);
