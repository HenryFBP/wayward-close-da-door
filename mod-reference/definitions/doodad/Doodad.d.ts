import { IDoodad, IDoodadDescription, IDoodadDoor, IDoodadOptions, IDoodadTorchType } from "doodad/IDoodad";
import { DoodadType, DoorOrientation, GrowingStage, IInspect, ItemQuality, SentenceCaseStyle } from "Enums";
import { IItemArray } from "item/IItem";
import { Message } from "language/Messages";
import { IPlayer } from "player/IPlayer";
import { IUnserializedCallback } from "save/ISerializer";
import { ITile } from "tile/ITerrain";
export default class Doodad implements IDoodad, Partial<IDoodadDoor>, IUnserializedCallback {
    containedItems: IItemArray;
    decay?: number;
    gatherReady?: boolean;
    gfx?: number;
    id: number;
    itemOrders?: number[];
    maxDur?: number;
    minDur?: number;
    orientation?: DoorOrientation;
    ownerIdentifier?: string;
    quality?: ItemQuality;
    renamed?: string;
    spread?: number;
    torch?: IDoodadTorchType;
    treasure?: boolean;
    type: DoodadType;
    weight?: number;
    weightCapacity: number;
    x: number;
    y: number;
    z: number;
    private _description;
    constructor(type?: DoodadType, x?: number, y?: number, z?: number, options?: IDoodadOptions);
    description(): IDoodadDescription | undefined;
    changeType(doodadType: DoodadType): void;
    isValid(): boolean;
    getTile(): ITile;
    canGrow(): boolean;
    getGrowingStage(): GrowingStage | undefined;
    setGrowingStage(stage: GrowingStage, updateTile?: boolean): void;
    canPickup(player: IPlayer): boolean;
    isReadyToGather(): boolean;
    isGatherable(): boolean;
    isEmbers(): boolean;
    canHarvest(): boolean;
    checkForTrampling(playerOrCreatureId: IPlayer | number): boolean;
    getDurabilityMessage(this: IDoodad): Message;
    getGrowingMessage(textCase: SentenceCaseStyle): string;
    getInspect(): IInspect[];
    damage(forceBreak?: boolean, isTrample?: boolean, skipSound?: boolean): void;
    getDefaultDurability(): number;
    addTreasureChestLoot(): void;
    blocksMove(): boolean;
    update(): void;
    causeStatus(player: IPlayer): void;
    setOffTrap(player?: IPlayer, withMessage?: boolean): void;
    onUnserialized(): void;
}
