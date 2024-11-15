import NFC from "./NFC";
import Pour from "./Pour";
import uuid from 'react-native-uuid';



const POLY_TABLE = [
    0x00, 0x5E, 0xBC, 0xE2, 0x61, 0x3F, 0xDD, 0x83,
    0xC2, 0x9C, 0x7E, 0x20, 0xA3, 0xFD, 0x1F, 0x41,
    0x9D, 0xC3, 0x21, 0x7F, 0xFC, 0xA2, 0x40, 0x1E,
    0x5F, 0x01, 0xE3, 0xBD, 0x3E, 0x60, 0x82, 0xDC,
    0x23, 0x7D, 0x9F, 0xC1, 0x42, 0x1C, 0xFE, 0xA0,
    0xE1, 0xBF, 0x5D, 0x03, 0x80, 0xDE, 0x3C, 0x62,
    0xBE, 0xE0, 0x02, 0x5C, 0xDF, 0x81, 0x63, 0x3D,
    0x7C, 0x22, 0xC0, 0x9E, 0x1D, 0x43, 0xA1, 0xFF,
    0x46, 0x18, 0xFA, 0xA4, 0x27, 0x79, 0x9B, 0xC5,
    0x84, 0xDA, 0x38, 0x66, 0xE5, 0xBB, 0x59, 0x07,
    0xDB, 0x85, 0x67, 0x39, 0xBA, 0xE4, 0x06, 0x58,
    0x19, 0x47, 0xA5, 0xFB, 0x78, 0x26, 0xC4, 0x9A,
    0x65, 0x3B, 0xD9, 0x87, 0x04, 0x5A, 0xB8, 0xE6,
    0xA7, 0xF9, 0x1B, 0x45, 0xC6, 0x98, 0x7A, 0x24,
    0xF8, 0xA6, 0x44, 0x1A, 0x99, 0xC7, 0x25, 0x7B,
    0x3A, 0x64, 0x86, 0xD8, 0x5B, 0x05, 0xE7, 0xB9,
    0x8C, 0xD2, 0x30, 0x6E, 0xED, 0xB3, 0x51, 0x0F,
    0x4E, 0x10, 0xF2, 0xAC, 0x2F, 0x71, 0x93, 0xCD,
    0x11, 0x4F, 0xAD, 0xF3, 0x70, 0x2E, 0xCC, 0x92,
    0xD3, 0x8D, 0x6F, 0x31, 0xB2, 0xEC, 0x0E, 0x50,
    0xAF, 0xF1, 0x13, 0x4D, 0xCE, 0x90, 0x72, 0x2C,
    0x6D, 0x33, 0xD1, 0x8F, 0x0C, 0x52, 0xB0, 0xEE,
    0x32, 0x6C, 0x8E, 0xD0, 0x53, 0x0D, 0xEF, 0xB1,
    0xF0, 0xAE, 0x4C, 0x12, 0x91, 0xCF, 0x2D, 0x73,
    0xCA, 0x94, 0x76, 0x28, 0xAB, 0xF5, 0x17, 0x49,
    0x08, 0x56, 0xB4, 0xEA, 0x69, 0x37, 0xD5, 0x8B,
    0x57, 0x09, 0xEB, 0xB5, 0x36, 0x68, 0x8A, 0xD4,
    0x95, 0xCB, 0x29, 0x77, 0xF4, 0xAA, 0x48, 0x16,
    0xE9, 0xB7, 0x55, 0x0B, 0x88, 0xD6, 0x34, 0x6A,
    0x2B, 0x75, 0x97, 0xC9, 0x4A, 0x14, 0xF6, 0xA8,
    0x74, 0x2A, 0xC8, 0x96, 0x15, 0x4B, 0xA9, 0xF7,
    0xB6, 0xE8, 0x0A, 0x54, 0xD7, 0x89, 0x6B, 0x35,
];

class Recipe {
    public uuid: string = "";
    public title: string = "";
    public xid: string = "";
    private ratio: number = -1;
    private machineRatio: number = 1;
    private dosage: number = 15;
    public grindSize: number = -1;
    public grindRPM: number = 120;
    public pours: Pour[] = [];
    public checksum: number = -1;
    public prefixArray: number[] = [];
    public suffixArray: number[] = [];



