const Promise = require('./myasync');

function randomDelay() {
    return (Math.round(Math.random() * 1E4) % 8000) + 1000;
}

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
        const nestedPromise = new Promise((resolve, reject) => {
            resolve(10);
        });
        res(nestedPromise);
    }, randomDelay());
});

const myPromise1 = new Promise((res, rej) => {
    setTimeout(() => {
        const nestedPromise = new Promise((resolve, reject) => {
            resolve(42);
        });
        res(nestedPromise);
    }, randomDelay());
});

const myPromise2 = new Promise((res, rej) => {
    setTimeout(() => {
        const nestedPromise = new Promise((resolve, reject) => {
            resolve(69);
        });
        res(nestedPromise);
    }, randomDelay());
});

Promise.race([myPromise, myPromise1, myPromise2])
    .then((data) => console.log(`${data} wins!`));

Promise.all([myPromise, myPromise1, myPromise2])
    .then((values) => console.log(values));

const myLongLastingPromise = new Promise((res) => {
    setTimeout(() => res(), 6000)
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
    .then(() => myLongLastingPromise)
    .then(() => console.log('After long wait'))
    .catch((err) => console.log(`My err: ${err}`));

console.log("Stack out");

