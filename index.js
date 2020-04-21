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

const myPromise = new Promise((res, rej) => {
    setTimeout(() => {
        res(10);
    });
});

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
    .then(() => myPromise)
    .then((ten) => console.log(`Previous promise value: ${ten}`))
    .catch((err) => console.log(`My err: ${err}`));

console.log("Stack out");

// function asyncSubtract(a, b) {
//     return new Promise((resolve, reject) => {
//             resolve(a - b);
//     });
// }
//
// const myPromise = new Promise((res, rej) => {
//     setTimeout(() => {
//         res(10);
//     }, 2000);
// });
//
// asyncSubtract(10, 1)
//     .then(() => myPromise)
//     .then((ten) => console.log(`Previous promise value: ${ten}`));
