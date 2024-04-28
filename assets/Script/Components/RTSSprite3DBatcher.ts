/* eslint-disable eqeqeq */
/* eslint-disable max-lines-per-function */

export class RTSSingleton {
    private static _instance: any;
    public static getInstance<T>(): T {
        if (!this._instance) {
            this._instance = new this();
        }

        return this._instance;
    };
    
    public static destroyInstance() {
        this._instance = null;
    }
}

export enum RTSSprite3DBatchType {
	Army,
	Projectile,
}

export default class RTSSprite3DBatcher extends RTSSingleton {
	private _pool: any = {};

	public addItem(type: RTSSprite3DBatchType, idx: number, model: any) {
		this._pool[type] = this._pool[type] || {};
		this._pool[type][idx] = model;
		// console.log('[RTSSprite3DBatcher] ========', 'addItem', type, idx);
	}

	public rmItem(type: RTSSprite3DBatchType, idx: number) {
		this._pool[type] = this._pool[type] || {};
		delete this._pool[type][idx];
		// console.log('[RTSSprite3DBatcher] ========', 'rmItem', type, idx);
	}

	public items(type: RTSSprite3DBatchType): any {
		return this._pool[type] || {};
	}

	public clear(): void {
		this._pool = {};
	}

	private _idx: number = 0;
	public getIdx(): number {
		return this._idx++;
	}
}