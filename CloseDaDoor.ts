import Mod from "mod/Mod";
import { FacingDirection, DoodadType, ActionType } from "Enums";
import { ITile } from "tile/ITerrain";
import Doodad from "doodad/Doodad";
import { IPlayer, gameMovement } from "player/IPlayer";
import { IDoodad } from "doodad/IDoodad";
import ActionManager from "action/ActionManager";
import { IActionArgument } from "action/IAction";
import { sleep } from "utilities/Async";
import Input from "newui/util/Input";
import WorldRenderer from "renderer/WorldRenderer";
import WorldLayerRenderer from "renderer/WorldLayerRenderer";


enum STORAGE_IDS {
    CLOSING_STATE_ID,
}

enum CLOSING_STATE {
    CLOSING,
    NOT_CLOSING,
}

/**
 * Apparently, going north DECREASES y.
 * This enum models that, assuming that:
 *   - Right  ->  x++;
 *   - Up     ->  y++;
 */
enum DIR_MULT {
    Y = -1,
    X = 1,
}

export default class HelloWorld extends Mod
{
    private _ident = "closeDaDoor"; //identifier to store state in player
    private _author = "HenryFBP";  //who made this mod

    private delay = 200;

    private already_closing = false;

    /**
     * If {v}, log object {o}.
     * @param o Object to be logged.
     * @param v Should we log this?
     */
    private logI(o:any, v:boolean = false)
    {
        return (v ? console.log(o) : null);
    }

    /**
     * Stores a key-value pair in localStorage using JSON.{stringify|parse}().
     * Prefixes keys with the mod identifier to minimize trampling of others' localStorage entries.
     * @param key The key object.
     * @param val The value object.
     */
    private store(key?: any, val?: any, v:boolean = true)
    {
        this.logI(`Key: ${JSON.stringify([this._ident,key])}`,v);
        this.logI(`Val: ${JSON.stringify(val)}`,v);

        localStorage[JSON.stringify([this._ident, key])] = JSON.stringify(val);
    }


