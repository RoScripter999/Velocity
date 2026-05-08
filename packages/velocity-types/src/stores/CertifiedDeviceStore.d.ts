import { FluxStore } from "..";

export namespace CertifiedDeviceStore {
    export interface Vendor {
        name: string;
        [key: string]: any;
    }

    export interface Model {
        name: string;
        [key: string]: any;
    }

    export interface CertifiedDevice {
        id: string;
        type: string;
        vendor: Vendor;
        model: Model;
        hardwareMute?: boolean;
        echoCancellation?: boolean;
        noiseSuppression?: boolean;
        automaticGainControl?: boolean;
    }
}

export class CertifiedDeviceStore extends FluxStore {
    isCertified(deviceId: string): boolean;
    getCertifiedDevice(deviceId: string): CertifiedDeviceStore.CertifiedDevice | undefined;
    getCertifiedDeviceName(deviceId: string, fallback: string): string;
    getCertifiedDeviceByType(type: string): CertifiedDeviceStore.CertifiedDevice | undefined;
    isHardwareMute(deviceId: string): boolean;
    hasEchoCancellation(deviceId: string): boolean;
    hasNoiseSuppression(deviceId: string): boolean;
    hasAutomaticGainControl(deviceId: string): boolean;
    getVendor(deviceId: string): CertifiedDeviceStore.Vendor | null;
    getModel(deviceId: string): CertifiedDeviceStore.Model | null;
    getRevision(): number;
}
