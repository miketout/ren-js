// Modified from web3-core-method

/*
    This file is part of web3.js.

    web3.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    web3.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * @file PromiEvent.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>, Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */

import { EventEmitter } from "events";

export class EventEmitterTyped<
    EventTypes extends { [event: string]: any[] } = {},
> {
    // @ts-ignore no initializer because of proxyHandler
    public readonly emit: <Event extends keyof EventTypes>(
        event: Event,
        ...args: EventTypes[Event]
    ) => boolean; // EventEmitter["emit"]
    // @ts-ignore no initializer because of proxyHandler
    public readonly removeListener: EventEmitter["removeListener"];
    // @ts-ignore no initializer because of proxyHandler
    public readonly on: <Event extends keyof EventTypes>(
        event: Event,
        callback: (...values: EventTypes[Event]) => void | Promise<void>,
    ) => this;
    // @ts-ignore no initializer because of proxyHandler
    public readonly once: <Event extends keyof EventTypes>(
        event: Event,
        callback: (...values: EventTypes[Event]) => void | Promise<void>,
    ) => this;
    // @ts-ignore no initializer because of proxyHandler
    public readonly listenerCount: (event: string | symbol) => number;
}

export class InternalPromiEvent<
    T,
    // eslint-disable-next-line @typescript-eslint/ban-types
    EventTypes extends { [event: string]: any[] } = {},
> extends EventEmitterTyped<EventTypes> {
    public readonly [Symbol.toStringTag]: "Promise";
    public readonly promise: Promise<T>;
    // @ts-ignore no initializer because of proxyHandler
    public resolve: (value: T | PromiseLike<T>) => void;
    // @ts-ignore no initializer because of proxyHandler
    public reject: (reason?: any) => void;
    public eventEmitter: EventEmitter;
    private _cancelled: boolean;

    // @ts-ignore no initializer because of proxyHandler
    public readonly emit: <Event extends keyof EventTypes>(
        event: Event,
        ...args: EventTypes[Event]
    ) => boolean; // EventEmitter["emit"]
    // @ts-ignore no initializer because of proxyHandler
    public readonly removeListener: EventEmitter["removeListener"];
    // @ts-ignore no initializer because of proxyHandler
    public readonly on: <Event extends keyof EventTypes>(
        event: Event,
        callback: (...values: EventTypes[Event]) => void | Promise<void>,
    ) => this;
    // @ts-ignore no initializer because of proxyHandler
    public readonly once: <Event extends keyof EventTypes>(
        event: Event,
        callback: (...values: EventTypes[Event]) => void | Promise<void>,
    ) => this;
    // @ts-ignore no initializer because of proxyHandler
    public readonly listenerCount: (event: string | symbol) => number;
    // @ts-ignore no initializer because of proxyHandler
    public readonly _cancel: () => void;
    // @ts-ignore no initializer because of proxyHandler
    public readonly _resume: () => void;
    // @ts-ignore no initializer because of proxyHandler
    public readonly _isCancelled: () => boolean;
    // @ts-ignore no initializer because of proxyHandler
    public readonly then: Promise<T>["then"];
    // @ts-ignore no initializer because of proxyHandler
    public readonly catch: Promise<T>["catch"];
    // @ts-ignore no initializer because of proxyHandler
    public readonly finally: Promise<T>["finally"];

    /**
     * @constructor
     */
    constructor() {
        super();
        this.promise = new Promise<T>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });

        this._cancelled = false;

        this.eventEmitter = new EventEmitter();

        return new Proxy(this, {
            // eslint-disable-next-line @typescript-eslint/unbound-method
            get: this.proxyHandler,
        });
    }

    /**
     * Proxy handler to call the promise or eventEmitter methods
     */
    public proxyHandler(
        target: PromiEvent<T, EventTypes>,
        name: string,
    ): unknown {
        if (name === "resolve" || name === "reject") {
            // eslint-disable-next-line security/detect-object-injection
            return target[name];
        }

        if (name === "then") {
            return target.promise.then.bind(target.promise);
        }

        if (name === "catch") {
            return target.promise.catch.bind(target.promise);
        }

        if (name === "_cancel") {
            return () => {
                this._cancelled = true;
            };
        }

        if (name === "_isCancelled") {
            return () => this._cancelled === true;
        }

        if (name === "_resume") {
            return () => {
                this._cancelled = false;
            };
        }

        // eslint-disable-next-line security/detect-object-injection, @typescript-eslint/no-unsafe-member-access
        if ((target.eventEmitter as any)[name]) {
            // eslint-disable-next-line security/detect-object-injection, @typescript-eslint/no-unsafe-member-access
            return (target.eventEmitter as any)[name];
        }

        return;
    }
}

// Tell Typescript that InternalPromiEvent<T> implements Promise<T>.
export type PromiEvent<
    T,
    // eslint-disable-next-line @typescript-eslint/ban-types
    EventTypes extends { [event: string]: any[] } = {},
> = InternalPromiEvent<T, EventTypes> & Promise<T>;
export const newPromiEvent = <
    T,
    // eslint-disable-next-line @typescript-eslint/ban-types
    EventTypes extends { [event: string]: any[] } = {},
>() => new InternalPromiEvent<T, EventTypes>() as PromiEvent<T, EventTypes>;
