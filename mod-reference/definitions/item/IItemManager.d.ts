import { IDoodad } from "doodad/IDoodad";
import { CraftStatus, IItemTypeGroup, ItemQuality, ItemType, ItemTypeGroup, RequirementInfo, SentenceCaseStyle, WeightType } from "Enums";
import { ContainerReference, IContainable, IContainer, IItem, IItemArray, IItemDescription } from "IItem";
import { Message } from "language/Messages";
import { IPlayer } from "player/IPlayer";
import { ITile } from "tile/ITerrain";
export interface IItemManager {
    addToContainerInternal(item: IItem, container: IContainer, movingMultiple: boolean, skipMessage?: boolean): void;
    breakContainerOnTile(itemContainer: IItem, x: number, y: number, z: number): void;
    checkMilestones(player: IPlayer, item: IItem): void;
    computeContainerWeight(container: IContainer): number;
    countItemsInContainer(container: IContainer, itemTypeSearch: ItemType, ignoreItem?: IItem): number;
    countItemsInContainerByGroup(container: IContainer, itemTypeGroupSearch: ItemTypeGroup | IItemTypeGroup, ignoreItem?: IItem): number;
    craft(player: IPlayer, itemType: ItemType, itemsToRequire: IItemArray, itemsToConsume: IItemArray, baseItem?: IItem): CraftStatus;
    create(itemType: ItemType, container: IContainer, quality?: ItemQuality, fake?: boolean): IItem;
    createFake(itemType: ItemType, quality?: ItemQuality): IItem;
    decayItems(): boolean;
    derefenceContainerReference(containerRef: ContainerReference): object | undefined;
    getContainerReference(container: IContainer, parentObject?: any): ContainerReference;
    getDefaultDurability(): number;
    getDefaultItemFromItemGroup(itemGroup: ItemTypeGroup): ItemType;
    getDisassemblyComponents(description: IItemDescription, quality: ItemQuality | undefined): IItemArray;
    getDisassemblyComponentsAsItemTypes(description: IItemDescription): Array<ItemType | ItemTypeGroup | IItemTypeGroup>;
    getItemInContainer(container: IContainer, itemTypeSearch: ItemType, ignoreItem?: IItem): IItem | undefined;
    generateLookups(): void;
    getItemInContainerByGroup(container: IContainer, itemTypeGroupSearch: ItemTypeGroup, ignoreItemId?: number, excludeProtectedItems?: boolean): IItem | undefined;
    getItemInInventoryByGroup(player: IPlayer, itemTypeGroupSearch: ItemTypeGroup, ignoreItemId?: number, excludeProtectedItems?: boolean): IItem | undefined;
    getItemsInContainer(container: IContainer, includeSubContainers?: boolean, excludeProtectedItems?: boolean): IItemArray;
    getItemsInContainerByGroup(container: IContainer, itemGroup: ItemTypeGroup, includeSubContainers?: boolean, excludeProtectedItems?: boolean): IItemArray;
    getItemsInContainerByType(container: IContainer, itemType: ItemType, includeSubContainers?: boolean, excludeProtectedItems?: boolean): IItemArray;
    getItemsString(items: IItemArray): string;
    getItemTypeGroupName(itemType: ItemType | ItemTypeGroup | IItemTypeGroup, prefix?: boolean, sentenceCaseStyle?: SentenceCaseStyle): string;
    getOrderedContainerItems(container: IContainer, excludeProtectedItems?: boolean): IItem[];
    getPlayerWithItemInInventory(containable: IContainable): IPlayer | undefined;
    getRandomQuality(itemType: ItemType, bonusQuality?: number): ItemQuality;
    getTileContainer(x: number, y: number, z: number): IContainer;
    getWeight(itemType: ItemType, weightType?: WeightType): number;
    hasAdditionalRequirements(player: IPlayer, craftType: ItemType, message?: Message, faceDoodad?: boolean): RequirementInfo;
    hasRoomInContainer(extraWeight: number, container: IContainer, itemToMove?: IItem): boolean;
    isContainableInContainer(containable: IContainable, container: IContainer): boolean;
    isContainableInAdjacentContainer(player: IPlayer, containable: IContainable): boolean;
    isContainer(obj: IItem | IDoodad | IContainer | ITile): obj is IContainer;
    isInGroup(itemType: ItemType, itemGroup: ItemTypeGroup): boolean;
    isInInventory(containable: IContainable): boolean;
    isItemInContainer(container: IContainer, itemTypeSearch: ItemType, ignoreItem?: IItem): boolean;
    isItemTypeGroup(itemType: (ItemType | ItemTypeGroup)): itemType is ItemTypeGroup;
    isItemTypeInGroup(itemType: ItemType, itemGroupSearch: ItemTypeGroup): boolean;
    isTileContainer(container: IContainer | undefined): boolean;
    loadReferences(): void;
    loadTileReferences(): void;
    moveAllFromContainerToContainer(player: IPlayer | undefined, fromContainer: IContainer, toContainer: IContainer, itemType?: ItemType, ofQuality?: ItemQuality, checkWeight?: boolean, onMoveItem?: (item: IItem) => void): void;
    moveAllFromContainerToInventory(player: IPlayer, container: IContainer, ofQuality?: ItemQuality): void;
    moveToContainer(player: IPlayer | undefined, item: IItem, container: IContainer): void;
    placeItemsAroundLocation(container: IContainer, x: number, y: number, z: number, skipMessage?: boolean): void;
    reduceDismantleWeight(createdItems: IItemArray, itemWeight: number, mod?: number): void;
    remove(item: IItem): void;
    removeContainerItems(container: IContainer): void;
    resetMapsInContainer(container: IContainer): void;
    saveTileReferences(): void;
    spawn(itemTypes: ItemType[] | undefined, x: number, y: number, z: number): void;
    updateItemOrder(container: IContainer, itemOrder: number[] | undefined): void;
    getQualityBasedOnSkill(itemQuality: ItemQuality | undefined, skillValue: number, qualityBypass?: boolean): ItemQuality | undefined;
}
export default IItemManager;
