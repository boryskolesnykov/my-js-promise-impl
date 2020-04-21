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
            if (that.status === STATUS_PENDING) {
                this.registerResolver(this.thenWrapper, taskAction, that, resolve, reject);
            } else {
                this.thenWrapper(taskAction, that, resolve, reject);
            }
        });
    }

    catch(errorAction) {
        const that = this;
        return  new Promise((resolve, reject) => {
            if (that.status === STATUS_PENDING) {
                this.registerResolver(this.catchWrapper, errorAction, that, resolve, reject);
            } else {
                this.catchWrapper(errorAction, that, resolve, reject);
            }
        });
    }

    resolve(value) {
        this.value = value;
        this.status = STATUS_RESOLVED;
        for (const resolver of this.resolvers) {
            resolver.cb(...resolver.args);
        }
    }

    reject(error) {
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
                        this.registerResolver(this.thenWrapper, taskAction, context, resolve, reject);
                        return;
                    }
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
        setTimeout(() => {
            try {
                taskAction(
                    this.innerPromise.resolve.bind(this.innerPromise),
                    this.innerPromise.reject.bind(this.innerPromise));
            } catch (e) {
                this.innerPromise.reject(e);
            }
        });
    }

    then(taskAction) {
        return this.innerPromise.then(taskAction);
    }

    catch(errorAction) {
        return this.innerPromise.catch(errorAction);
    }
}

module.exports = Promise;