    constructor(data?: number[], json?: string) {
        this.uuid = (uuid.v4() as string);
        if (data) {
            this.parseData(data);
            return;
        }
        if (json) {
            var jsonRecipe = JSON.parse(json);
            this.grindRPM = jsonRecipe.grindRPM;
            this.grindSize = jsonRecipe.grindSize;
            if (jsonRecipe.uuid) {
                this.uuid = jsonRecipe.uuid;
            } else {
                this.uuid = (uuid.v4() as string);
            }
            for (let i = 0; i < jsonRecipe.pours.length; i++) {
                if (typeof (jsonRecipe.pours[i]) == 'string') {
                    var pour = JSON.parse(jsonRecipe.pours[i]);
                } else {
                    var pour = jsonRecipe.pours[i];
                }
                if (pour.pauseTime == 256) {
                    pour.pauseTime = 0;
                }
                var p = new Pour(
                    (pour.pourNumber),
                    pour.volume,
                    pour.temperature,
                    pour.flowRate,
                    pour.agitation,
                    pour.pourPattern,
                    pour.pauseTime)
                this.pours.push(p);
            }
            this.prefixArray = jsonRecipe.prefixArray;
            this.suffixArray = jsonRecipe.suffixArray;
            this.ratio = jsonRecipe.ratio;
            this.title = jsonRecipe.title;
            this.xid = jsonRecipe.xid;
            if (jsonRecipe.dosage) {
                this.dosage = jsonRecipe.dosage;
            }
            this.checksum = jsonRecipe.checksum;
        }

    }

    public addPour(pourNumber: number) {
        const newPour = new Pour(pourNumber + 2, 1, 39, 30, 0, 0, 0);
        this.pours.splice(pourNumber + 1, 0, newPour);
        for (let i = 0; i < this.pours.length; i++) {
            this.pours[i].pourNumber = i + 1;
        }


    }

    public setRatio(ratio: number) {
        this.ratio = ratio;
    }

    public getRatio(): number {
        return this.ratio;
    }

    public getMachineRatio(): number {
        if (this.isXPodDosage()) {
            return this.ratio;
        } else {
            return Math.round(this.getTotalVolume() / 15);
        }
        //return this.machineRatio;
    }

    public generateNewUUID() {
        this.uuid = (uuid.v4() as string);
    }

    public isXPodDosage(): boolean {
        return this.dosage == 15;
    }

    public deletePour(pourNumber: number) {
        this.pours.splice(pourNumber, 1);
        for (let i = 0; i < this.pours.length; i++) {
            this.pours[i].pourNumber = i + 1;
        }
    }

    public setDosage(dosage: number) {

        this.dosage = dosage;
    }

    public getDosage(): number {
        return this.dosage;
    }



    public getTotalVolume(): number {

        if (this.isXPodDosage()) {
            return this.dosage * this.ratio
        } else {
            return Math.round((this.dosage * this.ratio) / 15) * 15;
        }

    }

    public getPourTotalVolume(): number {
        let totalVolume = 0;
        for (let pour of this.pours) {
            totalVolume += pour.getVolume();
        }
        return totalVolume;
    }

    public isPourVolumeValid(): boolean {
        return this.getPourTotalVolume() === this.getTotalVolume();
    }



    // Function to calculate CRC-8/MAXIM-DOW
    private calculateCRC(array: number[]): number {
        const crcTable = POLY_TABLE//this.createCrcTable();
        let crc = 0x00; // Initial value for CRC-8/MAXIM-DOW

        array.forEach((byte) => {
            crc = crcTable[(crc ^ byte) & 0xff];
        });

        return crc ^ 0x00; // Final XOR value (reflected output)
    }

    public async writeCard(toastID?: string) {
        console.log("Writing Card");
        var nfc = new NFC();
        try {
            await nfc.init();
            await nfc.open();
            var hash = await nfc.readHash();
            console.log("Read Hash:" + this.convertNumberArrayToHex(hash!));

            if (hash) {
                var data = this.getData(hash);
                console.log(this.convertNumberArrayToHex(data));
                //        var data = [249,24,80,207,4,14,81,85,240,235,57,87,169,254,224,164,137,252,56,196,242,173,180,175,25,224,148,168,125,239,237,40,86,69,82,48,48,57,0,0,40,45,95,2,2,226,0,0,30,50,94,2,2,241,0,0,35,50,93,2,0,244,0,0,35,50,93,1,2,241,0,0,35,45,92,1,2,0,0,0,35,24,16,237,0,244,0,0,35,25,17,130,0,251,0,0,35,23,15,97,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

                await nfc.writeCard(data, toastID);

            }
        } catch (e) {
            throw new Error("Error writing card: " + e);
        } finally {
            await nfc.close();
        }
    }

