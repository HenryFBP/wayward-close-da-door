import { ISerializer } from "save/ISerializer";
export default class Serializer implements ISerializer {
    maxBytes: number;
    private buffer;
    private dataView;
    private byteOffset;
    private object;
    private objectKey;
    private version;
    private skipOnUnserialized;
    constructor(object: any, objectKey: any, version: string, skipOnUnserialized?: boolean);
    saveToString(): string;
    loadToObject(data: string): void;
    readProperty(object: any, key: any): void;
    writeProperty(object: any, key: any): void;
    private getSerializationProperties(object, version);
    private readObject(object, key);
    private readString();
    private readArrayV2(object, key);
    private readArrayBuffer();
    private writeObject(object);
    private writeString(value);
    private writeArrayV2(value);
    private writeArrayBuffer(object);
    private isInteger(nVal);
    private isByteSigned(num);
    private isByteUnsigned(num);
    private isShortSigned(num);
    private isShortUnsigned(num);
    private isIntegerSigned(num);
    private isIntegerUnsigned(num);
}