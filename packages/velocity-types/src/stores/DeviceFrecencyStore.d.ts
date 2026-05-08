import { FluxStore } from "..";

export namespace DeviceFrecencyStore {
    export interface State {
        audioinput: Array;
        audiooutput: Array;
        videoinput: Array;
    }

    export interface UsageStats {
        duration_input_device_used_ids: string[];
        duration_input_device_used_ms: number[];
        duration_output_device_used_ids: string[];
        duration_output_device_used_ms: number[];
    }
}

export class DeviceFrecencyStore extends FluxStore {
    reset(): void;
    track(deviceType: number, deviceId: string, usageMs: number): void;
    isSampling(deviceType: number): boolean;
    startSampling(deviceType: number): void;
    stopSampling(deviceType: number, oldId?: string): void;
    getState(): DeviceFrecencyStore.State;
    getDeviceIdsSortedByFrecency(deviceType: number): string[];
    getUsageStats(): DeviceFrecencyStore.UsageStats;
}
