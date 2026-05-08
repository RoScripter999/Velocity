import { FluxStore } from "..";

export namespace AVErrorStore {
    export enum ErrorType {
        STREAM_FAILED_TO_START = "stream-failed-to-start",
        NO_INPUT_DEVICES = "no-input-devices",
        NO_AUDIO_INPUT_DETECTED = "no-audio-input-detected",
        DEBUG_LOG_UPLOAD_FAILED = "debug-log-upload-failed",
        STREAM_VIEW_LOW_FPS = "stream-view-low-fps",
        STREAM_VIEW_HIGH_PACKET_LOSS = "stream-view-high-packet-loss",
        STREAM_SEND_LOW_FPS = "stream-send-low-encode-fps",
        STREAM_SEND_HIGH_PACKET_LOSS = "stream-send-high-packet-loss",
        STREAM_BAD_NETWORK_QUALITY = "stream-send-network-quality",
        STREAM_SOUNDSHARE_FAILED = "stream-soundshare-failed",
        NOISE_CANCELLER_ERROR = "noise-canceller-error",
        SCREENSHARE_OS_NOT_SUPPORTED = "screenshare-min-os-requirement",
        STREAM_RECONNECTING = "stream-reconnecting",
        VIDEO_DECODE_ERROR = "video-decode-error",
        VIDEO_ENCODE_ERROR = "video-encode-error",
        STREAM_FULL = "stream-full",
        AUDIO_CAPTURE_SAMPLE_RATE_MISMATCH = "audio-capture-sample-rate-mismatch",
        VIDEO_STREAM_SENDER_READY_TIMEOUT = "video-stream-sender-ready-timeout",
        VIDEO_STREAM_RECEIVER_READY_TIMEOUT = "video-stream-receiver-ready-timeout",
        CAMERA_SEND_LOW_FPS = "camera-send-low-encode-fps",
        SCREENSHARE_OS_ERROR = "screenshare-os-error"
    }

    export interface AVError {
        type: ErrorType;
    }
}

export class AVErrorStore extends FluxStore {
    hasActiveErrorOfType(type: string): boolean;
    getActiveErrors(): Map<string, AVErrorStore.AVError>;
    getActiveErrorsOfType(type: string): AVErrorStore.AVError[];
}
