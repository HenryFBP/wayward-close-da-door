import Mod from "mod/Mod";
import { FacingDirection } from "Enums";
import { ITile } from "tile/ITerrain";
import { IPlayer } from "player/IPlayer";
import { IDoodad } from "doodad/IDoodad";
export default class HelloWorld extends Mod {
    private _ident;
    private _author;
    private delay;
    private already_closing;
    /**
     * If {v}, log object {o}.
     * @param o Object to be logged.
     * @param v Should we log this?
     */
    private logI(o, v?);
    /**
     * Stores a key-value pair in localStorage using JSON.{stringify|parse}().
     * Prefixes keys with the mod identifier to minimize trampling of others' localStorage entries.
     * @param key The key object.
     * @param val The value object.
     */
    private store(key?, val?, v?);
    private retrieve(key?, v?);
    /**
     * Return whether or not a door doodad is open.
     *
     * @param d The doodad in question.
     * @returns Null if doodad is null,
     *          false if it isn't an open door,
     *          true if it is an open door.
     */
    private isOpenDoor(d);
    /**
     * Return a 2d vector representing the offset that a facingDirection would apply.
     *
     * @param d The direction.
     * @returns The 2d vector.
     *
     * @example North -> [ 0,  1 ]
     * @example South -> [ 0, -1 ]
     */
    private directionToVector(d);
    /**
     * Toggles any doodad's open/closed state.
     * @param d The doodad.
     */
    toggleDoorState(d: IDoodad): void;
    /**
     * Return the direction opposite to {d}.
     *
     * @param d The direction.
     * @returns The direction opposite to {d}.
     *
     * @example North -> South
     * @example East -> West
     */
    private oppositeDirection(d);
    /**
     * Return the position behind a position and direction.
     *
     * @param x x position.
     * @param y y position.
     * @param d Direction player is facing.
     * @returns The tile behind the player.
     * @example {10, 10, North} -> [10, 11] (y is reversed in the game...idk why.)
     */
    private getPositionBehind(x, y, d);
    /**
     * Return the tile behind a position and direction.
     *
     * @param x x position.
     * @param y y position.
     * @param z z position.
     * @param d Direction at [x, y, z].
     * @returns The tile behind [x, y, z] facing opposite to {d}.
     *
     * @example {10, 10, 1, South} -> {tileAt(10, 11, 1)}
     */
    private getTileBehind(x, y, z, d);
    /**
     * Attempts to close a door behind a player.
     * Mimicks player actions using ActionManager.
     *
     * @param p The player.
     */
    private closeThatDoor(p);
    /**
     * Attempts to close a door behind a player.
     * I don't know how to use actionManager.execute(...) correctly,
     * so this is the 'maximum jank' version of closeThatDoor(...).
     *
     * Directly modifies player attributes, is blocking, is probably not thread-safe.
     * @param p The player
     */
    private closeThatDoorUnsafe(p);
    onPlayerJoin(p: IPlayer): void;
    onMove(p: IPlayer, nX: number, nY: number, t: ITile, d: FacingDirection): (boolean | undefined);
}
