/**
 * This is polyfill plugin for cc.Tween class.
 * This plugin has to be available in web and native, not editor.
 * If you load this plugin in editor, this will change it's engine code.
 */

CC_EDITOR ||
    (function () {
        cc.Tween.prototype.constructor['_tweenID'] = 0;

        cc.Tween.prototype['group'] = function (group) {
            this._group = group;
            return this;
        };

        cc.Tween.constructor.prototype['pauseAll'] = function () {
            cc.director.getActionManager().pauseAllRunningActions();
        };

        cc.Tween.constructor.prototype['resumeAll'] = function () {
            for (let i = 0; i < cc.director.getActionManager()._arrayTargets.length; i++) {
                const element = cc.director.getActionManager()._arrayTargets[i];

                if (element && element.paused) {
                    element.paused = false;
                }
            }
        };

        cc.Tween.constructor.prototype['pauseTarget'] = function (target) {
            cc.director.getActionManager().pauseTarget(target);
        };

        cc.Tween.constructor.prototype['pauseTargets'] = function (targets) {
            cc.director.getActionManager().pauseTargets(targets);
        };

        cc.Tween.constructor.prototype['resumeTarget'] = function (target) {
            cc.director.getActionManager().resumeTarget(target);
        };

        cc.Tween.constructor.prototype['resumeTargets'] = function (targets) {
            cc.director.getActionManager().resumeTargets(targets);
        };

        cc.Tween.constructor.prototype['pauseAllByTag'] = function (tag) {
            if (tag === cc.Action.TAG_INVALID) {
                cc.log('Tween: -1 tag is invalid.');
                return;
            }

            const hashTargets = cc.director.getActionManager()._arrayTargets;
            for (const element of hashTargets) {
                if (element.actions[0].tag === tag) {
                    this.pauseTarget(element.target);
                }
            }
        };

        cc.Tween.constructor.prototype['resumeAllByTag'] = function (tag) {
            if (tag === cc.Action.TAG_INVALID) {
                cc.log('Tween: -1 tag is invalid.');
                return;
            }

            const hashTargets = cc.director.getActionManager()._arrayTargets;
            for (const element of hashTargets) {
                if (element.actions[0].tag === tag) {
                    this.resumeTarget(element.target);
                }
            }
        };

        cc.Tween.constructor.prototype['stopAllByGroup'] = function (group) {
            const hashTargets = cc.director.getActionManager()._arrayTargets;
            for (const element of hashTargets) {
                if (element.actions[0].group === group) {
                    cc.director.getActionManager().removeAction(element.actions[0]);
                }
            }
        };

        cc.Tween.constructor.prototype['delay'] = async function (duration, opts) {
            opts = opts || {};
            const { tag, group } = opts;

            return new Promise((resolve) => {
                cc.tween(cc.game)
                    .tag(tag)
                    .group(group)
                    .delay(duration)
                    .call(() => resolve())
                    .start();
            });
        };

        cc.Tween.constructor.prototype['delayWithNode'] = async function (duration, node, opts) {
            opts = opts || {};
            const { tag, group } = opts;

            return new Promise((resolve) => {
                cc.tween(node)
                    .tag(tag)
                    .group(group)
                    .delay(duration)
                    .call(() => resolve())
                    .start();
            });

        }

        cc.Tween.prototype['start'] = function () {
            let target = this._target;
            if (!target) {
                cc.warn('Please set target to tween first');
                return this;
            }
            if (target instanceof cc.Object && !target.isValid) {
                return;
            }

            if (this._finalAction) {
                cc.director.getActionManager().removeAction(this._finalAction);
            }
            this._finalAction = this._union();

            // Use the static property for generating unique IDs
            if (target._id === undefined) {
                target._id = ++cc.Tween._tweenID;
            }

            this._finalAction.setTag(this._tag);
            this._finalAction.setGroup(this._group);
            cc.director.getActionManager().addAction(this._finalAction, target, false);
            return this;
        };
    })();
