declare namespace cc {
    interface Tween<T = any> {
        _group: string;
        group(groupName: string): cc.Tween;
    }

    namespace Tween {
        /**
         * Pause all tween actions.
         */
        function pauseAll(): void;
        /**
         * Resume all tween actions.
         */
        function resumeAll(): void;

        /**
         * Pause tween actions of the target.
         */
        function pauseTarget(target: any): void;
        /**
         * Pause all tween actions of targets.
         */
        function pauseTargets(targets: any[]): void;

        /**
         * Resume tween actions of the target.
         */
        function resumeTarget(target: any): void;
        /**
         * Resume all tween actions of targets.
         */
        function resumeTargets(target: any[]): void;

        /**
         * Pause all tween actions by tag.
         */
        function pauseAllByTag(tag: number): void;
        /**
         * Resume all tween actions by tag.
         */
        function resumeAllByTag(tag: number): void;

        /**
         * Stop all tween actions by group.
         */
        function stopAllByGroup(group: string): void;

        function delay(duration: number, opts?: { tag?: number; group?: string }): Promise<void>;
        
        function delayWithNode(duration: number, node: cc.Node, opts?: { tag?: number; group?: string }): Promise<void>;
    }
}