    private retrieve(key?: any, v:boolean = true): any | null
    {
        this.logI(`Attempting to retrieve key ${JSON.stringify(key)}...`,v);
        this.logI(`Value retrieved is ${JSON.parse(localStorage.getItem(JSON.stringify(key)))}.`,v);

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
    private isOpenDoor(d: IDoodad | null): boolean
    {
        if(!d) //if doodad does not exist, return false.
        {
            return null;
        }

        let t = d.type;

        switch(t)
        {
            case DoodadType.WoodenDoorOpen:
            case DoodadType.WoodenGateOpen:
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
    private directionToVector(d: FacingDirection) : number[]
    {
        switch(d)
        {
            case FacingDirection.North: return [ 0,  1]; //up
            case FacingDirection.East:  return [ 1,  0]; //right
            case FacingDirection.South: return [ 0, -1]; //down
            case FacingDirection.West:  return [-1,  0]; //left
        }

        return;
    }

    /**
     * Toggles any doodad's open/closed state.
     * @param d The doodad.
     */
    public toggleDoorState(d: IDoodad)
    {
        switch(d.type)
        {
            case DoodadType.WoodenDoor:
                d.changeType(DoodadType.WoodenDoorOpen);
                break;

            case DoodadType.WoodenDoorOpen:
                d.changeType(DoodadType.WoodenDoor);
                break;

            case DoodadType.WoodenGateOpen:
                d.changeType(DoodadType.WoodenGate);
                break;

            case DoodadType.WoodenGate:
                d.changeType(DoodadType.WoodenGateOpen);
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
    private oppositeDirection(d: FacingDirection) : FacingDirection
    {
        switch(d)
        {
            case FacingDirection.North: return FacingDirection.South;
            case FacingDirection.East:  return FacingDirection.West;
            case FacingDirection.South: return FacingDirection.North;
            case FacingDirection.West:  return FacingDirection.East;
        }
        return FacingDirection.None;
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
    private getPositionBehind(x: number, y: number, d: FacingDirection): number[]
    {
        let v = this.directionToVector(d);
        
        return [ x + ( -DIR_MULT.X * v[0] ),
                 y + ( -DIR_MULT.Y * v[1] ) ]; //the offset, but in reverse.
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
    private getTileBehind(x: number, y: number, z: number, d: FacingDirection): ITile
    {
        let pb = this.getPositionBehind(x, y, d);

        return game.getTile(pb[0], pb[1], z);
    }

    /**
     * Attempts to close a door behind a player.
     * Mimicks player actions using ActionManager.
     * 
     * @param p The player.
     */
    private closeThatDoor(p: IPlayer)
    {
        let df = p.facingDirection;
        let db = this.oppositeDirection(df);

        let dfv = this.directionToVector(df);
        let dbv = this.directionToVector(db);

        let aArg180: IActionArgument = { //argument for actionManager.exec(...)
            type: ActionType.Move,
            direction: db, //turn 180,
            point: { //don't move
                x: (p.x),
                y: (p.y),
            },
        };

        let aArgClose: IActionArgument = {
            type: ActionType.CloseDoor,
            direction: df,
            point: {
                x: p.x + dfv[0],
                y: p.x + dfv[1],
            },
        };

        actionManager.execute(p, ActionType.Move, aArg180);
        actionManager.execute(p, ActionType.CloseDoor, aArgClose );

    }

    /**
     * Attempts to close a door behind a player.
     * I don't know how to use actionManager.execute(...) correctly,
     * so this is the 'maximum jank' version of closeThatDoor(...).
     * 
     * Directly modifies player attributes, is blocking, is probably not thread-safe.
     * @param p The player
     */
    private closeThatDoorUnsafe(p: IPlayer)
    {
        let df = p.facingDirection;          //direction forwards
        let db = this.oppositeDirection(df); //direction backwards

        let pp = {x: p.x, y: p.y, z: p.z}; //player's point

        let dfv = this.directionToVector(df); //direction forwards vector
        let dbv = this.directionToVector(db); //direction backwards vector

        let t = game.getTileFromPoint(pp); //tile
        let d = t.doodad;                   //doodad

        this.toggleDoorState(d);            //close the door
        // renderer.renderWorld(d.x, d.y, d.z)
        // renderer.render();
        world.updateTile(d.x, d.y, d.z, t); //show that door gettin closed
        actionManager.execute(p, ActionType.Idle); //idle because this normally will take 1 turn
        game.updateRender = true;


    }

    public onPlayerJoin(p: IPlayer)
    {
        //reset local vars
        this.already_closing = false;
    }

    public onMove(p: IPlayer, nX: number, nY: number, t: ITile, d: FacingDirection): (boolean | undefined)
    {
        // console.log("Current tile: ");
        // console.log(tile);

        // let pb = this.getPositionBehind(nX, nY, d);
        let tb = this.getTileBehind(nX, nY, p.z, d);

        // console.log(`Player position:         [${nX}, ${nY}, ${p.z}].`);
        // console.log(`Position behind player:  [${pb[0]}, ${pb[1]}, ${"z"}]`);

        if(tb.doodad) //if tile behind player has doodad
        {
            console.log("Just got a doodad that's behind us!");
    
            // console.log("Tile's doodad: ");
            // console.log(tb.doodad);
            
            if(this.isOpenDoor(tb.doodad)) //if it's an open door
            {
                console.log(`There is an open door behind us!`);

                //if we're not already closing a door
                if(!this.already_closing)
                {
                    console.log(`We aren't already closing a door. Now we are going to try!`);
                    this.already_closing = true;

                    this.closeThatDoorUnsafe(p);
                }
                else
                {
                    console.log(`We are in the process of closing a door. Not going to try.`);
                }
            }
            else
            {
                this.already_closing = false; //since we're not in front of a door, we can't be closing something.
            }
        }
        else
        {
            this.already_closing = false; //since we're not in front of a doodad, we can't be closing something.
        }

        return undefined;
    }
    
}