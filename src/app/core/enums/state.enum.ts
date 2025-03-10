export enum EState {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    DELETED = 'DELETED',
    CREATED = 'CREATED',
    ARCHIVED = 'ARCHIVED',
}

export enum ETargetingStatus {
    PENDING = 'PENDING',
    FINISHED = 'FINISHED',
    NOT_STARTED = 'NOT_STARTED',
    RUNNING = 'RUNNING',
    FAILED = 'FAILED',
}

export enum EOtherStatus {
    APPROVED = 'APPROVED',
    CANCELLED = 'CANCELLED',
    LOCKED = 'LOCKED',
}

export enum EBooleanState {
    YES = 'YES',
    NO = 'NO',
}
