const STATUS_PENDING = 'PENDING';
const STATUS_RESOLVED = 'RESOLVED';
const STATUS_REJECTED = 'REJECTED';

class InnerPromise {

    constructor() {
        this.value = undefined;
        this.error = undefined;
        this.status = STATUS_PENDING;
        this.resolvers = [];
    }

    then(taskAction) {
        const that = this;
        return  new Promise((resolve, reject) => {
            setTimeout(() => {
                if (that.status === STATUS_PENDING) {
                    that.registerResolver(that.thenWrapper, taskAction, that, resolve, reject);
                } else {
                    that.thenWrapper(taskAction, that, resolve, reject);
                }
            });
        });
    }

    catch(errorAction) {
        const that = this;
        return  new Promise((resolve, reject) => {
            setTimeout(() => {
                if (that.status === STATUS_PENDING) {
                    that.registerResolver(that.catchWrapper, errorAction, that, resolve, reject);
                } else {
                    that.catchWrapper(errorAction, that, resolve, reject);
                }
            });
        });
    }

    resolve(value) {
        if (this.status === STATUS_RESOLVED || this.status === STATUS_REJECTED) {
            return;
        }

        this.value = value;
        this.status = STATUS_RESOLVED;
        for (const resolver of this.resolvers) {
            resolver.cb(...resolver.args);
        }
    }

    reject(error) {
        if (this.status === STATUS_RESOLVED || this.status === STATUS_REJECTED) {
            return;
        }

        this.error = error;
        this.status = STATUS_REJECTED;
        for (const resolver of this.resolvers) {
            resolver.cb(...resolver.args);
        }
    }

    registerResolver(resolver, ...args) {
        this.resolvers.push({
            cb: resolver,
            args
        });
    }

    thenWrapper(taskAction, context, resolve, reject) {
        if (context.status === STATUS_REJECTED) {
            reject(context.error);
        } else if (context.status === STATUS_RESOLVED) {
            try {
                if (context.value instanceof Promise) {
                    const innerPromise = context.value.innerPromise;
                    if (innerPromise.status === STATUS_PENDING) {
                        innerPromise.registerResolver(context.thenWrapper, taskAction, innerPromise, resolve, reject);
                    } else {
                        context.thenWrapper(taskAction, innerPromise, resolve, reject);
                    }
                    return;
                }
                let result = taskAction(context.value);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        }
    }

    catchWrapper(errorAction, context, resolve, reject) {
        if (context.status === STATUS_REJECTED) {
            resolve(errorAction(context.error));
        }
    }
}

class Promise {

    constructor(taskAction) {
        this.innerPromise = new InnerPromise();
        try {
            taskAction(
                this.innerPromise.resolve.bind(this.innerPromise),
                this.innerPromise.reject.bind(this.innerPromise));
        } catch (e) {
            this.innerPromise.reject(e);
        }
    }

    then(taskAction) {
        return this.innerPromise.then(taskAction);
    }

    catch(errorAction) {
        return this.innerPromise.catch(errorAction);
    }

    static resolve() {
        return new Promise(resolve => resolve());
    }

    static reject() {
        return new Promise((resolve, reject) => reject());
    }

    static all(promises) {
        return new Promise((resolve, reject) => {
            try {
                let counter = promises.length;
                const result = [];
                for (let i = 0; i < promises.length; i++) {
                    promises[i].then((data) => {
                        try {
                            result[i] = data;
                            counter--;
                            if (counter === 0) {
                                resolve(result);
                            }
                        } catch (e) {
                            reject(e);
                        }
                    });
                }
            } catch (e) {
                reject(e);
            }
        });
    }

    static race(promises) {
        return new Promise((resolve, reject) => {
            promises.forEach(promise =>
                    promise
                        .then( data => resolve(data) )
                        .catch( error => reject(error) ));
        });
    }
}

module.exports = Promise;