    public async readCard() {
        console.log('Read Card')
        var nfc = new NFC();
        try {
            await nfc.init();
            await nfc.open();
            var data = await nfc.readCard();
            await nfc.close();
            if (data) {
                console.log(nfc.convertNumberArrayToHex(data));

                this.parseData(data);

                console.log(this.toString());
            } else {
                throw new Error("No data read from card");
            }
        } catch (e) {
            console.log("Error reading card:" + e);
            throw new Error("Error reading card: " + e);
        } finally {
            await nfc.close();
        }
    }

    public getData(prefix: number[]): number[] {
        let data: number[] = [];

        if (prefix && prefix.length > 0) {
            data = data.concat(prefix);
        } else {
            data = data.concat(this.prefixArray);
        }

        data = data.concat(this.convertXIDToData(this.xid));
        data.push(this.pours.length << 3);
        for (let pour of this.pours) {
            data.push(pour.getVolume());
            data.push(pour.getTemperature());
            data.push(pour.getPourPattern());
            data.push(pour.getAgitation());
            if (pour.getPauseTime() == 0) {
                data.push(0x00);
            } else {
                data.push(256 + (0 - pour.getPauseTime()));
            }
            data.push(0);
            data.push(0);
            data.push(pour.getFlowRate());
        }
        data.push(this.grindSize - 40);
        data.push(this.getMachineRatio());
        let checkSum = this.calculateCRC(data);
        console.log("CheckSum:" + this.convertNumberArrayToHex(data));
        console.log("CheckSum:" + checkSum + ":" + this.checksum);
        data.push(checkSum);
        
        data.push(0x00);
        data.push(0x00); //this is usually F4 (but not always), but it doesn't seem to matter 

        //these next two seem open, so writing dosage there
        data.push(0xBB)
        data.push(this.getDosage())
        /*var suffix = [];
        for (let i = 0; i < this.suffixArray.length; i++) {
           suffix[i] = 0;
        }*/
        //data = data.concat(suffix);
        //data = data.concat(this.suffixArray);
        data.splice(0, 32);

        return data
    }

    public convertNumberArrayToHex(array: number[]): string {
        let hexOutput = ''
        for (let i = 0; i < array.length; i++) {
            let hex = array[i].toString(16);
            if (hex.length == 1) {
                hex = '0' + hex;
            }
            hexOutput += "" + hex;
        }
        return hexOutput;
    }

    private convertDataToXID(data: number[]): string {
        let index = data.length - 1
        while (index >= 0) {
            if (data[index] !== 0) {
                break;
            }
            index--;
        }
        return String.fromCharCode(...data.slice(0, index + 1)).trim()
    }

    private convertXIDToData(xid: string): number[] {
        let result: number[] = [];
        if (xid.length > 8) {
            throw new Error("XID must be less than 8 characters")
        } else if (xid.length <= 8) {
            for (let i = 0; i < xid.length; i++) {
                result.push(xid.charCodeAt(i));
            }
            //add padding
            for (let i = xid.length; i < 8; i++) {
                result.push(0);
            }
        }
        return result;
    }


    private parseData(data: number[]) {
        this.prefixArray = data.slice(0, 32);


        this.xid = this.convertDataToXID(data.slice(32, 40));


        let numberOfPours = data[40] >> 3;

        this.suffixArray = data.slice(44 + (numberOfPours * 8), data.length);
       
        this.grindSize = data[41 + (numberOfPours * 8)] + 40
        this.ratio = data[42 + (numberOfPours * 8)]
        this.checksum = data[43 + (numberOfPours * 8)]


        let index = 41;
        let pourNum = 1;

        while (index < 41 + (numberOfPours * 8)) {

            let volume = data[index]
            let temp = data[index + 1]
            let pattern = data[index + 2]
            let agitation = data[index + 3]
            let pause = 256 - data[index + 4]
            let flow = data[index + 7]

            let pour = new Pour(pourNum, volume, temp, flow, agitation, pattern, pause);

            this.pours.push(pour);

            index += 8
            pourNum++;
        }

        //check if its a recipe with a changed dosage made by this application
        let thirdDatum = data[46 + (numberOfPours * 8)]
        if (thirdDatum == 0xBB) {
            this.dosage = data[47 + (numberOfPours * 8)]
            this.ratio = Math.round(this.getPourTotalVolume() / this.dosage);
        }
    }

    public toString(): string {
        return `Recipe: ${this.title}
    XID: ${this.xid}
    Ratio: 1:${this.ratio}
    Grind Size: ${this.grindSize}
    Grind RPM: ${this.grindRPM}
    Pours: ${this.pours.map(pour => pour.toString()).join(", ")}`
    }

}

export default Recipe;