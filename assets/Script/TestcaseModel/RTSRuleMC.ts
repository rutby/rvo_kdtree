import { IECSRule, IECSWorld } from "./ECS";

export class RTSRuleMC implements IECSRule {
    public buildWorld(): IECSWorld {
        let world: IECSWorld = {
            systems: [],
            entities: [],
        }

        // world.systems.push
        return world;
    }
}