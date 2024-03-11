import { IECSEntity, IECSSystem, IECSWorld } from "./ECS";

export class RTSGame {
    //================================================ static
    private static _instance: RTSGame = null;

    public static get instance(): RTSGame {
        RTSGame._instance = (RTSGame._instance || new RTSGame());
        return RTSGame._instance;
    }

    //================================================ instance
    public world: IECSWorld;
    private _time_ms: number = 0;

    /** 初始化游戏世界信息 */
    public start(world: IECSWorld): void {
        this.world = world;
    }

    public update(dt: number): void {
        if (!this.world) {
            return;
        }
        this._time_ms += 1000 * dt;

        //====================== system
        for(let sys of this.world.systems) {
            if (sys.update && !sys.disable) {
                sys.update(dt);
            }
        }

        //====================== entities
        let entities: IECSEntity[] = [];
        for(let ent of this.world.entities) {
            if (!ent.components.unit.dead) {
                entities.push(ent);
            }
        }
        this.world.entities = entities;
    }

    public now(): number {
        return this._time_ms;
    }
}