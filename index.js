const Promise = require('./myasync');

function asyncAdd(a, b) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            setTimeout(() => {
                if (a === 10) {
                    reject("Async add error");
                    return;
                }
                resolve(a + b);
            });
        });
    });
}

asyncAdd(13, 5)
    .then((data) => {
        if (data === 16) {
            throw "Then 1 error";
        }
        console.log(`My data: ${data}`);
        return 45 + data;
    })
    .then((data) => {
        if (data === 62) {
            throw "Then 2 error";
        }
        console.log(`My modified data: ${data + 10}`);
    })
    .catch((err) => console.log(`My err: ${err}`));

console.log("Stack out");
