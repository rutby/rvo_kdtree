import { KdTreeSimple } from "../KdTreeSimple";

export interface IECSSystem {
    update?(dt: number): void;

    disable?: boolean;
    name:string,
}

export interface IECSEntity {
    uuid: number;
    id: number;

    components: { 
        unit: IRTSComponentUnit,
    },
}

export interface IECSWorld {
    systems?: IECSSystem[];
    entities?: IECSEntity[];

    kdTree?: KdTreeSimple,
}

export interface IECSRule {
    buildWorld(): IECSWorld;
}

//================================================ 
export interface IRTSComponentUnit {

	/** 对应的唯一ID */
	uuid: number;

	/** 对应的单位配置ID */
	id: number;

	/** 交互半径 */
	radius?: number;
	/** 高度 */
	height?: number;

	/** 视野半径 (缺省时, 表示无限大) */
	viewRadius?: number;

	/** 生命值上限 */
	lifeMax?: number;

	/** 当前生命值 */
	life?: number;

	/** 是否已经死亡 */
	dead: boolean;
	

	/** 等级 */
	level?: number;
	//----

	/** 移除时间 */
	removeTime?: number;

	/** 显示配置 */
	displaySetting?: string;

	/** 缩放大小 */
	displayScale?: number;

	/** 死亡或者命中动画配置 */
	deadDisplaySetting?: string;

	/** 死亡音效 或者命中音效 */
	deadSound?: string,

	/** 根源单位 用来统计是谁创建的 */
	root?: IECSEntity,

	/** 基础攻击力 */
	damage?: number,

	/** MobControl - 当前朝向 */
	curDirect?: number,
	/** MobControl - 最终朝向 */
	dstDirect?: number,
}

