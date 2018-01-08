define(["require", "exports", "mod/Mod", "Enums"], function (require, exports, Mod_1, Enums_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var STORAGE_IDS;
    (function (STORAGE_IDS) {
        STORAGE_IDS[STORAGE_IDS["CLOSING_STATE_ID"] = 0] = "CLOSING_STATE_ID";
    })(STORAGE_IDS || (STORAGE_IDS = {}));
    var CLOSING_STATE;
    (function (CLOSING_STATE) {
        CLOSING_STATE[CLOSING_STATE["CLOSING"] = 0] = "CLOSING";
        CLOSING_STATE[CLOSING_STATE["NOT_CLOSING"] = 1] = "NOT_CLOSING";
    })(CLOSING_STATE || (CLOSING_STATE = {}));
    /**
     * Apparently, going north DECREASES y.
     * This enum models that, assuming that:
     *   - Right  ->  x++;
     *   - Up     ->  y++;
     */
    var DIR_MULT;
    (function (DIR_MULT) {
        DIR_MULT[DIR_MULT["Y"] = -1] = "Y";
        DIR_MULT[DIR_MULT["X"] = 1] = "X";
    })(DIR_MULT || (DIR_MULT = {}));
    class HelloWorld extends Mod_1.default {
        constructor() {
            super(...arguments);
            this._ident = "closeDaDoor"; //identifier to store state in player
            this._author = "HenryFBP"; //who made this mod
            this.delay = 200;
            this.already_closing = false;
        }
        /**
         * If {v}, log object {o}.
         * @param o Object to be logged.
         * @param v Should we log this?
         */
        logI(o, v = false) {
            return (v ? console.log(o) : null);
        }
        /**
         * Stores a key-value pair in localStorage using JSON.{stringify|parse}().
         * Prefixes keys with the mod identifier to minimize trampling of others' localStorage entries.
         * @param key The key object.
         * @param val The value object.
         */
        store(key, val, v = true) {
            this.logI(`Key: ${JSON.stringify([this._ident, key])}`, v);
            this.logI(`Val: ${JSON.stringify(val)}`, v);
            localStorage[JSON.stringify([this._ident, key])] = JSON.stringify(val);
        }
        retrieve(key, v = true) {
            this.logI(`Attempting to retrieve key ${JSON.stringify(key)}...`, v);
            this.logI(`Value retrieved is ${JSON.parse(localStorage.getItem(JSON.stringify(key)))}.`, v);
            return JSON.parse(localStorage.getItem(JSON.stringify(key)));
        }
        /**
         * Return whether or not a door doodad is open.
         *
         * @param d The doodad in question.
         * @returns Null if doodad is null,
         *          false if it isn't an open door,
         *          true if it is an open door.
         */
        isOpenDoor(d) {
            if (!d) {
                return null;
            }
            let t = d.type;
            switch (t) {
                case Enums_1.DoodadType.WoodenDoorOpen:
                case Enums_1.DoodadType.WoodenGateOpen:
                    return true;
            }
            return false;
        }
        /**
         * Return a 2d vector representing the offset that a facingDirection would apply.
         *
         * @param d The direction.
         * @returns The 2d vector.
         *
         * @example North -> [ 0,  1 ]
         * @example South -> [ 0, -1 ]
         */
        directionToVector(d) {
            switch (d) {
                case Enums_1.FacingDirection.North: return [0, 1]; //up
                case Enums_1.FacingDirection.East: return [1, 0]; //right
                case Enums_1.FacingDirection.South: return [0, -1]; //down
                case Enums_1.FacingDirection.West: return [-1, 0]; //left
            }
            return;
        }
        /**
         * Toggles any doodad's open/closed state.
         * @param d The doodad.
         */
        toggleDoorState(d) {
            switch (d.type) {
                case Enums_1.DoodadType.WoodenDoor:
                    d.changeType(Enums_1.DoodadType.WoodenDoorOpen);
                    break;
                case Enums_1.DoodadType.WoodenDoorOpen:
                    d.changeType(Enums_1.DoodadType.WoodenDoor);
                    break;
                case Enums_1.DoodadType.WoodenGateOpen:
                    d.changeType(Enums_1.DoodadType.WoodenGate);
                    break;
                case Enums_1.DoodadType.WoodenGate:
                    d.changeType(Enums_1.DoodadType.WoodenGateOpen);
                    break;
            }
            // d.update();
            // game.updateView(true);
            // game.updateRender = true;
        }
        /**
         * Return the direction opposite to {d}.
         *
         * @param d The direction.
         * @returns The direction opposite to {d}.
         *
         * @example North -> South
         * @example East -> West
         */
        oppositeDirection(d) {
            switch (d) {
                case Enums_1.FacingDirection.North: return Enums_1.FacingDirection.South;
                case Enums_1.FacingDirection.East: return Enums_1.FacingDirection.West;
                case Enums_1.FacingDirection.South: return Enums_1.FacingDirection.North;
                case Enums_1.FacingDirection.West: return Enums_1.FacingDirection.East;
            }
            return Enums_1.FacingDirection.None;
        }
        /**
         * Return the position behind a position and direction.
         *
         * @param x x position.
         * @param y y position.
         * @param d Direction player is facing.
         * @returns The tile behind the player.
         * @example {10, 10, North} -> [10, 11] (y is reversed in the game...idk why.)
         */
        getPositionBehind(x, y, d) {
            let v = this.directionToVector(d);
            return [x + (-DIR_MULT.X * v[0]),
                y + (-DIR_MULT.Y * v[1])]; //the offset, but in reverse.
        }
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
        getTileBehind(x, y, z, d) {
            let pb = this.getPositionBehind(x, y, d);
            return game.getTile(pb[0], pb[1], z);
        }
        /**
         * Attempts to close a door behind a player.
         * Mimicks player actions using ActionManager.
         *
         * @param p The player.
         */
        closeThatDoor(p) {
            let df = p.facingDirection;
            let db = this.oppositeDirection(df);
            let dfv = this.directionToVector(df);
            let dbv = this.directionToVector(db);
            let aArg180 = {
                type: Enums_1.ActionType.Move,
                direction: db,
                point: {
                    x: (p.x),
                    y: (p.y),
                },
            };
            let aArgClose = {
                type: Enums_1.ActionType.CloseDoor,
                direction: df,
                point: {
                    x: p.x + dfv[0],
                    y: p.x + dfv[1],
                },
            };
            actionManager.execute(p, Enums_1.ActionType.Move, aArg180);
            actionManager.execute(p, Enums_1.ActionType.CloseDoor, aArgClose);
        }
        /**
         * Attempts to close a door behind a player.
         * I don't know how to use actionManager.execute(...) correctly,
         * so this is the 'maximum jank' version of closeThatDoor(...).
         *
         * Directly modifies player attributes, is blocking, is probably not thread-safe.
         * @param p The player
         */
        closeThatDoorUnsafe(p) {
            let df = p.facingDirection; //direction forwards
            let db = this.oppositeDirection(df); //direction backwards
            let pp = { x: p.x, y: p.y, z: p.z }; //player's point
            let dfv = this.directionToVector(df); //direction forwards vector
            let dbv = this.directionToVector(db); //direction backwards vector
            let t = game.getTileFromPoint(pp); //tile
            let d = t.doodad; //doodad
            this.toggleDoorState(d); //close the door
            // renderer.renderWorld(d.x, d.y, d.z)
            // renderer.render();
            world.updateTile(d.x, d.y, d.z, t); //show that door gettin closed
            actionManager.execute(p, Enums_1.ActionType.Idle); //idle because this normally will take 1 turn
            game.updateRender = true;
        }
        onPlayerJoin(p) {
            //reset local vars
            this.already_closing = false;
        }
        onMove(p, nX, nY, t, d) {
            // console.log("Current tile: ");
            // console.log(tile);
            // let pb = this.getPositionBehind(nX, nY, d);
            let tb = this.getTileBehind(nX, nY, p.z, d);
            // console.log(`Player position:         [${nX}, ${nY}, ${p.z}].`);
            // console.log(`Position behind player:  [${pb[0]}, ${pb[1]}, ${"z"}]`);
            if (tb.doodad) {
                console.log("Just got a doodad that's behind us!");
                // console.log("Tile's doodad: ");
                // console.log(tb.doodad);
                if (this.isOpenDoor(tb.doodad)) {
                    console.log(`There is an open door behind us!`);
                    //if we're not already closing a door
                    if (!this.already_closing) {
                        console.log(`We aren't already closing a door. Now we are going to try!`);
                        this.already_closing = true;
                        this.closeThatDoorUnsafe(p);
                    }
                    else {
                        console.log(`We are in the process of closing a door. Not going to try.`);
                    }
                }
                else {
                    this.already_closing = false; //since we're not in front of a door, we can't be closing something.
                }
            }
            else {
                this.already_closing = false; //since we're not in front of a doodad, we can't be closing something.
            }
            return undefined;
        }
    }
    exports.default = HelloWorld;
});
//# sourceMappingURL=CloseDaDoor.js.map