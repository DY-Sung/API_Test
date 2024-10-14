declare namespace cc {
    interface Action {
        group: string;
        getGroup(): string;
        setGroup(group: string): void;
    }

    namespace Action {}
}
